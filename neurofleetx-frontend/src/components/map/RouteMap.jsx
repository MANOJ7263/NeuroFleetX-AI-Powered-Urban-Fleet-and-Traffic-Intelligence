import { useEffect, useRef, useState } from 'react';

const RouteMap = ({ origin, destination, onRouteCalculated }) => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [directionsService, setDirectionsService] = useState(null);
    const [directionsRenderer, setDirectionsRenderer] = useState(null);
    const [error, setError] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);

    // Load Google Maps Script
    useEffect(() => {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            setError('Google Maps API key not configured');
            return;
        }

        // Check if script already loaded
        if (window.google && window.google.maps) {
            initializeMap();
            return;
        }

        // Load script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => initializeMap();
        script.onerror = () => setError('Failed to load Google Maps');
        document.head.appendChild(script);

        return () => {
            // Cleanup if needed
        };
    }, []);

    const initializeMap = () => {
        if (!mapRef.current || !window.google) return;

        const mapInstance = new window.google.maps.Map(mapRef.current, {
            center: { lat: 11.0168, lng: 76.9558 }, // Coimbatore, India
            zoom: 7,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
        });

        const dirService = new window.google.maps.DirectionsService();
        const dirRenderer = new window.google.maps.DirectionsRenderer({
            map: mapInstance,
            suppressMarkers: false,
            polylineOptions: {
                strokeColor: '#1abc9c',
                strokeWeight: 5,
                strokeOpacity: 0.8,
            },
        });

        setMap(mapInstance);
        setDirectionsService(dirService);
        setDirectionsRenderer(dirRenderer);
    };

    // Calculate route when origin/destination change
    useEffect(() => {
        if (!directionsService || !directionsRenderer || !origin || !destination) return;

        calculateRoute();
    }, [origin, destination, directionsService, directionsRenderer]);

    const calculateRoute = () => {
        if (!directionsService || !directionsRenderer) return;

        setError(null);
        setRouteInfo(null);

        const request = {
            origin: origin,
            destination: destination,
            travelMode: window.google.maps.TravelMode.DRIVING,
            unitSystem: window.google.maps.UnitSystem.METRIC,
        };

        directionsService.route(request, (result, status) => {
            if (status === 'OK') {
                directionsRenderer.setDirections(result);

                const route = result.routes[0];
                const leg = route.legs[0];

                const info = {
                    distance: leg.distance.text,
                    distanceValue: leg.distance.value / 1000, // km
                    duration: leg.duration.text,
                    durationValue: leg.duration.value / 60, // minutes
                    startAddress: leg.start_address,
                    endAddress: leg.end_address,
                };

                setRouteInfo(info);

                // Callback to parent with route info
                if (onRouteCalculated) {
                    onRouteCalculated(info);
                }
            } else {
                setError(`Route calculation failed: ${status}`);
                console.error('Directions request failed:', status);
            }
        });
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div
                ref={mapRef}
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px',
                    minHeight: '400px',
                }}
            />

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

export default RouteMap;
