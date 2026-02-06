'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '../components/Navbar';
import AdminTreeTable from '../components/AdminTreeTable';

// Dynamic import MapComponent to avoid SSR issues
const MapComponent = dynamic(() => import('../components/MapComponent'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-green-50">
            <div className="text-center">
                <div className="animate-spin text-5xl mb-4">🌳</div>
                <p className="text-green-700 font-medium">กำลังโหลดแผนที่...</p>
            </div>
        </div>
    )
});

export default function AdminPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [trees, setTrees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTree, setSelectedTree] = useState(null);

    // Check authentication and load data
    useEffect(() => {
        checkAuth();
        fetchTrees();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/session');
            const data = await response.json();

            // Temporarily disabled for testing - uncomment for production
            // if (!data.user) {
            //     router.push('/');
            //     return;
            // }

            // Optional: Check if user is admin
            // if (data.user.role !== 'admin') {
            //     alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
            //     router.push('/');
            //     return;
            // }

            setCurrentUser(data.user || { fullName: 'Admin Test', role: 'admin' });
        } catch (error) {
            console.error('Error checking auth:', error);
            // Temporarily disabled redirect for testing
            // router.push('/');
            setCurrentUser({ fullName: 'Admin Test', role: 'admin' });
        } finally {
            setLoading(false);
        }
    };

    const fetchTrees = async () => {
        try {
            const response = await fetch('/api/trees');
            const data = await response.json();
            setTrees(data);
        } catch (error) {
            console.error('Error fetching trees:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleRowClick = (tree) => {
        setSelectedTree(tree);
        // Scroll to map on mobile
        if (window.innerWidth < 1024) {
            document.getElementById('admin-map')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                <div className="text-center">
                    <div className="animate-spin text-6xl mb-4">🌳</div>
                    <p className="text-green-700 font-medium text-lg">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            {/* Navbar */}
            <Navbar currentUser={currentUser} onLogout={handleLogout} />

            {/* Main Content - Split View */}
            <div className="admin-split-view">
                {/* Map Section */}
                <div id="admin-map" className="admin-map-section">
                    <MapComponent
                        trees={trees}
                        selectedTree={selectedTree}
                        visibleLayers={{
                            districts: true,
                            tambons: true,
                            villages: false,
                            satellite: false,
                            heatmap: false
                        }}
                        isAdminView={true}
                    />
                </div>

                {/* Table Section */}
                <div className="admin-table-section">
                    <AdminTreeTable trees={trees} onRowClick={handleRowClick} />
                </div>
            </div>
        </div>
    );
}
