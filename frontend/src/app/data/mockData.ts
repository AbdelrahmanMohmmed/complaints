// NOTE: This file contains MOCK/demo data used only for frontend prototyping.
// TODO: Replace all usages with real API responses once the FastAPI backend is implemented.

export interface Feedback {
  id: string;
  customerName: string;
  customerEmail: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  emotion: 'disgusted' | 'neutral' |  'frustrated' | 'satisfied'  ;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'inProgress' | 'resolved' | 'closed';
  category: string;
  channel: string;
  assignedTo?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  isActive: boolean;
  totalFeedback: number;
  createdAt: string;
}

export interface Domain {
  id: string;
  name: string;
  description: string;
  totalFeedback: number;
  companies: number;
  createdAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'superAdmin' | 'companyAdmin' | 'manager' | 'agent';
  companyId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected';
  apiKey?: string;
  companyId: string;
  lastSync?: string;
}

export interface Category {
  id: string;
  name: string;
  domain: string;
  companyId: string;
  slug: string;
  feedbackCount: number;
}

export interface TimelineActivity {
  id: string;
  feedbackId: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  timestamp: string;
}

// Mock Data
export const mockFeedback: Feedback[] = [
  {
    id: 'fb-1',
    customerName: 'Ahmed Mohammed',
    customerEmail: 'ahmed@example.com',
    content: 'The service was excellent! Very professional staff and quick response time. I highly recommend this company.',
    sentiment: 'positive',
    emotion: 'satisfied',
    priority: 'low',
    status: 'closed',
    category: 'service_quality',
    channel: 'Email',
    assignedTo: 'agent-1',
    companyId: 'company-1',
    createdAt: '2026-02-20T10:30:00Z',
    updatedAt: '2026-02-22T14:20:00Z',
  },
  {
    id: 'fb-2',
    customerName: 'Sarah Al-Rashid',
    customerEmail: 'sarah@example.com',
    content: 'I am very disappointed with the product quality. It broke after just one week of use. This is unacceptable!',
    sentiment: 'negative',
    emotion: 'frustrated',
    priority: 'high',
    status: 'inProgress',
    category: 'food_quality',
    channel: 'WhatsApp',
    assignedTo: 'agent-2',
    companyId: 'company-1',
    createdAt: '2026-02-22T08:15:00Z',
    updatedAt: '2026-02-22T09:00:00Z',
  },
  {
    id: 'fb-3',
    customerName: 'Omar Hassan',
    customerEmail: 'omar@example.com',
    content: 'The delivery was on time but the packaging could be improved. Overall, an average experience.',
    sentiment: 'neutral',
    emotion: 'satisfied',
    priority: 'medium',
    status: 'open',
    category: 'delivery_issues',
    channel: 'Web Form',
    companyId: 'company-1',
    createdAt: '2026-02-23T12:00:00Z',
    updatedAt: '2026-02-23T12:00:00Z',
  },
  {
    id: 'fb-4',
    customerName: 'Fatima Ali',
    customerEmail: 'fatima@example.com',
    content: 'Customer support was unhelpful and rude. I waited 2 hours for a response and still no solution!',
    sentiment: 'negative',
    emotion: 'frustrated',
    priority: 'high',
    status: 'open',
    category: 'service_quality',
    channel: 'Phone',
    companyId: 'company-1',
    createdAt: '2026-02-24T09:30:00Z',
    updatedAt: '2026-02-24T09:30:00Z',
  },
  {
    id: 'fb-5',
    customerName: 'Khalid Ibrahim',
    customerEmail: 'khalid@example.com',
    content: 'Great product! Exactly what I was looking for. The price is very competitive too.',
    sentiment: 'positive',
    emotion: 'satisfied',
    priority: 'low',
    status: 'closed',
    category: 'pricing',
    channel: 'Email',
    assignedTo: 'agent-1',
    companyId: 'company-1',
    createdAt: '2026-02-21T15:45:00Z',
    updatedAt: '2026-02-23T10:30:00Z',
  },
  {
    id: 'fb-6',
    customerName: 'Nour Al-Farsi',
    customerEmail: 'nour@example.com',
    content: 'The app crashed multiple times during my session. Very frustrating experience. Please fix ASAP.',
    sentiment: 'negative',
    emotion: 'disgusted',
    priority: 'high',
    status: 'open',
    category: 'service_quality',
    channel: 'Web Form',
    companyId: 'company-1',
    createdAt: '2026-02-25T07:00:00Z',
    updatedAt: '2026-02-25T07:00:00Z',
  },
  {
    id: 'fb-7',
    customerName: 'Layla Mansour',
    customerEmail: 'layla@example.com',
    content: 'The new update is fantastic! The interface is much cleaner and responsive now.',
    sentiment: 'positive',
    emotion: 'satisfied',
    priority: 'low',
    status: 'resolved',
    category: 'service_quality',
    channel: 'Email',
    assignedTo: 'agent-1',
    companyId: 'company-1',
    createdAt: '2026-02-24T11:00:00Z',
    updatedAt: '2026-02-25T08:30:00Z',
  },
  {
    id: 'fb-8',
    customerName: 'Hassan Nasser',
    customerEmail: 'hassan@example.com',
    content: 'Billing issue. I was charged twice for the same order. Waiting for refund for 5 days now.',
    sentiment: 'negative',
    emotion: 'neutral',
    priority: 'high',
    status: 'inProgress',
    category: 'pricing',
    channel: 'Phone',
    assignedTo: 'agent-2',
    companyId: 'company-1',
    createdAt: '2026-02-23T16:00:00Z',
    updatedAt: '2026-02-24T10:00:00Z',
  },
  {
    id: 'fb-9',
    customerName: 'Mariam Al-Qasim',
    customerEmail: 'mariam@example.com',
    content: 'The delivery driver was very polite and careful with the package. Keep up the great work!',
    sentiment: 'positive',
    emotion: 'satisfied',
    priority: 'low',
    status: 'closed',
    category: 'delivery_issues',
    channel: 'WhatsApp',
    assignedTo: 'agent-1',
    companyId: 'company-1',
    createdAt: '2026-02-20T14:00:00Z',
    updatedAt: '2026-02-21T09:00:00Z',
  },
  {
    id: 'fb-10',
    customerName: 'Yousef Karim',
    customerEmail: 'yousef@example.com',
    content: 'Product arrived damaged. The box was crushed and the item inside is broken. Need replacement.',
    sentiment: 'negative',
    emotion: 'disgusted',
    priority: 'high',
    status: 'open',
    category: 'delivery_issues',
    channel: 'Email',
    companyId: 'company-1',
    createdAt: '2026-02-25T10:30:00Z',
    updatedAt: '2026-02-25T10:30:00Z',
  },
  {
    id: 'fb-11',
    customerName: 'Rania Khalil',
    customerEmail: 'rania@example.com',
    content: 'The setup process was a bit confusing but the customer support team helped me figure it out.',
    sentiment: 'neutral',
    emotion: 'satisfied',
    priority: 'medium',
    status: 'resolved',
    category: 'service_quality',
    channel: 'Web Form',
    assignedTo: 'agent-2',
    companyId: 'company-1',
    createdAt: '2026-02-22T13:30:00Z',
    updatedAt: '2026-02-23T11:00:00Z',
  },
  {
    id: 'fb-12',
    customerName: 'Tariq Saleh',
    customerEmail: 'tariq@example.com',
    content: 'Absolutely love the loyalty program. The rewards are generous and easy to redeem.',
    sentiment: 'positive',
    emotion: 'satisfied',
    priority: 'low',
    status: 'closed',
    category: 'menu',
    channel: 'Email',
    assignedTo: 'agent-1',
    companyId: 'company-2',
    createdAt: '2026-02-18T09:00:00Z',
    updatedAt: '2026-02-19T08:00:00Z',
  },
];

