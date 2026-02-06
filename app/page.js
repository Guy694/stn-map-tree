'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import RecordModal from './components/RecordModal';
import LoginModal from './components/LoginModal';
import Sidebar from './components/Sidebar';
import SplashScreen from './components/SplashScreen';

// Dynamic import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('./components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-green-50">
      <div className="text-center">
        <div className="animate-spin text-5xl mb-4">🌳</div>
        <p className="text-green-700 font-medium">กำลังโหลดแผนที่...</p>
      </div>
    </div>
  )
});

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [trees, setTrees] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [visibleLayers, setVisibleLayers] = useState({
    districts: true,
    tambons: true,
    villages: false,
    satellite: false,
    heatmap: false
  });

  // Filter states
  const [selectedTreeTypes, setSelectedTreeTypes] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedTambon, setSelectedTambon] = useState(null);

  // Load user session and trees on mount
  useEffect(() => {
    fetchSession();
    fetchTrees();
  }, []);

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      if (data.user) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
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

  // Filtered trees based on filters
  const filteredTrees = useMemo(() => {
    return trees.filter(tree => {
      // Filter by tree type
      if (selectedTreeTypes.length > 0 && !selectedTreeTypes.includes(tree.tree_name)) {
        return false;
      }
      // Filter by district
      if (selectedDistrict && tree.district_name !== selectedDistrict) {
        return false;
      }
      // Filter by tambon
      if (selectedTambon && tree.tambon_name !== selectedTambon) {
        return false;
      }
      return true;
    });
  }, [trees, selectedTreeTypes, selectedDistrict, selectedTambon]);

  // Handle map click - Keep for future features
  const handleMapClick = (latlng) => {
    // Can be used for other features later
  };

  // Handle polygon click - Keep for filtering
  const handlePolygonClick = (properties, layerType) => {
    // Can be used for filtering or info display
  };

  // Handle save tree
  const handleSaveTree = async (treeData) => {
    if (!currentUser) {
      alert('กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล');
      return;
    }

    try {
      const response = await fetch('/api/trees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(treeData)
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'เกิดข้อผิดพลาดในการบันทึก');
        return;
      }

      // Add new tree to list
      setTrees(prev => [data.tree, ...prev]);
      setSelectedLocation(null);
      alert('บันทึกข้อมูลสำเร็จ! 🎉');
    } catch (error) {
      console.error('Error saving tree:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  // Handle record button click
  const handleRecordClick = () => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    // Open form directly with embedded map
    setIsModalOpen(true);
  };

  // Handle login success
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true); // Auto open form after login
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      alert('ออกจากระบบสำเร็จ');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Handle layer toggle
  const handleLayerToggle = (layer) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  // Handle tree type toggle
  const handleTreeTypeToggle = (treeName) => {
    if (treeName === null) {
      // Clear all filters
      setSelectedTreeTypes([]);
      return;
    }
    setSelectedTreeTypes(prev => {
      if (prev.includes(treeName)) {
        return prev.filter(t => t !== treeName);
      } else {
        return [...prev, treeName];
      }
    });
  };

  // Handle district change
  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedTambon(null); // Reset tambon when district changes
  };

  // Handle tambon change
  const handleTambonChange = (tambon) => {
    setSelectedTambon(tambon);
  };

  return (
    <div className="map-container">
      {/* Splash Screen */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Sidebar */}
      <Sidebar
        trees={trees}
        visibleLayers={visibleLayers}
        onLayerToggle={handleLayerToggle}
        selectedTreeTypes={selectedTreeTypes}
        onTreeTypeToggle={handleTreeTypeToggle}
        selectedDistrict={selectedDistrict}
        onDistrictChange={handleDistrictChange}
        selectedTambon={selectedTambon}
        onTambonChange={handleTambonChange}
      />

      {/* Map */}
      <MapComponent
        trees={filteredTrees}
        onMapClick={handleMapClick}
        onPolygonClick={handlePolygonClick}
        visibleLayers={visibleLayers}
      />

      {/* User info */}
      <div className="absolute top-5 right-5 z-[500] flex gap-3">
        {currentUser ? (
          <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span>👤</span>
              <span className="font-medium text-gray-700">{currentUser.fullName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition"
            >
              ออกจากระบบ
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-sm font-medium text-gray-700 hover:bg-white transition flex items-center gap-2"
          >
            <span>🔐</span>
            <span>เข้าสู่ระบบ</span>
          </button>
        )}
      </div>

      {/* Record Button */}
      <div className="absolute top-5 right-5 mt-14 z-[500]">
        {currentUser && (
          <button
            onClick={handleRecordClick}
            className="btn-primary flex items-center gap-2"
          >
            <span className="text-xl">🌳</span>
            <span>บันทึกต้นไม้</span>
          </button>
        )}
      </div>

      {/* Record Modal */}
      <RecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTree}
        currentUser={currentUser}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
