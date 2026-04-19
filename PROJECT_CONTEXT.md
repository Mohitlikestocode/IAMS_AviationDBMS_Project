# Integrated Aviation Management System (IAMS) – Project Context

## 🧠 Project Goal

Build a full-stack web application that combines:

1. A MySQL-based relational database (aviation system)
2. A Supabase-style database UI (tables, queries, relationships)
3. An AI-powered query interface (natural language → SQL → execution)

This is NOT a generic CRUD app. It must behave like a **database management platform + airline system**.

---

## 🗄️ DATABASE SCHEMA (STRICT – DO NOT MODIFY)

Tables:

* airline
* aircraft
* airport
* flight
* passenger
* booking
* ticket
* payment
* crew
* flight_crew
* pricing

Rules:

* All tables already exist in MySQL
* Use proper JOINs for relational queries
* Respect foreign key relationships
* Do NOT rename tables or columns

---

## 🔗 CORE RELATIONSHIPS

* airline → aircraft (1:N)
* airline → flight (1:N)
* aircraft → seat (1:N)
* airport → flight (source & destination)
* passenger → booking (1:N)
* booking → ticket (1:N)
* flight → ticket (1:N)
* flight ↔ crew (M:N via flight_crew)
* booking → payment (1:1)

---

## 🧩 CORE FEATURES (MANDATORY)

### 1. Tables Explorer (Supabase Style)

* Sidebar lists all tables
* Clicking a table shows:

  * Rows
  * Columns
  * Data types
* Features:

  * Search
  * Sort
  * Pagination
  * Add/Delete row

---

### 2. SQL Console

* User can write raw SQL queries
* Execute and display results
* Show errors if query fails

---

### 3. AI Query System (CRITICAL FEATURE)

User types:

> "Show flights from Delhi to Mumbai"

System must:

1. Convert English → SQL
2. Show generated SQL
3. Execute SQL
4. Display results

---

### AI → SQL Rules

* Always generate valid MySQL queries
* Use correct table names
* Use JOINs where needed

Examples:

Input:
"show all passengers"
Output:
SELECT * FROM passenger;

Input:
"flights from Delhi to Mumbai"
Output:
SELECT f.*
FROM flight f
JOIN airport a1 ON f.source_airport_id = a1.airport_id
JOIN airport a2 ON f.destination_airport_id = a2.airport_id
WHERE a1.city = 'Delhi' AND a2.city = 'Mumbai';

---

### 4. Dashboard

* Show:

  * Total Flights
  * Total Passengers
  * Total Bookings
  * Revenue
* Use SQL aggregate queries

---

### 5. Flights Page

* Search flights by:

  * Source
  * Destination
  * Date
* Display results

---

### 6. Passengers Page

* List passengers
* Add passenger
* View bookings

---

### 7. Bookings Page

* Show all bookings
* Show related passenger + flight
* Allow cancellation (status update)

---

### 8. Analytics Page

Use SQL queries:

* COUNT()
* SUM()
* GROUP BY

Examples:

* Revenue per flight
* Passenger count per flight

---

## 🎨 UI/UX REQUIREMENTS (STRICT)

Design must match:

* Supabase / MongoDB Atlas style
* Clean dashboard UI
* Sidebar navigation
* Table-centric interface

Components:

* Sidebar (tables + pages)
* Top navbar
* Table grid view
* Chat interface for AI queries
* SQL editor panel

---

## ⚙️ BACKEND REQUIREMENTS

* Node.js + Express
* MySQL connection

APIs:

GET /tables/:name → fetch table data
POST /tables/:name → insert row
DELETE /tables/:name/:id → delete row

POST /query → run SQL query

POST /ai-query:

* Input: natural language
* Output:

  * generated SQL
  * query result

---

## 🤖 AI QUERY IMPLEMENTATION

Option 1:

* Use OpenAI API

Option 2:

* Use rule-based mapping for common queries

Steps:

1. Parse user input
2. Identify intent (SELECT / INSERT / FILTER)
3. Map to SQL query
4. Execute query
5. Return results

---

## 🚫 CONSTRAINTS

* Do NOT create fake data structures
* Do NOT ignore database relationships
* Do NOT simplify into basic CRUD app
* Always prioritize SQL-driven logic

---

## 🎯 FINAL GOAL

The system should allow:

* Viewing database tables like Supabase
* Running SQL queries manually
* Running queries via English input
* Managing airline operations data

This should feel like a **real database product**, not a college demo.
