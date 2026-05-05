import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, initDb } from '@/lib/db';
import { verifyPassword, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await initDb();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: '请填写完整信息' }, { status: 400 });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password as string);

    if (!isValid) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
    }

    const token = await signToken({ email: user.email as string });

    const response = NextResponse.json({
      success: true,
      message: '登录成功',
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
    console.error('Login error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
