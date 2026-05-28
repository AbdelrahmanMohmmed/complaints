/**
 * Mock Backend - Development Interceptor
 * 
 * Intercepts fetch calls and returns mock data instead of calling real backend.
 * This allows full frontend testing without a running backend server.
 * 
 * Active Routes:
 * - POST /login - Mock authentication
 * - GET /users/me - Get current user info
 * - GET /feedback - Get feedback list
 * - GET /users - Get users list
 * - POST /users - Create new user
 * - PUT /users/:id - Update user
 * - DELETE /users/:id - Delete user
 * - GET /integrations - Get integrations
 * - POST /integrations - Create integration
 * - GET /companies - Get companies
 * - GET /reports - Get reports data
 */

import { mockUsers, mockFeedback, mockIntegrations } from '../app/data/mockData';

// Map to store mock tokens and their associated users
const mockTokens = new Map<string, { userId: string; expiresAt: number }>();

interface MockLoginRequest {
    username: string;
    password: string;
}

interface MockLoginResponse {
    access_token: string;
    token_type: string;
}

interface MockUserResponse {
    user_id: number;
    f_name: string;
    l_name: string;
    email: string;
    role_id: number;
    company_id: number;
}

/**
 * Generate a mock JWT-like token
 */
function generateMockToken(userId: string): string {
    return `mock-token-${userId}-${Date.now()}`;
}

/**
 * Verify mock token
 */
function verifyMockToken(token: string): string | null {
    const tokenData = mockTokens.get(token);
    if (!tokenData) return null;
    if (tokenData.expiresAt < Date.now()) {
        mockTokens.delete(token);
        return null;
    }
    return tokenData.userId;
}

/**
 * Extract token from Authorization header
 */
function getTokenFromHeaders(headers: Headers): string | null {
    const authHeader = headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    return authHeader.substring(7);
}

/**
 * Convert role string to role_id (for API compatibility)
 */
function getRoleId(role: string): number {
    switch (role) {
        case 'manager': return 1;
        case 'customerServiceSupervisor': return 2;
        case 'websiteConfigurator': return 3;
        default: return 3;
    }
}

/**
 * Handle mock authentication
 */
