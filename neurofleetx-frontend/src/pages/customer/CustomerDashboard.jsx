import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { searchTripOffers, createBooking, getTripRecommendations, getMyBookings } from "../../services/tripService";
import ReviewModal from "../../components/common/ReviewModal";
import OpenStreetMapRoute from "../../components/map/OpenStreetMapRoute";
import VehicleDetailsModal from "../../components/common/VehicleDetailsModal";

// --- Sub-Components Defined Outside to Prevent Remounting ---

const SearchForm = ({ formState, setFormState, handleSearch, loading, error, setOffers, setTab }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [localSource, setLocalSource] = useState(formState.source);

  // Debounce recommendations
  useEffect(() => {
    if (localSource.length > 2) {
      const fetchRecs = async () => {
        try {
          const recs = await getTripRecommendations(localSource);
          setSuggestions(recs || []);
        } catch (e) {
          console.error(e);
        }
      };
      const timeoutId = setTimeout(fetchRecs, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
    }
  }, [localSource]);

  const handleSuggestionClick = (recString) => {
    // "Coimbatore to Chennai"
    const parts = recString.split(" to ");
    if (parts.length === 2) {
      setFormState(prev => ({ ...prev, source: parts[0], destination: parts[1] }));
      setLocalSource(parts[0]);
      setSuggestions([]);
    }
  };

  return (
    <div className="card" style={{ width: "100%", maxWidth: '500px' }}>
      <h2>Find Your Ride</h2>
      <form onSubmit={handleSearch}>
        <div style={{ marginBottom: "15px", position: 'relative' }}>
          <label>From</label>
          <input
            type="text"
            placeholder="Pickup Location"
            value={localSource}
            onChange={(e) => {
              setLocalSource(e.target.value);
              setFormState(prev => ({ ...prev, source: e.target.value }));
            }}
            required
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: '#2c3e50', border: '1px solid #444',
              listStyle: 'none', padding: 0, margin: 0, zIndex: 100,
              maxHeight: '200px', overflowY: 'auto'
            }}>
              {suggestions.map((s, idx) => (
                <li key={idx}
                  onClick={() => handleSuggestionClick(s)}
                  style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #333' }}
                  onMouseEnter={(e) => e.target.style.background = '#34495e'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>To</label>
          <input
            type="text"
            placeholder="Drop Location"
            value={formState.destination}
            onChange={(e) => setFormState(prev => ({ ...prev, destination: e.target.value }))}
            required
          />
        </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label>Date</label>
            <input
              type="date"
              value={formState.date}
              onChange={(e) => setFormState(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Time</label>
            <input
              type="time"
              value={formState.time}
              onChange={(e) => setFormState(prev => ({ ...prev, time: e.target.value }))}
              required
            />
          </div>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search Routes"}
        </button>
      </form>
      {error && <p className="error" style={{ marginTop: '10px' }}>{error}</p>}
    </div>
  );
};

const VehicleSelection = ({ offers, handleSelect, setTab, formState, setSelectedVehicleForModal, setShowVehicleModal }) => (
  <div style={{ width: '100%', maxWidth: '900px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <button onClick={() => setTab("search")} style={{ background: 'transparent', border: '1px solid #fff', width: 'auto', padding: '10px 20px', color: '#fff' }}>
        &larr; Back
      </button>
      <h2>Select Route & Vehicle</h2>
    </div>

    <div style={{ marginBottom: '20px', background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#1abc9c' }}>Route Preview</h3>
      <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
        <OpenStreetMapRoute
          origin={formState.source}
          destination={formState.destination}
          onRouteCalculated={(routeInfo) => {
            console.log('Route calculated:', routeInfo);
          }}
        />
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
      {offers.length === 0 ? <p>No vehicles found for this route.</p> : offers.map(offer => (
        <div
          key={offer.id}
          className="card"
          style={{
            width: '100%',
            animation: 'fadeIn 0.5s',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: '2px solid transparent'
          }}
          onClick={() => {
            setSelectedVehicleForModal(offer);
            setShowVehicleModal(true);
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(26, 188, 156, 0.3)';
            e.currentTarget.style.borderColor = '#1abc9c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <h3>{offer.vehicle?.model || "Unknown Model"}</h3>
            <span style={{ background: '#1abc9c', color: '#000', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
              {offer.vehicle?.type}
            </span>
          </div>
          <p style={{ opacity: 0.8, fontSize: '14px', margin: '5px 0' }}>Driver: {offer.vehicle?.driverName || offer.driver?.name || offer.driver?.fullName || offer.driver?.email}</p>
          <p>⭐ 4.8 (120 trips)</p>
          <p>Seats: {offer.availableSeats}</p>
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: 'rgba(26, 188, 156, 0.1)',
            borderRadius: '6px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#1abc9c',
            fontWeight: 'bold'
          }}>
            Click to view details
          </div>
        </div>
      ))}
    </div>
  </div>
);

const BookingReview = ({ formState, selectedOffer, handleConfirmBooking, loading, error, setTab }) => {
  const distance = 15.5; // Mock distance
  const baseRate = 30;
  const isOneWay = true;
  const basePrice = distance * baseRate;
  const surcharge = isOneWay ? basePrice * 0.40 : 0;
  const total = basePrice + surcharge;

  return (
    <div className="card" style={{ width: "100%", maxWidth: "500px" }}>
      <button onClick={() => setTab("select")} style={{ background: 'transparent', border: 'none', color: '#1abc9c', cursor: 'pointer', marginBottom: '10px' }}>
        &larr; Change Vehicle
      </button>
      <h2>Review & Book</h2>

      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
        <p><strong>From:</strong> {formState.source}</p>
        <p><strong>To:</strong> {formState.destination}</p>
        <p><strong>Date:</strong> {formState.date} at {formState.time}</p>
        <hr style={{ opacity: 0.2, margin: '10px 0' }} />
        <p><strong>Vehicle:</strong> {selectedOffer?.vehicle?.model}</p>
        <p><strong>Driver:</strong> {selectedOffer?.driver?.fullName || "NeuroDriver"}</p>
      </div>

      <div style={{ padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #444', paddingBottom: '5px' }}>Fare Breakdown</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
          <span>Base Fare ({distance} km x ${baseRate}):</span>
          <span>${basePrice.toFixed(2)}</span>
        </div>
        {isOneWay && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px', color: '#FEB019' }}>
            <span>One-Way Surcharge (40%):</span>
            <span>${surcharge.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #444' }}>
          <span>Total:</span>
          <span style={{ color: '#1abc9c' }}>${total.toFixed(2)}</span>
        </div>
      </div>

      <button onClick={handleConfirmBooking} disabled={loading}>
        {loading ? "Booking..." : "Book Trip"}
      </button>
      {error && <p className="error" style={{ marginTop: '10px' }}>{error}</p>}
    </div>
  );
};

const BookingStatus = ({ bookingResult, setTab, setShowReviewModal }) => (
  <div className="card" style={{ width: "100%", maxWidth: "500px", textAlign: 'center' }}>
    <h2 style={{ color: '#1abc9c' }}>Booking Requested!</h2>
    <p>Your trip status is currently:</p>
    <div style={{
      background: '#f39c12', color: 'white', padding: '10px',
      borderRadius: '8px', display: 'inline-block', margin: '20px 0', fontWeight: 'bold'
    }}>
      {bookingResult?.status || "PENDING"}
    </div>
    <p>You will be notified once a manager confirms your trip.</p>
    <button onClick={() => { setTab("search"); }} style={{ marginTop: '20px' }}>
      Book Another Trip
    </button>

    <div style={{
      marginTop: '30px', padding: '15px', background: 'rgba(26, 188, 156, 0.1)',
      border: '1px solid #1abc9c', borderRadius: '8px', textAlign: 'left'
    }}>
      <strong>🔔 Notification:</strong>
      <p style={{ margin: '5px 0', fontSize: '14px' }}>
        When your trip is <strong>CONFIRMED</strong>, driver contact info will appear here.
      </p>
    </div>

    <button onClick={() => setShowReviewModal(true)} style={{ marginTop: '20px', background: '#3498db', border: 'none' }}>
      Leave a Review
    </button>
  </div>
);

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const data = await getMyBookings();
        setBookings(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <p>Loading history...</p>;

  return (
    <div className="card" style={{ width: '100%', maxWidth: '900px' }}>
      <h3>My Booking History</h3>
      {bookings.length === 0 ? <p>No bookings found.</p> : (
        <table width="100%" style={{ borderCollapse: 'collapse', marginTop: '15px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #444' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>Route</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '10px' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '10px' }}>{b.pickupLocation} &rarr; {b.dropLocation}</td>
                <td style={{ padding: '10px' }}>{new Date().toLocaleDateString()}</td> {/* Mock Date if missing */}
                <td style={{ padding: '10px' }}>
                  <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                    background: b.status === 'CONFIRMED' ? '#2ecc71' : b.status === 'PENDING' ? '#f39c12' : '#e74c3c',
                    color: 'white'
                  }}>
                    {b.status}
                  </span>
                </td>
                <td style={{ padding: '10px', textAlign: 'right' }}>${b.totalPrice?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};


const CustomerDashboard = () => {
  const [searchParamsUrl, setSearchParamsUrl] = useSearchParams();
  const tab = searchParamsUrl.get("tab") || "search";

  // State
  const [formState, setFormState] = useState({
    source: "",
    destination: "",
    date: "",
    time: ""
  });
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [selectedVehicleForModal, setSelectedVehicleForModal] = useState(null);

  // Helper to change tab via URL
  const setTab = (newTab) => {
    setSearchParamsUrl({ tab: newTab });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await searchTripOffers(formState.source, formState.destination);
      setOffers(data);
      setTab("select");
    } catch (err) {
      console.error(err);
      setError("Failed to search trips. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (offer) => {
    setSelectedOffer(offer);
    setTab("review");
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError("");
    try {
      const mockDistance = 15.5;
      const isOneWay = true;

      await createBooking({
        tripOfferId: selectedOffer.id,
        pickupLocation: formState.source,
        dropLocation: formState.destination,
        distanceKm: mockDistance,
        oneWay: isOneWay
      });
      setBookingResult({ status: "PENDING" });
      setTab("status");
    } catch (err) {
      console.error(err);
      setError("Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center" style={{ flexDirection: 'column', padding: '40px', justifyContent: 'flex-start' }}>
      {/* Search View */}
      {tab === "search" && (
        <SearchForm
          formState={formState} setFormState={setFormState}
          handleSearch={handleSearch} loading={loading} error={error}
          setOffers={setOffers} setTab={setTab}
        />
      )}

      {/* Selection View */}
      {tab === "select" && (
        <VehicleSelection
          offers={offers}
          handleSelect={handleSelect}
          setTab={setTab}
          formState={formState}
          setSelectedVehicleForModal={setSelectedVehicleForModal}
          setShowVehicleModal={setShowVehicleModal}
        />
      )}

      {/* Review View */}
      {tab === "review" && (
        <BookingReview
          formState={formState} selectedOffer={selectedOffer}
          handleConfirmBooking={handleConfirmBooking} loading={loading} error={error} setTab={setTab}
        />
      )}

      {/* Status View */}
      {tab === "status" && (
        <BookingStatus
          bookingResult={bookingResult} setTab={setTab} setShowReviewModal={setShowReviewModal}
        />
      )}

      {/* Bookings History View (Sidebar item) */}
      {tab === "bookings" && (
        <MyBookings />
      )}

      {/* Dashboard Default (if navigated directly) */}
      {tab === "dashboard" && (
        <div style={{ textAlign: 'center' }}>
          <h1>Welcome Customer</h1>
          <p>Please use the sidebar to Search Trip or view Bookings.</p>
          <button onClick={() => setTab("search")} style={{ padding: '10px 20px', marginTop: '20px' }}>Start Search</button>
        </div>
      )}

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        vehicleId={selectedOffer?.vehicle?.id}
        onSuccess={() => console.log("Review added")}
      />

      <VehicleDetailsModal
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        offer={selectedVehicleForModal}
        onSelect={handleSelect}
      />
    </div>
  );
};

export default CustomerDashboard;