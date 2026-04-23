const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// MOCK DATA GENERATORS
const generateAirlines = () => [
  "('Indian Airlines', 'India')", "('Global Air', 'USA')", "('EuroJet', 'Germany')", "('Oceanic Airlines', 'Australia')"
].join(',');

const generateAirports = () => [
  "('Indira Gandhi Intl', 'Delhi', 'India')", "('Chhatrapati Shivaji', 'Mumbai', 'India')",
  "('JFK Intl', 'New York', 'USA')", "('Heathrow', 'London', 'UK')", "('Dubai Intl', 'Dubai', 'UAE')",
  "('Singapore Changi', 'Singapore', 'Singapore')"
].join(',');

const generateAircrafts = () => Array.from({ length: 40 }).map((_, i) => `(${(i % 4) + 1}, 'Boeing ${737 + (i % 3) * 10}', ${150 + (i % 5) * 20})`).join(',');

const generateFlights = () => {
  const flights = [];
  for (let i = 1; i <= 100; i++) {
    const airline = (i % 4) + 1;
    const aircraft = i % 40 + 1;
    let src = (i % 6) + 1;
    let dst = ((i + 1) % 6) + 1;
    if (src === dst) dst = (dst % 6) + 1;
    const statuses = ['Active', 'Scheduled', 'Delayed', 'Completed'];
    const status = statuses[i % 4];
    flights.push(`(${airline}, ${aircraft}, ${src}, ${dst}, '2026-04-${18 + (i % 5)} 10:00:00', '2026-04-${18 + (i % 5)} 14:00:00', '${status}')`);
  }
  return flights.join(',');
};

const generateSeats = () => {
  const seats = [];
  for (let ac = 1; ac <= 40; ac++) {
    for (let s = 1; s <= 20; s++) { // creating 20 seats per aircraft for brevity (800 target)
      seats.push(`(${ac}, '${s}A', '${s < 5 ? 'Business' : 'Economy'}', ${s % 2 === 0})`);
    }
  }
  return seats.join(',');
};

const generatePassengers = () => {
  const passengers = [];
  // Generating 1000 passengers
  for (let i = 1; i <= 1000; i++) {
    passengers.push(`('John_${i}', 'Doe', 'john.doe${i}@example.com', 'PASS${100000 + i}', '+1800555${(1000 + i).toString().slice(-4)}', '1990-01-01')`);
  }
  return passengers.join(',');
};

const generateBookings = () => {
  const bookings = [];
  for (let i = 1; i <= 800; i++) {
    const passn = (i % 1000) + 1;
    bookings.push(`(${passn}, '2026-04-${10 + (i % 8)} 00:00:00', ${(Math.random() * 1000 + 200).toFixed(2)})`);
  }
  return bookings.join(',');
};

const generateTickets = () => {
  const tickets = [];
  // Linking Booking (1..800), Flight (1..100) and Seat (1..800)
  for (let i = 1; i <= 800; i++) {
    tickets.push(`(${i}, ${(i % 100) + 1}, ${i}, ${(Math.random() * 800 + 200).toFixed(2)}, 'Confirmed')`);
  }
  return tickets.join(',');
};

const generatePayments = () => {
  const payments = [];
  const methods = ['Credit Card', 'PayPal', 'Crypto', 'Debit Card'];
  for (let i = 1; i <= 800; i++) { // 1 to 1 relation with booking
    payments.push(`(${i}, '${methods[i % 4]}', ${(Math.random() * 1000 + 200).toFixed(2)}, 'Completed')`);
  }
  return payments.join(',');
};

const generatePricing = () => {
  const prices = [];
  for (let i = 1; i <= 100; i++) {
    prices.push(`(${i}, ${(Math.random() * 300 + 100).toFixed(2)}, 1.${(i % 5)}, ${(Math.random() * 400 + 150).toFixed(2)})`);
  }
  return prices.join(',');
}

const generateCrews = () => {
  const crews = [];
  const roles = ['Pilot', 'Co-Pilot', 'Flight Attendant', 'Navigator'];
  for (let i = 1; i <= 200; i++) {
    crews.push(`('Crew_${i}', '${roles[i % 4]}', ${Math.floor(Math.random() * 1000) + 100})`);
  }
  return crews.join(',');
};