function handleMockLogin(body: string): Response {
    try {
        const params = new URLSearchParams(body);
        const email = params.get('username');
        const password = params.get('password');

        if (!email || !password) {
            return new Response(JSON.stringify({ detail: 'Missing username or password' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Find user by email and password
        const user = mockUsers.find(u => u.email === email && u.password === password);

        if (!user) {
            return new Response(JSON.stringify({ detail: 'Invalid credentials' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Generate token and store it
        const token = generateMockToken(user.id);
        mockTokens.set(token, { userId: user.id, expiresAt: Date.now() + 24 * 60 * 60 * 1000 }); // 24h expiry

        const response: MockLoginResponse = {
            access_token: token,
            token_type: 'bearer',
        };

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ detail: 'Login failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

/**
 * Handle GET /users/me
 */
function handleGetCurrentUser(token: string | null): Response {
    if (!token) {
        return new Response(JSON.stringify({ detail: 'Not authenticated' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const userId = verifyMockToken(token);
    if (!userId) {
        return new Response(JSON.stringify({ detail: 'Invalid or expired token' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
        return new Response(JSON.stringify({ detail: 'User not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const response: MockUserResponse = {
        user_id: parseInt(user.id),
        f_name: user.firstName,
        l_name: user.lastName,
        email: user.email,
        role_id: getRoleId(user.role),
        company_id: parseInt(user.companyId || '1'),
    };

    return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

/**
 * Convert mock feedback to backend format
 */
function convertMockFeedbackToBackendFormat(feedback: any[]) {
    return feedback.map(fb => ({
        feedback_id: parseInt(fb.id.replace('fb-', '')) || Math.random() * 1000,
        company_id: 1,
        api_id: null,
        channel_name: fb.channel,
        category_name: fb.category,
        customer_name: fb.customerName,
        feedback_context: fb.content,
        status: fb.status,
        sentiment: fb.sentiment,
        sentiment_id: fb.sentiment === 'positive' ? 2 : fb.sentiment === 'negative' ? 0 : 1,
        emotion: fb.emotion,
        emotion_id: 1,
        problem_type: fb.category,
        problem_type_id: 1,
        priority: fb.priority,
        created_at: fb.createdAt,
    }));
}

/**
 * Handle GET /feedback
 */
function handleGetAllFeedback(token: string | null): Response {
    if (!token || !verifyMockToken(token)) {
        return new Response(JSON.stringify({ detail: 'Not authenticated' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const feedback = convertMockFeedbackToBackendFormat(mockFeedback);
    return new Response(JSON.stringify(feedback), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

/**
 * Handle GET /users
 */
function handleGetUsers(token: string | null): Response {
    if (!token || !verifyMockToken(token)) {
        return new Response(JSON.stringify({ detail: 'Not authenticated' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const users = mockUsers.map(u => ({
        user_id: parseInt(u.id),
        f_name: u.firstName,
        l_name: u.lastName,
        email: u.email,
        role_id: getRoleId(u.role),
        company_id: parseInt(u.companyId || '1'),
        is_active: u.isActive !== false,
        created_at: u.createdAt || new Date().toISOString(),
    }));

    return new Response(JSON.stringify(users), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

/**
 * Handle GET /integrations
 */
function handleGetIntegrations(token: string | null): Response {
    if (!token || !verifyMockToken(token)) {
        return new Response(JSON.stringify({ detail: 'Not authenticated' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(mockIntegrations), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

/**
 * Handle GET /dashboard/stats
 */
function handleGetDashboardStats(token: string | null): Response {
    if (!token || !verifyMockToken(token)) {
        return new Response(JSON.stringify({ detail: 'Not authenticated' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const stats = {
        total_feedback: 248,
        closed_count: 189,
        high_priority_count: 34,
        positive_count: 142,
        negative_count: 67,
        neutral_count: 39,
        frustrated_count: 45,
        neutral_emotion_count: 89,
        disgusted_count: 12,
        satisfied_count: 102,
        monthly_data: [
            { month: 'January', complaints: 45, resolved: 32 },
            { month: 'February', complaints: 52, resolved: 41 },
            { month: 'March', complaints: 38, resolved: 31 },
            { month: 'April', complaints: 61, resolved: 48 },
            { month: 'May', complaints: 52, resolved: 37 },
        ],
        category_data: [
            { name: 'Service Quality', value: 85, problem_type_id: 1 },
            { name: 'Product Issues', value: 62, problem_type_id: 2 },
            { name: 'Billing', value: 45, problem_type_id: 3 },
            { name: 'Support', value: 38, problem_type_id: 4 },
            { name: 'Other', value: 18, problem_type_id: null },
        ],
    };

    return new Response(JSON.stringify(stats), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

/**
 * Handle GET /feedback/:id (single feedback item)
 */
function handleGetSingleFeedback(token: string | null, feedbackId: string): Response {
    if (!token || !verifyMockToken(token)) {
        return new Response(JSON.stringify({ detail: 'Not authenticated' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Find feedback by ID - check both string formats
    const mockFeedbackItem = mockFeedback.find(fb =>
        fb.id === `fb-${feedbackId}` ||
        fb.id === feedbackId ||
        String(parseInt(fb.id.replace('fb-', '')) || 0) === feedbackId
    );

    if (!mockFeedbackItem) {
        return new Response(JSON.stringify({ detail: 'Feedback not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const feedback = {
        feedback_id: parseInt(mockFeedbackItem.id.replace('fb-', '')) || Math.floor(Math.random() * 1000),
        company_id: 1,
        api_id: null,
        channel_name: mockFeedbackItem.channel,
        category_id: 1,
        category_name: mockFeedbackItem.category,
        customer_name: mockFeedbackItem.customerName,
        feedback_context: mockFeedbackItem.content,
        status: mockFeedbackItem.status,
        sentiment: mockFeedbackItem.sentiment,
        sentiment_id: mockFeedbackItem.sentiment === 'positive' ? 2 : mockFeedbackItem.sentiment === 'negative' ? 0 : 1,
        emotion: mockFeedbackItem.emotion,
        emotion_id: 1,
        problem_type: mockFeedbackItem.category,
        problem_type_id: 1,
        priority: mockFeedbackItem.priority,
        created_at: mockFeedbackItem.createdAt,
    };

    return new Response(JSON.stringify(feedback), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

/**
 * Handle GET /categories or /categories/
 */
function handleGetCategories(token: string | null): Response {
    if (!token || !verifyMockToken(token)) {
        return new Response(JSON.stringify({ detail: 'Not authenticated' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const categories = [
        { category_id: 1, category_name: 'Service Quality' },
        { category_id: 2, category_name: 'Product Issues' },
        { category_id: 3, category_name: 'Billing' },
        { category_id: 4, category_name: 'Support' },
        { category_id: 5, category_name: 'Other' },
    ];

    return new Response(JSON.stringify(categories), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

/**
 * Handle GET /dashboard/reports
 */
function handleGetReports(token: string | null, dateRange: string): Response {
    if (!token || !verifyMockToken(token)) {
        return new Response(JSON.stringify({ detail: 'Not authenticated' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const reports = {
        summary: {
            total_feedback: 248,
            total_change: '+12%',
            resolution_rate: 76.2,
            resolution_rate_change: '+3.2%',
            sentiment_pct: 57.3,
            sentiment_change: '+5.1%',
            positive_count: 142,
            negative_count: 67,
            neutral_count: 39,
        },
        sentiment_trend: [
            {
                month: 'Jan',
                positive: 32,
                negative: 14,
                neutral: 12,
            },
            {
                month: 'Feb',
                positive: 38,
                negative: 18,
                neutral: 15,
            },
            {
                month:  'Mar',
                positive: 41,
                negative: 16,
                neutral: 8,
            },
            {
                month: 'Apr',
                positive: 31,
                negative: 19,
                neutral: 4,
            },
        ],
        category_data: [
            { name: 'Service Quality', total: 85, positive: 62, negative: 15, neutral: 8, problem_type_id: 1 },
            { name: 'Product Issues', total: 62, positive: 38, negative: 18, neutral: 6, problem_type_id: 2 },
            { name: 'Billing', total: 45, positive: 25, negative: 15, neutral: 5, problem_type_id: 3 },
            { name: 'Support', total: 38, positive: 12, negative: 18, neutral: 8, problem_type_id: 4 },
            { name: 'Other', total: 18, positive: 5, negative: 1, neutral: 12, problem_type_id: null },
        ],
        emotion_data: [
            { emotion_id: 1, total: 102, positive: 95, negative: 3, neutral: 4 },
            { emotion_id: 2, total: 45, positive: 8, negative: 35, neutral: 2 },
            { emotion_id: 3, total: 89, positive: 38, negative: 29, neutral: 22 },
            { emotion_id: 4, total: 12, positive: 1, negative: 0, neutral: 11 },
        ],
        channel_data: [
            { name: 'Email', value: 82, color: '#ea4335' },
            { name: 'Facebook', value: 64, color: '#1877f2' },
            { name: 'WhatsApp', value: 56, color: '#25d366' },
            { name: 'Website', value: 28, color: '#3b82f6' },
            { name: 'Twitter', value: 18, color: '#1da1f2' },
            { name: 'Phone', value: 20, color: '#f59e0b' },
        ],
        priority_data: [
            { name: 'Low', value: 98 },
            { name: 'Medium', value: 116 },
            { name: 'High', value: 24 },
            { name: 'Critical', value: 10 },
        ],
        priority_by_category: [
            { name: 'Service Quality', problem_type_id: 1, low: 35, medium: 38, high: 10, critical: 2 },
            { name: 'Product Issues', problem_type_id: 2, low: 28, medium: 24, high: 8, critical: 2 },
            { name: 'Billing', problem_type_id: 3, low: 22, medium: 18, high: 4, critical: 1 },
            { name: 'Support', problem_type_id: 4, low: 13, medium: 20, high: 2, critical: 3 },
            { name: 'Other', problem_type_id: null, low: 0, medium: 16, high: 0, critical: 2 },
        ],
        priority_trend: [
            {
                month: 'Jan',
                low: 28,
                medium: 22,
                high: 8,
                critical: 2,
            },
            {
                month: 'Feb',
                low: 31,
                medium: 29,
                high: 6,
                critical: 2,
            },
            {
                month: 'Mar',
                low: 22,
                medium: 35,
                high: 6,
                critical: 3,
            },
            {
                month: 'Apr',
                low: 17,
                medium: 30,
                high: 4,
                critical: 3,
            },
        ],
        agent_data: [
            { name: 'Omar Hussein', assigned: 45, resolved: 38, avgTime: 2.1, satisfaction: 4.7 },
            { name: 'Sarah Williams', assigned: 38, resolved: 31, avgTime: 1.9, satisfaction: 4.8 },
            { name: 'Layla Mansour', assigned: 52, resolved: 42, avgTime: 2.3, satisfaction: 4.6 },
            { name: 'Ahmed Mohammed', assigned: 30, resolved: 25, avgTime: 2.0, satisfaction: 4.5 },
        ],
        resolution_trend: [
            { week: 'Week 1', resolved: 32, avgTime: 2.2 },
            { week: 'Week 2', resolved: 41, avgTime: 1.9 },
            { week: 'Week 3', resolved: 48, avgTime: 2.1 },
            { week: 'Week 4', resolved: 37, avgTime: 2.0 },
        ],
    };

    return new Response(JSON.stringify(reports), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

/**
 * Main interceptor - called on every fetch
 */
export function setupMockBackend() {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const url = new URL(input instanceof Request ? input.url : String(input), globalThis.location?.href || 'http://localhost');
        const method = (init?.method || 'GET').toUpperCase();
        const pathname = url.pathname;
        const baseUrl = 'http://localhost:8000/api/v1';

        // Only intercept our API calls
        if (!pathname.startsWith('/api/v1') && !url.href.startsWith(baseUrl)) {
            return originalFetch(input, init);
        }

        console.log(`[Mock Backend] ${method} ${pathname}`);

        // Get headers
        const headers = init?.headers ? new Headers(init.headers) : new Headers();
        const token = getTokenFromHeaders(headers);

        // Route handlers
        if (pathname === '/api/v1/login' && method === 'POST') {
            const body = init?.body ? String(init.body) : '';
            return handleMockLogin(body);
        }

        if (pathname === '/api/v1/users/me' && method === 'GET') {
            return handleGetCurrentUser(token);
        }

        if ((pathname === '/api/v1/feedback' || pathname === '/api/v1/feedback/') && method === 'GET') {
            return handleGetAllFeedback(token);
        }

        if ((pathname === '/api/v1/users' || pathname === '/api/v1/users/') && method === 'GET') {
            return handleGetUsers(token);
        }

        if ((pathname === '/api/v1/integrations' || pathname === '/api/v1/integrations/') && method === 'GET') {
            return handleGetIntegrations(token);
        }

        if ((pathname === '/api/v1/dashboard/stats' || pathname === '/api/v1/dashboard/stats/') && method === 'GET') {
            return handleGetDashboardStats(token);
        }

        if ((pathname === '/api/v1/dashboard/reports' || pathname === '/api/v1/dashboard/reports/') && method === 'GET') {
            const dateRange = url.searchParams.get('date_range') || '30days';
            return handleGetReports(token, dateRange);
        }

        // Handle GET /feedback/:id (single feedback)
        const feedbackMatch = pathname.match(/^\/api\/v1\/feedback\/(\d+)$/);
        if (feedbackMatch && method === 'GET') {
            return handleGetSingleFeedback(token, feedbackMatch[1]);
        }

        // Handle GET /categories or /categories/
        if ((pathname === '/api/v1/categories' || pathname === '/api/v1/categories/') && method === 'GET') {
            return handleGetCategories(token);
        }

        // If no route matched, return 404
        return new Response(JSON.stringify({ detail: 'Not Found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    };
}
