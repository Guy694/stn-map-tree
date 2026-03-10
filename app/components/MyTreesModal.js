'use client';

import { useState, useEffect, useRef } from 'react';

// ---- Edit Form (same fields as RecordModal) ----
function EditForm({ tree, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        treeName: tree.tree_name || '',
        quantity: tree.quantity || 1,
        districtName: tree.district_name || '',
        tambonName: tree.tambon_name || '',
        villageName: tree.village_name || '',
        locationDetail: tree.location_detail || '',
        plantingDate: tree.planting_date
            ? tree.planting_date.split('T')[0]
            : new Date().toISOString().split('T')[0],
        note: tree.note || ''
    });
    const [saving, setSaving] = useState(false);
    const [treeOptions, setTreeOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState({
        districts: [],
        tambons: []
    });

    // Fetch tree species list
    useEffect(() => {
        fetch('/stn-tree/api/trees/species/')
            .then(r => r.ok ? r.json() : [])
            .then(data => setTreeOptions(data))
            .catch(() => { });
    }, []);

    // Fetch districts
    useEffect(() => {
        fetch('/stn-tree/api/locations/districts/')
            .then(r => r.ok ? r.json() : [])
            .then(data => setLocationOptions(prev => ({ ...prev, districts: data })))
            .catch(() => { });
    }, []);

    // Fetch tambons when district changes
    useEffect(() => {
        if (!formData.districtName) {
            setLocationOptions(prev => ({ ...prev, tambons: [] }));
            return;
        }
        const url = `/stn-tree/api/locations/tambons/?district=${encodeURIComponent(formData.districtName)}`;
        fetch(url)
            .then(r => r.ok ? r.json() : [])
            .then(data => setLocationOptions(prev => ({ ...prev, tambons: data })))
            .catch(() => { });
    }, [formData.districtName]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' ? (parseInt(value) || 1) : value
        }));
    };

    const handleDistrictChange = (e) => {
        setFormData(prev => ({
            ...prev,
            districtName: e.target.value,
            tambonName: '',
            villageName: ''
        }));
    };

    const handleSave = async () => {
        if (!formData.treeName.trim()) {
            alert('กรุณากรอกชื่อต้นไม้');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`/stn-tree/api/trees/${tree.id}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const json = await res.json();
            if (res.ok) {
                onSave(json.tree);
            } else {
                alert(json.error || 'เกิดข้อผิดพลาด');
            }
        } catch {
            alert('ไม่สามารถบันทึกได้');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 bg-green-50 border-t border-green-100 space-y-4">
            <h4 className="text-sm font-semibold text-green-800">✏️ แก้ไขข้อมูลต้นไม้</h4>

            {/* ชื่อต้นไม้ */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อต้นไม้ <span className="text-red-500">*</span>
                </label>
                <input
                    list={`tree-options-${tree.id}`}
                    type="text"
                    name="treeName"
                    value={formData.treeName}
                    onChange={handleChange}
                    placeholder="เลือกหรือพิมพ์ชื่อต้นไม้..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                />
                <datalist id={`tree-options-${tree.id}`}>
                    {treeOptions.map(t => (
                        <option key={t.id} value={t.name} />
                    ))}
                </datalist>
            </div>

            {/* จำนวน */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    จำนวนที่ปลูก <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    placeholder="จำนวนต้น"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                />
            </div>

            {/* ที่ตั้ง */}
            <div className="border-t border-green-200 pt-3">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">📍 ที่ตั้ง</h5>
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">อำเภอ</label>
                        <select
                            name="districtName"
                            value={formData.districtName}
                            onChange={handleDistrictChange}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                        >
                            <option value="">เลือกอำเภอ</option>
                            {locationOptions.districts.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">ตำบล</label>
                        <select
                            name="tambonName"
                            value={formData.tambonName}
                            onChange={(e) => setFormData(prev => ({ ...prev, tambonName: e.target.value, villageName: '' }))}
                            disabled={!formData.districtName || locationOptions.tambons.length === 0}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">เลือกตำบล</option>
                            {locationOptions.tambons.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">หมู่บ้าน (ถ้ามี)</label>
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

            {/* รายละเอียดสถานที่ */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดสถานที่</label>
                <input
                    type="text"
                    name="locationDetail"
                    value={formData.locationDetail}
                    onChange={handleChange}
                    placeholder="เช่น ริมถนน ใกล้วัด"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                />
            </div>

            {/* วันที่ปลูก */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    📅 วันที่ปลูก <span className="text-red-500">*</span>
                </label>
                <input
                    type="date"
                    name="plantingDate"
                    value={formData.plantingDate}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                />
                <p className="text-xs text-gray-500 mt-1">เลือกวันที่ปลูกต้นไม้</p>
            </div>

            {/* หมายเหตุ */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ / รายละเอียดเพิ่มเติม</label>
                <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows={3}
                    placeholder="รายละเอียดเพิ่มเติม..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
                />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-sm disabled:opacity-50"
                >
                    {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึก'}
                </button>
                <button
                    onClick={onCancel}
                    className="px-5 py-2.5 border border-gray-200 bg-white rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                    ยกเลิก
                </button>
            </div>
        </div>
    );
}

// ---- Tree Card ----
function TreeCard({ tree, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [deletingImageId, setDeletingImageId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const fileInputRef = useRef(null);

    const handleAddImage = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setUploadingImage(true);
        try {
            const formData = new FormData();
            files.forEach(f => formData.append('images', f));
            const res = await fetch(`/stn-tree/api/trees/${tree.id}/images/`, {
                method: 'POST',
                body: formData
            });
            const json = await res.json();
            if (res.ok) {
                const newImages = [...tree.images, ...json.images.map(i => i.path)];
                const newImageIds = [...tree.image_ids, ...json.images.map(i => i.id)];
                onUpdate({ ...tree, images: newImages, image_ids: newImageIds });
            } else {
                alert(json.error || 'อัปโหลดไม่สำเร็จ');
            }
        } catch {
            alert('เกิดข้อผิดพลาดในการอัปโหลด');
        } finally {
            setUploadingImage(false);
            e.target.value = '';
        }
    };

    const handleDeleteImage = async (imageId, imageIndex) => {
        setDeletingImageId(imageId);
        try {
            const res = await fetch(`/stn-tree/api/trees/${tree.id}/images/?imageId=${imageId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                const newImages = tree.images.filter((_, i) => i !== imageIndex);
                const newImageIds = tree.image_ids.filter((_, i) => i !== imageIndex);
                onUpdate({ ...tree, images: newImages, image_ids: newImageIds });
            } else {
                const json = await res.json();
                alert(json.error || 'ลบรูปไม่สำเร็จ');
            }
        } catch {
            alert('เกิดข้อผิดพลาด');
        } finally {
            setDeletingImageId(null);
        }
    };

    const handleDeleteTree = async () => {
        try {
            const res = await fetch(`/stn-tree/api/trees/${tree.id}/`, { method: 'DELETE' });
            if (res.ok) {
                onDelete(tree.id);
            } else {
                const json = await res.json();
                alert(json.error || 'ลบไม่สำเร็จ');
            }
        } catch {
            alert('เกิดข้อผิดพลาด');
        }
        setConfirmDelete(false);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('th-TH', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Image Gallery */}
            <div className="bg-gray-50 p-2">
                {tree.images && tree.images.length > 0 ? (
                    <div className="flex gap-1.5 overflow-x-auto">
                        {tree.images.map((img, idx) => (
                            <div key={tree.image_ids[idx] || idx} className="relative flex-shrink-0 group">
                                <img
                                    src={`/stn-tree${img}`}
                                    alt={`รูปที่ ${idx + 1}`}
                                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                    onError={e => { e.target.src = '/stn-tree/img/mahogani.png'; }}
                                />
                                <button
                                    onClick={() => handleDeleteImage(tree.image_ids[idx], idx)}
                                    disabled={deletingImageId === tree.image_ids[idx]}
                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow hover:bg-red-600 disabled:opacity-50"
                                    title="ลบรูปนี้"
                                >
                                    {deletingImageId === tree.image_ids[idx] ? '⟳' : '✕'}
                                </button>
                            </div>
                        ))}
                        {/* Add more images */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="w-24 h-24 flex-shrink-0 border-2 border-dashed border-green-300 rounded-lg flex flex-col items-center justify-center text-green-500 hover:bg-green-50 hover:border-green-400 transition"
                        >
                            {uploadingImage
                                ? <span className="text-2xl animate-spin">⟳</span>
                                : <><span className="text-2xl">📷</span><span className="text-xs mt-1">เพิ่มรูป</span></>
                            }
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="w-20 h-20 rounded-xl bg-green-50 flex items-center justify-center border border-green-100 flex-shrink-0">
                            <img src="/stn-tree/img/mahogani.png" alt="tree" width={40} height={40} />
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="flex items-center gap-2 text-sm text-green-600 border border-green-200 rounded-xl px-3 py-2 hover:bg-green-50 transition"
                        >
                            {uploadingImage ? '⟳ กำลังอัปโหลด...' : '📷 เพิ่มรูปภาพ'}
                        </button>
                    </div>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAddImage}
                />
            </div>

            {/* View Mode */}
            {!isEditing && !confirmDelete && (
                <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="font-bold text-lg text-gray-800">{tree.tree_name}</h3>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span className="bg-green-100 text-green-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                                    {tree.quantity} ต้น
                                </span>
                                {tree.district_name && (
                                    <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-0.5 rounded-full">
                                        📍 {tree.district_name}
                                    </span>
                                )}
                                {tree.tambon_name && (
                                    <span className="bg-teal-50 text-teal-600 text-xs px-2 py-0.5 rounded-full">
                                        ต.{tree.tambon_name}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                            >
                                ✏️ แก้ไข
                            </button>
                            <button
                                onClick={() => setConfirmDelete(true)}
                                className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                    <div className="space-y-0.5 text-xs text-gray-500">
                        {tree.location_detail && <div>📌 {tree.location_detail}</div>}
                        {tree.note && <div className="text-gray-600">📝 {tree.note}</div>}
                        {tree.planting_date && <div>🌱 ปลูกเมื่อ {formatDate(tree.planting_date)}</div>}
                        <div>🗓️ บันทึกเมื่อ {formatDate(tree.created_at)}</div>
                    </div>
                </div>
            )}

            {/* Edit Form */}
            {isEditing && (
                <EditForm
                    tree={tree}
                    onSave={(updatedTree) => { onUpdate(updatedTree); setIsEditing(false); }}
                    onCancel={() => setIsEditing(false)}
                />
            )}

            {/* Confirm Delete */}
            {confirmDelete && !isEditing && (
                <div className="border-t border-red-100 bg-red-50 p-4">
                    <p className="text-sm text-red-700 font-medium mb-3">
                        ⚠️ ยืนยันลบต้นไม้ "{tree.tree_name}"?
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDeleteTree}
                            className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                        >
                            ลบต้นไม้
                        </button>
                        <button
                            onClick={() => setConfirmDelete(false)}
                            className="flex-1 border border-gray-200 bg-white py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                        >
                            ยกเลิก
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ---- Main Modal ----
export default function MyTreesModal({ isOpen, onClose, currentUser, onTreeDeleted, onTreeUpdated }) {
    const [trees, setTrees] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && currentUser) {
            fetchMyTrees();
        }
    }, [isOpen, currentUser]);

    const fetchMyTrees = async () => {
        setLoading(true);
        try {
            const res = await fetch('/stn-tree/api/trees/my-trees/');
            const data = await res.json();
            if (Array.isArray(data)) setTrees(data);
        } catch (err) {
            console.error('Error fetching my trees:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = (updatedTree) => {
        setTrees(prev => prev.map(t => t.id === updatedTree.id ? updatedTree : t));
        if (onTreeUpdated) onTreeUpdated(updatedTree);
    };

    const handleDelete = (treeId) => {
        setTrees(prev => prev.filter(t => t.id !== treeId));
        if (onTreeDeleted) onTreeDeleted(treeId);
    };

    if (!isOpen) return null;

    const totalTrees = trees.reduce((s, t) => s + (t.quantity || 1), 0);

    return (
        <div className="fixed inset-0 z-[900] flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-5 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🌳</span>
                        <div>
                            <h2 className="text-xl font-bold text-white">ต้นไม้ของฉัน</h2>
                            <p className="text-emerald-100 text-sm">
                                {currentUser?.fullName || ''} · {trees.length} รายการ · {totalTrees.toLocaleString()} ต้น
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchMyTrees}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition text-sm"
                            title="รีเฟรช"
                        >
                            🔄
                        </button>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="text-5xl animate-spin mb-4">🌿</div>
                            <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                        </div>
                    ) : trees.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🌱</div>
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">ยังไม่มีต้นไม้</h3>
                            <p className="text-gray-400 text-sm">เริ่มปลูกต้นไม้เพื่อบันทึกข้อมูล</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {trees.map(tree => (
                                <TreeCard
                                    key={tree.id}
                                    tree={tree}
                                    onUpdate={handleUpdate}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
