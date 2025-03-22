import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

interface HuiMember {
  hui_group_id: string;
  slot_number: number;
  hui_groups: {
    total_slots: number;
    amount: number;
    start_date: string;
    hui_payments: {
      amount: number;
      status: 'pending' | 'paid';
      round_number: number;
    }[];
  };
}

interface HuiPayment {
  amount: number;
  status: 'pending' | 'paid';
  round_number: number;
}

interface Member {
  id: string;
  hui_members: HuiMember[];
  hui_payments: HuiPayment[];
}

export function calculateMemberBalance(member: Member): number {
  let balance = 0;

  // Process each hui group the member is in
  member.hui_members.forEach(huiMember => {
    const { total_slots, amount } = huiMember.hui_groups;
    const startDate = new Date(huiMember.hui_groups.start_date);
    const today = new Date();

    // Check if member has "hotted" (received payout)
    const hasHotted = member.hui_payments
      .some(p => p.status === 'paid' && p.round_number === 1);

    if (hasHotted) {
      // If member has hotted, they need to pay all rounds
      balance -= total_slots * Number(amount);
      
      // Add back what they've already paid
      const paidAmount = member.hui_payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + Number(p.amount), 0);
      balance += paidAmount;
    } else {
      // If member hasn't hotted, they only need to pay up to current period
      let duePayments = 0;
      
      // Calculate due payments based on hui type
      const timeDiff = today.getTime() - startDate.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      switch (huiMember.hui_groups.type) {
        case 'daily':
          duePayments = Math.min(daysDiff + 1, total_slots);
          break;
        case 'weekly':
          duePayments = Math.min(Math.floor(daysDiff / 7) + 1, total_slots);
          break;
        case 'monthly':
          duePayments = Math.min(
            (today.getFullYear() - startDate.getFullYear()) * 12 +
            (today.getMonth() - startDate.getMonth()) + 1,
            total_slots
          );
          break;
      }
      
      // Calculate balance for this hui
      balance -= duePayments * Number(amount);
      
      // Add back what they've paid
      const paidAmount = member.hui_payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + Number(p.amount), 0);
      balance += paidAmount;
    }
  });

  return balance;
}
