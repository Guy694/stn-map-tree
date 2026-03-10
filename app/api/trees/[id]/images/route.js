import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';

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

// POST - Upload and attach new image(s) to a tree
export async function POST(request, { params }) {
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
            return NextResponse.json({ error: 'ไม่มีสิทธิ์เพิ่มรูปภาพ' }, { status: 403 });
        }

        const formData = await request.formData();
        const files = formData.getAll('images');

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'ไม่พบไฟล์รูปภาพ' }, { status: 400 });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        const uploadedImages = [];

        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json(
                    { error: `ไฟล์ ${file.name} ไม่ใช่รูปภาพที่รองรับ (jpg, png, webp เท่านั้น)` },
                    { status: 400 }
                );
            }
            if (file.size > maxSize) {
                return NextResponse.json(
                    { error: `ไฟล์ ${file.name} มีขนาดใหญ่เกิน 10MB` },
                    { status: 400 }
                );
            }

            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const extension = file.name.split('.').pop();
            const filename = `${timestamp}_${randomString}.${extension}`;

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uploadDir = join(process.cwd(), 'public', 'uploads', 'trees');
            await mkdir(uploadDir, { recursive: true });

            const filepath = join(uploadDir, filename);
            await writeFile(filepath, buffer);

            const imagePath = `/uploads/trees/${filename}`;

            // Insert into tree_images
            const result = await query(
                `INSERT INTO tree_images (tree_id, image_path) VALUES (?, ?)`,
                [id, imagePath]
            );

            uploadedImages.push({ id: result.insertId, path: imagePath });
        }

        return NextResponse.json({ success: true, images: uploadedImages });
    } catch (error) {
        console.error('Error uploading tree image:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ', details: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Remove a specific image from a tree
export async function DELETE(request, { params }) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 });
        }

        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const imageId = searchParams.get('imageId');

        if (!imageId) {
            return NextResponse.json({ error: 'กรุณาระบุ imageId' }, { status: 400 });
        }

        // Verify the image belongs to this tree and the user owns the tree
        const imageRow = await query(`
            SELECT ti.id, ti.image_path, t.user_id 
            FROM tree_images ti
            JOIN trees t ON ti.tree_id = t.id
            WHERE ti.id = ? AND ti.tree_id = ?
        `, [imageId, id]);

        if (!imageRow.length) {
            return NextResponse.json({ error: 'ไม่พบรูปภาพ' }, { status: 404 });
        }
        if (imageRow[0].user_id !== user.id && user.role !== 'admin') {
            return NextResponse.json({ error: 'ไม่มีสิทธิ์ลบรูปภาพนี้' }, { status: 403 });
        }

        // Try to delete file from disk
        try {
            const filePath = join(process.cwd(), 'public', imageRow[0].image_path);
            await unlink(filePath);
        } catch (fileError) {
            console.warn('Could not delete file from disk:', fileError.message);
            // Continue even if file deletion fails (might not exist)
        }

        // Delete from DB
        await query(`DELETE FROM tree_images WHERE id = ?`, [imageId]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting tree image:', error);
        return NextResponse.json({ error: 'ไม่สามารถลบรูปภาพได้' }, { status: 500 });
    }
}
