import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

// GET trees owned by the current logged-in user
export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session');

        if (!sessionCookie) {
            return NextResponse.json(
                { error: 'กรุณาเข้าสู่ระบบก่อน' },
                { status: 401 }
            );
        }

        const user = JSON.parse(sessionCookie.value);

        const trees = await query(`
            SELECT 
                t.*,
                u.username,
                u.full_name as planter_name,
                GROUP_CONCAT(ti.image_path ORDER BY ti.id SEPARATOR ',') as images,
                GROUP_CONCAT(ti.id ORDER BY ti.id SEPARATOR ',') as image_ids
            FROM trees t
            JOIN users u ON t.user_id = u.id
            LEFT JOIN tree_images ti ON t.id = ti.tree_id
            WHERE t.user_id = ?
            GROUP BY t.id
            ORDER BY t.created_at DESC
        `, [user.id]);

        const treesWithImages = trees.map(tree => ({
            ...tree,
            images: tree.images ? tree.images.split(',') : [],
            image_ids: tree.image_ids ? tree.image_ids.split(',').map(Number) : []
        }));

        return NextResponse.json(treesWithImages);
    } catch (error) {
        console.error('Error fetching user trees:', error);
        return NextResponse.json(
            { error: 'ไม่สามารถดึงข้อมูลต้นไม้ได้' },
            { status: 500 }
        );
    }
}
