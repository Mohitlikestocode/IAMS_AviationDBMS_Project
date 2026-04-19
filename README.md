<h1 align="center">FlightDBMS: Integrated Aviation Management System</h1>

<p align="center">
  <strong>An enterprise-grade, high-altitude database command center built for modern flight operations.</strong>
</p>

<div align="center">
  <img src="src/assets/1.png" alt="IAMS Dashboard" width="100%" />
</div>

---

## 🏆 Project Team & Credits

We developed this sophisticated database architecture collaboratively. While everyone worked full-stack to bring IAMS to life, our primary focal areas were:

- **Sai Mohit Kotta** — Website Architecture, Core Logic, UI/UX Engineering & Ideation, AI Query Synthesizer
- **Trishay Kaul** — Website Development, Entitty Relationship, SQL Editor & Ideation, Inclusive of people with disabilities
- **Ghana Polishetty** — Comprehensive Documentation & Database (SQL Workbench) Design, Tables Visualisation and Authentication
- **V. Surya Prakash Reddy** — System Documentation & Relational Schema (SQL Workbench) Planning, Database Design

*(Note: Every member contributed end-to-end to ensure the flawless execution of this Hackathon DBMS Project).*

---

## 🚀 About The Platform

**FlightDBMS** is a state-of-the-art Database Management wrapper designed to elevate how airports and airlines process raw relational data. Moving away from traditional, clunky database managers, we've deployed a visually stunning, react-powered Command Center that seamlessly connects to a complex, fully-relational MySQL backend. 

The system tracks 12 interconnected operational schemas—ranging from complex `Airline`, `Aircraft`, and `Flight` mappings to live transactional streams handling `Passengers`, `Tickets`, `Bookings`, and `Payments`.

<br/>

## ✨ Key Features & Technical Highlights

### 1. Robust Relational Explorer
<p align="center">
  <img src="src/assets/4.png" alt="Tables Explorer" width="100%" />
</p>
Ditch standard command-line fetching. The **Data Grid Explorer** visually pulls millions of records using dynamic `LEFT JOIN` aggregations. Features beautiful formatting engines that structurally map Boolean values, ID associations, and status attributes (`Completed`, `Active`, `Delayed`, etc.) into dynamic glowing badges across standard tables.

### 2. Generative AI Query Synthesizer 
<p align="center">
  <img src="src/assets/3.png" alt="AI Query Assistant" width="100%" />
</p>
You don't need to be a Database Administrator to understand complex relational logic. Our **AI Syntax Engine** translates normal English sentences (e.g. *"Show me the flight revenue across all Boeing jets"*) directly into perfectly optimized SQL queries, streaming back live response grids instantaneously. 

### 3. Native SQL Command Terminal
<p align="center">
  <img src="src/assets/2.png" alt="SQL Console" width="100%" />
</p>
For those who prefer total control, the built-in raw developer console permits the execution of manual MySQL queries directly against the `aviation_db` instance with zero latency, securely rendering raw field rows and schema constraints effortlessly.

<br/>

---

## ⚙️ Advanced DBMS Masterclass Features (Hackathon Focused)
We went far beyond simple CRUD operations to demonstrate absolute database mastery:
- 🛡️ **ACID Compliant Transactions (Stored Procedures):** We utilize master-level `START TRANSACTION` / `COMMIT` / `ROLLBACK` MySQL endpoints for flight bookings. Purchasing a ticket locks the payload conditionally across `Booking`, `Ticket`, and `Payment` seamlessly. If one fails, the system rolls back to preserve global data integrity.
- 📡 **Automated Audit Triggers:** An autonomous Database Trigger (`AFTER DELETE`) is attached natively to our SQL payload schemas. It instantly intercepts destruction operations to secretly construct auditable breadcrumbs inside an encrypted `audit_log` table.
- 🗺️ **Live Seat-Map Matrix Engines:** Advanced relational `JOIN` algorithms correlate available geometry grids from our `Seat` table against confirmed active row queries in our `Ticket` table, locking down spatial nodes on runtime queries in real time.
- ♿ **Inclusive Accessibility Algorithms:** We integrated a specific flag condition into the Database linking Passenger Disability Requirements with Accessible Seat Nodes. When queries determine a requirement for special assistance, visual checkmarks conditionally map directly to optimized seating via front-end interpretation.
- 🔐 **Encrypted Role-Based Access Control (RBAC):** Deploying a robust `system_user` schema enforcing polymorphic privileges allowing 'ADMIN' or 'CONTROLLER' permission gates via RESTful API interceptors.

---

## 💻 Tech Stack & Deployment Architecture
- **Frontend Layer:** React.js, Vite, TailwindCSS (Dark Glassmorphism Atmospheric UI).
- **Backend API Engine:** Node.js, Express.js.
- **Relational Database Engine:** MySQL Engine.
- **Environment Handling:** Dotenv encryption module. 

<div align="center">
  <br/>
  <i>Engineered for the optimal presentation of Database integrity, inclusivity, and architectural beauty.</i>
</div>
