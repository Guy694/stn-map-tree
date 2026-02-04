'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import RecordModal from './components/RecordModal';
import Legend from './components/Legend';
import { getTrees, saveTree } from './utils/treeStorage';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [isSelectingPosition, setIsSelectingPosition] = useState(false);

  // Load trees on mount
  useEffect(() => {
    setTrees(getTrees());
  }, []);

  // Handle map click
  const handleMapClick = (latlng) => {
    if (isSelectingPosition) {
      setSelectedPosition(latlng);
      setIsModalOpen(true);
      setIsSelectingPosition(false);
    }
  };

  // Handle save tree
  const handleSaveTree = (treeData) => {
    const newTree = saveTree(treeData);
    if (newTree) {
      setTrees(prev => [...prev, newTree]);
    }
    setSelectedPosition(null);
  };

  // Handle record button click
  const handleRecordClick = () => {
    setIsSelectingPosition(true);
    setIsModalOpen(false);
  };

  return (
    <div className="map-container">
      {/* Map */}
      <MapComponent
        trees={trees}
        onMapClick={handleMapClick}
        isSelectingPosition={isSelectingPosition}
      />

      {/* Record Button */}
      <div className="record-button">
        {isSelectingPosition ? (
          <div className="flex flex-col items-end gap-2">
            <div className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-medium animate-pulse shadow-lg">
              👆 คลิกบนแผนที่เพื่อเลือกตำแหน่ง
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
      <Legend />

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
        }}
        onSave={handleSaveTree}
        selectedPosition={selectedPosition}
      />
    </div>
  );
}