const generateFlightCrew = () => {
  const fc = [];
  for (let f = 1; f <= 100; f++) {
    fc.push(`(${f}, ${(f % 200) + 1})`);
    fc.push(`(${f}, ${((f + 1) % 200) + 1})`);
  }
  return fc.join(',');
}

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  await connection.query('CREATE DATABASE IF NOT EXISTS aviation_db;');
  await connection.query('USE aviation_db;');
  await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

  const tables = ['airline', 'aircraft', 'airport', 'flight', 'seat', 'passenger', 'booking', 'ticket', 'payment', 'pricing', 'crew', 'flight_crew'];
  for (const t of tables) {
    await connection.query(`DROP TABLE IF EXISTS \`${t}\`;`);
  }

  console.log("Creating tables...");
  // Structure Definitions (Matching Request Strictly)
  await connection.query(`CREATE TABLE airline (airline_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), country VARCHAR(50));`);
  await connection.query(`CREATE TABLE aircraft (aircraft_id INT AUTO_INCREMENT PRIMARY KEY, airline_id INT, model VARCHAR(50), total_seats INT, FOREIGN KEY (airline_id) REFERENCES airline(airline_id));`);
  await connection.query(`CREATE TABLE airport (airport_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), city VARCHAR(50), country VARCHAR(50));`);
  await connection.query(`CREATE TABLE flight (flight_id INT AUTO_INCREMENT PRIMARY KEY, airline_id INT, aircraft_id INT, source_airport_id INT, destination_airport_id INT, departure_time DATETIME, arrival_time DATETIME, status VARCHAR(20), FOREIGN KEY (airline_id) REFERENCES airline(airline_id), FOREIGN KEY (aircraft_id) REFERENCES aircraft(aircraft_id), FOREIGN KEY (source_airport_id) REFERENCES airport(airport_id), FOREIGN KEY (destination_airport_id) REFERENCES airport(airport_id));`);
  await connection.query(`CREATE TABLE seat (seat_id INT AUTO_INCREMENT PRIMARY KEY, aircraft_id INT, seat_number VARCHAR(10), class VARCHAR(20), is_window BOOLEAN, FOREIGN KEY (aircraft_id) REFERENCES aircraft(aircraft_id));`);
  await connection.query(`CREATE TABLE passenger (passenger_id INT AUTO_INCREMENT PRIMARY KEY, first_name VARCHAR(50), last_name VARCHAR(50), email VARCHAR(100) UNIQUE, passport_no VARCHAR(50) UNIQUE, phone VARCHAR(20), date_of_birth DATE);`);
  await connection.query(`CREATE TABLE booking (booking_id INT AUTO_INCREMENT PRIMARY KEY, passenger_id INT, booking_date DATETIME, total_amount DECIMAL(10,2), FOREIGN KEY (passenger_id) REFERENCES passenger(passenger_id));`);
  await connection.query(`CREATE TABLE ticket (ticket_id INT AUTO_INCREMENT PRIMARY KEY, booking_id INT, flight_id INT, seat_id INT, price DECIMAL(10,2), status VARCHAR(20), FOREIGN KEY (booking_id) REFERENCES booking(booking_id), FOREIGN KEY (flight_id) REFERENCES flight(flight_id), FOREIGN KEY (seat_id) REFERENCES seat(seat_id));`);
  await connection.query(`CREATE TABLE payment (payment_id INT AUTO_INCREMENT PRIMARY KEY, booking_id INT UNIQUE, method VARCHAR(20), amount DECIMAL(10,2), status VARCHAR(20), FOREIGN KEY (booking_id) REFERENCES booking(booking_id));`);
  await connection.query(`CREATE TABLE pricing (pricing_id INT AUTO_INCREMENT PRIMARY KEY, flight_id INT, base_price DECIMAL(10,2), demand_factor DECIMAL(5,2), final_price DECIMAL(10,2), FOREIGN KEY (flight_id) REFERENCES flight(flight_id));`);
  await connection.query(`CREATE TABLE crew (crew_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), role VARCHAR(20), flight_hours INT);`);
  await connection.query(`CREATE TABLE flight_crew (flight_id INT, crew_id INT, PRIMARY KEY (flight_id, crew_id), FOREIGN KEY (flight_id) REFERENCES flight(flight_id), FOREIGN KEY (crew_id) REFERENCES crew(crew_id));`);

  // --- HACKATHON ADVANCED FEATURES ---
  await connection.query(`DROP TABLE IF EXISTS system_user;`);
  await connection.query(`CREATE TABLE system_user (user_id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(100) UNIQUE, password VARCHAR(100), permissions VARCHAR(20));`);

  await connection.query(`DROP TABLE IF EXISTS audit_log;`);
  await connection.query(`CREATE TABLE audit_log (audit_id INT AUTO_INCREMENT PRIMARY KEY, action_type VARCHAR(50), log_details TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);`);

  // Triggers (Advanced Audit Logging)
  await connection.query(`DROP TRIGGER IF EXISTS AfterBookingCancel;`);
  await connection.query(`
    CREATE TRIGGER AfterBookingCancel
    AFTER DELETE ON booking
    FOR EACH ROW
    BEGIN
      INSERT INTO audit_log (action_type, log_details) 
      VALUES ('BOOKING_CANCELLED', CONCAT('Booking ID: ', OLD.booking_id, ' for Passenger: ', OLD.passenger_id, ' was destroyed.'));
    END;
  `);

  // Stored Procedure (ACID Transactions for bookings)
  await connection.query(`DROP PROCEDURE IF EXISTS ExecuteBookingTransaction;`);
  await connection.query(`
    CREATE PROCEDURE ExecuteBookingTransaction(
      IN p_passenger_id INT,
      IN p_flight_id INT,
      IN p_seat_id INT,
      IN p_amount DECIMAL(10,2)
    )
    BEGIN
      DECLARE v_booking_id INT;
      DECLARE EXIT HANDLER FOR SQLEXCEPTION
      BEGIN
        ROLLBACK;
      END;
      
      START TRANSACTION;
      
      INSERT INTO booking (passenger_id, booking_date, total_amount) 
      VALUES (p_passenger_id, NOW(), p_amount);
      
      SET v_booking_id = LAST_INSERT_ID();
      
      INSERT INTO ticket (booking_id, flight_id, seat_id, price, status) 
      VALUES (v_booking_id, p_flight_id, p_seat_id, p_amount, 'Confirmed');
      
      INSERT INTO payment (booking_id, method, amount, status) 
      VALUES (v_booking_id, 'Credit Card', p_amount, 'Completed');
      
      COMMIT;
    END;
  `);

  await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
  console.log("Tables, Triggers, and Stored Procedures created successfully.");

  console.log("Inserting massive mock data sets...");
  await connection.query(`INSERT INTO airline (name, country) VALUES ${generateAirlines()};`);
  await connection.query(`INSERT INTO airport (name, city, country) VALUES ${generateAirports()};`);
  await connection.query(`INSERT INTO aircraft (airline_id, model, total_seats) VALUES ${generateAircrafts()};`);
  await connection.query(`INSERT INTO flight (airline_id, aircraft_id, source_airport_id, destination_airport_id, departure_time, arrival_time, status) VALUES ${generateFlights()};`);
  await connection.query(`INSERT INTO seat (aircraft_id, seat_number, class, is_window) VALUES ${generateSeats()};`);
  await connection.query(`INSERT INTO passenger (first_name, last_name, email, passport_no, phone, date_of_birth) VALUES ${generatePassengers()};`);
  await connection.query(`INSERT INTO booking (passenger_id, booking_date, total_amount) VALUES ${generateBookings()};`);
  await connection.query(`INSERT INTO ticket (booking_id, flight_id, seat_id, price, status) VALUES ${generateTickets()};`);
  await connection.query(`INSERT INTO payment (booking_id, method, amount, status) VALUES ${generatePayments()};`);
  await connection.query(`INSERT INTO pricing (flight_id, base_price, demand_factor, final_price) VALUES ${generatePricing()};`);
  await connection.query(`INSERT INTO crew (name, role, flight_hours) VALUES ${generateCrews()};`);
  await connection.query(`INSERT INTO flight_crew (flight_id, crew_id) VALUES ${generateFlightCrew()};`);

  // Insert Admin Auth Node
  await connection.query(`INSERT INTO system_user (email, password, permissions) VALUES ('admin@iams.com', 'admin123', 'ADMIN');`);
  await connection.query(`INSERT INTO system_user (email, password, permissions) VALUES ('controller@iams.com', 'command', 'CONTROLLER');`);

  console.log("Database seeded successfully with thousands of relationally mapped rows.");
  process.exit(0);
}

seed().catch(err => {
  console.error("CRITICAL DB FAILED. MAKE SURE MYSQL IS RUNNING: ", err.message);
  process.exit(1);
});
