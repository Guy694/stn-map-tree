'use client';

import { useState, useEffect } from 'react';

export default function RecordModal({
    isOpen,
    onClose,
    onSave,
    selectedPosition,
    selectedLocation,
    currentUser
}) {
    const [formData, setFormData] = useState({
        treeName: '',
        quantity: 1,
        villageName: '',
        tambonName: '',
        districtName: '',
        locationDetail: '',
        note: ''
    });

    const [treeOptions, setTreeOptions] = useState([]);

    // Fetch tree options on mount
    useEffect(() => {
        const fetchTrees = async () => {
            try {
                const res = await fetch('/api/trees/species');
                if (res.ok) {
                    const data = await res.json();
                    setTreeOptions(data);
                }
            } catch (error) {
                console.error('Error fetching tree options:', error);
            }
        };
        fetchTrees();
    }, []);

    // Update location fields when polygon is clicked
    useEffect(() => {
        if (selectedLocation) {
            setFormData(prev => ({
                ...prev,
                villageName: selectedLocation.villageName || prev.villageName,
                tambonName: selectedLocation.tambonName || prev.tambonName,
                districtName: selectedLocation.districtName || prev.districtName
            }));
        }
    }, [selectedLocation]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedPosition) {
            alert('กรุณาคลิกบนแผนที่เพื่อเลือกตำแหน่งปลูก');
            return;
        }

        if (!currentUser) {
            alert('กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล');
            return;
        }

        onSave({
            ...formData,
            lat: selectedPosition.lat,
            lng: selectedPosition.lng
        });

        // Reset form
        setFormData({
            treeName: '',
            quantity: 1,
            villageName: '',
            tambonName: '',
            districtName: '',
            locationDetail: '',
            note: ''
        });
        onClose();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' ? parseInt(value) || 1 : value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-500 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🌳</span>
                        <h2 className="text-xl font-bold text-white">บันทึกข้อมูลต้นไม้</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition text-white"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6">
                    {/* User info */}
                    {currentUser && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 text-blue-700 text-sm">
                                <span>👤</span>
                                <span>ผู้บันทึก: <strong>{currentUser.fullName}</strong></span>
                            </div>
                        </div>
                    )}

                    {/* Position indicator */}
                    {selectedPosition ? (
                        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 text-green-700 text-sm">
                                <span>📍</span>
                                <span>ตำแหน่ง: {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center gap-2 text-yellow-700 text-sm">
                                <span>⚠️</span>
                                <span>คลิกบนแผนที่เพื่อเลือกตำแหน่งปลูก</span>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ชื่อต้นไม้ <span className="text-red-500">*</span>
                            </label>
                            <input
                                list="tree-options"
                                type="text"
                                name="treeName"
                                value={formData.treeName}
                                onChange={handleChange}
                                required
                                placeholder="เลือกหรือพิมพ์ชื่อต้นไม้..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                            />
                            <datalist id="tree-options">
                                {treeOptions.map(tree => (
                                    <option key={tree.id} value={tree.name} />
                                ))}
                            </datalist>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                จำนวนที่ปลูก <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                required
                                min="1"
                                placeholder="จำนวนต้น"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                            />
                        </div>

                        {/* Administrative location */}
                        <div className="border-t pt-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">📍 ที่ตั้ง</h3>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        หมู่บ้าน
                                    </label>
                                    <input
                                        type="text"
                                        name="villageName"
                                        value={formData.villageName}
                                        onChange={handleChange}
                                        placeholder="คลิก polygon หรือพิมพ์"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        ตำบล
                                    </label>
                                    <input
                                        type="text"
                                        name="tambonName"
                                        value={formData.tambonName}
                                        onChange={handleChange}
                                        placeholder="คลิก polygon หรือพิมพ์"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        อำเภอ
                                    </label>
                                    <input
                                        type="text"
                                        name="districtName"
                                        value={formData.districtName}
                                        onChange={handleChange}
                                        placeholder="คลิก polygon หรือพิมพ์"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                รายละเอียดสถานที่
                            </label>
                            <input
                                type="text"
                                name="locationDetail"
                                value={formData.locationDetail}
                                onChange={handleChange}
                                placeholder="เช่น ริมถนน ใกล้วัด"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                หมายเหตุ / รายละเอียดเพิ่มเติม
                            </label>
                            <textarea
                                name="note"
                                value={formData.note}
                                onChange={handleChange}
                                rows={3}
                                placeholder="รายละเอียดเพิ่มเติม..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/30"
                            >
                                💾 บันทึก
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
