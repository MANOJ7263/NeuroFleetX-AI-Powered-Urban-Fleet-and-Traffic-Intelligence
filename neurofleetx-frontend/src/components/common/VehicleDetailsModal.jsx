import { useState, useEffect } from 'react';

const VehicleDetailsModal = ({ isOpen, onClose, offer, onSelect }) => {
    if (!isOpen || !offer) return null;

    const vehicle = offer.vehicle || {};
    const driver = offer.driver || {};

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px',
                animation: 'fadeIn 0.3s ease-in-out'
            }}
            onClick={onClose}
        >
            <div
                className="card"
                style={{
                    maxWidth: '800px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    position: 'relative',
                    animation: 'slideUp 0.3s ease-out'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        color: 'white',
                        width: '35px',
                        height: '35px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontSize: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.target.style.transform = 'rotate(90deg)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.transform = 'rotate(0deg)';
                    }}
                >
                    ×
                </button>

                <h2 style={{ marginBottom: '25px', color: '#1abc9c', borderBottom: '2px solid #1abc9c', paddingBottom: '10px' }}>
                    Vehicle & Driver Details
                </h2>

                {/* Vehicle Photo */}
                {vehicle.vehiclePhoto && (
                    <div style={{ marginBottom: '25px', textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '15px', color: '#aaa', fontSize: '16px' }}>Vehicle Photo</h3>
                        <div
                            style={{
                                width: '100%',
                                maxWidth: '500px',
                                height: '300px',
                                margin: '0 auto',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: '3px solid #1abc9c',
                                boxShadow: '0 8px 20px rgba(26, 188, 156, 0.3)'
                            }}
                        >
                            <img
                                src={vehicle.vehiclePhoto}
                                alt="Vehicle"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: rgba(255,255,255,0.05); color: #aaa;">No vehicle photo available</div>';
                                }}
                            />
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                    {/* Driver Details */}
                    <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '20px', borderRadius: '12px', border: '1px solid #444' }}>
                        <h3 style={{ marginBottom: '15px', color: '#1abc9c', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>👤</span> Driver Information
                        </h3>

                        {/* Driver Photo */}
                        {(vehicle.driverPhoto || driver.photoUrl) && (
                            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                                <div
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        margin: '0 auto',
                                        overflow: 'hidden',
                                        border: '3px solid #1abc9c',
                                        background: vehicle.driverPhoto || driver.photoUrl ? `url(${vehicle.driverPhoto || driver.photoUrl}) center/cover` : '#1abc9c'
                                    }}
                                >
                                    {!(vehicle.driverPhoto || driver.photoUrl) && (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '40px',
                                            fontWeight: 'bold',
                                            color: '#000'
                                        }}>
                                            {(vehicle.driverName || driver.name || driver.fullName || 'D').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                                <strong style={{ color: '#aaa', fontSize: '14px' }}>Name:</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '16px' }}>
                                    {vehicle.driverName || driver.name || driver.fullName || driver.email || 'Not available'}
                                </p>
                            </div>
                            <div>
                                <strong style={{ color: '#aaa', fontSize: '14px' }}>Phone:</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '16px' }}>
                                    {vehicle.driverPhone || driver.phone || 'Not available'}
                                </p>
                            </div>
                            <div>
                                <strong style={{ color: '#aaa', fontSize: '14px' }}>Email:</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '16px', wordBreak: 'break-word' }}>
                                    {driver.email || 'Not available'}
                                </p>
                            </div>
                            <div>
                                <strong style={{ color: '#aaa', fontSize: '14px' }}>Rating:</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '16px' }}>
                                    ⭐ 4.8 (120 trips)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Details */}
                    <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '20px', borderRadius: '12px', border: '1px solid #444' }}>
                        <h3 style={{ marginBottom: '15px', color: '#1abc9c', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>🚗</span> Vehicle Information
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                                <strong style={{ color: '#aaa', fontSize: '14px' }}>Model:</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '16px' }}>
                                    {vehicle.model || 'Unknown Model'}
                                </p>
                            </div>
                            <div>
                                <strong style={{ color: '#aaa', fontSize: '14px' }}>Type:</strong>
                                <p style={{ margin: '5px 0 0 0' }}>
                                    <span style={{
                                        background: '#1abc9c',
                                        color: '#000',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }}>
                                        {vehicle.type || 'CAR'}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <strong style={{ color: '#aaa', fontSize: '14px' }}>Vehicle Number:</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '16px', fontFamily: 'monospace', letterSpacing: '1px' }}>
                                    {vehicle.vehicleNumber || vehicle.licensePlate || 'Not available'}
                                </p>
                            </div>
                            <div>
                                <strong style={{ color: '#aaa', fontSize: '14px' }}>Seat Capacity:</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '16px' }}>
                                    {vehicle.seatCapacity || 4} seats
                                </p>
                            </div>
                            <div>
                                <strong style={{ color: '#aaa', fontSize: '14px' }}>Available Seats:</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '16px', color: '#1abc9c', fontWeight: 'bold' }}>
                                    {offer.availableSeats || vehicle.seatCapacity || 4} seats
                                </p>
                            </div>
                            {vehicle.costPerHour && (
                                <div>
                                    <strong style={{ color: '#aaa', fontSize: '14px' }}>Cost Per Hour:</strong>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '16px', color: '#1abc9c' }}>
                                        ${vehicle.costPerHour}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Trip Details */}
                <div style={{ background: 'rgba(26, 188, 156, 0.1)', padding: '20px', borderRadius: '12px', border: '1px solid #1abc9c', marginBottom: '25px' }}>
                    <h3 style={{ marginBottom: '15px', color: '#1abc9c', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🗺️</span> Trip Details
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <strong style={{ color: '#aaa', fontSize: '14px' }}>From:</strong>
                            <p style={{ margin: '5px 0 0 0', fontSize: '16px' }}>{offer.source || 'Not specified'}</p>
                        </div>
                        <div>
                            <strong style={{ color: '#aaa', fontSize: '14px' }}>To:</strong>
                            <p style={{ margin: '5px 0 0 0', fontSize: '16px' }}>{offer.destination || 'Not specified'}</p>
                        </div>
                        {offer.startTime && (
                            <div style={{ gridColumn: '1 / -1' }}>
                                <strong style={{ color: '#aaa', fontSize: '14px' }}>Departure Time:</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '16px' }}>
                                    {new Date(offer.startTime).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '12px 30px',
                            background: 'transparent',
                            border: '2px solid #555',
                            color: 'white',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = '#555';
                            e.target.style.borderColor = '#777';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.borderColor = '#555';
                        }}
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            onSelect(offer);
                            onClose();
                        }}
                        style={{
                            padding: '12px 30px',
                            background: 'linear-gradient(135deg, #1abc9c, #16a085)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 15px rgba(26, 188, 156, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(26, 188, 156, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(26, 188, 156, 0.3)';
                        }}
                    >
                        Select This Vehicle
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(50px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default VehicleDetailsModal;
