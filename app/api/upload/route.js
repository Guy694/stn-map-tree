import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { cookies } from 'next/headers';
import Busboy from 'busboy';
import { Readable } from 'stream';

// Allow large uploads — no Next.js body size limit imposed
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(request) {
    try {
        // Check authentication
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session');

        if (!sessionCookie) {
            return NextResponse.json(
                { error: 'กรุณาเข้าสู่ระบบก่อนอัปโหลดรูปภาพ' },
                { status: 401 }
            );
        }

        const contentType = request.headers.get('content-type') || '';
        if (!contentType.includes('multipart/form-data')) {
            return NextResponse.json({ error: 'กรุณาส่งเป็น multipart/form-data' }, { status: 400 });
        }

        // Prepare upload directory
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'trees');
        await mkdir(uploadDir, { recursive: true });

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSizeBytes = 50 * 1024 * 1024; // 50MB per file
        const uploadedPaths = [];

        // Stream body through busboy — bypasses Next.js body size limits entirely
        await new Promise((resolve, reject) => {
            const busboy = Busboy({
                headers: { 'content-type': contentType },
                limits: {
                    fileSize: maxSizeBytes,   // 50MB per file
                    files: 10                  // max 10 files at once
                }
            });

            const filePromises = [];

            busboy.on('file', (fieldName, fileStream, info) => {
                const { filename, mimeType } = info;

                if (!allowedTypes.includes(mimeType)) {
                    fileStream.resume(); // discard
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
                    writeStream.on('finish', () => {
                        if (!fileSizeExceeded) {
                            uploadedPaths.push(`/uploads/trees/${outputFilename}`);
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

            // Pipe the request body to busboy
            // Convert Web ReadableStream → Node.js Readable → busboy
            const reader = request.body.getReader();
            const nodeStream = new Readable({
                async read() {
                    const { done, value } = await reader.read();
                    if (done) {
                        this.push(null);
                    } else {
                        this.push(Buffer.from(value));
                    }
                }
            });
            nodeStream.pipe(busboy);
        });

        return NextResponse.json({
            success: true,
            paths: uploadedPaths
        });

    } catch (error) {
        // If error is already a NextResponse (from our reject()), return it
        if (error instanceof Response || (error && error.status && error.headers)) {
            return error;
        }
        console.error('Error uploading images:', error);
        return NextResponse.json(
            {
                error: 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ',
                details: error.message
            },
            { status: 500 }
        );
    }
}
