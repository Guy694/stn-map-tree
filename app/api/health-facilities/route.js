import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
    try {
        // Fetch active health facilities
        // New schema uses: typecode, tambon (instead of type, tambon_name)
        const facilities = await query(`
            SELECT 
                id,
                name,
                typecode,
                district_name,
                tambon,
                address,
                lat,
                lon
            FROM health_facilities
            WHERE is_active = TRUE
            ORDER BY 
                district_name,
                name
        `);

        return NextResponse.json(facilities);
    } catch (error) {
        console.error('Error fetching health facilities:', error);
        return NextResponse.json(
            { error: 'ไม่สามารถดึงข้อมูลหน่วยงานได้' },
            { status: 500 }
        );
    }
}
