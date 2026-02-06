import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDriverConfirmedBookings } from '../../services/tripService';
import NavigationMap from '../../components/map/NavigationMap';
import NavigationHUD from '../../components/navigation/NavigationHUD';

const NavigationPage = () => {
    const navigate = useNavigate();
    const [routeData, setRouteData] = useState(null);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [optimalRoute, setOptimalRoute] = useState([]);
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [error, setError] = useState(null);

    const animationRef = useRef(null);
    const progressRef = useRef(0); // 0 to 1 along the path

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

    // Get route from OSRM
    const getRoute = async (start, end) => {
        try {
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?alternatives=true&steps=true&geometries=geojson&overview=full`
            );
            const data = await response.json();

            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                const route = data.routes[0]; // Use optimal route
                const coordinates = route.geometry.coordinates.map(coord => ({ lat: coord[1], lng: coord[0] }));
                const distanceKm = (route.distance / 1000).toFixed(1);
                const durationMin = Math.round(route.duration / 60);

                return {
                    path: coordinates,
                    totalDistanceKm: parseFloat(distanceKm),
                    estimatedTimeMinutes: durationMin,
                    baseTimeMinutes: durationMin, // For demo, same as estimated
                };
            }
        } catch (err) {
            console.error('Routing error:', err);
        }
        return null;
    };

    useEffect(() => {
        const fetchCurrentJob = async () => {
            try {
                // Fetch driver's confirmed bookings
                const confirmedTrips = await getDriverConfirmedBookings();

                if (!confirmedTrips || confirmedTrips.length === 0) {
                    setError('No active job found. Please accept a trip first.');
                    setLoading(false);
                    return;
                }

                // Get the first confirmed trip
                const currentJob = confirmedTrips[0];
                const pickupLocation = currentJob.pickupLocation;
                const dropLocation = currentJob.dropLocation;

                console.log('Current Job:', currentJob);
                console.log('Route:', pickupLocation, '→', dropLocation);

                setOrigin(pickupLocation);
                setDestination(dropLocation);

                // Geocode start and end
                const [start, end] = await Promise.all([
                    geocodeLocation(pickupLocation),
                    geocodeLocation(dropLocation)
                ]);

                if (start && end) {
                    const data = await getRoute(start, end);
                    if (data) {
                        setRouteData(data);
                        setOptimalRoute(data.path);
                        if (data.path && data.path.length > 0) {
                            setCurrentPosition(data.path[0]);
                        }
                    }
                } else {
                    setError('Failed to geocode locations. Please check the addresses.');
                }
            } catch (error) {
                console.error("Failed to load current job", error);
                setError('Failed to load your current job. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentJob();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    // Simulation Loop - animate vehicle along the route
    useEffect(() => {
        if (!optimalRoute || optimalRoute.length < 2) return;

        const animate = () => {
            progressRef.current += 0.001; // Speed of simulation (adjust for faster/slower)
            if (progressRef.current > 1) progressRef.current = 0; // Loop

            // Calculate position based on progress
            const totalSegments = optimalRoute.length - 1;
            const scaledProgress = progressRef.current * totalSegments;
            const currentSegmentIndex = Math.floor(scaledProgress);
            const segmentProgress = scaledProgress - currentSegmentIndex;

            const startNode = optimalRoute[currentSegmentIndex];
            const endNode = optimalRoute[currentSegmentIndex + 1];

            if (startNode && endNode) {
                const lat = startNode.lat + (endNode.lat - startNode.lat) * segmentProgress;
                const lng = startNode.lng + (endNode.lng - startNode.lng) * segmentProgress;
                setCurrentPosition({ lat, lng });
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationRef.current);
    }, [optimalRoute]);

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: '#000' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading your current job...</div>
                    <div style={{ fontSize: '14px', opacity: 0.7 }}>Calculating AI optimized route</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', background: '#000' }}>
                <div style={{ textAlign: 'center', maxWidth: '500px', padding: '20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
                    <div style={{ fontSize: '18px', marginBottom: '10px', color: '#e74c3c' }}>{error}</div>
                    <button
                        onClick={() => navigate('/driver/dashboard?tab=current-job')}
                        style={{
                            marginTop: '20px',
                            padding: '12px 24px',
                            background: '#1abc9c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '16px',
                        }}
                    >
                        Go to Current Job
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100vw', background: '#000' }}>
            {/* Map Background */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
                <NavigationMap
                    currentPosition={currentPosition}
                    origin={origin}
                    destination={destination}
                />
            </div>

            {/* HUD Overlay */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2, pointerEvents: 'none' }}>
                {routeData && (
                    <NavigationHUD
                        distanceKm={routeData.totalDistanceKm}
                        etaMinutes={routeData.estimatedTimeMinutes}
                        baseEtaMinutes={routeData.baseTimeMinutes}
                        firstManeuver="Head towards destination"
                    />
                )}

                {/* Top Bar for Context */}
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(5px)',
                    padding: '10px 30px',
                    borderRadius: '30px',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>Navigating to {destination}</h3>
                    <span style={{ fontSize: '12px', opacity: 0.7 }}>Following AI Optimized Route</span>
                </div>
            </div>

            {/* Back Button */}
            <button
                onClick={() => navigate('/driver/dashboard?tab=current-job')}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    zIndex: 10,
                    pointerEvents: 'auto',
                    background: 'white',
                    color: 'black',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
            >
                ←
            </button>
        </div>
    );
};

export default NavigationPage;
