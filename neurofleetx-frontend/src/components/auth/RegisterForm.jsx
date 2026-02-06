import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/authService";
import RoleDropdown from "../common/RoleDropdown";
import Toast from "../common/Toast";

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !phone || !email || !password || !confirmPassword || !role) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      await register(name, phone, email, password, role);

      setToast({ message: "Registration successful", type: "success" });

      setTimeout(() => navigate("/login"), 1000);
    } catch {
      setToast({ message: "Registration failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <form className="card" onSubmit={handleSubmit}>
        <h2>Register</h2>

        {error && <div className="error">{error}</div>}

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <RoleDropdown value={role} onChange={setRole} />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="link-text">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default RegisterForm;