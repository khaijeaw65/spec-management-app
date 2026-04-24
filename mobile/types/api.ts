export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  };
}

export type SpecStatus = 'PROCESSING' | 'COMPLETED' | 'REVIEWED' | 'FAILED';
export type SpecLanguage = 'TH' | 'EN';

export interface Specification {
  id: string;
  mainId: string;
  latestVersionId: string;
  name: string;
  title: string;
  version: string;
  status: SpecStatus;
  language: SpecLanguage;
  createdAt: string;
  updatedAt: string;
}

export interface SpecificationListResponse {
  data: {
    items: Specification[];
  };
}

export interface SpecSection {
  id: string;
  title: string;
  detail: string;
}

export interface SpecRisk {
  id: string;
  sectionTitle: string;
  riskType: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  detail: string;
  referenceText?: string;
}

export interface SpecDetailResponse {
  data: SpecDetail;
}

export interface SpecVersionListResponse {
  data: {
    items: SpecVersion[];
  };
}

export interface SpecVersion {
  id: string;
  version: string;
  status: SpecStatus;
  language: SpecLanguage;
  createdAt: string;
  updatedAt: string;
  isCurrent: boolean;
}

export interface SpecDetail {
  id: string;
  mainId: string;
  name: string;
  version: string;
  status: SpecStatus;
  language: SpecLanguage;
  sections: SpecSection[];
  risks: SpecRisk[];
  createdAt: string;
  updatedAt: string;
  versions: SpecVersion[];
}