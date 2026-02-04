'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import RecordModal from './components/RecordModal';
import LoginModal from './components/LoginModal';
import Legend from './components/Legend';

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
  const [trees, setTrees] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSelectingPosition, setIsSelectingPosition] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState({
    districts: true,
    tambons: true,
    villages: false
  });

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

  // Handle map click
  const handleMapClick = (latlng) => {
    if (isSelectingPosition) {
      setSelectedPosition(latlng);
      setIsModalOpen(true);
      setIsSelectingPosition(false);
    }
  };

  // Handle polygon click
  const handlePolygonClick = (properties, layerType) => {
    if (isSelectingPosition) {
      const location = {
        villageName: layerType === 'villages' ? properties.name : undefined,
        tambonName: layerType === 'tambons' ? properties.name : properties.tambonName,
        districtName: layerType === 'districts' ? properties.name : properties.districtName
      };
      setSelectedLocation(location);
    }
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
      setSelectedPosition(null);
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
    setIsSelectingPosition(true);
    setIsModalOpen(false);
  };

  // Handle login success
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsSelectingPosition(true); // Auto start recording after login
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

  return (
    <div className="map-container">
      {/* Map */}
      <MapComponent
        trees={trees}
        onMapClick={handleMapClick}
        onPolygonClick={handlePolygonClick}
        isSelectingPosition={isSelectingPosition}
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
      <div className="record-button">
        {isSelectingPosition ? (
          <div className="flex flex-col items-end gap-2">
            <div className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-medium animate-pulse shadow-lg">
              👆 คลิกบนแผนที่หรือ polygon เพื่อเลือกตำแหน่ง
            </div>
            <button
              onClick={() => setIsSelectingPosition(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-600 transition-colors shadow-lg"
            >
              ✕ ยกเลิก
            </button>
          </div>
        ) : (
          <button
            onClick={handleRecordClick}
            className="btn-primary flex items-center gap-2"
          >
            <span className="text-xl">🌳</span>
            <span>บันทึกต้นไม้</span>
          </button>
        )}
      </div>

      {/* Legend */}
      <Legend
        visibleLayers={visibleLayers}
        onLayerToggle={handleLayerToggle}
      />

      {/* Stats Badge */}
      <div className="absolute top-20 right-5 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg z-[500]">
        <div className="flex items-center gap-2 text-sm font-medium text-green-700">
          <span>🌳</span>
          <span>{trees.length} ต้นไม้</span>
        </div>
      </div>

      {/* Record Modal */}
      <RecordModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPosition(null);
          setSelectedLocation(null);
        }}
        onSave={handleSaveTree}
        selectedPosition={selectedPosition}
        selectedLocation={selectedLocation}
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
