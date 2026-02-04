import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

// GET all trees
export async function GET(request) {
    try {
        const trees = await query(`
      SELECT 
        t.*,
        u.username,
        u.full_name as planter_name
      FROM trees t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `);

        return NextResponse.json(trees);
    } catch (error) {
        console.error('Error fetching trees:', error);
        return NextResponse.json(
            { error: 'ไม่สามารถดึงข้อมูลต้นไม้ได้' },
            { status: 500 }
        );
    }
}

// POST new tree (requires authentication)
export async function POST(request) {
    try {
        // Check authentication
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session');

        if (!sessionCookie) {
            return NextResponse.json(
                { error: 'กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล' },
                { status: 401 }
            );
        }

        const user = JSON.parse(sessionCookie.value);

        const data = await request.json();
        const {
            treeName,
            quantity,
            lat,
            lng,
            villageName,
            tambonName,
            districtName,
            locationDetail,
            note
        } = data;

        // Validate required fields
        if (!treeName || !quantity || !lat || !lng) {
            return NextResponse.json(
                { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
                { status: 400 }
            );
        }

        // Insert tree
        const result = await query(`
      INSERT INTO trees (
        user_id, tree_name, quantity, lat, lng,
        village_name, tambon_name, district_name,
        location_detail, note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            user.id,
            treeName,
            quantity,
            lat,
            lng,
            villageName || null,
            tambonName || null,
            districtName || null,
            locationDetail || null,
            note || null
        ]);

        // Fetch the created tree
        const newTree = await query(
            `SELECT 
        t.*,
        u.username,
        u.full_name as planter_name
      FROM trees t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?`,
            [result.insertId]
        );

        return NextResponse.json({
            success: true,
            tree: newTree[0]
        });
    } catch (error) {
        console.error('Error creating tree:', error);
        return NextResponse.json(
            { error: 'ไม่สามารถบันทึกข้อมูลต้นไม้ได้' },
            { status: 500 }
        );
    }
}
