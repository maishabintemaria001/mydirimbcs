const BASE_URL = '/api/v1';

export class ApiClient {
  private static getToken(): string | null {
    const token = localStorage.getItem('prerona_auth_token');
    if (!token || token === 'guest' || token === 'none' || token === '') {
      return null;
    }
    return token;
  }

  public static setToken(token: string) {
    localStorage.setItem('prerona_auth_token', token);
  }

  public static removeToken() {
    localStorage.removeItem('prerona_auth_token');
    localStorage.setItem('prerona_auth_token', 'guest');
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  }

  // Public APIs
  public static getHomeData() {
    return this.request<{ status: string; data: any }>('/home');
  }

  public static searchGlobal(q: string, type: string = 'all', limit: number = 50) {
    const params = new URLSearchParams({ q, type, limit: String(limit) });
    return this.request<{
      status: string;
      data: {
        query: string;
        total: number;
        categories: any[];
        subjects: any[];
        exams: any[];
        papers: any[];
        questions: any[];
      };
    }>(`/search?${params.toString()}`);
  }

  public static getTopPerformers(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<{ status: string; data: any }>(`/top-performers${query ? `?${query}` : ''}`);
  }

  public static getCategories() {
    return this.request<{ status: string; data: any[] }>('/categories');
  }

  public static getOrganizations() {
    return this.request<{ status: string; data: any[] }>('/organizations');
  }

  public static getPositions(organizationId?: string) {
    const q = organizationId ? `?organization_id=${organizationId}` : '';
    return this.request<{ status: string; data: any[] }>(`/positions${q}`);
  }

  public static getYears() {
    return this.request<{ status: string; data: number[] }>('/years');
  }

  public static getQuestions(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return this.request<{ status: string; data: any[]; pagination: any }>(`/questions?${query.toString()}`);
  }

  public static getQuestionDetail(slug: string) {
    return this.request<{ status: string; data: any }>(`/questions/${slug}`);
  }

  public static getPackages() {
    return this.request<{ status: string; data: any[] }>('/packages');
  }

  public static getAdvertisements() {
    return this.request<{ status: string; data: { settings: any; sponsors: any[] } }>('/advertisements');
  }

  public static recordAdClick(campaignId: string) {
    return this.request('/advertisements/click', {
      method: 'POST',
      body: JSON.stringify({ campaign_id: campaignId }),
    });
  }

  public static getNotices() {
    return this.request<{ status: string; data: any[] }>('/notices');
  }

  public static getExams() {
    return this.request<{ status: string; data: any[] }>('/exams');
  }

  public static getExamDetail(slug: string) {
    return this.request<{ status: string; data: any }>(`/exams/${slug}`);
  }

