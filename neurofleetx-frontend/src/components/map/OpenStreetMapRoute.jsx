import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to fit bounds when route changes
const FitBounds = ({ positions }) => {
    const map = useMap();

    useEffect(() => {
        if (positions && positions.length > 0) {
            const bounds = L.latLngBounds(positions);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [positions, map]);

    return null;
};

const OpenStreetMapRoute = ({ origin, destination, onRouteCalculated }) => {
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [startCoord, setStartCoord] = useState(null);
    const [endCoord, setEndCoord] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Geocode location name to coordinates using Nominatim (free)
    const geocodeLocation = async (locationName) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}, India&limit=1`
            );
            const data = await response.json();
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon),
                    display_name: data[0].display_name
                };
            }
            throw new Error('Location not found');
        } catch (err) {
            console.error('Geocoding error:', err);
            throw err;
        }
    };

    // Get route using OpenRouteService (free API)
    const getRoute = async (start, end) => {
        try {
            // Using OSRM (Open Source Routing Machine) - completely free, no API key needed
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson`
            );
            const data = await response.json();

            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                const route = data.routes[0];

                // Convert coordinates to Leaflet format [lat, lng]
                const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

                const distanceKm = (route.distance / 1000).toFixed(2);
                const durationMin = Math.round(route.duration / 60);
                const durationHrs = Math.floor(durationMin / 60);
                const remainingMin = durationMin % 60;

                const info = {
                    distance: `${distanceKm} km`,
                    distanceValue: parseFloat(distanceKm),
                    duration: durationHrs > 0 ? `${durationHrs}h ${remainingMin}m` : `${remainingMin} min`,
                    durationValue: durationMin,
                    startAddress: start.display_name,
                    endAddress: end.display_name,
                };

                setRouteInfo(info);
                setRouteCoordinates(coordinates);

                if (onRouteCalculated) {
                    onRouteCalculated(info);
                }

                return coordinates;
            } else {
                throw new Error('Route not found');
            }
        } catch (err) {
            console.error('Routing error:', err);
            throw err;
        }
    };

    // Calculate route when origin/destination change
    useEffect(() => {
        const calculateRoute = async () => {
            if (!origin || !destination) return;

            setLoading(true);
            setError(null);

            try {
                // Geocode both locations
                const [startLoc, endLoc] = await Promise.all([
                    geocodeLocation(origin),
                    geocodeLocation(destination)
                ]);

                setStartCoord(startLoc);
                setEndCoord(endLoc);

                // Get route
                await getRoute(startLoc, endLoc);
            } catch (err) {
                setError(err.message || 'Failed to calculate route');
                console.error('Route calculation error:', err);
            } finally {
                setLoading(false);
            }
        };

        calculateRoute();
    }, [origin, destination]);

    // Default center (India)
    const defaultCenter = [20.5937, 78.9629];
    const defaultZoom = 5;

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                style={{ width: '100%', height: '100%', borderRadius: '8px', minHeight: '400px' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Start Marker */}
                {startCoord && (
                    <Marker position={[startCoord.lat, startCoord.lon]}>
                        <Popup>
                            <strong>Start:</strong><br />
                            {origin}
                        </Popup>
                    </Marker>
                )}

                {/* End Marker */}
                {endCoord && (
                    <Marker position={[endCoord.lat, endCoord.lon]}>
                        <Popup>
                            <strong>Destination:</strong><br />
                            {destination}
                        </Popup>
                    </Marker>
                )}

                {/* Route Polyline */}
                {routeCoordinates.length > 0 && (
                    <>
                        <Polyline
                            positions={routeCoordinates}
                            color="#1abc9c"
                            weight={5}
                            opacity={0.8}
                        />
                        <FitBounds positions={routeCoordinates} />
                    </>
                )}
            </MapContainer>

            {/* Loading Indicator */}
            {loading && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#1abc9c',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    zIndex: 1000,
                }}>
                    Calculating route...
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#e74c3c',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    zIndex: 1000,
                }}>
                    {error}
                </div>
            )}

            {/* Route Info Overlay */}
            {routeInfo && (
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    background: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    padding: '15px 20px',
                    borderRadius: '8px',
                    zIndex: 1000,
                    minWidth: '250px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#1abc9c', fontSize: '16px' }}>Route Information</h4>
                    <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                        <div style={{ marginBottom: '5px' }}>
                            <strong>Distance:</strong> {routeInfo.distance}
                        </div>
                        <div style={{ marginBottom: '5px' }}>
                            <strong>Duration:</strong> {routeInfo.duration}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OpenStreetMapRoute;
