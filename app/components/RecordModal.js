'use client';

import { useState } from 'react';

export default function RecordModal({ isOpen, onClose, onSave, selectedPosition }) {
    const [formData, setFormData] = useState({
        planterName: '',
        treeName: '',
        quantity: 1,
        location: '',
        note: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedPosition) {
            alert('กรุณาคลิกบนแผนที่เพื่อเลือกตำแหน่งปลูก');
            return;
        }

        onSave({
            ...formData,
            lat: selectedPosition.lat,
            lng: selectedPosition.lng
        });

        // Reset form
        setFormData({
            planterName: '',
            treeName: '',
            quantity: 1,
            location: '',
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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🌳</span>
                        <h2 className="text-xl font-bold text-green-800">บันทึกข้อมูลต้นไม้</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        ✕
                    </button>
                </div>

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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ชื่อ-นามสกุลผู้ปลูก <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="planterName"
                            value={formData.planterName}
                            onChange={handleChange}
                            required
                            placeholder="เช่น นายสมชาย ใจดี"
                            className="form-input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ชื่อต้นไม้ <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="treeName"
                            value={formData.treeName}
                            onChange={handleChange}
                            required
                            placeholder="เช่น ต้นยางนา, ต้นประดู่"
                            className="form-input"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                จำนวนที่ปลูก <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                required
                                min="1"
                                className="form-input"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                สถานที่
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="เช่น บ้านควนโดน"
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            หมายเหตุ / รายละเอียดเพิ่มเติม
                        </label>
                        <textarea
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            rows={3}
                            placeholder="รายละเอียดเพิ่มเติม..."
                            className="form-input resize-none"
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
    );
}
