import { useEffect, useState } from "react";
import { getPendingTrips, assignTrip } from "../../services/tripService";
import { getVehicles } from "../../services/vehicleService";
import AssignTripModal from "../../components/admin/AssignTripModal";

const AdminTripDashboard = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [error, setError] = useState("");

  // ✅ EFFECT: only fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError("");

        const tripData = await getPendingTrips();
        const vehicleData = await getVehicles();

        // TEMP drivers (until backend API exists)
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const driverUsers = users.filter(u => u.role === "DRIVER");

        setTrips(tripData);
        setVehicles(vehicleData.filter(v => v.active));
        setDrivers(driverUsers);

      } catch (err) {
        console.error(err);
        setError("Failed to load trips");
      }
    };

    fetchData();
  }, []); // ✅ safe dependency list

  // ✅ ACTION HANDLER (NOT inside useEffect)
  const handleAssign = async (tripId, payload) => {
    try {
      await assignTrip(tripId, payload);

      // refresh trips only
      const updatedTrips = await getPendingTrips();
      setTrips(updatedTrips);

      setSelectedTrip(null);
    } catch (err) {
      console.error(err);
      alert("Failed to assign trip");
    }
  };

  return (
    <div className="page-center">
      <div className="card" style={{ width: "720px" }}>
        <h2>Admin – Pending Trips</h2>

        {error && <p className="error">{error}</p>}

        {trips.length === 0 ? (
          <p>No pending trips</p>
        ) : (
          <table width="100%">
            <thead>
              <tr>
                <th>Pickup</th>
                <th>Drop</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {trips.map(trip => (
                <tr key={trip.id}>
                  <td>{trip.pickupLocation}</td>
                  <td>{trip.dropLocation}</td>
                  <td>
                    <button onClick={() => setSelectedTrip(trip)}>
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedTrip && (
        <AssignTripModal
          trip={selectedTrip}
          drivers={drivers}
          vehicles={vehicles}
          onAssign={handleAssign}
          onClose={() => setSelectedTrip(null)}
        />
      )}
    </div>
  );
};

export default AdminTripDashboard;
