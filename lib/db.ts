import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://pantone-users-clark0711.aws-ap-northeast-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

export async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function createUser(email: string, password: string) {
  try {
    const result = await db.execute({
      sql: 'INSERT INTO users (email, password) VALUES (?, ?)',
      args: [email, password],
    });
    return { success: true, lastInsertId: result.lastInsertRowId };
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('UNIQUE constraint')) {
      return { success: false, error: '邮箱已被注册' };
    }
    return { success: false, error: '注册失败' };
  }
}

export async function getUserByEmail(email: string) {
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });
  return result.rows[0] || null;
}

export default db;
