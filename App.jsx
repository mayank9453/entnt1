// src/App.jsx
import React, { useState, useEffect, createContext, useContext, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

// --- Simulated Users ---
const USERS = [
  { email: "admin@entnt.in", password: "admin123", role: "Admin" },
  { email: "inspector@entnt.in", password: "inspect123", role: "Inspector" },
  { email: "engineer@entnt.in", password: "engineer123", role: "Engineer" },
];

// --- Auth Context ---
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("sessionUser");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email, password) => {
    const found = USERS.find((u) => u.email === email && u.password === password);
    if (found) {
      setUser(found);
      localStorage.setItem("sessionUser", JSON.stringify(found));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sessionUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

// --- Protected Route ---
function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" />;
  return children;
}

// --- Ships Component with useRef fix ---
function Ships() {
  const [ships, setShips] = useState(() => {
    const data = localStorage.getItem("entnt_ships");
    return data ? JSON.parse(data) : [];
  });
  const [form, setForm] = useState({ id: null, name: "", imo: "", flag: "", status: "" });
  const [editing, setEditing] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [editing]);

  const resetForm = () => setForm({ id: null, name: "", imo: "", flag: "", status: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      const updated = ships.map((s) => (s.id === form.id ? form : s));
      setShips(updated);
      localStorage.setItem("entnt_ships", JSON.stringify(updated));
    } else {
      const newShip = { ...form, id: Date.now().toString() };
      const updated = [...ships, newShip];
      setShips(updated);
      localStorage.setItem("entnt_ships", JSON.stringify(updated));
    }
    resetForm();
    setEditing(false);
  };

  const handleEdit = (id) => {
    const ship = ships.find((s) => s.id === id);
    setForm(ship);
    setEditing(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this ship?")) {
      const updated = ships.filter((s) => s.id !== id);
      setShips(updated);
      localStorage.setItem("entnt_ships", JSON.stringify(updated));
      if (editing && form.id === id) {
        resetForm();
        setEditing(false);
      }
    }
  };

  return (
    <div>
      <h2>Ships Management</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          ref={nameInputRef}
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          style={{ marginRight: 8 }}
        />
        <input
          name="imo"
          placeholder="IMO Number"
          value={form.imo}
          onChange={handleChange}
          required
          style={{ marginRight: 8 }}
        />
        <input
          name="flag"
          placeholder="Flag"
          value={form.flag}
          onChange={handleChange}
          required
          style={{ marginRight: 8 }}
        />
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          required
          style={{ marginRight: 8 }}
        >
          <option value="">Select Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Maintenance">Maintenance</option>
        </select>
        <button type="submit">{editing ? "Update" : "Add"} Ship</button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setEditing(false);
            }}
            style={{ marginLeft: 8 }}
          >
            Cancel
          </button>
        )}
      </form>

      <table border="1" cellPadding="8" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>IMO Number</th>
            <th>Flag</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ships.length === 0 && (
            <tr>
              <td colSpan="5">No ships found.</td>
            </tr>
          )}
          {ships.map((ship) => (
            <tr key={ship.id}>
              <td>{ship.name}</td>
              <td>{ship.imo}</td>
              <td>{ship.flag}</td>
              <td>{ship.status}</td>
              <td>
                <button onClick={() => handleEdit(ship.id)}>Edit</button>{" "}
                <button onClick={() => handleDelete(ship.id)}>Delete</button>{" "}
                <Link to={`/ships/${ship.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Login Page
function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate("/");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: "auto", padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 8 }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 8 }}
        />
        <button type="submit" style={{ width: "100%" }}>
          Login
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
      <p>
        Use admin@entnt.in/admin123, inspector@entnt.in/inspect123,
        engineer@entnt.in/engineer123
      </p>
    </div>
  );
}

// Unauthorized Page
function Unauthorized() {
  return <h2>Unauthorized - You do not have permission to view this page.</h2>;
}

// Navigation Bar
function NavBar() {
  const { user, logout } = useAuth();
  return (
    <nav style={{ padding: 10, backgroundColor: "#eee", marginBottom: 20 }}>
      <Link to="/">Dashboard</Link> | <Link to="/ships">Ships</Link> |{" "}
      {user ? (
        <>
          Logged in as <b>{user.role}</b> |{" "}
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
}

// Dashboard Page (KPIs)
function Dashboard() {
  const ships = JSON.parse(localStorage.getItem("entnt_ships") || "[]");
  const totalShips = ships.length;

  // For demo, components with overdue maintenance and jobs are simulated as 0
  const overdueComponents = 0;
  const jobsInProgress = 0;
  const jobsCompleted = 0;

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ border: "1px solid #ccc", padding: 10, flex: 1 }}>
          <h3>Total Ships</h3>
          <p>{totalShips}</p>
        </div>
        <div style={{ border: "1px solid #ccc", padding: 10, flex: 1 }}>
          <h3>Components Overdue</h3>
          <p>{overdueComponents}</p>
        </div>
        <div style={{ border: "1px solid #ccc", padding: 10, flex: 1 }}>
          <h3>Jobs In Progress</h3>
          <p>{jobsInProgress}</p>
        </div>
        <div style={{ border: "1px solid #ccc", padding: 10, flex: 1 }}>
          <h3>Jobs Completed</h3>
          <p>{jobsCompleted}</p>
        </div>
      </div>
    </div>
  );
}

// Ship Profile Page (basic)
function ShipProfile() {
  const { id } = useParams();
  const [ship, setShip] = useState(null);

  useEffect(() => {
    const ships = JSON.parse(localStorage.getItem("entnt_ships") || "[]");
    const found = ships.find((s) => s.id === id);
    setShip(found || null);
  }, [id]);

  if (!ship) return <p>Ship not found.</p>;

  return (
    <div>
      <h2>Ship Profile: {ship.name}</h2>
      <p>
        <b>IMO Number:</b> {ship.imo}
      </p>
      <p>
        <b>Flag:</b> {ship.flag}
      </p>
      <p>
        <b>Status:</b> {ship.status}
      </p>
      {/* TODO: Add Components and Maintenance History */}
      <Link to="/ships">Back to Ships</Link>
    </div>
  );
}

// Main App
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/ships"
            element={
              <PrivateRoute roles={["Admin", "Inspector", "Engineer"]}>
                <Ships />
              </PrivateRoute>
            }
          />
          <Route
            path="/ships/:id"
            element={
              <PrivateRoute roles={["Admin", "Inspector", "Engineer"]}>
                <ShipProfile />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
