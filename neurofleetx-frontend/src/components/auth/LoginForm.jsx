import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import { saveAuth } from "../../utils/auth";
import Toast from "../common/Toast";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const data = await login(email, password);
      saveAuth(data.token, data.role, email);

      setToast({ message: "Login successful", type: "success" });

      setTimeout(() => {
        if (data.role === "ADMIN") navigate("/admin/dashboard");
        if (data.role === "MANAGER") navigate("/manager/dashboard");
        if (data.role === "DRIVER") navigate("/driver/dashboard");
        if (data.role === "CUSTOMER") navigate("/customer/dashboard");
      }, 800);
    } catch {
      setToast({ message: "Invalid email or password", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <form className="card" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {error && <div className="error">{error}</div>}

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

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="link-text">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </p>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default LoginForm;