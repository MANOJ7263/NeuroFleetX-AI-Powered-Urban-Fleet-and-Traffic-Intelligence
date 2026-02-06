import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom vehicle icon (car marker)
const vehicleIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#1abc9c">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
    </svg>
  `),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
});

// Component to update map view
const MapUpdater = ({ currentPosition, allRoutes }) => {
    const map = useMap();

    useEffect(() => {
        if (allRoutes && allRoutes.length > 0) {
            // Fit bounds to show all routes on initial load
            const allCoords = allRoutes.flatMap(route => route.coordinates);
            if (allCoords.length > 0) {
                const bounds = L.latLngBounds(allCoords);
                map.fitBounds(bounds, { padding: [80, 80] });
            }
        }
    }, [allRoutes, map]);

    // Don't auto-center on vehicle - let user see the whole route

    return null;
};

const NavigationMap = ({ path, currentPosition, origin, destination }) => {
    const [routes, setRoutes] = useState([]); // Multiple routes
    const [startCoord, setStartCoord] = useState(null);
    const [endCoord, setEndCoord] = useState(null);
    const [loading, setLoading] = useState(false);
    const [vehiclePosition, setVehiclePosition] = useState(null);

    // Geocode location
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
                };
            }
        } catch (err) {
            console.error('Geocoding error:', err);
        }
        return null;
    };

    // Get multiple alternative routes from OSRM
    const getAlternativeRoutes = async (start, end) => {
        try {
            setLoading(true);

            // OSRM request with alternatives=true and number of alternatives
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?alternatives=true&steps=true&geometries=geojson&overview=full&continue_straight=false`
            );
            const data = await response.json();

            console.log('OSRM Response:', data); // Debug log

            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                const routesData = data.routes.map((route, index) => {
                    const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                    const distanceKm = (route.distance / 1000).toFixed(1);
                    const durationMin = Math.round(route.duration / 60);

                    return {
                        id: index,
                        coordinates,
                        distance: distanceKm,
                        duration: durationMin,
                        isOptimal: index === 0, // First route is the optimal one
                        color: index === 0 ? '#1abc9c' : '#95a5a6', // Green for optimal, gray for alternatives
                        weight: index === 0 ? 6 : 4,
                        opacity: index === 0 ? 1 : 0.5,
                        label: index === 0 ? 'AI Optimized Route' : `Alternative ${index}`,
                    };
                });

                console.log('Processed routes:', routesData); // Debug log
                setRoutes(routesData);

                // Set initial vehicle position to start of optimal route
                if (routesData[0] && routesData[0].coordinates.length > 0) {
                    const firstCoord = routesData[0].coordinates[0];
                    setVehiclePosition({ lat: firstCoord[0], lng: firstCoord[1] });
                }
            }
        } catch (err) {
            console.error('Routing error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Initialize routes
    useEffect(() => {
        const initRoutes = async () => {
            if (origin && destination) {
                const [start, end] = await Promise.all([
                    geocodeLocation(origin),
                    geocodeLocation(destination)
                ]);

                if (start && end) {
                    setStartCoord(start);
                    setEndCoord(end);
                    await getAlternativeRoutes(start, end);
                }
            }
        };

        initRoutes();
    }, [origin, destination]);

    // Update vehicle position from parent component
    useEffect(() => {
        if (currentPosition) {
            setVehiclePosition(currentPosition);
        }
    }, [currentPosition]);

    // Default center
    const defaultCenter = vehiclePosition
        ? [vehiclePosition.lat, vehiclePosition.lng]
        : [11.0168, 76.9558]; // Coimbatore

    const defaultZoom = 7;

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                style={{ width: '100%', height: '100%' }}
                scrollWheelZoom={true}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Render all routes - alternatives first, then optimal on top */}
                {routes.length > 0 && routes
                    .slice()
                    .reverse() // Reverse so optimal route is drawn last (on top)
                    .map((route) => (
                        <Polyline
                            key={route.id}
                            positions={route.coordinates}
                            color={route.color}
                            weight={route.weight}
                            opacity={route.opacity}
                            dashArray={route.isOptimal ? null : '10, 10'} // Dashed for alternatives
                        >
                            <Popup>
                                <div>
                                    <strong>{route.label}</strong><br />
                                    Distance: {route.distance} km<br />
                                    Duration: {Math.floor(route.duration / 60)}h {route.duration % 60}m
                                    {route.isOptimal && <div style={{ color: '#1abc9c', marginTop: '5px' }}>✓ Fastest Route</div>}
                                </div>
                            </Popup>
                        </Polyline>
                    ))}

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

                {/* Current Vehicle Position */}
                {vehiclePosition && (
                    <Marker
                        position={[vehiclePosition.lat, vehiclePosition.lng]}
                        icon={vehicleIcon}
                        zIndexOffset={1000} // Ensure vehicle is always on top
                    >
                        <Popup>
                            <strong>Current Position</strong><br />
                            Following AI Optimized Route<br />
                            Lat: {vehiclePosition.lat.toFixed(5)}<br />
                            Lng: {vehiclePosition.lng.toFixed(5)}
                        </Popup>
                    </Marker>
                )}

                <MapUpdater currentPosition={vehiclePosition} allRoutes={routes} />
            </MapContainer>

            {/* Route Legend */}
            {routes.length > 1 && (
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    zIndex: 1000,
                    minWidth: '200px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1abc9c' }}>
                        Available Routes ({routes.length})
                    </h4>
                    {routes.map((route) => (
                        <div
                            key={route.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '8px',
                                fontSize: '12px',
                                opacity: route.isOptimal ? 1 : 0.7,
                            }}
                        >
                            <div style={{
                                width: '30px',
                                height: '3px',
                                background: route.color,
                                marginRight: '8px',
                                borderRadius: '2px',
                                opacity: route.opacity,
                                border: route.isOptimal ? 'none' : '1px dashed rgba(255,255,255,0.3)',
                            }} />
                            <div>
                                <div style={{ fontWeight: route.isOptimal ? 'bold' : 'normal' }}>
                                    {route.label}
                                    {route.isOptimal && ' ⭐'}
                                </div>
                                <div style={{ fontSize: '10px', opacity: 0.8 }}>
                                    {route.distance} km • {Math.floor(route.duration / 60)}h {route.duration % 60}m
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Loading Indicator */}
            {loading && (
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#1abc9c',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    zIndex: 1000,
                }}>
                    Calculating alternative routes...
                </div>
            )}

            {/* Debug Info */}
            {routes.length === 1 && (
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    background: 'rgba(255, 193, 7, 0.9)',
                    color: '#000',
                    padding: '10px',
                    borderRadius: '5px',
                    zIndex: 1000,
                    fontSize: '12px',
                }}>
                    ⚠️ Only 1 route found. OSRM may not have alternatives for this path.
                </div>
            )}
        </div>
    );
};

export default NavigationMap;
