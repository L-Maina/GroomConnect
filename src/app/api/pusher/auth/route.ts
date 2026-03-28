import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import pusher from 'pusher';

const pusherServer = new pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
  useTLS: true,
});

// Pusher authentication endpoint
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.formData();

    const socketId = body.get('socket_id') as string;
    const channel = body.get('channel_name') as string;

    if (!socketId || !channel) {
      return errorResponse('Missing socket_id or channel_name', 400);
    }

    // Validate that user can access this channel
    const isUserChannel = channel.startsWith(`user-${user.id}`);
    const isChatChannel = channel.startsWith('chat-');
    const isBusinessChannel = channel.startsWith('business-');
    const isAdminChannel = channel === 'admin-channel';

    let authorized = false;

    if (isUserChannel) {
      authorized = true;
    } else if (isChatChannel || isBusinessChannel) {
      authorized = true;
    } else if (isAdminChannel) {
      authorized = user.role === 'ADMIN';
    }

    if (!authorized) {
      return errorResponse('Unauthorized channel access', 403);
    }

    // Generate auth response
    const authResponse = pusherServer.authorizeChannel(socketId, channel, {
      user_id: user.id,
      user_info: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    return successResponse(authResponse);
  } catch (error) {
    return handleApiError(error);
  }
}
