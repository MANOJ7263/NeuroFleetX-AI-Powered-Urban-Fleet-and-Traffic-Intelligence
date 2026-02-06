const DriverProfileModal = ({ driver, onClose }) => {
    if (!driver) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div className="card" style={{ width: '400px', animation: 'slideUp 0.3s ease' }} onClick={e => e.stopPropagation()}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '50%',
                        background: driver.photoUrl ? `url(${driver.photoUrl}) center/cover` : '#1abc9c',
                        margin: '0 auto 15px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '36px', fontWeight: 'bold', color: '#000'
                    }}>
                        {!driver.photoUrl && driver.name?.charAt(0).toUpperCase()}
                    </div>
                    <h2 style={{ margin: '0 0 5px' }}>{driver.name}</h2>
                    <span style={{ color: '#1abc9c', fontWeight: 'bold' }}>{driver.driverRatingLabel || 'New Driver'}</span>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '15px' }}>
                    <p style={{ margin: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#aaa' }}>Email:</span>
                        <span>{driver.email}</span>
                    </p>
                    <p style={{ margin: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#aaa' }}>Phone:</span>
                        <span>{driver.phone}</span>
                    </p>
                    <p style={{ margin: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#aaa' }}>Total Trips:</span>
                        <span>{driver.totalTrips || 0}</span>
                    </p>
                </div>

                <button onClick={onClose} style={{ marginTop: '20px', background: '#333' }}>Close</button>
            </div>
        </div>
    );
};

export default DriverProfileModal;
