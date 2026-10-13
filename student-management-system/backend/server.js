
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");
const app = express();

app.use(cors());
app.use(express.json());

// Check backend and database connection
app.get("/", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.send("Student Management API and PostgreSQL are working!");
  } catch (err) {
    console.error("Database connection error:", err.message);
    res.status(500).send("Database connection failed.");
  }
});

// GET: View all students
app.get("/api/students", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM students ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch students." });
  }
});

// POST: Add a new student
app.post("/api/students", async (req, res) => {
  const { name, roll_number, department, email } = req.body;

  if (
    ![name, roll_number, department, email].every(
      (value) => typeof value === "string" && value.trim()
    )
  ) {
    return res.status(400).json({
      error: "All fields are required."
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO students (name, roll_number, department, email)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        name.trim(),
        roll_number.trim(),
        department.trim(),
        email.trim()
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);

    if (err.code === "23505") {
      return res.status(409).json({
        error: "Roll number or email already exists."
      });
    }

    res.status(500).json({ error: "Failed to add student." });
  }
});

// PUT: Update an existing student
app.put("/api/students/:id", async (req, res) => {
  const { name, roll_number, department, email } = req.body;
  const { id } = req.params;

  if (
    !/^\d+$/.test(id) ||
    ![name, roll_number, department, email].every(
      (value) => typeof value === "string" && value.trim()
    )
  ) {
    return res.status(400).json({
      error: "Valid ID and all fields are required."
    });
  }

  try {
    const result = await pool.query(
      `UPDATE students
       SET name = $1,
           roll_number = $2,
           department = $3,
           email = $4
       WHERE id = $5
       RETURNING *`,
      [
        name.trim(),
        roll_number.trim(),
        department.trim(),
        email.trim(),
        Number(id)
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Student not found."
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);

    if (err.code === "23505") {
      return res.status(409).json({
        error: "Roll number or email already exists."
      });
    }

    res.status(500).json({ error: "Failed to update student." });
  }
});

// DELETE: Remove a student
app.delete("/api/students/:id", async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({
      error: "Invalid student ID."
    });
  }

  try {
    const result = await pool.query(
      "DELETE FROM students WHERE id = $1 RETURNING id",
      [Number(req.params.id)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Student not found."
      });
    }

    res.json({
      message: "Student deleted successfully."
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to delete student." });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
