import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import sql from '@/lib/db';

async function getAuthUserId() {
  const cookieStore = await cookies();
  return cookieStore.get('userId')?.value;
}

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const notifications = await sql`
      SELECT 
        n.id, n.type, n.entity_id, n.is_read, n.created_at,
        u.name as actor_name,
        u.username as actor_username,
        u.avatar_url as actor_avatar
      FROM notifications n
      JOIN users u ON n.actor_id = u.id
      WHERE n.user_id = ${Number(userId)}
      ORDER BY n.created_at DESC
      LIMIT 30
    `;

    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Mark all unread notifications as read for current user
    await sql`
      UPDATE notifications 
      SET is_read = TRUE 
      WHERE user_id = ${Number(userId)} AND is_read = FALSE
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
 