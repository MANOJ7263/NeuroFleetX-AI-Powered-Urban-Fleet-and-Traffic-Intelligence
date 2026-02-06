import { useState } from "react";

const VehicleTable = ({ vehicles, onEdit, onDelete }) => {
    return (
        <table width="100%" style={{ marginTop: "16px", borderCollapse: "collapse" }}>
            <thead>
                <tr style={{ background: "#f0f0f0", borderBottom: "2px solid #ddd" }}>
                    <th style={{ padding: "10px", textAlign: "left" }}>Vehicle No</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>Model</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>Type</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>Battery</th>
                    <th style={{ padding: "10px", textAlign: "center" }}>Action</th>
                </tr>
            </thead>
            <tbody>
                {vehicles.map((v) => (
                    <tr key={v.id} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "10px" }}>{v.vehicleNumber}</td>
                        <td style={{ padding: "10px" }}>{v.model}</td>
                        <td style={{ padding: "10px" }}>{v.type}</td>
                        <td style={{ padding: "10px" }}>
                            <StatusBadge status={v.status} active={v.active} />
                        </td>
                        <td style={{ padding: "10px" }}>
                            {v.status === 'IN_USE' ? `${v.batteryLevel?.toFixed(1)}%` : '-'}
                        </td>
                        <td align="center" style={{ padding: "10px" }}>
                            <button
                                onClick={() => onEdit(v)}
                                style={{ padding: "6px 12px", marginRight: "8px", background: "#4dabf7", border: "none", color: "white", borderRadius: "4px", cursor: "pointer" }}
                            >
                                Edit
                            </button>
                            {v.active && (
                                <button
                                    onClick={() => onDelete(v.id)}
                                    style={{ padding: "6px 12px", background: "#ff6b6b", border: "none", color: "white", borderRadius: "4px", cursor: "pointer" }}
                                >
                                    Delete
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

// Status Badge Component
const StatusBadge = ({ status, active }) => {
    if (!active) {
        return <span className="badge badge-gray">Inactive</span>;
    }

    let colorClass = "badge-green";
    if (status === "IN_USE") colorClass = "badge-red";
    else if (status === "MAINTENANCE") colorClass = "badge-yellow";
    else if (status === "AVAILABLE") colorClass = "badge-green";

    // Inline styles for badges (Tailwind-like)
    const styles = {
        padding: "4px 8px",
        borderRadius: "12px",
        fontSize: "0.85em",
        fontWeight: "bold",
        color: "white",
        backgroundColor: colorClass === "badge-green" ? "#28a745" : colorClass === "badge-red" ? "#dc3545" : "#ffc107",
        color: colorClass === "badge-yellow" ? "black" : "white"
    };

    return <span style={styles}>{status || "AVAILABLE"}</span>;
};

export default VehicleTable;
