import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { getUserRole, logout } from "../../utils/auth";
import { sidebarConfig } from "../../config/sidebarConfig";
import { LogOut } from "lucide-react";
import { getUserProfile } from "../../services/userService";
import { logoutApi } from "../../services/authService";

const MainLayout = () => {
    const role = getUserRole();
    const navigate = useNavigate();
    const location = useLocation();
    const navItems = sidebarConfig[role] || [];
    const [userProfile, setUserProfile] = useState({ name: "User", role: role, photoUrl: null });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getUserProfile();
                setUserProfile(data);
            } catch (err) {
                console.error("Failed to load profile", err);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = async () => {
        await logoutApi();
        logout(); // Clear client side
        navigate("/login");
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#090a0f' }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                background: '#14141f',
                borderRight: '1px solid #2f3b52',
                display: 'flex',
                flexDirection: 'column',
                padding: '20px',
                position: 'fixed',
                height: '100vh'
            }}>
                {/* Profile Section */}
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: userProfile.photoUrl ? `url(${userProfile.photoUrl}) center/cover` : '#1abc9c',
                        margin: '0 auto 15px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '32px', fontWeight: 'bold', color: '#000'
                    }}>
                        {!userProfile.photoUrl && userProfile.name?.charAt(0).toUpperCase()}
                    </div>
                    <h3 style={{ margin: '0 0 5px', color: '#fff' }}>{userProfile.name}</h3>
                    <span style={{
                        background: 'rgba(26, 188, 156, 0.2)', color: '#1abc9c',
                        padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'
                    }}>
                        {userProfile.role}
                    </span>
                </div>

                {/* Nav Items */}
                <nav style={{ flex: 1 }}>
                    {navItems.map((item, idx) => {
                        const Icon = item.icon;
                        const isActive = location.pathname + location.search === item.path;
                        return (
                            <div
                                key={idx}
                                onClick={() => navigate(item.path)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '12px 15px',
                                    borderRadius: '10px',
                                    marginBottom: '8px',
                                    cursor: 'pointer',
                                    background: isActive ? 'linear-gradient(90deg, rgba(26, 188, 156, 0.15), transparent)' : 'transparent',
                                    color: isActive ? '#1abc9c' : '#a0aec0',
                                    borderLeft: isActive ? '3px solid #1abc9c' : '3px solid transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Icon size={20} />
                                <span style={{ fontWeight: isActive ? '600' : 'normal' }}>{item.label}</span>
                            </div>
                        );
                    })}
                </nav>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 15px',
                        background: 'rgba(231, 76, 60, 0.1)',
                        color: '#e74c3c',
                        border: 'none', borderRadius: '10px',
                        cursor: 'pointer',
                        marginTop: 'auto',
                        width: '100%',
                        fontWeight: '600'
                    }}
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </aside>

            {/* Main Content */}
            <main style={{ marginLeft: '260px', flex: 1, padding: '0' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
