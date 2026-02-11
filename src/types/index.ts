// types/index.ts

// src/types/auth.ts
export interface RegisterOwnerData {
  fullName: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  companyLogo?: string;
  companyName?: string;
  siteDomain?: string;
  description?: string;
  tokenDuration?: "DAY" | "WEEK" | "MONTH" | "";
}

export interface LoginFormInput {
  phoneNumber: string;
  password: string;
}

export interface User {
  id: string | number | null;
  email?: string;
  name?: string;
  fullName: string;
  phoneNumber: string;
  organization_name?: string;
  organization_language?: string;
  site_domain?: string;
  site_name?: string;
  public_key?: string;
  companyLogo?: string;
  duration?: string;
  activeSeance?: string;
  companyName?: string;
  companyPhone?: string;
  description?: string;
  messageTemplate?: string;
  location?: string;
  sites?: Site[];
  access_token?: string;
  role?: string; // "admin" | "user" | "owner"
  type?: string; // owner, hr, manager
  status?: boolean; // TRUE → active, FALSE → blocked
}

export interface Site {
  id: number | null | string | undefined;
  name: string;
  site_name?: string;
  site_domain: string;
  public_key: string;
  is_new?: boolean;
  domain?: string;
  domain_id?: number;
  is_active?: boolean;
}

export interface Vacancy {
  id: number;
  title: string;
  description: string;
  from_price?: number;
  to_price?: number;
  valyuta?: string;
  salary?: string;
  number_of_applications?: number;
  new_applications?: number;
  requirements?: string;
  location?: string;
  type?: string;
  status?: "active" | "closed";
  created_at?: string;
  updated_at?: string;
  required_question?: string;
  work_experiance?: string;
  work_schedule?: string;
  work_time?: string;
  position_name?: string;
  position_role?: string;
  required?: string;
  acceptance_rate?: number;
  test_id?: number | null;
}

export interface VacancyFormData {
  title: string;
  description: string;
  from_price?: number;
  to_price?: number;
  valyuta?: string;
  salary?: string;
  required_question?: string;
  work_experiance?: string;
  work_schedule?: string;
  work_time?: string;
  position_name?: string;
  position_role?: string;
  required?: string;
  acceptance_rate?: number;
  test_id?: number | null;
  widget_question?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  initializing: boolean;
  login: (phoneNumber: string, password: string) => Promise<User | null>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
}

export interface RegisterData {
  fullName: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}
export interface LoginData {
  success: boolean;
  message: string;
  data: {
    status: number;
    token: string;
    refreshToken: string;
  };
}

export interface VerifyResponse {
  success: boolean;
  message?: string;
  data?: string;
}
export interface LoginData {
  phoneNumber: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface ResetData {
  phoneNumber: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  status?: number;
}

export interface Application {
  id: number;
  name: string;
  phonenumber: string;
  resume: string;
  score: number;
  site_name: string;
  vakansiya_title: string | null;
  is_new: boolean;
  video_url?: string;
  viewed?: boolean;
  created_at?: string;
  session_id?: string;
  type?: string;
  description?: string;
  invited_time?: string;
}

export interface TestItem {
  id: number;
  position_name: string;
  position_role: string;
  required_question: string | Array<{ forms: string }>;
  required: string | Array<{ forms: string }>;
  test_question: string;
  work_experiance: string;
  vakansiya_id: number;
  number_of_questions: number;
  time_minut?: number;
  created_at?: string;
  updated_at?: string;
  lang: "uz" | "en" | "ru";
}

export interface CreateOrUpdateTestDto {
  position_name: string;
  position_role: string;
  required_question?: Array<{ forms: string }>;
  required: string;
  test_question: string[];
  work_experiance: string;
  vakansiya_id: number;
  number_of_questions: number;
  time_minut?: number;
}

export interface ChatTestRequest {
  message: string;
  position_name: string;
  position_role: string;
  test_question: string;
  work_experiance: string;
  session_id: string;
  language?: string;
}

export interface ChatTestResponse {
  status: number;
  data: {
    answer: string;
    score: number | null;
  };
}

export interface WidgetData {
  position: "right" | "left";
  siteName: string;
  height: string;
  theme: string;
  publicKey: string;
  btnColor: string;
  btnTextColor: string;
  headerBg: string;
  headerText: string;
  messageBg: string;
  messageText: string;
  chatBg: string;
  userMessageBg: string;
  userMessageText: string;
  widgetType: string;
  iconUrl: string;
  sticked?: boolean;
}

export interface SiteCount {
  site_id: number;
  site_name: string;
  new_count: number;
}

export interface GetApplicationsCountBySiteResponse {
  status: number;
  total: number;
  data: SiteCount[];
}
export interface CandidateProfile {
  id: number;
  name: string;
  email: string;
  phonenumber: string;
  resume: string;
  score: number;
  description?: string;
  work_experience?: string;
  specialization?: string;
  employment_type?: string;
  work_format?: string;
  location?: string;
  company_name?: string;
  position_title?: string;
  vakansiya_title?: string;
  created_at: string;
  type?: string;
}

export interface CandidateComment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
}
