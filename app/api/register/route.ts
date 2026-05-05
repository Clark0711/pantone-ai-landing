import { NextRequest, NextResponse } from 'next/server';
import { createUser, initDb } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await initDb();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: '请填写完整信息' }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: '请输入有效的邮箱地址' }, { status: 400 });
    }

    // Password validation (min 6 chars)
    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少6位' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const result = await createUser(email, hashedPassword);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Generate token
    const token = await signToken({ email });

    // Set cookie and redirect
    const response = NextResponse.json({
      success: true,
      message: '注册成功',
      redirectUrl: 'https://pantone-color-system-3bm4iiy14-clark0711s-projects.vercel.app'
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
