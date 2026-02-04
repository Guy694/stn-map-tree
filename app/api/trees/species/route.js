import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('q');

        let sql = 'SELECT id, name FROM common_trees';
        let params = [];

        if (search) {
            sql += ' WHERE name LIKE ?';
            params.push(`%${search}%`);
        }

        sql += ' ORDER BY name ASC';

        const trees = await query(sql, params);

        return NextResponse.json(trees);
    } catch (error) {
        console.error('Error fetching tree species:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลพันธุ์ไม้' },
            { status: 500 }
        );
    }
}
