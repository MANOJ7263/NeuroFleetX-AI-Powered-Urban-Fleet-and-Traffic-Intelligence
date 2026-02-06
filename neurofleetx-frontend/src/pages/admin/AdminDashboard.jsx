import { useEffect, useState } from "react";
import {
  getVehicles,
  addVehicle,
  updateVehicle,
  deactivateVehicle,
} from "../../services/vehicleService";
import VehicleTable from "../../components/admin/VehicleTable";
import AddVehicleModal from "../../components/admin/AddVehicleModal";

const AdminDashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const loadVehicles = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getVehicles();
      setVehicles(data);
    } catch {
      setError("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVehicle = async (vehicleData) => {
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, vehicleData);
      } else {
        await addVehicle(vehicleData);
      }
      setShowModal(false);
      setEditingVehicle(null);
      loadVehicles();
    } catch (err) {
      alert("Failed to save vehicle");
      console.error(err);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Deactivate this vehicle?");
    if (!confirm) return;

    try {
      await deactivateVehicle(id);
      loadVehicles();
    } catch {
      setError("Failed to deactivate vehicle");
    }
  };

  const openAddModal = () => {
    setEditingVehicle(null);
    setShowModal(true);
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  return (
    <div className="page-center">
      <div className="card" style={{ width: "950px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Admin – Vehicle Management</h2>
          <button onClick={openAddModal} style={{ padding: "8px 16px", background: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            + Add Vehicle
          </button>
        </div>

        {loading && <p>Loading vehicles...</p>}

        {!loading && error && (
          <p style={{ color: "#ff6b6b", textAlign: "center" }}>{error}</p>
        )}

        {!loading && !error && (
          <VehicleTable
            vehicles={vehicles}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {showModal && (
          <AddVehicleModal
            vehicle={editingVehicle}
            onSave={handleSaveVehicle}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
