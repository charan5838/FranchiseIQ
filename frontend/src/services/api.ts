import {
  Sector, FranchiseSummary, FranchiseDetail,
  RankedFranchise, CalculatorResult, ScenarioSimResult,
  LocationAnalysisResult, WatchlistItem, NotificationItem, User,
  FranchiseCalculatorPreset
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('franchiseiq_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    let errorMsg = `Request failed (${res.status})`;
    try {
      const err = await res.json();
      errorMsg = err.detail || err.message || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const data = await request<{ access_token: string; role: string; name: string; email: string; user_id: number }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('franchiseiq_token', data.access_token);
    return data;
  },

  async register(name: string, email: string, password: string, role = 'investor') {
    const data = await request<{ access_token: string; role: string; name: string; email: string; user_id: number }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });
    localStorage.setItem('franchiseiq_token', data.access_token);
    return data;
  },

  async quickLogin(params: {
    name: string;
    email?: string;
    phone?: string;
    budget?: number;
    city?: string;
    locality?: string;
    risk_preference?: string;
    business_experience?: string;
    goal?: string;
  }) {
    const data = await request<{ access_token: string; role: string; name: string; email: string; user_id: number }>('/auth/quick-login', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    localStorage.setItem('franchiseiq_token', data.access_token);
    return data;
  },

  async loginDemoInvestor() {
    const data = await request<{ access_token: string; role: string; name: string; email: string; user_id: number }>('/auth/demo-investor');
    localStorage.setItem('franchiseiq_token', data.access_token);
    return data;
  },

  async loginDemoAdmin() {
    const data = await request<{ access_token: string; role: string; name: string; email: string; user_id: number }>('/auth/demo-admin');
    localStorage.setItem('franchiseiq_token', data.access_token);
    return data;
  },

  async getMe(): Promise<User> {
    return request<User>('/auth/me');
  },

  logout() {
    localStorage.removeItem('franchiseiq_token');
  },

  // Sectors
  async getSectors(): Promise<Sector[]> {
    return request<Sector[]>('/sectors');
  },

  // Franchises
  async getFranchises(params: Record<string, any> = {}): Promise<FranchiseSummary[]> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    return request<FranchiseSummary[]>(`/franchises?${query.toString()}`);
  },

  async getFranchiseDetail(idOrSlug: string | number): Promise<FranchiseDetail> {
    return request<FranchiseDetail>(`/franchises/${idOrSlug}`);
  },

  async getSectorProfitLeaders(budget?: number): Promise<any[]> {
    const q = budget ? `?budget=${budget}` : '';
    return request<any[]>(`/franchises/sector-profit-leaders${q}`);
  },

  // Core Recommendation Engine
  async rankFranchises(params: {
    budget: number;
    city: string;
    locality: string;
    preferred_sector_id?: number | null;
    shop_area_sqft: number;
    business_experience: string;
    desired_involvement: string;
    risk_preference: string;
    desired_return_pct: number;
    max_payback_months: number;
    goal: string;
  }): Promise<RankedFranchise[]> {
    return request<RankedFranchise[]>('/recommendations/rank', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  // Calculator
  async getCalculatorPresets(sectorId?: number): Promise<FranchiseCalculatorPreset[]> {
    const url = sectorId ? `/calculator/franchise-presets?sector_id=${sectorId}` : '/calculator/franchise-presets';
    return request<FranchiseCalculatorPreset[]>(url);
  },

  async getCalculatorPresetById(franchiseId: number): Promise<FranchiseCalculatorPreset> {
    return request<FranchiseCalculatorPreset>(`/calculator/preset/${franchiseId}`);
  },

  async runCalculator(params: any): Promise<CalculatorResult> {
    return request<CalculatorResult>('/calculator/calculate', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  async simulateScenario(params: {
    franchise_id: number;
    sales_delta_pct: number;
    rent_delta_pct: number;
    salaries_delta_pct: number;
    cogs_delta_pct: number;
    demand_delta_pct: number;
  }): Promise<ScenarioSimResult> {
    return request<ScenarioSimResult>('/calculator/simulate', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  // Comparison
  async compareFranchises(franchiseIds: number[]): Promise<{ franchises: any[]; best_highlights: Record<string, number> }> {
    return request('/comparison/compare', {
      method: 'POST',
      body: JSON.stringify({ franchise_ids: franchiseIds })
    });
  },

  // Location Analysis
  async getLocations(): Promise<any[]> {
    return request('/locations');
  },

  async analyzeLocation(params: {
    city: string;
    locality: string;
    pin_code: string;
    available_area_sqft: number;
    monthly_rent: number;
    footfall_estimate: number;
  }): Promise<LocationAnalysisResult> {
    return request<LocationAnalysisResult>('/locations/analyze', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  // Watchlist & Alerts
  async getWatchlist(): Promise<WatchlistItem[]> {
    return request<WatchlistItem[]>('/watchlist');
  },

  async toggleWatchlist(franchiseId: number): Promise<{ status: 'added' | 'removed'; franchise_id: number }> {
    return request(`/watchlist/${franchiseId}`, { method: 'POST' });
  },

  async getNotifications(): Promise<NotificationItem[]> {
    return request<NotificationItem[]>('/notifications');
  },

  // Reviews
  async submitReview(data: { franchise_id: number; rating: number; title: string; comment: string }) {
    return request('/reviews', { method: 'POST', body: JSON.stringify(data) });
  },

  async submitFranchiseeReport(data: any) {
    return request('/reviews/franchisee-report', { method: 'POST', body: JSON.stringify(data) });
  },

  // Admin Portal
  async createFranchise(data: any) {
    return request('/admin/franchises', { method: 'POST', body: JSON.stringify(data) });
  },

  async updateVerification(data: { data_source_id: number; source_type: string; confidence_level: number; methodology: string; source_name: string }) {
    return request('/admin/data-sources/verify', { method: 'PUT', body: JSON.stringify(data) });
  },

  async addSector(data: { name: string; category?: string; description?: string; icon?: string }) {
    return request('/admin/sectors', { method: 'POST', body: JSON.stringify(data) });
  },

  async uploadDocument(formData: FormData) {
    const token = localStorage.getItem('franchiseiq_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/admin/document-upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  async getAuditLogs(): Promise<any[]> {
    return request('/admin/audit-logs');
  }
};
