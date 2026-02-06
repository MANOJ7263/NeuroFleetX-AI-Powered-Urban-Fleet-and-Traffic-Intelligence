import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserEmail,
  getUserRole,
  logout,
  isAuthenticated,
} from "../../utils/auth";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  if (!isAuthenticated()) return null;

  const email = getUserEmail();
  const role = getUserRole();
  const initials = email?.charAt(0).toUpperCase();

  return (
    <div className="navbar">
      <strong>NeuroFleetX</strong>

      <div className="avatar-container">
        <div className="avatar" onClick={() => setOpen(!open)}>
          {initials}
        </div>

        {open && (
          <div className="avatar-menu">
            <p>{email}</p>
            <p className="role">{role}</p>
            <hr />
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;