  // Auth & Profile
  public static login(identifier: string, password: string) {
    return this.request<{ status: string; message?: string; token: string; user: any; active_entitlement?: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  }

  public static register(payload: { name: string; email: string; password: string; phone?: string; track?: string }) {
    return this.request<{ status: string; message?: string; token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public static forgotPassword(identifier: string) {
    return this.request<{ status: string; message: string; otp?: string; target?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  }

  public static resetPassword(payload: { identifier: string; otp: string; new_password: string }) {
    return this.request<{ status: string; message: string; token: string; user: any }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public static getMe() {
    return this.request<{ status: string; user: any; active_entitlement?: any }>('/auth/me');
  }

  public static switchDemoRole(role: string) {
    return this.request<{ status: string; token: string; user: any; active_entitlement?: any }>('/auth/switch-demo-role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  // Bookmarks
  public static toggleBookmark(paper_id: string, question_id?: string) {
    return this.request<{ status: string; bookmarked: boolean; message: string }>('/bookmarks/toggle', {
      method: 'POST',
      body: JSON.stringify({ paper_id, question_id }),
    });
  }

  public static getBookmarks() {
    return this.request<{ status: string; data: any[] }>('/bookmarks');
  }

  // Exam Taking Engine
  public static startExamAttempt(exam_id: string) {
    return this.request<{ status: string; data: any }>('/exam-attempts/start', {
      method: 'POST',
      body: JSON.stringify({ exam_id }),
    });
  }

  public static saveExamAnswers(attempt_id: string, answers: Record<string, string[]>) {
    return this.request<{ status: string; message: string }>(`/exam-attempts/${attempt_id}/save`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  public static submitExamAttempt(attempt_id: string, answers: Record<string, string[]>) {
    return this.request<{ status: string; data: any }>(`/exam-attempts/${attempt_id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  public static getExamResult(attemptId: string) {
    return this.request<{ status: string; data: any }>(`/results/${attemptId}`);
  }

  public static getUserResults() {
    return this.request<{ status: string; data: any[] }>('/results');
  }

  public static getSkillsHeatmap(userId?: string) {
    const q = userId ? `?user_id=${userId}` : '';
    return this.request<{ status: string; data: any }>(`/user/skills-heatmap${q}`);
  }

  public static getStudentDashboard(params: { page?: number; limit?: number; filter?: string } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.filter) query.append('filter', params.filter);
    return this.request<{ status: string; data: any }>(`/user/student-dashboard?${query.toString()}`);
  }

  // Orders & Entitlements
  public static createOrder(payload: { package_id: string; payment_method: string; transaction_id: string; sender_number: string }) {
    return this.request<{ status: string; message: string; data: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public static getUserOrders() {
    return this.request<{ status: string; data: any[] }>('/orders');
  }

  public static getUserEntitlements() {
    return this.request<{ status: string; data: any[] }>('/entitlements');
  }

  // Admin APIs
  public static getAdminDashboard() {
    return this.request<{ status: string; data: any }>('/admin/dashboard');
  }

  public static getAdminQuestions() {
    return this.request<{ status: string; data: any[] }>('/admin/questions');
  }

  public static createQuestionPaper(payload: any) {
    return this.request<{ status: string; data: any }>('/admin/questions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public static updateQuestionPaper(id: string, payload: any) {
    return this.request<{ status: string; data: any }>(`/admin/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public static deleteQuestionPaper(id: string) {
    return this.request<{ status: string; message: string }>(`/admin/questions/${id}`, {
      method: 'DELETE',
    });
  }

  public static addQuestionItem(paperId: string, payload: any) {
    return this.request<{ status: string; data: any }>(`/admin/questions/${paperId}/items`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public static bulkImportMCQs(paper_id: string, mcqs: any[]) {
    return this.request<{ status: string; message: string; imported_count: number }>('/admin/bulk-import-mcqs', {
      method: 'POST',
      body: JSON.stringify({ paper_id, mcqs }),
    });
  }

  public static getAdminExams() {
    return this.request<{ status: string; data: any[] }>('/admin/exams');
  }

  public static createExam(payload: any) {
    return this.request<{ status: string; data: any }>('/admin/exams', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public static getAdminPayments() {
    return this.request<{ status: string; data: any[] }>('/admin/payments');
  }

  public static approvePayment(orderId: string, notes?: string) {
    return this.request<{ status: string; message: string; data: any }>(`/admin/payments/${orderId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  public static rejectPayment(orderId: string, reason?: string) {
    return this.request<{ status: string; message: string; data: any }>(`/admin/payments/${orderId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  public static getAdminUsers() {
    return this.request<{ status: string; data: any[] }>('/admin/users');
  }

  public static updateAdminUser(userId: string, payload: { role?: string; status?: string }) {
    return this.request<{ status: string; data: any }>(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public static getAdminAds() {
    return this.request<{ status: string; data: any }>('/admin/advertisements');
  }

  public static updateAdSettings(payload: any) {
    return this.request<{ status: string; data: any }>('/admin/advertisements/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public static createSponsor(payload: any) {
    return this.request<{ status: string; data: any }>('/admin/sponsors', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public static getAdminAuditLogs() {
    return this.request<{ status: string; data: any[] }>('/admin/audit-logs');
  }
}
