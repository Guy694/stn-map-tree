import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
    try {
        // Fetch unique districts from districts_polygon table
        const districts = await query(`
            SELECT DISTINCT dis_name as name
            FROM districts_polygon
            WHERE pro_name = 'สตูล'
            ORDER BY dis_name
        `);

        return NextResponse.json(districts.map(d => d.name));
    } catch (error) {
        console.error('Error fetching district names:', error);
        return NextResponse.json(
            { error: 'ไม่สามารถดึงข้อมูลอำเภอได้' },
            { status: 500 }
        );
    }
}
