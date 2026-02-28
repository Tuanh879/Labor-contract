export interface User {
  id: string;
  name: string;
  email: string;
  role: 'HR' | 'DLM' | 'LM' | 'BOD';
  department: string;
}

export interface Contract {
  id: string;
  month: string;
  employee_name: string;
  employee_id: string;
  position: string;
  department: string;
  salary: number;
  contract_type: string;
  start_date: string;
  end_date: string;
  dlm_id: string;
  lm_id: string;
  hr_owner_id: string;
  dlm_status: 'pending' | 'approved' | 'rejected';
  lm_status: 'pending' | 'approved' | 'rejected';
  dlm_comment: string | null;
  lm_comment: string | null;
  dlm_updated_at: string | null;
  lm_updated_at: string | null;
  final_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}
