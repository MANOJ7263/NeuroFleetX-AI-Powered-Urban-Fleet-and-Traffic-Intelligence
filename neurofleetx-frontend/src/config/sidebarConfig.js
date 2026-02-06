import { LayoutDashboard, Car, Calendar, User, Search, MapPin, CheckSquare, List } from "lucide-react";

export const sidebarConfig = {
    MANAGER: [
        { label: "Dashboard", path: "/manager/dashboard", icon: LayoutDashboard },
        { label: "Pending Trips", path: "/manager/dashboard?tab=bookings", icon: Calendar },
        { label: "Vehicle Approval", path: "/manager/dashboard?tab=vehicle-approval", icon: CheckSquare },
        { label: "Available Trips", path: "/manager/dashboard?tab=active-trips", icon: List },
        { label: "Available Vehicle", path: "/manager/dashboard?tab=active-vehicles", icon: Car },
        { label: "Profile", path: "/profile", icon: User },
    ],
    DRIVER: [
        { label: "Dashboard", path: "/driver/dashboard", icon: LayoutDashboard },
        { label: "Trip Requests", path: "/driver/dashboard?tab=requests", icon: Calendar },
        { label: "Current Job", path: "/driver/dashboard?tab=current-job", icon: MapPin },
        { label: "My Vehicles", path: "/driver/dashboard?tab=vehicles", icon: Car },
        { label: "Post Trip", path: "/driver/dashboard?tab=post-trip", icon: Calendar },
        { label: "Current Dispatch", path: "/driver/navigation", icon: MapPin },
        { label: "Profile", path: "/profile", icon: User },
    ],
    CUSTOMER: [
        { label: "Dashboard", path: "/customer/dashboard", icon: LayoutDashboard },
        { label: "Search Trip", path: "/customer/dashboard?tab=search", icon: Search },
        { label: "My Bookings", path: "/customer/dashboard?tab=bookings", icon: Calendar },
        { label: "Profile", path: "/profile", icon: User },
    ],
    ADMIN: [
        { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Profile", path: "/profile", icon: User },
    ]
};
