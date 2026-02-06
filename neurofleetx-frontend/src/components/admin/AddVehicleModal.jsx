import { useState, useEffect } from "react";

const AddVehicleModal = ({ vehicle, onSave, onClose, hasApprovedVehicle }) => {
    const [formData, setFormData] = useState({
        vehicleNumber: "",
        model: "",
        type: "CAR",
        status: "AVAILABLE",
        active: true,
        driverName: "",
        driverPhone: ""
    });

    useEffect(() => {
        if (vehicle) {
            setFormData({
                vehicleNumber: vehicle.vehicleNumber,
                model: vehicle.model,
                type: vehicle.type,
                status: vehicle.status || "AVAILABLE",
                active: vehicle.active,
                driverName: vehicle.driverName || "",
                driverPhone: vehicle.driverPhone || ""
            });
        } else {
            setFormData({
                vehicleNumber: "",
                model: "",
                type: "CAR",
                status: "AVAILABLE",
                active: true,
                driverName: "",
                driverPhone: ""
            });
        }
    }, [vehicle]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-backdrop" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div className="card" style={{ width: "400px", padding: '20px', backgroundColor: 'white', borderRadius: '8px', color: '#333' }}>
                <h3>{vehicle ? "Edit Vehicle" : "Add Vehicle"}</h3>
                <form onSubmit={handleSubmit}>

                    {!hasApprovedVehicle && (
                        <>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Driver Name</label>
                                <input
                                    type="text"
                                    name="driverName"
                                    value={formData.driverName}
                                    onChange={handleChange}
                                    required={!hasApprovedVehicle}
                                    style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Driver Phone</label>
                                <input
                                    type="text"
                                    name="driverPhone"
                                    value={formData.driverPhone}
                                    onChange={handleChange}
                                    required={!hasApprovedVehicle}
                                    style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc' }}
                                />
                            </div>
                            {/* Photo field can be added similarly if needed */}
                        </>
                    )}

                    <div style={{ marginBottom: '10px' }}>
                        <label>Vehicle Number</label>
                        <input
                            type="text"
                            name="vehicleNumber"
                            value={formData.vehicleNumber}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Model</label>
                        <input
                            type="text"
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc' }}
                        >
                            <option value="CAR">Car</option>
                            <option value="BIKE">Bike</option>
                            <option value="VAN">Van</option>
                            <option value="TRUCK">Truck</option>
                        </select>
                    </div>

                    {vehicle && (
                        <div style={{ marginBottom: '10px' }}>
                            <label>Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc' }}
                            >
                                <option value="AVAILABLE">Available</option>
                                <option value="MAINTENANCE">Maintenance</option>
                                <option value="IN_USE">In Use</option>
                            </select>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                        <button type="button" onClick={onClose} style={{ marginRight: '10px', padding: '8px 16px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', color: '#333' }}>Cancel</button>
                        <button type="submit" style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVehicleModal;
