import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '12px'
};

const defaultCenter = {
    lat: 11.0168, // Coimbatore
    lng: 76.9558
};

const GoogleMapComponent = ({ source, destination, onRouteSelect }) => {
    const [directionsResponse, setDirectionsResponse] = useState(null);

    // Note: ideally API key should be in env var
    const API_KEY = "AIzaSyAJ_6A2jjkknP3DSNk0YdmBOTbTRV2sf2U";

    const directionsCallback = useCallback((response) => {
        if (response !== null) {
            if (response.status === 'OK') {
                setDirectionsResponse(response);
            } else {
                console.error('Directions request failed response: ', response);
            }
        }
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden' }}>
            <LoadScript googleMapsApiKey={API_KEY}>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={defaultCenter}
                    zoom={10}
                    options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                        styles: [
                            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                            {
                                featureType: "administrative.locality",
                                elementType: "labels.text.fill",
                                stylers: [{ color: "#d59563" }],
                            },
                            {
                                featureType: "road",
                                elementType: "geometry",
                                stylers: [{ color: "#38414e" }],
                            },
                            {
                                featureType: "road",
                                elementType: "geometry.stroke",
                                stylers: [{ color: "#212a37" }],
                            },
                            {
                                featureType: "road.highway",
                                elementType: "geometry",
                                stylers: [{ color: "#746855" }],
                            },
                            {
                                featureType: "road.highway",
                                elementType: "geometry.stroke",
                                stylers: [{ color: "#1f2835" }],
                            },
                            {
                                featureType: "water",
                                elementType: "geometry",
                                stylers: [{ color: "#17263c" }],
                            },
                        ],
                    }}
                >
                    {source && destination && (
                        <DirectionsService
                            options={{
                                destination: destination,
                                origin: source,
                                travelMode: 'DRIVING'
                            }}
                            callback={directionsCallback}
                        />
                    )}

                    {directionsResponse && (
                        <DirectionsRenderer
                            options={{
                                directions: directionsResponse,
                                polylineOptions: {
                                    strokeColor: "#00E396",
                                    strokeWeight: 6,
                                    strokeOpacity: 0.8
                                }
                            }}
                        />
                    )}
                </GoogleMap>
            </LoadScript>
        </div>
    );
};

export default GoogleMapComponent;
