// components/utils/api.js  (updated — added notification methods)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthToken() {
    return localStorage.getItem('token');
  }

  removeAuthToken() {
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        if (response.status === 401) {
          this.removeAuthToken();
          window.location.reload();
          return;
        }
        throw new APIError(data.message || `HTTP ${response.status}`, response.status, data);
      }

      return data;
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError(error.message || 'Network error occurred', 0, null);
    }
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  async login(emailOrUsername, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername, password }),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // ── Predictions ───────────────────────────────────────────────────────────
  async getPredictions(page = 1, limit = 10) {
    return this.request(`/predictions?page=${page}&limit=${limit}`);
  }

  async createPrediction(predictionData) {
    return this.request('/predictions', {
      method: 'POST',
      body: JSON.stringify(predictionData),
    });
  }

  // ── Leaderboard ───────────────────────────────────────────────────────────
  async getLeaderboard(limit = 100) {
    return this.request(`/leaderboard?limit=${limit}`);
  }

  // ── Health ────────────────────────────────────────────────────────────────
  async healthCheck() {
    return this.request('/health');
  }

  // ── VS Mode ───────────────────────────────────────────────────────────────
  async createVsMatch(matchData) {
    return this.request('/vs/create', {
      method: 'POST',
      body: JSON.stringify(matchData),
    });
  }

  async joinVsMatch(matchId) {
    return this.request(`/vs/${matchId}/join`, { method: 'POST' });
  }

  async submitVsPrediction(matchId, predictionData) {
    return this.request(`/vs/${matchId}/predict`, {
      method: 'POST',
      body: JSON.stringify(predictionData),
    });
  }

  async getMyVsMatches(status = null) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/vs/my-matches${query}`);
  }

  async getOpenVsMatches() {
    return this.request('/vs/open');
  }

  async getMyVsInvites() {
    return this.request('/vs/invites');
  }

  async getVsMatchDetails(matchId) {
    return this.request(`/vs/${matchId}`);
  }

  async getVsStats(userId = null) {
    const path = userId ? `/vs/stats/${userId}` : '/vs/stats';
    return this.request(path);
  }

  async cancelVsMatch(matchId) {
    return this.request(`/vs/${matchId}`, { method: 'DELETE' });
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  /**
   * Get notifications for the current user.
   * @param {Object} opts
   * @param {boolean} [opts.unreadOnly=false]
   * @param {number}  [opts.limit=30]
   */
  async getNotifications({ unreadOnly = false, limit = 30 } = {}) {
    const params = new URLSearchParams();
    if (unreadOnly) params.set('unreadOnly', 'true');
    if (limit !== 30) params.set('limit', String(limit));
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/notifications${qs}`);
  }

  /** Get only the unread count (lightweight poll). */
  async getUnreadNotificationCount() {
    return this.request('/notifications/unread-count');
  }

  /** Mark a single notification as read. */
  async markNotificationRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, { method: 'PATCH' });
  }

  /** Mark all notifications as read. */
  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', { method: 'PATCH' });
  }

  /** Delete a single notification. */
  async deleteNotification(notificationId) {
    return this.request(`/notifications/${notificationId}`, { method: 'DELETE' });
  }

  /** Delete all notifications for the current user. */
  async clearAllNotifications() {
    return this.request('/notifications', { method: 'DELETE' });
  }
}

const apiService = new APIService();

export default apiService;
export { APIError };