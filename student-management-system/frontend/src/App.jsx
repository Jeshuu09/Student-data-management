
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/students";

const emptyForm = {
  name: "",
  roll_number: "",
  department: "",
  email: "",
};

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchStudents() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Could not load students.");

      const data = await response.json();
      setStudents(data);
    } catch {
      setError("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const url = editingId
      ? `${API_URL}/${editingId}`
      : API_URL;

    try {
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setForm(emptyForm);
      setEditingId(null);
      await fetchStudents();
    } catch (err) {
      setError(err.message || "Unable to save student.");
    }
  }

  function handleEdit(student) {
    setForm({
      name: student.name,
      roll_number: student.roll_number,
      department: student.department,
      email: student.email,
    });
    setEditingId(student.id);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete student.");
      }

      await fetchStudents();
    } catch (err) {
      setError(err.message || "Unable to delete student.");
    }
  }

  function cancelEdit() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  return (
    <main className="app-container">
      <header className="page-header">
        <p className="eyebrow">STUDENT PORTAL</p>
        <h1>Student Management System</h1>
        <p>Manage student information in one place.</p>
      </header>

      <section className="form-card">
        <h2>{editingId ? "Edit Student" : "Add New Student"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Full Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </label>

            <label>
              Roll Number
              <input
                name="roll_number"
                value={form.roll_number}
                onChange={handleChange}
                placeholder="Enter roll number"
                required
              />
            </label>

            <label>
              Department
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g. CSE"
                required
              />
            </label>

            <label>
              Email Address
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="student@example.com"
                required
              />
            </label>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="form-actions">
            <button className="primary-button" type="submit">
              {editingId ? "Update Student" : "Add Student"}
            </button>

            {editingId && (
              <button
                className="secondary-button"
                type="button"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="table-card">
        <div className="table-heading">
          <div>
            <h2>Student Records</h2>
            <p>All registered students</p>
          </div>
          <span className="student-count">{students.length} students</span>
        </div>

        {loading ? (
          <p className="status-message">Loading students...</p>
        ) : students.length === 0 ? (
          <p className="status-message">
            No student records yet. Add your first student above.
          </p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Roll Number</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.roll_number}</td>
                    <td>{student.department}</td>
                    <td>{student.email}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="edit-button"
                          onClick={() => handleEdit(student)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(student.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer>Student Management System · React + Express + PostgreSQL</footer>
    </main>
  );
}

export default App;
