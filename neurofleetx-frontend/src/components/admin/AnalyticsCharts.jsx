import React from "react";
import Chart from "react-apexcharts";

export const VehicleWearChart = () => {
    const options = {
        chart: { id: "vehicle-wear", type: "line", toolbar: { show: false } },
        xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"] },
        stroke: { curve: "smooth", width: 3 },
        colors: ["#FF4560"],
        title: { text: "Avg Vehicle Wear (Mileage/Month)", style: { color: "#fff" } },
        theme: { mode: "dark" }
    };

    const series = [
        { name: "Mileage (km)", data: [1200, 1500, 1100, 1800, 2000, 2400, 2100] }
    ];

    return (
        <div className="card" style={{ padding: "20px", background: "#1e1e2d", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.3)" }}>
            <Chart options={options} series={series} type="line" height={300} />
        </div>
    );
};

export const FleetHealthChart = () => {
    const options = {
        chart: { id: "fleet-health", type: "donut" },
        labels: ["Healthy", "Due for Service", "Critical"],
        colors: ["#00E396", "#FEB019", "#FF4560"],
        title: { text: "Fleet Health Status", style: { color: "#fff" } }, // ApexCharts title might not center well in donut, but good enough
        theme: { mode: "dark" },
        plotOptions: {
            pie: {
                donut: {
                    labels: {
                        show: true,
                        total: { show: true, color: '#fff' }
                    }
                }
            }
        },
        dataLabels: { enabled: false },
        legend: { position: 'bottom', labels: { colors: '#fff' } }
    };

    const series = [45, 12, 4]; // Mock data

    return (
        <div className="card" style={{ padding: "20px", background: "#1e1e2d", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.3)" }}>
            <Chart options={options} series={series} type="donut" height={300} />
        </div>
    );
};
