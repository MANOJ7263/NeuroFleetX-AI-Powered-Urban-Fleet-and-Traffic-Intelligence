import { useEffect, useRef, useState } from "react";

const roles = ["ADMIN", "MANAGER", "DRIVER", "CUSTOMER"];

const RoleDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dropdown" ref={ref}>
      <div className="dropdown-selected" onClick={() => setOpen(!open)}>
        {value || "Select Role"}
        <span className={`arrow ${open ? "open" : ""}`}>▼</span>
      </div>

      {open && (
        <div className="dropdown-menu">
          {roles.map((role) => (
            <div
              key={role}
              className="dropdown-item"
              onClick={() => {
                onChange(role);
                setOpen(false);
              }}
            >
              {role}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoleDropdown;