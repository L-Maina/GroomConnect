import { getSession } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return errorResponse('Not authenticated', 401);
    }
    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}
