// API Client for frontend to interact with backend
import { toast } from 'sonner';

const API_BASE = '/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<{ data: T; success: boolean; error?: string }> {
    const { params, ...fetchOptions } = options;

    let url = `${API_BASE}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const error = data.error || 'An error occurred';
        toast.error(error);
        throw new Error(error);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ id: string; email: string; name: string; role: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getProfile() {
    return this.request<{ id: string; email: string; name: string; role: string }>('/auth/me');
  }

  async verifyOTP(phone: string, code: string) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    });
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  // User endpoints
  async updateProfile(data: { name?: string; phone?: string; avatar?: string }) {
    return this.request('/users', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAccount() {
    return this.request('/users', { method: 'DELETE' });
  }

  // Business endpoints
  async getBusinesses(params?: {
    query?: string;
    category?: string;
    city?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    page?: number;
    limit?: number;
  }) {
    return this.request<{
      data: unknown[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>('/businesses', { params });
  }

  async getBusiness(idOrSlug: string) {
    return this.request(`/businesses/${idOrSlug}`);
  }

  async createBusiness(data: Record<string, unknown>) {
    return this.request('/businesses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBusiness(id: string, data: Record<string, unknown>) {
    return this.request(`/businesses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Service endpoints
  async getServices(businessId: string) {
    return this.request('/services', { params: { businessId } });
  }

  async createService(data: Record<string, unknown>) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateService(id: string, data: Record<string, unknown>) {
    return this.request(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Booking endpoints
  async getBookings(params?: { status?: string; fromDate?: string; toDate?: string }) {
    return this.request('/bookings', { params });
  }

  async getBooking(id: string) {
    return this.request(`/bookings/${id}`);
  }

  async createBooking(data: Record<string, unknown>) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBooking(id: string, data: { status: string; notes?: string }) {
    return this.request(`/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async cancelBooking(id: string) {
    return this.request(`/bookings/${id}`, { method: 'DELETE' });
  }

  // Payment endpoints
  async createPayment(data: { bookingId: string; amount: number; currency?: string; paymentMethod: string }) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Review endpoints
  async getReviews(businessId?: string) {
    return this.request('/reviews', { params: businessId ? { businessId } : undefined });
  }

  async createReview(data: { businessId: string; bookingId: string; rating: number; comment?: string }) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Notification endpoints
  async getNotifications(unreadOnly = false) {
    return this.request('/notifications', { params: { unread: unreadOnly } });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications', { method: 'PATCH' });
  }

  async markNotificationRead(id: string) {
    return this.request(`/notifications/${id}`, { method: 'PATCH' });
  }

  // Chat endpoints
  async getConversations() {
    return this.request('/conversations');
  }

  async createConversation(businessId: string) {
    return this.request('/conversations', {
      method: 'POST',
      body: JSON.stringify({ businessId }),
    });
  }

  async getMessages(conversationId: string, page = 1) {
    return this.request(`/conversations/${conversationId}`, { params: { page } });
  }

  async sendMessage(conversationId: string, receiverId: string, content: string) {
    return this.request(`/conversations/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ conversationId, receiverId, content }),
    });
  }

  // Admin endpoints
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAdminUsers(params?: { role?: string; query?: string }) {
    return this.request('/admin/users', { params });
  }

  async getAdminUser(id: string) {
    return this.request(`/admin/users/${id}`);
  }

  async updateUserRole(id: string, role: string) {
    return this.request(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async getAdminBusinesses(params?: { status?: string; query?: string }) {
    return this.request('/admin/businesses', { params });
  }

  async updateBusinessStatus(id: string, verificationStatus: string, reason?: string) {
    return this.request(`/admin/businesses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ verificationStatus, reason }),
    });
  }

  // File upload
  async uploadFile(file: File, type: 'avatar' | 'portfolio' | 'logo' = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      toast.error(data.error || 'Upload failed');
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  }
}

export const api = new ApiClient();
export default api;
