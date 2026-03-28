import { clearSession } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-utils';

export async function POST() {
  try {
    await clearSession();
    return successResponse({ message: 'Logged out successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
