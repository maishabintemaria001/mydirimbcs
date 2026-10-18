export type UserRole = 'admin' | 'content_manager' | 'exam_manager' | 'paid_user' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  status: 'active' | 'suspended';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_bn: string;
  slug: string;
  icon: string;
  description: string;
  order: number;
  is_active: boolean;
  paper_count?: number;
}

export interface Organization {
  id: string;
  name: string;
  name_bn: string;
  slug: string;
  description?: string;
  logo?: string;
  is_active: boolean;
  paper_count?: number;
  position_count?: number;
}

export interface Position {
  id: string;
  name: string;
  name_bn: string;
  slug: string;
  organization_id: string;
  is_active: boolean;
}

export interface QuestionOption {
  id: string;
  text: string;
  text_bn?: string;
}

export interface Question {
  id: string;
  paper_id: string;
  question_text: string;
  question_text_bn?: string;
  question_image?: string;
  options: QuestionOption[];
  correct_option_ids: string[];
  explanation?: string;
  explanation_bn?: string;
  subject_id?: string;
  marks: number;
  negative_marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  is_paid: boolean;
}

export interface QuestionPaper {
  id: string;
  title: string;
  title_bn: string;
  slug: string;
  category_id: string;
  organization_id: string;
  position_id: string;
  exam_year: number;
  exam_date: string;
  total_marks: number;
  duration_minutes: number;
  is_paid: boolean;
  price_bdt?: number;
  publication_status: 'published' | 'draft' | 'scheduled' | 'archived';
  pdf_url?: string;
  description?: string;
  view_count: number;
  tags: string[];
  created_at: string;
  category?: Category;
  organization?: Organization;
  position?: Position;
  question_count?: number;
}

export interface Exam {
  id: string;
  title: string;
  title_bn: string;
  slug: string;
  description: string;
  category_id: string;
  question_ids: string[];
  total_marks: number;
  pass_marks: number;
  duration_minutes: number;
  negative_mark_per_question: number;
  start_time?: string;
  end_time?: string;
  attempt_limit: number;
  is_paid: boolean;
  is_active: boolean;
  answer_reveal_mode: 'immediate' | 'after_submit' | 'after_exam_ends';
  created_at: string;
  category?: Category;
  question_count?: number;
  attempts_count?: number;
}

export interface ExamAttempt {
  id: string;
  exam_id: string;
  user_id: string;
  user_name: string;
  start_time: string;
  deadline: string;
  submitted_at?: string;
  answers: Record<string, string[]>;
  score: number;
  total_marks: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  passed: boolean;
  status: 'in_progress' | 'submitted' | 'timed_out';
  rank?: number;
  total_participants?: number;
}

export interface MembershipPackage {
  id: string;
  name: string;
  name_bn: string;
  duration_days: number;
  price_bdt: number;
  discount_price_bdt?: number;
  features: string[];
  is_active: boolean;
  badge?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  user_name: string;
  user_email: string;
  package_id: string;
  package_name: string;
  amount_bdt: number;
  payment_method: 'bkash' | 'nagad' | 'rocket' | 'bank';
  transaction_id: string;
  sender_number: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface UserEntitlement {
  id: string;
  user_id: string;
  order_id: string;
  package_id: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  package?: MembershipPackage;
  is_valid?: boolean;
}

export interface AdSetting {
  adsense_enabled: boolean;
  publisher_id: string;
  header_slot_id: string;
  sidebar_slot_id: string;
  content_slot_id: string;
}

export interface SponsorCampaign {
  id: string;
  title: string;
  client_name: string;
  banner_url: string;
  target_url: string;
  placement: 'header' | 'sidebar' | 'footer' | 'question_bottom';
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  impressions: number;
  clicks: number;
}

export interface Notice {
  id: string;
  title: string;
  title_bn: string;
  content: string;
  priority: 'normal' | 'urgent';
  is_published: boolean;
  publish_date: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string;
  timestamp: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  paper_id: string;
  question_id?: string;
  created_at: string;
  question?: Question;
  paper?: QuestionPaper;
}
