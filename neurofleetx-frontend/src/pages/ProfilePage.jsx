import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "../services/userService";

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        photoUrl: ''
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await getUserProfile();
            setProfile(data);
            setFormData({
                name: data.name || '',
                phone: data.phone || '',
                photoUrl: data.photoUrl || ''
            });
            setPhotoPreview(data.photoUrl);
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let photoUrl = formData.photoUrl;

            // If user selected a new photo, convert to base64
            if (photoFile) {
                const reader = new FileReader();
                reader.readAsDataURL(photoFile);
                await new Promise((resolve) => {
                    reader.onloadend = () => {
                        photoUrl = reader.result;
                        resolve();
                    };
                });
            }

            const updatedData = {
                ...formData,
                photoUrl
            };

            console.log('Updating profile with photo URL length:', photoUrl ? photoUrl.length : 0);
            await updateUserProfile(updatedData);
            alert('Profile updated successfully!');
            setEditing(false);
            setPhotoFile(null);
            loadProfile();
        } catch (error) {
            console.error('Failed to update profile:', error);
            let errorMessage = 'Failed to update profile. Please try again.';

            if (error.response) {
                // Server responded with error
                if (error.response.data && error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else {
                    errorMessage = `Server error: ${error.response.status}`;
                }
            } else if (error.request) {
                // Request made but no response
                errorMessage = 'No response from server. Please check your connection.';
            }

            alert(errorMessage);
        }
    };

    if (!profile) return <div className="page-center">Loading...</div>;

    return (
        <div className="page-center" style={{ flexDirection: 'column' }}>
            <div className="card" style={{ textAlign: 'center', maxWidth: '600px', width: '100%' }}>
                {!editing ? (
                    <>
                        <div style={{
                            width: '120px', height: '120px', borderRadius: '50%',
                            background: photoPreview ? `url(${photoPreview}) center/cover` : '#1abc9c',
                            margin: '0 auto 20px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '48px', fontWeight: 'bold', color: '#000',
                            border: '4px solid #1abc9c'
                        }}>
                            {!photoPreview && profile.name?.charAt(0).toUpperCase()}
                        </div>
                        <h2>{profile.name}</h2>
                        <p style={{ color: '#aaa', marginBottom: '20px' }}>{profile.email}</p>
                        <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                            <p><strong>Role:</strong> {profile.role}</p>
                            <p><strong>Phone:</strong> {profile.phone || 'Not set'}</p>
                            <p><strong>Status:</strong> <span style={{ color: '#1abc9c' }}>{profile.status}</span></p>
                        </div>
                        <button
                            onClick={() => setEditing(true)}
                            style={{
                                padding: '12px 30px',
                                background: '#1abc9c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            Edit Profile
                        </button>
                    </>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <h3 style={{ marginBottom: '20px' }}>Edit Profile</h3>

                        {/* Photo Upload */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{
                                width: '120px', height: '120px', borderRadius: '50%',
                                background: photoPreview ? `url(${photoPreview}) center/cover` : '#1abc9c',
                                margin: '0 auto 15px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '48px', fontWeight: 'bold', color: '#000',
                                border: '4px solid #1abc9c',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {!photoPreview && formData.name?.charAt(0).toUpperCase()}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        opacity: 0,
                                        cursor: 'pointer'
                                    }}
                                />
                            </div>
                            <p style={{ fontSize: '14px', color: '#aaa' }}>Click photo to change</p>
                        </div>

                        {/* Name */}
                        <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    background: '#333',
                                    border: '1px solid #555',
                                    borderRadius: '5px',
                                    color: 'white'
                                }}
                            />
                        </div>

                        {/* Phone */}
                        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    background: '#333',
                                    border: '1px solid #555',
                                    borderRadius: '5px',
                                    color: 'white'
                                }}
                            />
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                type="submit"
                                style={{
                                    padding: '12px 30px',
                                    background: '#1abc9c',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditing(false);
                                    setPhotoFile(null);
                                    setPhotoPreview(profile.photoUrl);
                                    setFormData({
                                        name: profile.name || '',
                                        phone: profile.phone || '',
                                        photoUrl: profile.photoUrl || ''
                                    });
                                }}
                                style={{
                                    padding: '12px 30px',
                                    background: '#555',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
