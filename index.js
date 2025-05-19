const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public_html")));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "ech59",
  database: "mybooking9_2",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL database.");
  }
});

// Handle form submission
app.post("/signup", (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    address_street,
    address_city,
    address_state,
    address_postal_code,
    address_country,
    registration_date,
  } = req.body;
  let errors = [];

  if (!first_name || first_name.length < 2)
    errors.push("First name must be at least 2 characters.");
  if (!last_name || last_name.length < 2)
    errors.push("Last name must be at least 2 characters.");
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    errors.push("Invalid email address.");
  if (!phone || phone.length < 7)
    errors.push("Phone number must be at least 7 digits.");
  if (!address_street || address_street.length < 3)
    errors.push("Street must be at least 3 characters.");
  if (!address_city || address_city.length < 2)
    errors.push("City must be at least 2 characters.");
  if (!address_state || address_state.length < 2)
    errors.push("State must be at least 2 characters.");
  if (!address_postal_code || address_postal_code.length < 3)
    errors.push("Postal code must be at least 3 characters.");
  if (!address_country || address_country.length < 2)
    errors.push("Country must be at least 2 characters.");
  if (!registration_date || !/^\d{4}-\d{2}-\d{2}$/.test(registration_date))
    errors.push("Registration date must be a valid date (YYYY-MM-DD).");

  if (errors.length > 0) {
    return res.json({ success: false, errors });
  }

  // Insert customer into the database with address fields
  const sql = `INSERT INTO CUSTOMER (CUSTOMER_FIRST_NAME, CUSTOMER_LAST_NAME, CUSTOMER_EMAIL_ADDRESS, CUSTOMER_PHONE_NUMBER, ADDRESS_STREET, ADDRESS_CITY, ADDRESS_STATE, ADDRESS_POSTAL_CODE, ADDRESS_COUNTRY, CUSTOMER_REGISTRATION_DATE) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    first_name,
    last_name,
    email,
    phone,
    address_street,
    address_city,
    address_state,
    address_postal_code,
    address_country,
    registration_date,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("MySQL insert error:", err);
      return res.json({
        success: false,
        errors: ["Database error: " + err.message],
      });
    }
    console.log("Customer inserted successfully:", result);
    res.json({ success: true, message: "Signup successful!" });
  });
});

// Serve the customer list page
app.get("/customers", (req, res) => {
  res.sendFile(path.join(__dirname, "customers.html"));
});

// API endpoint to get all customers
app.get("/api/customers", (req, res) => {
  db.query("SELECT * FROM CUSTOMER", (err, results) => {
    if (err) {
      console.error("MySQL select error:", err);
      return res
        .status(500)
        .json({ success: false, errors: ["Database error: " + err.message] });
    }
    res.json({ success: true, customers: results });
  });
});

// Serve the signup page as the default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public_html", "signup.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
