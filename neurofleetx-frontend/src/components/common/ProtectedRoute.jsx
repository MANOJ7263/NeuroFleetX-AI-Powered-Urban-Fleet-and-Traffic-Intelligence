import { Navigate } from "react-router-dom";
import { getUserRole, isAuthenticated } from "../../utils/auth";

const ProtectedRoute = ({ role, children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  const userRole = getUserRole();

  if (role) {
    if (Array.isArray(role)) {
      if (!role.includes(userRole)) return <Navigate to="/login" />;
    } else {
      if (userRole !== role) return <Navigate to="/login" />;
    }
  }

  return children;
};

export default ProtectedRoute;
