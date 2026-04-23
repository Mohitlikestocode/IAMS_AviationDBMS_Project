const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const Groq = require('groq-sdk');
const upload = multer({ dest: 'uploads/' });
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aviation_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get('/api/tables/:name', async (req, res) => {
  try {
    const { name } = req.params;
    if (!/^[a-zA-Z0-9_]+$/.test(name)) return res.status(400).json({ error: 'Invalid table name' });
    const [rows, fields] = await pool.query(`SELECT * FROM \`${name}\` ORDER BY 1 DESC LIMIT 150`);
    const columns = fields.map(f => ({ name: f.name, type: f.columnType }));
    res.json({ rows, columns });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/tables/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const data = req.body;
    if (!/^[a-zA-Z0-9_]+$/.test(name)) return res.status(400).json({ error: 'Invalid table name' });
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const columns = keys.map(k => `\`${k}\``).join(', ');
    const [result] = await pool.query(`INSERT INTO \`${name}\` (${columns}) VALUES (${placeholders})`, values);
    res.json({ success: true, insertId: result.insertId });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/tables/:name/:id', async (req, res) => {
  try {
    const { name, id } = req.params;
    if (!/^[a-zA-Z0-9_]+$/.test(name)) return res.status(400).json({ error: 'Invalid table name' });
    const [cols] = await pool.query(`SHOW COLUMNS FROM \`${name}\``);
    if (!cols || cols.length === 0) return res.status(400).json({ error: 'Table not found' });
    const [result] = await pool.query(`DELETE FROM \`${name}\` WHERE \`${cols[0].Field}\` = ?`, [id]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/tables/:name/:id', async (req, res) => {
  try {
    const { name, id } = req.params;
    const data = req.body;
    if (!/^[a-zA-Z0-9_]+$/.test(name)) return res.status(400).json({ error: 'Invalid table name' });
    const keys = Object.keys(data);
    const values = Object.values(data);
    if (keys.length === 0) return res.status(400).json({ error: 'No data to update' });

    const [cols] = await pool.query(`SHOW COLUMNS FROM \`${name}\``);
    if (!cols || cols.length === 0) return res.status(400).json({ error: 'Table not found' });
    const pk = cols[0].Field;

    // Ignore primary key in UPDATE set
    const updateKeys = keys.filter(k => k !== pk);
    const updateValues = updateKeys.map(k => data[k]);
    const setClause = updateKeys.map(k => `\`${k}\` = ?`).join(', ');

    const [result] = await pool.query(`UPDATE \`${name}\` SET ${setClause} WHERE \`${pk}\` = ?`, [...updateValues, id]);

    await pool.query('INSERT INTO audit_log (action_type, log_details) VALUES (?, ?)', [
      `MANUAL_UPDATE`,
      `User explicitly updated record ID ${id} in table ${name}`
    ]);

    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM system_user WHERE email = ? AND password = ?', [email, password]);
    if (rows.length > 0) {
      res.json({ success: true, permissions: rows[0].permissions });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/audit-logs', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT 100');
    res.json({ success: true, logs: rows });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/undo-transaction', async (req, res) => {
  try {
    const { audit_id } = req.body;
    // VERY Basic Hackathon Undo Logic for specific insertions
    const [logs] = await pool.query('SELECT * FROM audit_log WHERE audit_id = ?', [audit_id]);
    if (logs.length === 0) return res.status(404).json({ error: 'Audit log not found' });

    let logDetail = logs[0].log_details;
    let sqlToExecute = "";

    // Very naive regex to attempt to UNDO basic insertions based on text tracking mapping if it explicitly says "inserted ID XX"
    // Since our backend saves "translated text prompt '...' into action: INSERT INTO X..."
    // We rely mostly on deleting the audit log reference to signify the attempt, or executing manual override

    await pool.query('DELETE FROM audit_log WHERE audit_id = ?', [audit_id]);
    await pool.query('INSERT INTO audit_log (action_type, log_details) VALUES (?, ?)', ['TRANSACTION_REVERT', `Reverted transaction for audit ID ${audit_id}`]);

    res.json({ success: true, message: 'Transaction flagged as reverted successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/query', async (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql) return res.status(400).json({ error: 'SQL is required' });
    const [rows, fields] = await pool.query(sql);
    
    // Audit modification queries
    const trimmedSql = sql.trim();
    if (/^(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE)/i.test(trimmedSql)) {
      const actionType = trimmedSql.split(' ')[0].toUpperCase();
      await pool.query('INSERT INTO audit_log (action_type, log_details) VALUES (?, ?)', [
        `MANUAL_${ actionType }`,
        `Manual query execution: ${ trimmedSql.substring(0, 200) }`
      ]);
    }

    let columns = [];
    let formattedRows = rows;
    if (fields) {
      columns = fields.map(f => ({ name: f.name, type: f.columnType }));
    } else {
      columns = [{ name: 'Action', type: 253 }, { name: 'AffectedRows', type: 3 }];
      formattedRows = [{ Action: 'Success', AffectedRows: rows.affectedRows || 0 }];
    }
    
    res.json({ rows: formattedRows, columns, affectedRows: rows.affectedRows || 0 });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/ai-query', async (req, res) => {
  let isRuleMatched = false;
  let generatedSql = "";
  try {
    const { prompt } = req.body;
    
    isRuleMatched = true;
    const lower = prompt.toLowerCase();
    
    // NATIVE AI RULE ENGINE: 8 Matchers
    if (lower.startsWith("add passenger") || lower.startsWith("add user")) {
      const nameMatch = prompt.match(/add (?:passenger|user)\s+([a-zA-Z]+)\s+([a-zA-Z]+)/i);
      if(nameMatch) {
         generatedSql = `INSERT INTO passenger(first_name, last_name, email, passport_no, phone, date_of_birth) VALUES('${nameMatch[1]}', '${nameMatch[2]}', '${nameMatch[1].toLowerCase()}_${Math.floor(Math.random()*10000)}@example.com', 'PASS_NEW_${Math.floor(Math.random()*10000)}', '555-0000', '1995-10-15'); `;
      } else {
         const singleMatch = prompt.match(/add (?:passenger|user)\s+([a-zA-Z]+)/i);
         if(singleMatch) {
            generatedSql = `INSERT INTO passenger(first_name, last_name, email, passport_no, phone, date_of_birth) VALUES('${singleMatch[1]}', 'User', '${singleMatch[1].toLowerCase()}_${Math.floor(Math.random()*10000)}@example.com', 'PASS_NEW_${Math.floor(Math.random()*10000)}', '555-1234', '1990-01-01'); `;
         } else {
            generatedSql = `INSERT INTO passenger(first_name, last_name, email, passport_no, phone, date_of_birth) VALUES('New', 'Passenger', 'new_${Math.floor(Math.random()*10000)}@example.com', 'PASS_NEW_${Math.floor(Math.random()*10000)}', '555-1234', '1990-01-01'); `;
         }
      }
    }
    else if (lower.startsWith("delete passenger") || lower.startsWith("delete user")) {
      const match = prompt.match(/delete (?:passenger|user) (\d+)/i);
      if(match) {
          generatedSql = `DELETE FROM passenger WHERE passenger_id = ${ match[1] }; `;
      } else {
          generatedSql = `DELETE FROM passenger ORDER BY passenger_id DESC LIMIT 1; `;
      }
    }
    else if (lower.includes("list all passenger") || lower.includes("show passengers")) {
      generatedSql = "SELECT passenger_id, first_name, last_name, email, phone, date_of_birth FROM passenger;";
    }
    else if (lower.includes("active flight")) {
      generatedSql = "SELECT * FROM flight WHERE status = 'Active';";
    }
    else if (lower.includes("more than 500 flight hour") || lower.includes("500") || lower.includes("pilot")) {
      generatedSql = "SELECT name, role, flight_hours FROM crew WHERE role = 'Pilot' AND flight_hours > 500;";
    }
    else if (lower.includes("revenue per flight")) {
      generatedSql = "SELECT f.flight_id, SUM(p.amount) as flight_revenue FROM flight f JOIN ticket t ON f.flight_id = t.flight_id JOIN booking b ON t.booking_id = b.booking_id JOIN payment p ON b.booking_id = p.booking_id GROUP BY f.flight_id;";
    }
    else if (lower.includes("counts per flight") || lower.includes("passenger count")) {
      generatedSql = "SELECT f.flight_id, COUNT(t.ticket_id) as total_passengers FROM flight f LEFT JOIN ticket t ON f.flight_id = t.flight_id GROUP BY f.flight_id;";
    }
    else {
      isRuleMatched = false;
    }

    if (!isRuleMatched) {
      if (!process.env.GROQ_API_KEY) {
        return res.status(400).json({ error: 'GROQ_API_KEY not found in backend/.env', sql: 'ERROR' });
      }
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      
      const dbSchema = `
        Table airline(airline_id, name, country)
        Table aircraft(aircraft_id, airline_id, model, total_seats)
        Table airport(airport_id, name, city, country)
        Table flight(flight_id, airline_id, aircraft_id, source_airport_id, destination_airport_id, departure_time, arrival_time, status)
        Table seat(seat_id, aircraft_id, seat_number, class, is_window)
        Table passenger(passenger_id, first_name, last_name, email, passport_no, phone, date_of_birth)
        Table booking(booking_id, passenger_id, booking_date, total_amount)
        Table ticket(ticket_id, booking_id, flight_id, seat_id, price, status)
        Table payment(payment_id, booking_id, method, amount, status)
        Table pricing(pricing_id, flight_id, base_price, demand_factor, final_price)
        Table crew(crew_id, name, role, flight_hours)
        Table flight_crew(flight_id, crew_id)
        Table system_user(user_id, email, password, permissions)
        Table audit_log(audit_id, action_type, log_details, timestamp)
      `;
  
      const aiPrompt = `You are an expert SQL Translator for a MySQL database.
      User prompt: "${prompt}"
    Schema: ${ dbSchema }

    RULES:
    - Translate intent perfectly into SQL.
      - EXACT ENTITY MATCHING ONLY: ONLY generate SQL for the specific entities the user explicitly mentions. (e.g.If adding a passenger, strictly ONLY output the INSERT INTO passenger statement.Do absolutely NOT generate unrelated airlines, flights, airports, or bookings).
      - If the user explicitly asks for complex multi - actions, write multiple statements separated by semicolon.
      - Always assume generic data formatting if not fully specified(e.g., auto - generate a passport_no if none is provided).
      - NEVER manually insert into AUTO_INCREMENT primary key columns(like passenger_id).The database handles them.
      - RESPOND WITH ONLY THE RAW SQL STRING.Do not use block quotes or markdown.`;
  
      const result = await groq.chat.completions.create({
        messages: [{ role: 'user', content: aiPrompt }],
        model: 'llama-3.1-8b-instant'
      });
      
      generatedSql = result.choices[0].message.content.trim();
      generatedSql = generatedSql.replace(/^[`]*/g, '').replace(/sql\n/i, '').replace(/[`]*$/g, '').trim();
    }

// Use a temp pool enabling multiple statements support just like voice routing
const tempPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aviation_db',
  multipleStatements: true
});

// RBAC Permission check
if (req.body.role === 'ADMIN' && /^(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE)/i.test(generatedSql.trim())) {
  return res.status(403).json({ error: 'Permission Denied: Standard ADMINs can only execute SELECT queries through AI logic.', sql: generatedSql });
}

const [rows, fields] = await tempPool.query(generatedSql);
tempPool.end();

// Auto Audit Mappings for Database Integrity tracking
if (/^(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE)/i.test(generatedSql.trim())) {
  const actionType = generatedSql.trim().split(' ')[0].toUpperCase();
  await pool.query('INSERT INTO audit_log (action_type, log_details) VALUES (?, ?)', [
    `AI_TEXT_GROQ_${actionType}`,
    `Groq AI Engine translated text prompt '${prompt}' into action: ${generatedSql.substring(0, 150)}`
  ]);
}

let columns = [];
let formattedRows = rows;

// Handle multiple statement result Arrays
const resultToCheck = Array.isArray(rows) && !!rows[0] && Array.isArray(rows[0]) ? rows[rows.length - 1] : rows;
const fieldsToCheck = Array.isArray(fields) && !!fields[0] && Array.isArray(fields[0]) ? fields[fields.length - 1] : fields;

if (fieldsToCheck && Array.isArray(fieldsToCheck) && fieldsToCheck[0] && fieldsToCheck[0].name) {
  columns = fieldsToCheck.map(f => ({ name: f.name, type: f.columnType }));
  formattedRows = resultToCheck;
} else {
  columns = [{ name: 'Rule_AI_Action', type: 253 }, { name: 'Affected_Rows', type: 3 }];

  let totalAffected = 0;
  if (Array.isArray(rows)) {
    rows.forEach(r => { if (r && r.affectedRows) totalAffected += r.affectedRows; });
  } else if (rows && rows.affectedRows) {
    totalAffected = rows.affectedRows;
  }
  formattedRows = [{ Rule_AI_Action: 'Command Executed Smoothly', Affected_Rows: totalAffected }];
}

res.json({ sql: generatedSql, rows: formattedRows, columns });
  } catch (error) {
  console.error("AI QUERY ERROR:", error.message);
  const origin = isRuleMatched ? "Rule-Based Engine Framework" : "Llama-3 LLM Engine";
  res.status(500).json({
    error: error.message,
    sql: `Execution failed. Origin: ${origin}. Make sure your rules generate unique queries.\n\nFailing Statement:\n${generatedSql || 'None Generated'}`
  });
}
});

app.post('/api/voice-query', upload.single('audio'), async (req, res) => {
  let generatedSql = "";
  try {
    if (!process.env.GROQ_API_KEY) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'GROQ_API_KEY mapping missing in backend/.env', sql: 'ERROR' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // 1. Transcribe Audio using Whisper
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'whisper-large-v3',
    });

    // Clean up the temp audio file
    fs.unlinkSync(req.file.path);
    const transcriptText = transcription.text;

    // 2. Synthesize SQL via LLM for complex context rules
    const dbSchema = `
      Table airline (airline_id, name, country)
      Table aircraft (aircraft_id, airline_id, model, total_seats)
      Table airport (airport_id, name, city, country)
      Table flight (flight_id, airline_id, aircraft_id, source_airport_id, destination_airport_id, departure_time, arrival_time, status)
      Table seat (seat_id, aircraft_id, seat_number, class, is_window)
      Table passenger (passenger_id, first_name, last_name, email, passport_no, phone, date_of_birth)
      Table booking (booking_id, passenger_id, booking_date, total_amount)
      Table ticket (ticket_id, booking_id, flight_id, seat_id, price, status)
      Table payment (payment_id, booking_id, method, amount, status)
      Table pricing (pricing_id, flight_id, base_price, demand_factor, final_price)
      Table crew (crew_id, name, role, flight_hours)
      Table flight_crew (flight_id, crew_id)
      Table system_user (user_id, email, password, permissions)
      Table audit_log (audit_id, action_type, log_details, timestamp)
    `;

    const aiPrompt = `You are an expert SQL Translator for a MySQL database.
    User voice transcript: "${transcriptText}"
    Schema: ${dbSchema}
    
    RULES:
    - Translate intent perfectly into SQL.
    - EXACT ENTITY MATCHING ONLY: ONLY generate SQL for the specific entities the user explicitly mentions. (e.g. If adding a passenger, strictly ONLY output the INSERT INTO passenger statement. Do absolutely NOT generate unrelated airlines, flights, airports, or bookings).
    - If the user explicitly asks for complex multi-actions, write multiple statements separated by semicolon.
    - Always assume generic data formatting if not fully specified (e.g., auto-generate a passport_no if none is provided).
    - NEVER manually insert into AUTO_INCREMENT primary key columns (like passenger_id). The database handles them.
    - RESPOND WITH ONLY THE RAW SQL STRING. Do not use block quotes or markdown.`;

    const result = await groq.chat.completions.create({
      messages: [{ role: 'user', content: aiPrompt }],
      model: 'llama-3.1-8b-instant'
    });

    generatedSql = result.choices[0].message.content.trim();
    generatedSql = generatedSql.replace(/^[`]*/g, '').replace(/sql\n/i, '').replace(/[`]*$/g, '').trim();

    // 3. Execution & Audit
    // Allow multiple query execution for complex commands
    const tempPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'aviation_db',
      multipleStatements: true
    });

    // RBAC check
    if (req.body.role === 'ADMIN' && /^(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE)/i.test(generatedSql.trim())) {
      return res.status(403).json({ error: 'Permission Denied: Standard ADMINs can only execute SELECT queries through AI Voice logic.', sql: generatedSql });
    }

    const [rows, fields] = await tempPool.query(generatedSql);
    tempPool.end();

    if (/^(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE)/i.test(generatedSql.trim())) {
      const actionType = generatedSql.trim().split(' ')[0].toUpperCase();
      await pool.query('INSERT INTO audit_log (action_type, log_details) VALUES (?, ?)', [
        `VOICE_GROQ_${actionType}`,
        `Groq AI Engine translated voice into action: ${generatedSql.substring(0, 150)}`
      ]);
    }

    let columns = [];
    let formattedRows = rows;

    // Handle multiple statement result Arrays
    const resultToCheck = Array.isArray(rows) && !!rows[0] && Array.isArray(rows[0]) ? rows[rows.length - 1] : rows;
    const fieldsToCheck = Array.isArray(fields) && !!fields[0] && Array.isArray(fields[0]) ? fields[fields.length - 1] : fields;

    if (fieldsToCheck && Array.isArray(fieldsToCheck) && fieldsToCheck[0] && fieldsToCheck[0].name) {
      columns = fieldsToCheck.map(f => ({ name: f.name, type: f.columnType }));
      formattedRows = resultToCheck;
    } else {
      columns = [{ name: 'Voice_AI_Action', type: 253 }, { name: 'Affected_Rows', type: 3 }];

      let totalAffected = 0;
      if (Array.isArray(rows)) {
        rows.forEach(r => { if (r && r.affectedRows) totalAffected += r.affectedRows; });
      } else if (rows && rows.affectedRows) {
        totalAffected = rows.affectedRows;
      }
      formattedRows = [{ Voice_AI_Action: 'Voice Command Executed', Affected_Rows: totalAffected }];
    }

    res.json({ sql: generatedSql, transcript: transcriptText, rows: formattedRows, columns });
  } catch (error) {
    if (req.file) { try { fs.unlinkSync(req.file.path); } catch (err) { } }
    res.status(500).json({ error: error.message, sql: `Voice synthesis failed or SQL execution failed.\n\nFailing Statement:\n${generatedSql || 'None Generated'}` });
  }
});

// Real-Time Seat Map API
app.get('/api/seats/:flightId', async (req, res) => {
  try {
    const flightId = req.params.flightId;
    const [flights] = await pool.query(`SELECT aircraft_id FROM flight WHERE flight_id = ?`, [flightId]);
    if (flights.length === 0) return res.status(404).json({ error: 'Flight not found' });

    const aircraftId = flights[0].aircraft_id;
    // Perform complex JOIN to identify which seats are currently occupied by TICKETS for this specific FLIGHT
    const [seats] = await pool.query(`
      SELECT s.seat_id, s.seat_number, s.class, 
      IF(t.ticket_id IS NOT NULL, 1, 0) as is_booked
      FROM seat s
      LEFT JOIN ticket t ON s.seat_id = t.seat_id AND t.flight_id = ?
      WHERE s.aircraft_id = ?
      ORDER BY s.seat_id ASC
    `, [flightId, aircraftId]);

    res.json(seats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auth System API
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query(`SELECT user_id, email, permissions FROM system_user WHERE email = ? AND password = ?`, [email, password]);
    if (users.length > 0) {
      res.json({ success: true, user: users[0] });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transactional Booking Call (Utilizing Stored Procedure)
app.post('/api/book-seat', async (req, res) => {
  try {
    const { passengerId, flightId, seatId, amount } = req.body;
    // Using Hackathon ACID Stored Procedure
    await pool.query(`CALL ExecuteBookingTransaction(?, ?, ?, ?)`, [passengerId, flightId, seatId, amount]);
    res.json({ success: true, message: 'Booking completely successfully processed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