export const mockCompanies: Company[] = [
  {
    id: 'company-1',
    name: 'TechCorp Solutions',
    domain: 'Technology',
    isActive: true,
    totalFeedback: 1247,
    createdAt: '2025-06-15T00:00:00Z',
  },
  {
    id: 'company-2',
    name: 'Healthcare Plus',
    domain: 'Healthcare',
    isActive: true,
    totalFeedback: 892,
    createdAt: '2025-08-20T00:00:00Z',
  },
  {
    id: 'company-3',
    name: 'Retail World',
    domain: 'Retail',
    isActive: false,
    totalFeedback: 543,
    createdAt: '2025-10-10T00:00:00Z',
  },
];

export const mockDomains: Domain[] = [
  {
    id: '1',  // ← was 'domain-1'
    name: 'Resturants',
    description: 'food',
    totalFeedback: 2450,
    companies: 12,
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',  // ← was 'domain-2'
    name: 'Senatiary tools',
    description: 'Medical services, pharmaceuticals, health insurance',
    totalFeedback: 1830,
    companies: 8,
    createdAt: '2025-01-01T00:00:00Z',
  },
];

export const mockUsers: User[] = [
  {
    id: 'user-1',
    firstName: 'Ahmed',
    lastName: 'Al-Mansour',
    email: 'ahmed@company.com',
    role: 'companyAdmin',
    companyId: 'company-1',
    isActive: true,
    createdAt: '2025-06-20T00:00:00Z',
  },
  {
    id: 'user-2',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah@company.com',
    role: 'manager',
    companyId: 'company-1',
    isActive: true,
    createdAt: '2025-07-15T00:00:00Z',
  },
  {
    id: 'user-3',
    firstName: 'Layla',
    lastName: 'Mansour',
    email: 'layla@company.com',
    role: 'manager',
    companyId: 'company-1',
    isActive: true,
    createdAt: '2025-09-01T00:00:00Z',
  },
  {
    id: 'agent-1',
    firstName: 'Omar',
    lastName: 'Hussein',
    email: 'omar@company.com',
    role: 'agent',
    companyId: 'company-1',
    isActive: true,
    createdAt: '2025-08-01T00:00:00Z',
  },
  {
    id: 'agent-2',
    firstName: 'Fatima',
    lastName: 'Ahmed',
    email: 'fatima@company.com',
    role: 'agent',
    companyId: 'company-1',
    isActive: true,
    createdAt: '2025-08-01T00:00:00Z',
  },
  {
    id: 'agent-3',
    firstName: 'Khalid',
    lastName: 'Nasser',
    email: 'khalid@company.com',
    role: 'agent',
    companyId: 'company-1',
    isActive: false,
    createdAt: '2025-10-15T00:00:00Z',
  },
];

