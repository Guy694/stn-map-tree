'use client';

import { useState, useMemo } from 'react';

export default function AdminTreeTable({ trees, onRowClick }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTreeType, setSelectedTreeType] = useState('');
    const itemsPerPage = 10;

    // Get unique tree types for filter
    const treeTypes = useMemo(() => {
        const types = [...new Set(trees.map(tree => tree.tree_name))];
        return types.sort();
    }, [trees]);

    // Filter and sort trees
    const filteredAndSortedTrees = useMemo(() => {
        let result = [...trees];

        // Apply search filter
        if (searchTerm) {
            result = result.filter(tree =>
                tree.tree_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tree.planter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tree.district_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tree.tambon_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tree.village_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply tree type filter
        if (selectedTreeType) {
            result = result.filter(tree => tree.tree_name === selectedTreeType);
        }

        // Apply sorting
        result.sort((a, b) => {
            let aVal = a[sortColumn];
            let bVal = b[sortColumn];

            // Handle null values
            if (aVal === null) return 1;
            if (bVal === null) return -1;

            // String comparison for text columns
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return result;
    }, [trees, searchTerm, selectedTreeType, sortColumn, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedTrees.length / itemsPerPage);
    const paginatedTrees = filteredAndSortedTrees.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Handle sort
    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 h-full flex flex-col">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>📊</span>
                    <span>ตารางข้อมูลการบันทึกต้นไม้</span>
                </h2>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-3">
                    {/* Search */}
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="🔍 ค้นหา (ชื่อต้นไม้, ผู้บันทึก, พื้นที่...)"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Tree Type Filter */}
                    <div className="w-full md:w-64">
                        <select
                            value={selectedTreeType}
                            onChange={(e) => {
                                setSelectedTreeType(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                        >
                            <option value="">ทุกชนิดต้นไม้</option>
                            {treeTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-4 flex gap-4 text-sm text-gray-600">
                    <span>📈 ทั้งหมด: <strong>{trees.length}</strong> รายการ</span>
                    <span>🔎 แสดง: <strong>{filteredAndSortedTrees.length}</strong> รายการ</span>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto sidebar-scrollbar">
                <table className="admin-table w-full">
                    <thead className="sticky top-0 bg-gradient-to-r from-green-600 to-green-500 text-white">
                        <tr>
                            <th onClick={() => handleSort('id')} className="cursor-pointer hover:bg-green-700 transition-colors">
                                ID {sortColumn === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('tree_name')} className="cursor-pointer hover:bg-green-700 transition-colors">
                                ชื่อต้นไม้ {sortColumn === 'tree_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('quantity')} className="cursor-pointer hover:bg-green-700 transition-colors">
                                จำนวน {sortColumn === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>ตำแหน่ง</th>
                            <th onClick={() => handleSort('district_name')} className="cursor-pointer hover:bg-green-700 transition-colors">
                                อำเภอ {sortColumn === 'district_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('tambon_name')} className="cursor-pointer hover:bg-green-700 transition-colors">
                                ตำบล {sortColumn === 'tambon_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('village_name')} className="cursor-pointer hover:bg-green-700 transition-colors">
                                หมู่บ้าน {sortColumn === 'village_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('planter_name')} className="cursor-pointer hover:bg-green-700 transition-colors">
                                ผู้บันทึก {sortColumn === 'planter_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('created_at')} className="cursor-pointer hover:bg-green-700 transition-colors">
                                วันที่บันทึก {sortColumn === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedTrees.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="text-center py-12 text-gray-500">
                                    <div className="text-5xl mb-3">🌳</div>
                                    <p>ไม่พบข้อมูล</p>
                                </td>
                            </tr>
                        ) : (
                            paginatedTrees.map((tree, index) => (
                                <tr
                                    key={tree.id}
                                    onClick={() => onRowClick && onRowClick(tree)}
                                    className="table-hover cursor-pointer"
                                >
                                    <td className="font-mono text-sm">{tree.id}</td>
                                    <td className="font-medium text-green-700">{tree.tree_name}</td>
                                    <td className="text-center">{tree.quantity}</td>
                                    <td className="font-mono text-xs">
                                        {Number(tree.lat).toFixed(6)}, {Number(tree.lng).toFixed(6)}
                                    </td>
                                    <td>{tree.district_name || '-'}</td>
                                    <td>{tree.tambon_name || '-'}</td>
                                    <td>{tree.village_name || '-'}</td>
                                    <td>{tree.planter_name}</td>
                                    <td className="text-sm">{formatDate(tree.created_at)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t pt-4">
                    <div className="text-sm text-gray-600">
                        หน้า {currentPage} จาก {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            ← ก่อนหน้า
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            ถัดไป →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
