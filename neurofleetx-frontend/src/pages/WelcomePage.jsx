import { useNavigate } from "react-router-dom";
import carIcon from "../assets/car.svg"; // adjust path if needed

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
      <div className="page-center">
        <div className="card welcome-card">

          {/* TITLE WITH CAR */}
          <div className="brand-row">
            <h1 className="brand-text">NeuroFleetX</h1>
            <img src={carIcon} alt="car" className="brand-car" />
          </div>

          <p className="subtitle">
            AI-Driven Urban Mobility Platform
          </p>

          <button onClick={() => navigate("/login")}>Login</button>
          <br /><br />
          <button onClick={() => navigate("/register")}>Register</button>
        </div>
      </div>
  );
};

export default WelcomePage;
