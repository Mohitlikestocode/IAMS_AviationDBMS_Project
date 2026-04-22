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
    const [rows, fields] = await pool.query(`SELECT * FROM \`${name}\` LIMIT 100`);
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
        `MANUAL_${actionType}`,
        `Manual query execution: ${trimmedSql.substring(0, 200)}`
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
  try {
    const { prompt } = req.body;
    const lower = prompt.toLowerCase();
    
    let generatedSql = "";
    
    // NATIVE AI RULE ENGINE: Matches intent flexibly
    if (lower.includes("active flight")) {
      generatedSql = "SELECT flight_number, status, departure_time, gate FROM flight WHERE status = 'Active';";
    } else if (lower.includes("more than 500 flight hour") || lower.includes("500")) {
      generatedSql = "SELECT c.first_name, c.last_name, c.flight_hours FROM crew c WHERE c.role = 'Pilot' AND c.flight_hours > 500;";
    } else if (lower.includes("delhi to mumbai")) {
      generatedSql = "SELECT f.* FROM flight f JOIN airport a1 ON f.source_airport_id = a1.airport_id JOIN airport a2 ON f.destination_airport_id = a2.airport_id WHERE a1.city = 'Delhi' AND a2.city = 'Mumbai';";
    } else if (lower.includes("list all passenger") || lower.includes("show passengers")) {
      generatedSql = "SELECT passenger_id, first_name, last_name, email, passport_number FROM passenger;";
    } else if (lower.includes("total revenue")) {
      generatedSql = "SELECT SUM(amount) as total_revenue FROM payment WHERE status = 'Completed';";
    } else if (lower.includes("revenue per flight")) {
      generatedSql = "SELECT f.flight_number, SUM(p.amount) as flight_revenue FROM flight f JOIN ticket t ON f.flight_id = t.flight_id JOIN booking b ON t.booking_id = b.booking_id JOIN payment p ON b.payment_id = p.payment_id GROUP BY f.flight_id;";
    } else if (lower.includes("delayed flight")) {
      generatedSql = "SELECT flight_number, destination_airport_id, scheduled_departure, status FROM flight WHERE status = 'Delayed';";
    } else if (lower.includes("list all aircraft") || lower.includes("show aircrafts")) {
      generatedSql = "SELECT aircraft_id, model, capacity, manufacturer, status FROM aircraft;";
    } else if (lower.includes("counts per flight") || lower.includes("passenger count")) {
      generatedSql = "SELECT f.flight_number, COUNT(t.ticket_id) as total_passengers FROM flight f LEFT JOIN ticket t ON f.flight_id = t.flight_id GROUP BY f.flight_id;";
    } else if (lower.includes("john doe")) {
      generatedSql = "SELECT b.booking_id, b.booking_date, b.booking_reference, b.status FROM booking b JOIN passenger p ON b.passenger_id = p.passenger_id WHERE p.first_name = 'John' AND p.last_name = 'Doe';";
    } 
    // MUTATION RECOGNITION ENGINES
    else if (lower.startsWith("add passenger") || lower.startsWith("add user")) {
      const nameMatch = prompt.match(/add (?:passenger|user) ([a-zA-Z]+)\s+([a-zA-Z]+)/i);
      if(nameMatch) {
         generatedSql = `INSERT INTO passenger (first_name, last_name, email, phone, passport_number) VALUES ('${nameMatch[1]}', '${nameMatch[2]}', '${nameMatch[1].toLowerCase()}@example.com', '555-0000', 'P00000');`;
      } else {
         const singleMatch = prompt.match(/add (?:passenger|user) ([a-zA-Z0-9_]+)/i);
         if(singleMatch) {
            generatedSql = `INSERT INTO passenger (first_name, last_name, email, phone, passport_number) VALUES ('${singleMatch[1]}', 'User', '${singleMatch[1].toLowerCase()}@example.com', '555-1234', 'NEW1234');`;
         } else {
            generatedSql = "INSERT INTO passenger (first_name, last_name, email, phone, passport_number) VALUES ('New', 'Passenger', 'new@example.com', '555-1234', 'NEW1234');";
         }
      }
    }
    else if (lower.startsWith("delete passenger") || lower.startsWith("delete user")) {
      const match = prompt.match(/delete (?:passenger|user) (\d+)/i);
      if(match) {
          generatedSql = `DELETE FROM passenger WHERE passenger_id = ${match[1]};`;
      } else {
          generatedSql = `DELETE FROM passenger ORDER BY passenger_id DESC LIMIT 1;`;
      }
    }
    else if (lower.startsWith("change flight") || lower.startsWith("update flight")) {
      const match = prompt.match(/(?:update|change) flight ([A-Z0-9]+) to ([a-zA-Z]+)/i);
      if(match) {
          const newStatus = match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase();
          generatedSql = `UPDATE flight SET status = '${newStatus}' WHERE flight_number LIKE '%${match[1]}%';`;
      } else {
          generatedSql = `UPDATE flight SET status = 'Delayed' WHERE flight_id = 1;`;
      }
    }
    else if (lower.startsWith("add aircraft")) {
       generatedSql = `INSERT INTO aircraft (model, capacity, manufacturer, status) VALUES ('Boeing 737 Max', 180, 'Boeing', 'Active');`;
    }
    else if (lower.startsWith("add flight")) {
       generatedSql = `INSERT INTO flight (flight_number, source_airport_id, destination_airport_id, status) VALUES ('AI-999', 1, 2, 'Active');`;
    }
    else if (lower.includes("insert") || lower.includes("update") || lower.includes("delete")) {
      if (lower.startsWith("insert") || lower.startsWith("update") || lower.startsWith("delete")) {
         generatedSql = prompt; 
      } else {
         generatedSql = "SELECT * FROM flight LIMIT 10;";
      }
    }
    else if (lower.includes("tables") || lower.includes("schema")) {
      generatedSql = "SHOW TABLES;";
    }
    else {
      generatedSql = "SELECT * FROM flight LIMIT 10;";
    }

    const [rows, fields] = await pool.query(generatedSql);
    
    // Auto Audit Mappings for Database Integrity tracking
    if (/^(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE)/i.test(generatedSql.trim())) {
      const actionType = generatedSql.trim().split(' ')[0].toUpperCase();
      await pool.query('INSERT INTO audit_log (action_type, log_details) VALUES (?, ?)', [
        `AI_${actionType}`,
        `AI Engine translated prompt '${prompt}' into action: ${generatedSql.substring(0, 150)}`
      ]);
    }

    let columns = [];
    let formattedRows = rows;
    if (fields) {
      columns = fields.map(f => ({ name: f.name, type: f.columnType }));
    } else {
      columns = [{ name: 'Rule_AI_Action', type: 253 }, { name: 'Affected_Rows', type: 3 }];
      formattedRows = [{ Rule_AI_Action: 'Command Executed Smoothly', Affected_Rows: rows.affectedRows || 0 }];
    }
    
    res.json({ sql: generatedSql, rows: formattedRows, columns });
  } catch (error) { 
    res.status(500).json({ error: error.message, sql: "Rule mismatch or syntax error." }); 
  }
});

