import React from 'react';
import { Home as HomeIcon, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export default function Home() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [
        { count: totalHui },
        { count: activeMembers },
        { data: payments },
      ] = await Promise.all([
        supabase.from('hui_groups').select('*', { count: 'exact' }),
        supabase.from('members').select('*', { count: 'exact' }),
        supabase.from('hui_payments').select('amount').eq('status', 'pending'),
      ]);

      const totalAmount = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      return {
        totalHui: totalHui || 0,
        activeMembers: activeMembers || 0,
        totalAmount: new Intl.NumberFormat('vi-VN').format(totalAmount),
        pendingPayments: payments?.length || 0,
      };
    },
  });

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <HomeIcon className="w-6 h-6 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Trang chủ</h1>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
          <Plus className="w-5 h-5 mr-2" />
          Tạo dây hụi mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Tổng số dây hụi</h3>
          <p className="text-2xl font-bold text-gray-800">{stats?.totalHui}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Hụi viên đang hoạt động</h3>
          <p className="text-2xl font-bold text-gray-800">{stats?.activeMembers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Tổng giá trị</h3>
          <p className="text-2xl font-bold text-gray-800">{stats?.totalAmount} VNĐ</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Chờ thanh toán</h3>
          <p className="text-2xl font-bold text-gray-800">{stats?.pendingPayments}</p>
        </div>
      </div>
    </>
  );
}
