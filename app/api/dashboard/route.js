import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET dashboard statistics: tree counts per district + tree type breakdown
export async function GET() {
    try {
        // Overall stats
        const overallStats = await query(`
            SELECT 
                COUNT(DISTINCT t.id) as total_records,
                SUM(t.quantity) as total_trees,
                COUNT(DISTINCT t.user_id) as total_planters,
                COUNT(DISTINCT t.district_name) as total_districts,
                COUNT(DISTINCT t.tree_name) as total_species
            FROM trees t
        `);

        // Per-district stats with tree type breakdown
        const districtStats = await query(`
            SELECT 
                COALESCE(district_name, 'ไม่ระบุ') as district,
                COUNT(id) as record_count,
                SUM(quantity) as total_trees,
                COUNT(DISTINCT user_id) as planters,
                COUNT(DISTINCT tree_name) as species_count
            FROM trees
            GROUP BY district_name
            ORDER BY total_trees DESC
        `);

        // Tree type breakdown per district
        const districtTreeTypes = await query(`
            SELECT 
                COALESCE(district_name, 'ไม่ระบุ') as district,
                tree_name,
                COUNT(id) as record_count,
                SUM(quantity) as quantity
            FROM trees
            GROUP BY district_name, tree_name
            ORDER BY district_name, quantity DESC
        `);

        // Global tree type stats
        const treeTypeStats = await query(`
            SELECT 
                tree_name,
                COUNT(id) as record_count,
                SUM(quantity) as total_quantity
            FROM trees
            GROUP BY tree_name
            ORDER BY total_quantity DESC
            LIMIT 20
        `);

        // Build district data with nested tree types
        const typesByDistrict = {};
        districtTreeTypes.forEach(row => {
            if (!typesByDistrict[row.district]) {
                typesByDistrict[row.district] = [];
            }
            typesByDistrict[row.district].push({
                name: row.tree_name,
                recordCount: row.record_count,
                quantity: row.quantity
            });
        });

        const districts = districtStats.map(d => ({
            district: d.district,
            recordCount: d.record_count,
            totalTrees: d.total_trees,
            planters: d.planters,
            speciesCount: d.species_count,
            treeTypes: typesByDistrict[d.district] || []
        }));

        return NextResponse.json({
            overall: overallStats[0],
            districts,
            treeTypes: treeTypeStats
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'ไม่สามารถดึงข้อมูล Dashboard ได้' },
            { status: 500 }
        );
    }
}
