import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { mkdir } from 'fs/promises';
import { createWriteStream, unlink } from 'fs';
import { join } from 'path';
import Busboy from 'busboy';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

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

// POST - Upload and attach new image(s) to a tree (streaming via busboy)
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

        const contentType = request.headers.get('content-type') || '';
        if (!contentType.includes('multipart/form-data')) {
            return NextResponse.json({ error: 'กรุณาส่งเป็น multipart/form-data' }, { status: 400 });
        }

        const uploadDir = join(process.cwd(), 'public', 'uploads', 'trees');
        await mkdir(uploadDir, { recursive: true });

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSizeBytes = 50 * 1024 * 1024; // 50MB per file
        const uploadedImages = [];

        await new Promise((resolve, reject) => {
            const busboy = Busboy({
                headers: { 'content-type': contentType },
                limits: { fileSize: maxSizeBytes, files: 10 }
            });

            const filePromises = [];

            busboy.on('file', (fieldName, fileStream, info) => {
                const { filename, mimeType } = info;

                if (!allowedTypes.includes(mimeType)) {
                    fileStream.resume();
                    return reject(
                        NextResponse.json(
                            { error: `ไฟล์ ${filename} ไม่ใช่รูปภาพที่รองรับ (jpg, png, webp เท่านั้น)` },
                            { status: 400 }
                        )
                    );
                }

                const timestamp = Date.now();
                const randomStr = Math.random().toString(36).substring(2, 15);
                const extension = filename.split('.').pop().toLowerCase() || 'jpg';
                const outputFilename = `${timestamp}_${randomStr}.${extension}`;
                const filepath = join(uploadDir, outputFilename);

                let fileSizeExceeded = false;
                const writeStream = createWriteStream(filepath);

                fileStream.on('limit', () => {
                    fileSizeExceeded = true;
                    fileStream.resume();
                    writeStream.destroy();
                    reject(
                        NextResponse.json(
                            { error: `ไฟล์ ${filename} มีขนาดใหญ่เกิน 50MB` },
                            { status: 400 }
                        )
                    );
                });

                const p = new Promise((res, rej) => {
                    writeStream.on('finish', async () => {
                        if (!fileSizeExceeded) {
                            const imagePath = `/uploads/trees/${outputFilename}`;
                            try {
                                const result = await query(
                                    `INSERT INTO tree_images (tree_id, image_path) VALUES (?, ?)`,
                                    [id, imagePath]
                                );
                                uploadedImages.push({ id: result.insertId, path: imagePath });
                            } catch (dbErr) {
                                rej(dbErr);
                                return;
                            }
                        }
                        res();
                    });
                    writeStream.on('error', rej);
                    fileStream.on('error', rej);
                });

                filePromises.push(p);
                fileStream.pipe(writeStream);
            });

            busboy.on('finish', async () => {
                try {
                    await Promise.all(filePromises);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });

            busboy.on('error', reject);

            const reader = request.body.getReader();
            const nodeStream = new Readable({
                async read() {
                    const { done, value } = await reader.read();
                    if (done) this.push(null);
                    else this.push(Buffer.from(value));
                }
            });
            nodeStream.pipe(busboy);
        });

        return NextResponse.json({ success: true, images: uploadedImages });
    } catch (error) {
        if (error instanceof Response || (error && error.status && error.headers)) {
            return error;
        }
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
            await new Promise((res) => unlink(filePath, () => res()));
        } catch {
            // Continue if file doesn't exist
        }

        await query(`DELETE FROM tree_images WHERE id = ?`, [imageId]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting tree image:', error);
        return NextResponse.json({ error: 'ไม่สามารถลบรูปภาพได้' }, { status: 500 });
    }
}
