import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getPendingBookings, confirmBooking, getActiveTrips } from "../../services/tripService";
import { getVehicles, getPendingVehicles, getApprovedVehicles, approveVehicle, denyVehicle, toggleVehicleApproval } from "../../services/vehicleService";
import { VehicleWearChart, FleetHealthChart } from "../../components/admin/AnalyticsCharts";
import DriverProfileModal from "../../components/common/DriverProfileModal";
import { Car, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";

const ManagerDashboard = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]); // Generic data state
  const [approvalSubTab, setApprovalSubTab] = useState("pending"); // for vehicle-approval
  const [selectedDriver, setSelectedDriver] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === "bookings") {
        const res = await getPendingBookings();
        setData(res);
      } else if (tab === "vehicle-approval") {
        const res = approvalSubTab === "pending" ? await getPendingVehicles() : await getApprovedVehicles();
        setData(res);
      } else if (tab === "active-vehicles") {
        const res = await getApprovedVehicles();
        setData(res);
      } else if (tab === "active-trips") {
        const res = await getActiveTrips();
        setData(res);
      } else {
        // Default dashboard data if needed
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tab, approvalSubTab]);

  // Actions
  const handleConfirmBooking = async (id) => {
    if (!window.confirm("Confirm this trip?")) return;
    try {
      await confirmBooking(id);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to confirm booking.");
    }
  };

  const handleApprove = async (id) => {
    await approveVehicle(id);
    loadData();
  };

  const handleDeny = async (id) => {
    await denyVehicle(id);
    loadData();
  };

  const handleRevoke = async (id) => {
    if (!window.confirm("Revoke approval for this vehicle?")) return;
    await toggleVehicleApproval(id); // Toggles to false
    loadData();
  };

  // Render Helpers
  const renderDriverInfo = (driver) => (
    <div
      onClick={(e) => { e.stopPropagation(); setSelectedDriver(driver); }}
      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
    >
      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: driver?.photoUrl ? `url(${driver.photoUrl}) center/cover` : '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000', fontSize: '12px' }}>
        {!driver?.photoUrl && driver?.name?.charAt(0).toUpperCase()}
      </div>
      <div>
        <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1abc9c' }}>{driver?.name || 'Unknown'}</div>
        <div style={{ fontSize: '11px', color: '#ddd' }}>{driver?.driverRatingLabel || 'New Driver'}</div>
      </div>
    </div>
  );

  // Views
  if (!tab) {
    return (
      <div className="page-center" style={{ flexDirection: 'column', padding: '40px', justifyContent: 'flex-start' }}>
        <h1>Manager Dashboard</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%', maxWidth: '1000px', marginTop: '30px' }}>
          <VehicleWearChart />
          <FleetHealthChart />
        </div>
      </div>
    );
  }

  return (
    <div className="page-center" style={{ flexDirection: 'column', padding: '40px', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
      <h2 style={{ marginBottom: '20px', textTransform: 'capitalize' }}>{tab.replace('-', ' ')}</h2>

      {loading && <p>Loading...</p>}

      {/* Pending Trips (Bookings) */}
      {tab === "bookings" && !loading && (
        <div className="card" style={{ width: '100%', maxWidth: '1000px' }}>
          {data.length === 0 ? <p>No pending bookings.</p> : (
            <table width="100%" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #444" }}>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Customer</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Route</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Price</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map(b => (
                  <tr key={b.id} style={{ borderBottom: "1px solid #333" }}>
                    <td style={{ padding: '10px' }}>{b.customer?.name || b.customer?.email}</td>
                    <td style={{ padding: '10px' }}>{b.pickupLocation} &rarr; {b.dropLocation}</td>
                    <td style={{ padding: '10px' }}>${b.totalPrice?.toFixed(2)}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <button onClick={() => handleConfirmBooking(b.id)} style={{ padding: '6px 12px', width: 'auto' }}>Confirm</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Vehicle Approval */}
      {tab === "vehicle-approval" && (
        <div style={{ width: '100%', maxWidth: '1000px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => setApprovalSubTab("pending")} style={{ padding: '10px 20px', background: approvalSubTab === "pending" ? '#1abc9c' : '#333', border: 'none', borderRadius: '5px', color: '#fff' }}>Waiting for Approval</button>
            <button onClick={() => setApprovalSubTab("approved")} style={{ padding: '10px 20px', background: approvalSubTab === "approved" ? '#1abc9c' : '#333', border: 'none', borderRadius: '5px', color: '#fff' }}>Approved Vehicles</button>
          </div>

          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {data.map(v => (
                <div key={v.id} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>{v.model}</h3>
                    <b style={{ color: v.approved ? '#2ecc71' : '#f39c12' }}>{v.approved ? 'APPROVED' : 'PENDING'}</b>
                  </div>
                  <p>{v.vehicleNumber}</p>
                  {renderDriverInfo(v.driver)}
                  <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    {!v.approved ? (
                      <>
                        <button onClick={() => handleApprove(v.id)} style={{ background: '#2ecc71' }}>Approve</button>
                        <button onClick={() => handleDeny(v.id)} style={{ background: '#e74c3c' }}>Deny</button>
                      </>
                    ) : (
                      <button onClick={() => handleRevoke(v.id)} style={{ background: '#e74c3c' }}>Revoke Approval</button>
                    )}
                  </div>
                </div>
              ))}
              {data.length === 0 && <p>No vehicles found.</p>}
            </div>
          )}
        </div>
      )}

      {/* Active Vehicles (Available Vehicles) */}
      {tab === "active-vehicles" && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', width: '100%', maxWidth: '1000px' }}>
          {data.map(v => (
            <div key={v.id} className="card" style={{ padding: '20px' }}>
              <h3>{v.model}</h3>
              <p>{v.vehicleNumber}</p>
              <p style={{ color: '#aaa', fontSize: '13px' }}>{v.seatCapacity} Seats • {v.fuelType || 'Electric'}</p>
              {renderDriverInfo(v.driver)}
            </div>
          ))}
          {data.length === 0 && <p>No active vehicles found.</p>}
        </div>
      )}

      {/* Active Trips (Available Trips) */}
      {tab === "active-trips" && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', width: '100%', maxWidth: '1000px' }}>
          {data.map(trip => (
            <div key={trip.id} className="card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 5px', color: '#1abc9c' }}>{trip.source} &rarr; {trip.destination}</h3>
                <p style={{ margin: '0', color: '#aaa' }}>Departing: {new Date(trip.startTime).toLocaleString()}</p>
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#fff' }}>
                  Vehicle: <b>{trip.vehicle?.model}</b> ({trip.vehicle?.vehicleNumber})
                </div>
              </div>
              <div style={{ minWidth: '200px' }}>
                {renderDriverInfo(trip.driver)}
              </div>
            </div>
          ))}
          {data.length === 0 && <p>No active trips found.</p>}
        </div>
      )}

      {selectedDriver && <DriverProfileModal driver={selectedDriver} onClose={() => setSelectedDriver(null)} />}
    </div>
  );
};

export default ManagerDashboard;