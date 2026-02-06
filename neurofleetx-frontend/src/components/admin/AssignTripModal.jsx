import { useState } from "react";

const AssignTripModal = ({
  trip,
  drivers,
  vehicles,
  onAssign,
  onClose,
}) => {
  const [driverId, setDriverId] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  const handleSubmit = () => {
    if (!driverId || !vehicleId) {
      alert("Select both driver and vehicle");
      return;
    }

    onAssign(trip.id, {
      driverId: Number(driverId),
      vehicleId: Number(vehicleId),
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="card" style={{ width: "420px" }}>
        <h3>Assign Trip</h3>

        <p><b>Pickup:</b> {trip.pickupLocation}</p>
        <p><b>Drop:</b> {trip.dropLocation}</p>

        <select
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
        >
          <option value="">Select Driver</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.email}
            </option>
          ))}
        </select>

        <br /><br />

        <select
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
        >
          <option value="">Select Vehicle</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.vehicleNumber} – {v.model}
            </option>
          ))}
        </select>

        <br /><br />

        <button onClick={handleSubmit}>Assign</button>
        <br /><br />
        <button onClick={onClose} style={{ background: "#444" }}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AssignTripModal;
