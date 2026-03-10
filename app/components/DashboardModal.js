'use client';

import { useState, useEffect } from 'react';

// Simple Bar Chart
function BarChart({ data, maxValue, colors }) {
    return (
        <div className="space-y-2">
            {data.map((item, index) => (
                <div key={item.label} className="flex items-center gap-2">
                    <div className="w-24 text-xs text-gray-600 truncate text-right">{item.label}</div>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-2"
                            style={{
                                width: `${Math.max((item.value / maxValue) * 100, 2)}%`,
                                backgroundColor: colors[index % colors.length]
                            }}
                        >
                            <span className="text-xs text-white font-bold">{item.value.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Mini Pie Chart SVG
function MiniPie({ data, colors }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return null;
    let angle = 0;
    const slices = data.map((item, i) => {
        const pct = item.value / total;
        const sweep = pct * 360;
        const start = angle - 90;
        const end = start + sweep;
        angle += sweep;
        const r = 40;
        const x1 = 50 + r * Math.cos(start * Math.PI / 180);
        const y1 = 50 + r * Math.sin(start * Math.PI / 180);
        const x2 = 50 + r * Math.cos(end * Math.PI / 180);
        const y2 = 50 + r * Math.sin(end * Math.PI / 180);
        const large = sweep > 180 ? 1 : 0;
        const d = pct === 1
            ? `M 50 10 A 40 40 0 1 1 49.99 10 Z`
            : `M 50 50 L ${x1} ${y1} A 40 40 0 ${large} 1 ${x2} ${y2} Z`;
        return <path key={i} d={d} fill={colors[i % colors.length]} stroke="white" strokeWidth="1.5">
            <title>{`${item.name}: ${item.value} ต้น`}</title>
        </path>;
    });
    return <svg viewBox="0 0 100 100" className="w-full h-full">{slices}</svg>;
}

const CHART_COLORS = [
    '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

export default function DashboardModal({ isOpen, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expandedDistrict, setExpandedDistrict] = useState(null);
    const [activeTab, setActiveTab] = useState('districts'); // 'districts' | 'types'

    useEffect(() => {
        if (isOpen) {
            fetchDashboard();
        }
    }, [isOpen]);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const res = await fetch('/stn-tree/api/dashboard/');
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const maxTrees = data ? Math.max(...data.districts.map(d => d.totalTrees), 1) : 1;

    return (
        <div className="fixed inset-0 z-[900] flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-5 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">📊</span>
                        <div>
                            <h2 className="text-xl font-bold text-white">Dashboard</h2>
                            <p className="text-green-100 text-sm">สรุปข้อมูลการปลูกต้นไม้</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="text-5xl animate-spin mb-4">🌿</div>
                            <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                        </div>
                    ) : data ? (
                        <>
                            {/* Overall Stats Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                {[
                                    { label: 'ต้นไม้รวม', value: Number(data.overall.total_trees || 0).toLocaleString(), icon: '🌳', color: 'from-green-500 to-green-600' },
                                    { label: 'รายการ', value: Number(data.overall.total_records || 0).toLocaleString(), icon: '📋', color: 'from-blue-500 to-blue-600' },
                                    { label: 'ผู้ปลูก', value: Number(data.overall.total_planters || 0).toLocaleString(), icon: '👨‍🌾', color: 'from-orange-500 to-orange-600' },
                                    { label: 'ชนิดต้นไม้', value: Number(data.overall.total_species || 0).toLocaleString(), icon: '🌿', color: 'from-teal-500 to-teal-600' },
                                ].map(card => (
                                    <div key={card.label} className={`bg-gradient-to-br ${card.color} rounded-xl p-4 text-white`}>
                                        <div className="text-2xl mb-1">{card.icon}</div>
                                        <div className="text-2xl font-bold">{card.value}</div>
                                        <div className="text-xs opacity-80">{card.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 mb-5">
                                <button
                                    onClick={() => setActiveTab('districts')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'districts' ? 'bg-green-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    📍 แยกตามอำเภอ
                                </button>
                                <button
                                    onClick={() => setActiveTab('types')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'types' ? 'bg-green-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    🌲 ชนิดต้นไม้
                                </button>
                            </div>

                            {/* Districts Tab */}
                            {activeTab === 'districts' && (
                                <div className="space-y-4">
                                    {/* Bar chart for top districts */}
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-4">จำนวนต้นไม้แยกตามอำเภอ</h3>
                                        <BarChart
                                            data={data.districts.map(d => ({ label: d.district, value: d.totalTrees }))}
                                            maxValue={maxTrees}
                                            colors={CHART_COLORS}
                                        />
                                    </div>

                                    {/* District cards with expand */}
                                    <div className="space-y-2">
                                        {data.districts.map((district, index) => (
                                            <div
                                                key={district.district}
                                                className="border border-gray-200 rounded-xl overflow-hidden"
                                            >
                                                <button
                                                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition text-left"
                                                    onClick={() => setExpandedDistrict(
                                                        expandedDistrict === district.district ? null : district.district
                                                    )}
                                                >
                                                    <div
                                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-800">{district.district}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {district.speciesCount} ชนิด · {district.planters} ผู้ปลูก
                                                        </div>
                                                    </div>
                                                    <div className="text-right mr-3">
                                                        <div className="text-xl font-bold text-green-600">{Number(district.totalTrees).toLocaleString()}</div>
                                                        <div className="text-xs text-gray-500">ต้น</div>
                                                    </div>
                                                    <span className="text-gray-400 text-sm">
                                                        {expandedDistrict === district.district ? '▲' : '▼'}
                                                    </span>
                                                </button>

                                                {/* Expanded tree types */}
                                                {expandedDistrict === district.district && (
                                                    <div className="border-t border-gray-100 bg-gray-50 p-4">
                                                        <div className="flex gap-4">
                                                            {/* Mini pie */}
                                                            {district.treeTypes.length > 0 && (
                                                                <div className="w-24 h-24 flex-shrink-0">
                                                                    <MiniPie
                                                                        data={district.treeTypes.slice(0, 8).map(t => ({ name: t.name, value: t.quantity }))}
                                                                        colors={CHART_COLORS}
                                                                    />
                                                                </div>
                                                            )}
                                                            {/* Type list */}
                                                            <div className="flex-1 space-y-1">
                                                                <h4 className="text-xs font-semibold text-gray-600 mb-2">ชนิดต้นไม้ในอำเภอนี้</h4>
                                                                {district.treeTypes.map((t, ti) => (
                                                                    <div key={t.name} className="flex items-center gap-2 text-xs">
                                                                        <div
                                                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                                            style={{ backgroundColor: CHART_COLORS[ti % CHART_COLORS.length] }}
                                                                        />
                                                                        <span className="flex-1 text-gray-700 truncate">{t.name}</span>
                                                                        <span className="font-semibold text-gray-800">{t.quantity} ต้น</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tree Types Tab */}
                            {activeTab === 'types' && (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-4">ชนิดต้นไม้ยอดนิยม</h3>
                                        <BarChart
                                            data={data.treeTypes.slice(0, 10).map(t => ({ label: t.tree_name, value: t.total_quantity }))}
                                            maxValue={Math.max(...data.treeTypes.map(t => t.total_quantity), 1)}
                                            colors={CHART_COLORS}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {data.treeTypes.map((t, i) => (
                                            <div key={t.tree_name} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-green-200 transition">
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                                                >
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1 truncate">
                                                    <div className="text-sm font-medium text-gray-800 truncate">{t.tree_name}</div>
                                                    <div className="text-xs text-gray-500">{t.record_count} รายการ</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-green-600">{Number(t.total_quantity).toLocaleString()}</div>
                                                    <div className="text-xs text-gray-400">ต้น</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20 text-gray-400">
                            <p className="text-4xl mb-2">📊</p>
                            <p>ไม่สามารถโหลดข้อมูลได้</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
