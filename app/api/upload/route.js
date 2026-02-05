import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { cookies } from 'next/headers';

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

        const formData = await request.formData();
        const files = formData.getAll('images');

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'ไม่พบไฟล์รูปภาพ' },
                { status: 400 }
            );
        }

        const uploadedPaths = [];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; //    10MB

        for (const file of files) {
            // Validate file type
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json(
                    { error: `ไฟล์ ${file.name} ไม่ใช่รูปภาพที่รองรับ (jpg, png, webp เท่านั้น)` },
                    { status: 400 }
                );
            }

            // Validate file size
            if (file.size > maxSize) {
                return NextResponse.json(
                    { error: `ไฟล์ ${file.name} มีขนาดใหญ่เกิน 5MB` },
                    { status: 400 }
                );
            }

            // Generate unique filename
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const extension = file.name.split('.').pop();
            const filename = `${timestamp}_${randomString}.${extension}`;

            // Convert file to buffer
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Save file
            const uploadDir = join(process.cwd(), 'public', 'uploads', 'trees');
            const filepath = join(uploadDir, filename);
            await writeFile(filepath, buffer);

            // Store relative path from /public
            uploadedPaths.push(`/uploads/trees/${filename}`);
        }

        return NextResponse.json({
            success: true,
            paths: uploadedPaths
        });

    } catch (error) {
        console.error('Error uploading images:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ' },
            { status: 500 }
        );
    }
}
