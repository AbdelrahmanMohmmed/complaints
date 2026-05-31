import { request } from './api';

export interface DomainRecord {
  domain_id: number;
  domain_name: string;
  company_count: number;
  feedback_count: number;
}

export interface DomainCreateRequest {
  domain_name: string;
}

export async function listDomains(): Promise<DomainRecord[]> {
  return request<DomainRecord[]>('/domains/');
}

export async function createDomain(payload: DomainCreateRequest): Promise<DomainRecord> {
  return request<DomainRecord>('/domains/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateDomain(domainId: number, payload: DomainCreateRequest): Promise<DomainRecord> {
  return request<DomainRecord>(`/domains/${domainId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteDomain(domainId: number): Promise<void> {
  await request(`/domains/${domainId}`, {
    method: 'DELETE',
  });
}