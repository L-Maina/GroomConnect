import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createConversationSchema } from '@/lib/validations';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

// List conversations
export async function GET() {
  try {
    const user = await requireAuth();

    const conversations = await db.conversation.findMany({
      where: {
        OR: [
          { customerId: user.id },
          { business: { ownerId: user.id } },
        ],
      },
      include: {
        business: {
          select: { id: true, name: true, logo: true },
        },
        customer: {
          select: { id: true, name: true, avatar: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Add unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await db.chatMessage.count({
          where: {
            conversationId: conv.id,
            receiverId: user.id,
            isRead: false,
          },
        });
        return { ...conv, unreadCount };
      })
    );

    return successResponse(conversationsWithUnread);
  } catch (error) {
    return handleApiError(error);
  }
}

// Create conversation
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validated = createConversationSchema.parse(body);

    // Check if conversation already exists
    let conversation = await db.conversation.findUnique({
      where: {
        businessId_customerId: {
          businessId: validated.businessId,
          customerId: user.id,
        },
      },
    });

    if (conversation) {
      return successResponse(conversation);
    }

    // Create new conversation
    conversation = await db.conversation.create({
      data: {
        businessId: validated.businessId,
        customerId: user.id,
      },
      include: {
        business: {
          select: { id: true, name: true, logo: true },
        },
        customer: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return successResponse(conversation, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