app.post('/api/voice-query', upload.single('audio'), async (req, res) => {
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
      Table aircraft (aircraft_id, model, capacity, manufacturer, status)
      Table airport (airport_id, name, city, country, iata_code)
      Table flight (flight_id, flight_number, source_airport_id, destination_airport_id, departure_time, arrival_time, scheduled_departure, status, gate, aircraft_id)
      Table crew (crew_id, first_name, last_name, role, flight_hours)
      Table passenger (passenger_id, first_name, last_name, email, phone, passport_number)
      Table payment (payment_id, amount, payment_method, payment_date, status)
      Table booking (booking_id, passenger_id, booking_reference, booking_date, payment_id, status)
      Table ticket (ticket_id, booking_id, flight_id, seat_id)
      Table seat (seat_id, aircraft_id, seat_number, class)
      Table audit_log (audit_id, action_type, log_details, timestamp)
    `;

    const aiPrompt = `You are an expert SQL Translator for a MySQL database.
    User voice transcript: "${transcriptText}"
    Schema: ${dbSchema}
    
    RULES:
    - Translate intent perfectly into SQL.
    - If the user asks for multi-insert or complex actions (e.g. adding a user AND a ticket), write multiple statements separated by semicolon, or just execute the primary action.
    - Always assume generic data formatting if not fully specified.
    - RESPOND WITH ONLY THE RAW SQL STRING. Do not use block quotes or markdown.`;

    const result = await groq.chat.completions.create({
      messages: [{ role: 'user', content: aiPrompt }],
      model: 'llama3-8b-8192'
    });
    
    let generatedSql = result.choices[0].message.content.trim();
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
    const resultToCheck = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[rows.length - 1] : rows;
    const fieldsToCheck = Array.isArray(fields) && Array.isArray(fields[0]) ? fields[fields.length - 1] : fields;

    if (fieldsToCheck) {
      columns = fieldsToCheck.map(f => ({ name: f.name, type: f.columnType }));
      formattedRows = resultToCheck;
    } else {
      columns = [{ name: 'Voice_AI_Action', type: 253 }, { name: 'Affected_Rows', type: 3 }];
      formattedRows = [{ Voice_AI_Action: 'Voice Command Executed', Affected_Rows: resultToCheck.affectedRows || 0 }];
    }
    
    res.json({ sql: generatedSql, transcript: transcriptText, rows: formattedRows, columns });
  } catch (error) {
    if (req.file) { try { fs.unlinkSync(req.file.path); } catch(err){} }
    res.status(500).json({ error: error.message, sql: "Voice synthesis failed or SQL execution failed." });
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
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
