import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' },
                { status: 400 }
            );
        }

        // Find user
        const users = await query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return NextResponse.json(
                { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
                { status: 401 }
            );
        }

        const user = users[0];

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return NextResponse.json(
                { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
                { status: 401 }
            );
        }

        // Create session (simplified - in production use proper session management)
        const sessionData = {
            id: user.id,
            username: user.username,
            fullName: user.full_name,
            role: user.role
        };

        const response = NextResponse.json({
            success: true,
            user: sessionData
        });

        // Set session cookie
        response.cookies.set('session', JSON.stringify(sessionData), {
            httpOnly: true,
            secure: false, // process.env.NODE_ENV === 'production', // Disable secure for HTTP testing
            sameSite: 'lax', // 'strict', // Set to lax for easier testing
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
            { status: 500 }
        );
    }
}
