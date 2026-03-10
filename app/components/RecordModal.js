'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for MiniMapPicker to avoid SSR issues
const MiniMapPicker = dynamic(() => import('./MiniMapPicker'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin text-3xl mb-2">🗺️</div>
                <p className="text-gray-600 text-sm">กำลังโหลดแผนที่...</p>
            </div>
        </div>
    )
});

export default function RecordModal({
    isOpen,
    onClose,
    onSave,
    currentUser
}) {
    const [formData, setFormData] = useState({
        treeName: '',
        quantity: 1,
        villageName: '',
        tambonName: '',
        districtName: '',
        locationDetail: '',
        plantingDate: new Date().toISOString().split('T')[0],
        note: ''
    });

    // Internal state for map position
    const [selectedPosition, setSelectedPosition] = useState(null);

    // GPS detection state
    const [gpsStatus, setGpsStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error' | 'manual'
    const [gpsError, setGpsError] = useState(null);

    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const [treeOptions, setTreeOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState({
        districts: [],
        tambons: [],
        villages: []
    });

    // Fetch tree options on mount
    useEffect(() => {
        const fetchTrees = async () => {
            try {
                const res = await fetch('/stn-tree/api/trees/species/');
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

    // Fetch districts on mount
    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const res = await fetch('/stn-tree/api/locations/districts/');
                if (res.ok) {
                    const data = await res.json();
                    setLocationOptions(prev => ({ ...prev, districts: data }));
                }
            } catch (error) {
                console.error('Error fetching districts:', error);
            }
        };
        fetchDistricts();
    }, []);

    // GPS detection when modal opens
    useEffect(() => {
        if (!isOpen) return;

        // Reset GPS status when modal opens
        setGpsStatus('loading');
        setGpsError(null);

        // Check if geolocation is available
        if (!navigator.geolocation) {
            setGpsStatus('error');
            setGpsError('เบราว์เซอร์ของคุณไม่รองรับ GPS');
            return;
        }

        // Get current position
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setSelectedPosition({ lat: latitude, lng: longitude });
                setGpsStatus('success');
            },
            (error) => {
                console.error('GPS error:', error);
                let errorMessage = 'ไม่สามารถดึงตำแหน่ง GPS ได้';

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'คุณไม่อนุญาตให้เข้าถึงตำแหน่ง GPS';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'ไม่สามารถระบุตำแหน่งได้';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'หมดเวลาในการดึงตำแหน่ง GPS';
                        break;
                }

                setGpsError(errorMessage);
                setGpsStatus('error');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }, [isOpen]);

    // Fetch tambons when district changes
    useEffect(() => {
        const fetchTambons = async () => {
            if (!formData.districtName) {
                setLocationOptions(prev => ({ ...prev, tambons: [], villages: [] }));
                return;
            }
            try {
                const url = `/stn-tree/api/locations/tambons/?district=${encodeURIComponent(formData.districtName)}`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setLocationOptions(prev => ({ ...prev, tambons: data, villages: [] }));
                }
            } catch (error) {
                console.error('Error fetching tambons:', error);
            }
        };
        fetchTambons();
    }, [formData.districtName]);

    // Handle image selection
    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Limit to 5 images
        if (files.length > 5) {
            alert('สามารถอัปโหลดได้สูงสุด 5 รูปภาพ');
            return;
        }

        setSelectedImages(files);

        // Create preview URLs from originals (for display quality)
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    // Remove image from selection
    const handleRemoveImage = (index) => {
        const newImages = selectedImages.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);

        // Revoke old preview URL
        URL.revokeObjectURL(imagePreviews[index]);

        setSelectedImages(newImages);
        setImagePreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedPosition) {
            alert('กรุณาคลิกบนแผนที่เพื่อเลือกตำแหน่งปลูก');
            return;
        }

        if (!currentUser) {
            alert('กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล');
            return;
        }

        try {
            setIsUploading(true);
            let imagePaths = [];

            // Upload images if any
            if (selectedImages.length > 0) {
                const uploadFormData = new FormData();
                selectedImages.forEach(file => {
                    uploadFormData.append('images', file);
                });

                const uploadRes = await fetch('/stn-tree/api/upload/', {
                    method: 'POST',
                    body: uploadFormData,
                    credentials: 'include'
                });

                if (!uploadRes.ok) {
                    const error = await uploadRes.json();
                    throw new Error(error.error || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
                }

                const uploadData = await uploadRes.json();
                imagePaths = uploadData.paths;
            }

            // Save tree data with image paths
            await onSave({
                ...formData,
                lat: selectedPosition.lat,
                lng: selectedPosition.lng,
                imagePaths
            });

            // Clean up preview URLs
            imagePreviews.forEach(url => URL.revokeObjectURL(url));

            // Reset form
            setFormData({
                treeName: '',
                quantity: 1,
                villageName: '',
                tambonName: '',
                districtName: '',
                locationDetail: '',
                plantingDate: new Date().toISOString().split('T')[0],
                note: ''
            });
            setSelectedImages([]);
            setImagePreviews([]);
            setSelectedPosition(null);
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
            alert(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setIsUploading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' ? parseInt(value) || 1 : value
        }));
    };

    // Handle manual position selection
    const handleManualPosition = (position) => {
        setSelectedPosition(position);
        setGpsStatus('manual');
    };

    // Enable manual repositioning mode
    const enableManualMode = () => {
        setGpsStatus('manual');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-500 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl"><img src="/stn-tree/img/mahogani.png" alt="logo_tree" width={40} height={40} /></span>
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

                    {/* Location Selection Section - Embedded Map */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                📍 ตำแหน่งบนแผนที่ <span className="text-red-500">*</span>
                            </label>

                            {/* GPS Status Badge */}
                            <div className="flex items-center gap-2">
                                {gpsStatus === 'loading' && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                                        <span className="animate-spin">🔄</span>
                                        กำลังดึง GPS...
                                    </span>
                                )}
                                {gpsStatus === 'success' && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                                        ✅ ใช้ตำแหน่ง GPS
                                    </span>
                                )}
                                {gpsStatus === 'manual' && (
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                                        📍 ปักหมุดด้วยตนเอง
                                    </span>
                                )}
                                {gpsStatus === 'error' && (
                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center gap-1">
                                        ⚠️ {gpsError}
                                    </span>
                                )}

                                {/* Manual Repositioning Button */}
                                {(gpsStatus === 'success' || gpsStatus === 'error') && (
                                    <button
                                        type="button"
                                        onClick={enableManualMode}
                                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition"
                                    >
                                        📍 ปักหมุดใหม่
                                    </button>
                                )}
                            </div>
                        </div>

                        <MiniMapPicker
                            selectedPosition={selectedPosition}
                            onSelectPosition={handleManualPosition}
                            height={350}
                        />

                        {selectedPosition && (
                            <p className="text-xs text-gray-500 mt-2">
                                พิกัด: {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
                            </p>
                        )}
                    </div>

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
                                        อำเภอ
                                    </label>
                                    <select
                                        name="districtName"
                                        value={formData.districtName}
                                        onChange={(e) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                districtName: e.target.value,
                                                tambonName: '', // Reset tambon when district changes
                                                villageName: '' // Reset village when district changes
                                            }));
                                        }}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                    >
                                        <option value="">เลือกอำเภอ</option>
                                        {locationOptions.districts.map(district => (
                                            <option key={district} value={district}>{district}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        ตำบล
                                    </label>
                                    <select
                                        name="tambonName"
                                        value={formData.tambonName}
                                        onChange={(e) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                tambonName: e.target.value,
                                                villageName: '' // Reset village when tambon changes
                                            }));
                                        }}
                                        disabled={!formData.districtName || locationOptions.tambons.length === 0}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <option value="">เลือกตำบล</option>
                                        {locationOptions.tambons.map(tambon => (
                                            <option key={tambon} value={tambon}>{tambon}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        หมู่บ้าน (ถ้ามี)
                                    </label>
                                    <input
                                        type="text"
                                        name="villageName"
                                        value={formData.villageName}
                                        onChange={handleChange}
                                        placeholder="พิมพ์ชื่อหมู่บ้าน"
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
                                📅 วันที่ปลูก <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="plantingDate"
                                value={formData.plantingDate}
                                onChange={handleChange}
                                required
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                            />
                            <p className="text-xs text-gray-500 mt-1">เลือกวันที่ปลูกต้นไม้</p>
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

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                📸 รูปภาพต้นไม้ (ไม่เกิน 5 รูป)
                            </label>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={handleImageSelect}
                                disabled={isUploading}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">รองรับ JPG, PNG, WEBP ขนาดไม่เกิน 10MB ต่อรูป</p>

                            {/* Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                disabled={isUploading}
                                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                disabled={isUploading}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUploading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-spin">⏳</span>
                                        กำลังอัปโหลด...
                                    </span>
                                ) : (
                                    <span>💾 บันทึก</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
