'use client';

import { useState, useMemo, useEffect } from 'react';

// Simple Pie Chart component using SVG
function PieChart({ data, colors }) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return null;

    let currentAngle = 0;
    const slices = data.map((item, index) => {
        const percentage = item.value / total;
        const angle = percentage * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;

        // Convert angles to radians
        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (endAngle - 90) * (Math.PI / 180);

        // Calculate path
        const x1 = 50 + 40 * Math.cos(startRad);
        const y1 = 50 + 40 * Math.sin(startRad);
        const x2 = 50 + 40 * Math.cos(endRad);
        const y2 = 50 + 40 * Math.sin(endRad);

        const largeArc = angle > 180 ? 1 : 0;

        const pathData = percentage === 1
            ? `M 50 10 A 40 40 0 1 1 49.99 10 Z`
            : `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

        return (
            <g key={index} className="cursor-pointer transition-opacity hover:opacity-80">
                <path
                    d={pathData}
                    fill={colors[index % colors.length]}
                    stroke="white"
                    strokeWidth="1"
                />
                <title>{`${item.name}: ${item.value} ต้น (${(percentage * 100).toFixed(1)}%)`}</title>
            </g>
        );
    });

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
            {slices}
        </svg>
    );
}

export default function Sidebar({
    trees,
    visibleLayers,
    onLayerToggle,
    selectedTreeTypes,
    onTreeTypeToggle,
    selectedDistrict,
    onDistrictChange,
    selectedTambon,
    onTambonChange
}) {
    const [isOpen, setIsOpen] = useState(true);

    // Colors for pie chart
    const chartColors = [
        '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
        '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
    ];

    // Compute tree type statistics
    const treeStats = useMemo(() => {
        const stats = {};
        trees.forEach(tree => {
            const name = tree.tree_name || 'ไม่ระบุ';
            if (!stats[name]) {
                stats[name] = { name, count: 0, quantity: 0 };
            }
            stats[name].count += 1;
            stats[name].quantity += tree.quantity || 1;
        });
        return Object.values(stats).sort((a, b) => b.quantity - a.quantity);
    }, [trees]);

    // State for location data from polygon tables
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [availableTambons, setAvailableTambons] = useState([]);

    // Fetch available districts from polygon data
    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const response = await fetch('/api/locations/districts');
                const data = await response.json();
                if (Array.isArray(data)) {
                    setAvailableDistricts(data);
                }
            } catch (error) {
                console.error('Error fetching districts:', error);
            }
        };
        fetchDistricts();
    }, []);

    // Fetch available tambons when district changes
    useEffect(() => {
        const fetchTambons = async () => {
            try {
                const url = selectedDistrict
                    ? `/api/locations/tambons?district=${encodeURIComponent(selectedDistrict)}`
                    : '/api/locations/tambons';
                const response = await fetch(url);
                const data = await response.json();
                if (Array.isArray(data)) {
                    setAvailableTambons(data);
                }
            } catch (error) {
                console.error('Error fetching tambons:', error);
            }
        };
        fetchTambons();
    }, [selectedDistrict]);

    // Total statistics
    const totalTrees = trees.reduce((sum, tree) => sum + (tree.quantity || 1), 0);
    const totalRecords = trees.length;
    const uniquePlanters = new Set(trees.map(t => t.planter_name)).size;

    // Pie chart data
    const pieData = treeStats.slice(0, 8).map(stat => ({
        name: stat.name,
        value: stat.quantity
    }));

    return (
        <>
            {/* Toggle button when sidebar is closed */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="absolute top-5 left-5 z-[600] bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg hover:bg-white transition-all flex items-center gap-2"
                >
                    <span className="text-lg">📊</span>
                    <span className="text-sm font-medium text-gray-700">เปิดแผงข้อมูล</span>
                </button>
            )}

            {/* Sidebar */}
            <div
                className={`absolute top-0 left-0 h-full bg-white/95 backdrop-blur-sm shadow-2xl z-[550] transition-all duration-300 overflow-hidden ${isOpen ? 'w-80' : 'w-0'
                    }`}
            >
                <div className="h-full overflow-y-auto p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🌳</span>
                            <h1 className="font-bold text-lg text-gray-800">1 คน 1 ต้นไม้ ฝนนี้ที่สตูล</h1>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button>
                    </div>

                    {/* Stats Summary */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 mb-5 text-white">
                        <h3 className="text-sm font-medium opacity-90 mb-3">สถิติภาพรวม</h3>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{totalTrees.toLocaleString()}</div>
                                <div className="text-xs opacity-80">ต้นไม้</div>
                            </div>
                            <div className="text-center border-x border-white/20">
                                <div className="text-2xl font-bold">{totalRecords}</div>
                                <div className="text-xs opacity-80">รายการ</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{uniquePlanters}</div>
                                <div className="text-xs opacity-80">ผู้ปลูก</div>
                            </div>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    {pieData.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">📈 สัดส่วนประเภทต้นไม้</h3>
                            <div className="w-32 h-32 mx-auto mb-3">
                                <PieChart data={pieData} colors={chartColors} />
                            </div>
                            <div className="space-y-1">
                                {pieData.slice(0, 5).map((item, index) => (
                                    <div key={item.name} className="flex items-center gap-2 text-xs">
                                        <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: chartColors[index] }}
                                        />
                                        <span className="truncate flex-1 text-gray-600">{item.name}</span>
                                        <span className="font-medium text-gray-800">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tree Type Filter */}
                    <div className="mb-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">🌲 กรองประเภทต้นไม้</h3>
                        <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                            {treeStats.map((stat, index) => (
                                <label
                                    key={stat.name}
                                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedTreeTypes.length === 0 || selectedTreeTypes.includes(stat.name)}
                                        onChange={() => onTreeTypeToggle(stat.name)}
                                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                    />
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: chartColors[index % chartColors.length] }}
                                    />
                                    <span className="text-sm text-gray-700 truncate flex-1">{stat.name}</span>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {stat.quantity}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {selectedTreeTypes.length > 0 && (
                            <button
                                onClick={() => onTreeTypeToggle(null)}
                                className="text-xs text-green-600 hover:text-green-700 mt-2"
                            >
                                ล้างตัวกรอง
                            </button>
                        )}
                    </div>

                    {/* Location Filter */}
                    <div className="mb-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">📍 กรองตามตำแหน่ง</h3>
                        <div className="space-y-2">
                            <select
                                value={selectedDistrict || ''}
                                onChange={(e) => onDistrictChange(e.target.value || null)}
                                className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">ทุกอำเภอ</option>
                                {availableDistricts.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                            <select
                                value={selectedTambon || ''}
                                onChange={(e) => onTambonChange(e.target.value || null)}
                                className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                disabled={availableTambons.length === 0}
                            >
                                <option value="">ทุกตำบล</option>
                                {availableTambons.map(tambon => (
                                    <option key={tambon} value={tambon}>{tambon}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Layer Controls */}
                    <div className="mb-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">🗺️ ชั้นข้อมูลแผนที่</h3>

                        {/* Base Map Selection */}
                        <div className="mb-3 bg-gray-50 rounded-lg p-3">
                            <h4 className="text-xs font-medium text-gray-600 mb-2">แผนที่พื้นฐาน</h4>
                            <div className="space-y-1">
                                <label className="flex items-center gap-2 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                                    <input
                                        type="radio"
                                        name="baseMap"
                                        checked={!visibleLayers.satellite}
                                        onChange={() => onLayerToggle('satellite')}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">🗺️ OpenStreetMap</span>
                                </label>
                                <label className="flex items-center gap-2 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                                    <input
                                        type="radio"
                                        name="baseMap"
                                        checked={visibleLayers.satellite}
                                        onChange={() => onLayerToggle('satellite')}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">🛰️ ภาพดาวเทียม</span>
                                </label>
                            </div>
                        </div>

                        {/* Polygon Overlays */}
                        <div className="mb-3">
                            <h4 className="text-xs font-medium text-gray-600 mb-2">ชั้นข้อมูลขอบเขต</h4>
                            <div className="space-y-1">
                                <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={visibleLayers.districts}
                                        onChange={() => onLayerToggle('districts')}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <div className="w-4 h-4 border-2 border-blue-700 bg-blue-500/20 rounded" />
                                    <span className="text-sm text-gray-700">ขอบเขตอำเภอ</span>
                                </label>
                                <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={visibleLayers.tambons}
                                        onChange={() => onLayerToggle('tambons')}
                                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                    />
                                    <div className="w-4 h-4 border border-green-600 bg-green-500/20 rounded" />
                                    <span className="text-sm text-gray-700">ขอบเขตตำบล</span>
                                </label>
                                <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={visibleLayers.villages}
                                        onChange={() => onLayerToggle('villages')}
                                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                    />
                                    <div className="w-4 h-4 border border-orange-600 bg-orange-500/20 rounded" />
                                    <span className="text-sm text-gray-700">ขอบเขตหมู่บ้าน</span>
                                </label>
                            </div>
                        </div>

                        {/* Data Overlays */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-600 mb-2">ชั้นข้อมูลเพิ่มเติม</h4>
                            <div className="space-y-1">
                                <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={visibleLayers.heatmap}
                                        onChange={() => onLayerToggle('heatmap')}
                                        className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                    />
                                    <div className="w-4 h-4 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded" />
                                    <span className="text-sm text-gray-700">🔥 ความหนาแน่นต้นไม้</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Tree Legend */}
                    <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🌳</span>
                            <span className="text-sm text-gray-700">ต้นไม้ที่บันทึก</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
