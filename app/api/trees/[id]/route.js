import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

async function getAuthUser() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    if (!sessionCookie) return null;
    try {
        return JSON.parse(sessionCookie.value);
    } catch {
        return null;
    }
}

// PATCH - Edit tree details (owner only)
export async function PATCH(request, { params }) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const existing = await query(`SELECT id, user_id FROM trees WHERE id = ?`, [id]);
        if (!existing.length) {
            return NextResponse.json({ error: 'ไม่พบข้อมูลต้นไม้' }, { status: 404 });
        }
        if (existing[0].user_id !== user.id && user.role !== 'admin') {
            return NextResponse.json({ error: 'ไม่มีสิทธิ์แก้ไขข้อมูลนี้' }, { status: 403 });
        }

        const data = await request.json();
        const {
            treeName,
            quantity,
            districtName,
            tambonName,
            villageName,
            locationDetail,
            plantingDate,
            note
        } = data;

        await query(`
            UPDATE trees 
            SET tree_name = ?, quantity = ?,
                district_name = ?, tambon_name = ?, village_name = ?,
                location_detail = ?, planting_date = ?, note = ?,
                updated_at = NOW()
            WHERE id = ?
        `, [
            treeName,
            quantity,
            districtName || null,
            tambonName || null,
            villageName || null,
            locationDetail || null,
            plantingDate || null,
            note || null,
            id
        ]);

        // Return updated tree
        const updated = await query(`
            SELECT t.*, u.full_name as planter_name,
                GROUP_CONCAT(ti.image_path ORDER BY ti.id SEPARATOR ',') as images,
                GROUP_CONCAT(ti.id ORDER BY ti.id SEPARATOR ',') as image_ids
            FROM trees t
            JOIN users u ON t.user_id = u.id
            LEFT JOIN tree_images ti ON t.id = ti.tree_id
            WHERE t.id = ?
            GROUP BY t.id
        `, [id]);

        const tree = {
            ...updated[0],
            images: updated[0].images ? updated[0].images.split(',') : [],
            image_ids: updated[0].image_ids ? updated[0].image_ids.split(',').map(Number) : []
        };

        return NextResponse.json({ success: true, tree });
    } catch (error) {
        console.error('Error updating tree:', error);
        return NextResponse.json({ error: 'ไม่สามารถแก้ไขข้อมูลต้นไม้ได้' }, { status: 500 });
    }
}

// DELETE - Delete tree and its images (owner only)
export async function DELETE(request, { params }) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const existing = await query(`SELECT id, user_id FROM trees WHERE id = ?`, [id]);
        if (!existing.length) {
            return NextResponse.json({ error: 'ไม่พบข้อมูลต้นไม้' }, { status: 404 });
        }
        if (existing[0].user_id !== user.id && user.role !== 'admin') {
            return NextResponse.json({ error: 'ไม่มีสิทธิ์ลบข้อมูลนี้' }, { status: 403 });
        }

        // Delete images first then tree
        await query(`DELETE FROM tree_images WHERE tree_id = ?`, [id]);
        await query(`DELETE FROM trees WHERE id = ?`, [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting tree:', error);
        return NextResponse.json({ error: 'ไม่สามารถลบข้อมูลต้นไม้ได้' }, { status: 500 });
    }
}
