import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function POST(request) {
    try {
        const { username, password, fullName } = await request.json();

        if (!username || !password || !fullName) {
            return NextResponse.json(
                { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
                { status: 400 }
            );
        }

        // Check if username already exists
        const existing = await query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existing.length > 0) {
            return NextResponse.json(
                { error: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert new user
        const result = await query(
            'INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
            [username, passwordHash, fullName, 'user']
        );

        return NextResponse.json({
            success: true,
            message: 'สมัครสมาชิกสำเร็จ'
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' },
            { status: 500 }
        );
    }
}
