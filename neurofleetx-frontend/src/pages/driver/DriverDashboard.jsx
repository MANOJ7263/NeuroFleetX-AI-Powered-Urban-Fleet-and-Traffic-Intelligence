import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCurrentDriverTrip, createTripOffer, getDriverRequests, confirmBooking, getDriverConfirmedBookings, cancelBooking } from "../../services/tripService";
import { addVehicle } from "../../services/vehicleService";
import { getUserEmail, getToken } from "../../utils/auth";
import axios from "axios";

const DriverDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";

  const [vehicles, setVehicles] = useState([]);
  const [requests, setRequests] = useState([]);
  const [confirmedTrips, setConfirmedTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  // Forms
  const [vehicleForm, setVehicleForm] = useState({
    model: "", vehicleNumber: "", type: "CAR", seatCapacity: 4, costPerHour: 15,
    driverName: "", driverPhone: "", driverPhoto: "", vehiclePhoto: "",
    active: true, isApproved: false, isDeleted: false
  });

  const [tripForm, setTripForm] = useState({
    source: "", destination: "", startTime: "", vehicleId: ""
  });

  const getMyVehicles = async () => {
    try {
      const res = await axios.get("http://localhost:9090/api/vehicles/my", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return res.data;
    } catch (e) {
      console.error("Fetch vehicles failed", e);
      return [];
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const myVehicles = await getMyVehicles();
      setVehicles(myVehicles);

      // Auto-select first vehicle for trip form
      if (myVehicles.length > 0 && !tripForm.vehicleId) {
        setTripForm(prev => ({ ...prev, vehicleId: myVehicles[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (tab === "requests") {
      fetchRequests();
    }
    if (tab === "current-job") {
      fetchConfirmed();
    }
  }, [tab]);

  const fetchRequests = async () => {
    try {
      const data = await getDriverRequests();
      setRequests(data);
    } catch (e) {
      console.error("Failed to fetch requests", e);
    }
  };

  const fetchConfirmed = async () => {
    try {
      const data = await getDriverConfirmedBookings();
      setConfirmedTrips(data);
    } catch (e) {
      console.error("Failed to fetch confirmed trips", e);
    }
  };

  const handleConfirmTrip = async (bookingId) => {
    try {
      await confirmBooking(bookingId);
      alert("Trip Confirmed!");
      fetchRequests();
    } catch (e) {
      console.error(e);
      alert("Failed to confirm trip");
    }
  };

  const handleCancelTrip = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel? This action cannot be undone.")) return;
    try {
      await cancelBooking(bookingId);
      alert("Job Cancelled Successfully");
      fetchConfirmed();
    } catch (e) {
      console.error(e);
      // Try to show backend error message if available
      const msg = e.response?.data?.message || e.response?.data || "Failed to cancel job (Check if within 3 hours)";
      alert(msg);
    }
  };

  const isFirstVehicle = vehicles.length === 0;

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      await addVehicle(vehicleForm);
      alert("Vehicle submitted for approval!");
      setVehicleForm({
        model: "", vehicleNumber: "", type: "CAR", seatCapacity: 4, costPerHour: 15,
        driverName: "", driverPhone: "", driverPhoto: "", vehiclePhoto: "",
        active: true, isApproved: false, isDeleted: false
      });
      loadData();
      setSearchParams({ tab: "vehicles" });
    } catch (err) {
      console.error(err);
      let errorMessage = "Failed to add vehicle";

      if (err.response) {
        // Server responded with error
        if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        // Request made but no response
        errorMessage = "No response from server. Please check your connection.";
      }

      alert(errorMessage);
    }
  };

  const handlePostTrip = async (e) => {
    e.preventDefault();
    if (!tripForm.vehicleId) {
      alert("Please select a vehicle first");
      return;
    }
    try {
      const payload = {
        source: tripForm.source,
        destination: tripForm.destination,
        startTime: tripForm.startTime.length === 16 ? tripForm.startTime + ":00" : tripForm.startTime,
        availableSeats: 4,
        vehicleId: tripForm.vehicleId
      };

      await createTripOffer(payload);
      alert("Trip Posted Successfully!");
      setTripForm({ ...tripForm, source: "", destination: "", startTime: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to post trip");
    }
  };

  return (
    <div className="page-center" style={{ flexDirection: 'column', padding: '40px', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
      <h1>Driver Hub</h1>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', marginTop: '20px' }}>
        <button onClick={() => setSearchParams({ tab: "vehicles" })} style={{ padding: '10px 20px', background: tab === 'vehicles' ? '#1abc9c' : '#333', border: 'none', color: '#fff', cursor: 'pointer' }}>My Vehicles</button>
        <button onClick={() => setSearchParams({ tab: "add-vehicle" })} style={{ padding: '10px 20px', background: tab === 'add-vehicle' ? '#1abc9c' : '#333', border: 'none', color: '#fff', cursor: 'pointer' }}>Add Vehicle</button>
        <button onClick={() => setSearchParams({ tab: "post-trip" })} style={{ padding: '10px 20px', background: tab === 'post-trip' ? '#1abc9c' : '#333', border: 'none', color: '#fff', cursor: 'pointer' }}>Post Trip</button>
        <button onClick={() => window.location.href = "/driver/navigation"} style={{ padding: '10px 20px', background: '#e74c3c', border: 'none', color: '#fff', cursor: 'pointer' }}>AI Nav Demo</button>
      </div>

      {tab === "dashboard" && (
        <div>
          <h3>Welcome Driver!</h3>
          <p>Select an option above or from the sidebar.</p>
        </div>
      )}

      {tab === "requests" && (
        <div className="card" style={{ width: '100%', maxWidth: '800px' }}>
          <h3>Trip Requests</h3>
          {requests.length === 0 ? <p>No pending requests.</p> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {requests.map(r => (
                <li key={r.id} style={{ padding: '20px', borderBottom: '1px solid #444', marginBottom: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#1abc9c' }}>Request from: {r.customer?.name || "Customer"}</h4>
                      <p style={{ margin: '5px 0' }}><strong>Route:</strong> {r.pickupLocation} &rarr; {r.dropLocation}</p>
                      <p style={{ margin: '5px 0' }}><strong>Distance:</strong> {r.distanceKm} km</p>
                      <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Price: ${r.totalPrice?.toFixed(2)}</p>
                    </div>
                    <button onClick={() => handleConfirmTrip(r.id)} style={{ padding: '10px 20px', background: '#2ecc71', border: 'none', color: '#fff', borderRadius: '5px', cursor: 'pointer' }}>
                      Confirm Trip
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "current-job" && (
        <div className="card" style={{ width: '100%', maxWidth: '800px' }}>
          <h3>Current Jobs</h3>
          {confirmedTrips.length === 0 ? <p>No active jobs.</p> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {confirmedTrips.map(j => (
                <li key={j.id} style={{ padding: '20px', borderBottom: '1px solid #444', marginBottom: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#1abc9c' }}>Customer: {j.customer?.name || "Client"}</h4>
                      <p style={{ margin: '5px 0' }}><strong>Route:</strong> {j.pickupLocation} &rarr; {j.dropLocation}</p>
                      <p style={{ margin: '5px 0' }}><strong>Pickup:</strong> {j.tripOffer?.startTime ? new Date(j.tripOffer.startTime).toLocaleString() : 'N/A'}</p>
                    </div>
                    <button onClick={() => handleCancelTrip(j.id)} style={{ padding: '10px 20px', background: '#e74c3c', border: 'none', color: '#fff', borderRadius: '5px', cursor: 'pointer' }}>
                      Cancel Job
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "vehicles" && (
        <div className="card" style={{ width: '100%', maxWidth: '800px' }}>
          <h3>My Vehicles</h3>
          {vehicles.length === 0 ? <p>No vehicles added yet. Please add one.</p> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {vehicles.map(v => (
                <li key={v.id} style={{ padding: '15px', borderBottom: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '1.1rem' }}>{v.model}</strong>
                    <span style={{ marginLeft: '10px', fontSize: '0.9rem', color: '#ccc' }}>({v.vehicleNumber})</span>
                  </div>
                  <span style={{
                    background: v.approved ? '#2ecc71' : '#f39c12',
                    color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'
                  }}>
                    {v.approved ? 'APPROVED' : 'PENDING'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "add-vehicle" && (
        <div className="card" style={{ width: '100%', maxWidth: '800px' }}>
          <h3>{isFirstVehicle ? "Onboard & Add First Vehicle" : "Add New Vehicle"}</h3>
          <form onSubmit={handleAddVehicle}>
            {isFirstVehicle && (
              <>
                <input type="text" placeholder="Driver Name" value={vehicleForm.driverName} onChange={e => setVehicleForm({ ...vehicleForm, driverName: e.target.value })} required style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '10px' }} />
                <input type="text" placeholder="Phone Number" value={vehicleForm.driverPhone} onChange={e => setVehicleForm({ ...vehicleForm, driverPhone: e.target.value })} required style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '10px' }} />

                {/* Driver Photo Upload */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>Driver Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setVehicleForm({ ...vehicleForm, driverPhoto: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    required
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px',
                      background: '#333',
                      color: 'white',
                      border: '1px solid #555',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  />
                  {vehicleForm.driverPhoto && (
                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                      <img src={vehicleForm.driverPhoto} alt="Driver Preview" style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '8px', border: '2px solid #1abc9c' }} />
                    </div>
                  )}
                </div>
              </>
            )}
            <h4 style={{ margin: '15px 0 10px' }}>Vehicle Details</h4>
            <input type="text" placeholder="Model (e.g. Tesla Model 3)" value={vehicleForm.model} onChange={e => setVehicleForm({ ...vehicleForm, model: e.target.value })} required style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '10px' }} />
            <input type="text" placeholder="Vehicle Number" value={vehicleForm.vehicleNumber} onChange={e => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })} required style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '10px' }} />

            {/* Vehicle Photo Upload */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>Vehicle Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setVehicleForm({ ...vehicleForm, vehiclePhoto: reader.result });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                required
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px',
                  background: '#333',
                  color: 'white',
                  border: '1px solid #555',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              />
              {vehicleForm.vehiclePhoto && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <img src={vehicleForm.vehiclePhoto} alt="Vehicle Preview" style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px', border: '2px solid #1abc9c' }} />
                </div>
              )}
            </div>

            <select value={vehicleForm.type} onChange={e => setVehicleForm({ ...vehicleForm, type: e.target.value })} style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '10px', background: '#333', color: 'white' }}>
              <option value="CAR">Car</option>
              <option value="BIKE">Bike</option>
              <option value="VAN">Van</option>
            </select>
            <button type="submit">Submit Vehicle</button>
          </form>
        </div>
      )}

      {tab === "post-trip" && (
        <div className="card" style={{ width: '100%', maxWidth: '800px' }}>
          <h3>Post a Trip</h3>
          {vehicles.filter(v => v.approved).length === 0 ? (
            <div style={{ color: '#f39c12', padding: '10px', border: '1px solid #f39c12', borderRadius: '5px' }}>
              <p>You need an <b>Approved</b> vehicle to post a trip.</p>
            </div>
          ) : (
            <form onSubmit={handlePostTrip}>
              <div style={{ marginBottom: '15px' }}>
                <label>Select Vehicle</label>
                <select
                  value={tripForm.vehicleId}
                  onChange={e => setTripForm({ ...tripForm, vehicleId: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#333', color: 'white', border: 'none', borderRadius: '5px' }}>
                  {vehicles.filter(v => v.approved).map(v => (
                    <option key={v.id} value={v.id}>{v.model} - {v.vehicleNumber}</option>
                  ))}
                </select>
              </div>
              <input type="text" placeholder="From (Source)" value={tripForm.source} onChange={e => setTripForm({ ...tripForm, source: e.target.value })} required style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '10px' }} />
              <input type="text" placeholder="To (Destination)" value={tripForm.destination} onChange={e => setTripForm({ ...tripForm, destination: e.target.value })} required style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '10px' }} />
              <label style={{ display: 'block', margin: '10px 0 5px' }}>Start Time</label>
              <input type="datetime-local" value={tripForm.startTime} onChange={e => setTripForm({ ...tripForm, startTime: e.target.value })} required style={{ display: 'block', marginBottom: '20px', width: '100%', padding: '10px' }} />
              <button type="submit">Post Trip Offer</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
