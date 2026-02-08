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
        u.full_name as planter_name,
        GROUP_CONCAT(ti.image_path) as images
      FROM trees t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN tree_images ti ON t.id = ti.tree_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);

        // Parse images string into array
        const treesWithImages = trees.map(tree => ({
            ...tree,
            images: tree.images ? tree.images.split(',') : []
        }));

        return NextResponse.json(treesWithImages);
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

        console.log('API POST /trees - Cookie checking');
        console.log('Has session cookie:', !!sessionCookie);
        if (sessionCookie) {
            console.log('Session cookie value (partial):', sessionCookie.value.substring(0, 10) + '...');
        } else {
            console.log('No session cookie found in request');
            const allCookies = cookieStore.getAll();
            console.log('All cookies present:', allCookies.map(c => c.name));
        }

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
            plantingDate,
            note,
            imagePaths // Array of image paths from upload
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
        location_detail, planting_date, note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            plantingDate || null,
            note || null
        ]);

        const treeId = result.insertId;

        // Insert images if provided
        if (imagePaths && imagePaths.length > 0) {
            // Insert each image individually since pool.execute() doesn't support bulk VALUES ?
            for (const imagePath of imagePaths) {
                await query(
                    `INSERT INTO tree_images (tree_id, image_path) VALUES (?, ?)`,
                    [treeId, imagePath]
                );
            }
        }

        // Fetch the created tree with images
        const newTree = await query(
            `SELECT 
        t.*,
        u.username,
        u.full_name as planter_name,
        GROUP_CONCAT(ti.image_path) as images
      FROM trees t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN tree_images ti ON t.id = ti.tree_id
      WHERE t.id = ?
      GROUP BY t.id`,
            [treeId]
        );

        // Parse images string into array
        const treeWithImages = {
            ...newTree[0],
            images: newTree[0].images ? newTree[0].images.split(',') : []
        };

        return NextResponse.json({
            success: true,
            tree: treeWithImages
        });
    } catch (error) {
        console.error('Error creating tree:', error);
        return NextResponse.json(
            { error: 'ไม่สามารถบันทึกข้อมูลต้นไม้ได้' },
            { status: 500 }
        );
    }
}