export const mockIntegrations: Integration[] = [
  {
    id: 'int-1',
    name: 'WhatsApp Business',
    type: 'messaging',
    status: 'connected',
    apiKey: 'whatsapp_xxxxxxxxxxxxx',
    companyId: 'company-1',
    lastSync: '2026-02-24T08:00:00Z',
  },
  {
    id: 'int-2',
    name: 'Email Integration',
    type: 'email',
    status: 'connected',
    apiKey: 'email_xxxxxxxxxxxxx',
    companyId: 'company-1',
    lastSync: '2026-02-24T07:30:00Z',
  },
  {
    id: 'int-3',
    name: 'Web Form Widget',
    type: 'web',
    status: 'connected',
    apiKey: 'web_xxxxxxxxxxxxx',
    companyId: 'company-1',
    lastSync: '2026-02-24T09:00:00Z',
  },
  {
    id: 'int-4',
    name: 'Phone System',
    type: 'phone',
    status: 'disconnected',
    companyId: 'company-1',
  },
];

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    slug: 'service_quality',
    name: 'Service Quality',
    domain: 'Restaurant',
    companyId: 'company-1',
    feedbackCount: 324,
  },
  {
    id: 'cat-2',
    slug: 'food_quality',
    name: 'Food Quality',
    domain: 'Restaurant',
    companyId: 'company-1',
    feedbackCount: 210,
  },
  {
    id: 'cat-3',
    slug: 'order_accuracy',
    name: 'Order Accuracy',
    domain: 'Restaurant',
    companyId: 'company-1',
    feedbackCount: 180,
  },
  {
    id: 'cat-4',
    slug: 'delivery_issues',
    name: 'Delivery Issues',
    domain: 'Restaurant',
    companyId: 'company-1',
    feedbackCount: 140,
  },
  {
    id: 'cat-5',
    slug: 'pricing',
    name: 'Pricing',
    domain: 'Restaurant',
    companyId: 'company-1',
    feedbackCount: 98,
  },
  {
    id: 'cat-6',
    slug: 'hygiene',
    name: 'Hygiene',
    domain: 'Restaurant',
    companyId: 'company-1',
    feedbackCount: 75,
  },
  {
    id: 'cat-7',
    slug: 'bad_atmosphere',
    name: 'Bad Atmosphere',
    domain: 'Restaurant',
    companyId: 'company-1',
    feedbackCount: 60,
  },
  {
    id: 'cat-8',
    slug: 'menu',
    name: 'Menu',
    domain: 'Restaurant',
    companyId: 'company-1',
    feedbackCount: 45,
  },
];

export const mockTimelineActivities: TimelineActivity[] = [
  {
    id: 'act-1',
    feedbackId: 'fb-2',
    userId: 'agent-2',
    userName: 'Fatima Ahmed',
    action: 'status_changed',
    description: 'Changed status from Open to In Progress',
    timestamp: '2026-02-22T09:00:00Z',
  },
  {
    id: 'act-2',
    feedbackId: 'fb-2',
    userId: 'user-2',
    userName: 'Sarah Williams',
    action: 'assigned',
    description: 'Assigned to Fatima Ahmed',
    timestamp: '2026-02-22T08:30:00Z',
  },
  {
    id: 'act-3',
    feedbackId: 'fb-2',
    userId: 'system',
    userName: 'System',
    action: 'created',
    description: 'Feedback received from WhatsApp',
    timestamp: '2026-02-22T08:15:00Z',
  },
];