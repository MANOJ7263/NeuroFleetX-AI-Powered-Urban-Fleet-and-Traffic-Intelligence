import LoginForm from "../components/auth/LoginForm";
import { useEffect } from "react";
import { logout } from "../utils/auth";
import { logoutApi } from "../services/authService";

const LoginPage = () => {
  useEffect(() => {
    // Auto-logout on mount
    const performLogout = async () => {
      await logoutApi();
      logout();
    };
    performLogout();
  }, []);

  return <LoginForm />;
};

export default LoginPage;
