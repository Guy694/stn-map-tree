import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
    try {
        const diagnostics = {};

        // Check all possible polygon tables
        const tablesToCheck = [
            'districts_polygon',
            'tambons_polygon',
            'villages_polygon',
            'satun_village_polygon',
            'satun_district_polygon',
            'satun_districts_polygon',
            'satun_tambon_polygon',
            'satun_tambons_polygon'
        ];

        for (const tableName of tablesToCheck) {
            try {
                // Check if table exists and get row count
                const countResult = await query(`
                    SELECT COUNT(*) as count FROM ${tableName}
                `);

                const count = countResult[0]?.count || 0;
                diagnostics[tableName] = {
                    exists: true,
                    rowCount: count,
                    sample: null
                };

                // Get a sample row if table has data
                if (count > 0) {
                    const sampleResult = await query(`
                        SELECT 
                            *,
                            ST_AsGeoJSON(geometry) as geom_json
                        FROM ${tableName}
                        LIMIT 1
                    `);

                    if (sampleResult && sampleResult.length > 0) {
                        const sample = sampleResult[0];
                        diagnostics[tableName].sample = {
                            columns: Object.keys(sample),
                            firstRow: sample
                        };
                    }
                }
            } catch (error) {
                // Table might not exist or might use different column name
                try {
                    // Try with 'geom' instead of 'geometry'
                    const countResult = await query(`
                        SELECT COUNT(*) as count FROM ${tableName}
                    `);

                    const count = countResult[0]?.count || 0;
                    diagnostics[tableName] = {
                        exists: true,
                        rowCount: count,
                        sample: null,
                        note: 'geometry column might be named differently'
                    };

                    // Try to get sample with 'geom' column
                    if (count > 0) {
                        const sampleResult = await query(`
                            SELECT 
                                *,
                                ST_AsGeoJSON(geom) as geom_json
                            FROM ${tableName}
                            LIMIT 1
                        `);

                        if (sampleResult && sampleResult.length > 0) {
                            const sample = sampleResult[0];
                            diagnostics[tableName].sample = {
                                columns: Object.keys(sample),
                                firstRow: sample,
                                geometryColumnName: 'geom'
                            };
                        }
                    }
                } catch (innerError) {
                    diagnostics[tableName] = {
                        exists: false,
                        error: innerError.message
                    };
                }
            }
        }

        // List all tables in the database
        try {
            const allTables = await query(`
                SELECT TABLE_NAME 
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME LIKE '%polygon%'
            `);
            diagnostics._allPolygonTables = allTables.map(t => t.TABLE_NAME);
        } catch (error) {
            diagnostics._allPolygonTables = { error: error.message };
        }

        return NextResponse.json(diagnostics, { status: 200 });
    } catch (error) {
        console.error('Error in polygon diagnostics:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล', details: error.message },
            { status: 500 }
        );
    }
}
