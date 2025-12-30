import React, { useEffect, useState } from 'react';
import { getStats } from '../services/stats';

const Dashboard = () => {
    const [stats, setStats] = useState({ articlesCount: 0, usersCount: 0, viewsCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const data = await getStats();
            setStats(data);
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium">Total Views</h3>
                    <p className="text-3xl font-bold mt-2">{stats.viewsCount.toLocaleString()}</p>
                    <span className="text-green-500 text-sm font-medium mt-1 inline-block">↑ Mock Data</span>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium">Total Articles</h3>
                    <p className="text-3xl font-bold mt-2">{stats.articlesCount}</p>
                    <span className="text-gray-400 text-sm font-medium mt-1 inline-block">Live Data</span>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium">Users / Authors</h3>
                    <p className="text-3xl font-bold mt-2">{stats.usersCount}</p>
                    <span className="text-gray-400 text-sm font-medium mt-1 inline-block">Live Data</span>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
