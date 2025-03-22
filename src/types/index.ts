export interface Hui {
  id: string;
  name: string;
  type: 'ngay' | 'tuan' | 'thang';
  total_members: number;
  amount_per_period: number;
  start_date: string;
  periods: number;
  current_period: number;
}

export interface HuiMember {
  id: string;
  hui_id: string;
  user_id: string;
  status: 'active' | 'inactive';
  received_period?: number;
  amount_paid: number;
  amount_received: number;
}

export interface Payment {
  id: string;
  hui_id: string;
  member_id: string;
  period: number;
  amount: number;
  payment_date: string;
  status: 'pending' | 'completed';
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
}
