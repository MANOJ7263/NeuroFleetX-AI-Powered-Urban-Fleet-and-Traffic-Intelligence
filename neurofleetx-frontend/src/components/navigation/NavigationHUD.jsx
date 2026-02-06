import React from 'react';
import { AlertTriangle, Clock, MapPin, Zap } from 'lucide-react';

const NavigationHUD = ({ distanceKm, etaMinutes, baseEtaMinutes, firstManeuver }) => {
    const timeSaved = Math.max(0, Math.round(baseEtaMinutes - etaMinutes));

    return (
        <div style={{
            position: 'absolute',
            bottom: '120px',
            left: '20px',
            background: 'rgba(23, 23, 23, 0.9)',
            backdropFilter: 'blur(10px)',
            padding: '20px',
            borderRadius: '16px',
            color: 'white',
            width: '300px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{
                    background: 'linear-gradient(45deg, #1abc9c, #16a085)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <Zap size={14} /> AI OPTIMIZED
                </div>
                {timeSaved > 0 && (
                    <span style={{ marginLeft: '10px', fontSize: '12px', color: '#1abc9c' }}>
                        Saved {timeSaved} mins via traffic bypass
                    </span>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div>
                    <p style={{ fontSize: '12px', opacity: 0.7, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> ETA
                    </p>
                    <h2 style={{ margin: 0, fontSize: '24px' }}>{Math.round(etaMinutes)} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>min</span></h2>
                </div>
                <div>
                    <p style={{ fontSize: '12px', opacity: 0.7, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> DISTANCE
                    </p>
                    <h2 style={{ margin: 0, fontSize: '24px' }}>{distanceKm} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>km</span></h2>
                </div>
            </div>

            <div style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '13px',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                marginBottom: '10px'
            }}>
                <div style={{ fontWeight: 'bold', color: '#fff', flex: 1 }} dangerouslySetInnerHTML={{ __html: firstManeuver }} />
            </div>

            <div style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '13px',
                display: 'flex',
                gap: '10px',
                alignItems: 'center'
            }}>
                <AlertTriangle size={16} color="#f39c12" />
                <span>Heavy traffic reported near Salem. Re-routing...</span>
            </div>
        </div>
    );
};

export default NavigationHUD;
