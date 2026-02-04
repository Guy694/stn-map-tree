// Tree data storage utilities using localStorage

const STORAGE_KEY = 'stn-tree-records';

// Sample initial data for Satun province
const sampleData = [
    {
        id: '1',
        planterName: 'นายสมชาย ใจดี',
        treeName: 'ต้นประดู่',
        quantity: 5,
        location: 'บ้านควนโดน ต.ควนโดน',
        lat: 6.7686,
        lng: 99.9563,
        note: 'ปลูกเนื่องในวันต้นไม้ประจำปี',
        createdAt: '2026-01-15T10:30:00'
    },
    {
        id: '2',
        planterName: 'นางสาวสมหญิง รักธรรมชาติ',
        treeName: 'ต้นยางนา',
        quantity: 10,
        location: 'บ้านท่าแพ ต.ท่าแพ',
        lat: 6.6238,
        lng: 100.0674,
        note: 'ปลูกในโครงการปลูกป่าชุมชน',
        createdAt: '2026-01-20T14:00:00'
    },
    {
        id: '3',
        planterName: 'นายวิชัย มองไกล',
        treeName: 'ต้นตะเคียน',
        quantity: 3,
        location: 'บ้านทุ่งหว้า ต.ทุ่งหว้า',
        lat: 7.1214,
        lng: 99.7936,
        note: 'ปลูกริมถนน',
        createdAt: '2026-01-25T09:15:00'
    }
];

// Initialize storage with sample data if empty
export function initializeStorage() {
    if (typeof window === 'undefined') return;

    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
    }
}

// Get all tree records
export function getTrees() {
    if (typeof window === 'undefined') return [];

    initializeStorage();
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Save a new tree record
export function saveTree(treeData) {
    if (typeof window === 'undefined') return null;

    const trees = getTrees();
    const newTree = {
        ...treeData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
    };

    trees.push(newTree);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trees));

    return newTree;
}

// Delete a tree record
export function deleteTree(id) {
    if (typeof window === 'undefined') return;

    const trees = getTrees();
    const filtered = trees.filter(tree => tree.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

// Update a tree record
export function updateTree(id, updatedData) {
    if (typeof window === 'undefined') return;

    const trees = getTrees();
    const index = trees.findIndex(tree => tree.id === id);

    if (index !== -1) {
        trees[index] = { ...trees[index], ...updatedData };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trees));
    }
}
