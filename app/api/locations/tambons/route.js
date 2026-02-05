import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const district = searchParams.get('district');

        let sql = `
            SELECT DISTINCT tam_name as name, dis_name
            FROM tambons_polygon
            WHERE pro_name = 'สตูล'
        `;

        const params = [];
        if (district) {
            sql += ` AND dis_name = ?`;
            params.push(district);
        }

        sql += ` ORDER BY tam_name`;

        const tambons = await query(sql, params);

        return NextResponse.json(tambons.map(t => t.name));
    } catch (error) {
        console.error('Error fetching tambon names:', error);
        return NextResponse.json(
            { error: 'ไม่สามารถดึงข้อมูลตำบลได้' },
            { status: 500 }
        );
    }
}
