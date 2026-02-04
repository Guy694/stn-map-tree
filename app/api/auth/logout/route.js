import { NextResponse } from 'next/server';

export async function POST(request) {
    const response = NextResponse.json({ success: true });

    // Clear session cookie
    response.cookies.set('session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0
    });

    return response;
}
