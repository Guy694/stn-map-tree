import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request, { params }) {
    try {
        const pathArray = await params.path;
        const imagePath = pathArray.join('/');
        const filePath = join(process.cwd(), 'public', 'uploads', imagePath);

        console.log('Attempting to serve file:', {
            cwd: process.cwd(),
            imagePath,
            fullPath: filePath
        });

        const file = await readFile(filePath);

        // ตรวจสอบ extension
        const ext = imagePath.split('.').pop().toLowerCase();
        const contentTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp'
        };

        return new NextResponse(file, {
            headers: {
                'Content-Type': contentTypes[ext] || 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Error serving image:', {
            error: error.message,
            stack: error.stack,
            attemptedPath: error.path // specific to fs errors
        });
        return new NextResponse(`Image not found: ${error.message}`, { status: 404 });
    }
}
