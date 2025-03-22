import React, { useState } from 'react';
import { Calendar, Plus, Search, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import HuiGroupDetails from '../components/HuiGroupDetails';
import { formatCurrency } from '../utils/format';

export default function HuiGroups() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const { data: huiGroups, isLoading } = useQuery({
    queryKey: ['hui-groups', searchTerm, filterType],
    queryFn: async () => {
      let query = supabase
        .from('hui_groups')
        .select(`
          *,
          hui_members(member_id)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(group => ({
        ...group,
        total_members: group.hui_members?.length || 0
      }));
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Calendar className="w-6 h-6 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Dây hụi</h1>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
          <Plus className="w-5 h-5 mr-2" />
          Tạo dây hụi mới
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type="text"
            placeholder="Tìm kiếm theo tên dây hụi..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'all' | 'daily' | 'weekly' | 'monthly')}
          className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <option value="all">Tất cả</option>
          <option value="daily">Hụi ngày</option>
          <option value="weekly">Hụi tuần</option>
          <option value="monthly">Hụi tháng</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 font-medium text-gray-500">Tên dây hụi</th>
              <th className="text-left p-4 font-medium text-gray-500">Loại</th>
              <th className="text-left p-4 font-medium text-gray-500">Số thành viên</th>
              <th className="text-left p-4 font-medium text-gray-500">Số tiền/kỳ</th>
              <th className="text-left p-4 font-medium text-gray-500">Trạng thái</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {huiGroups?.map((group) => (
              <tr key={group.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{group.name}</td>
                <td className="p-4">
                  {group.type === 'daily' && 'Hụi ngày'}
                  {group.type === 'weekly' && 'Hụi tuần'}
                  {group.type === 'monthly' && 'Hụi tháng'}
                </td>
                <td className="p-4">{group.total_members}/{group.total_slots}</td>
                <td className="p-4">{formatCurrency(group.amount)} đ</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    group.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {group.status === 'active' ? 'Đang chạy' : 'Đã kết thúc'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => setSelectedGroupId(group.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
      
      {selectedGroupId && (
        <HuiGroupDetails
          groupId={selectedGroupId}
          onClose={() => setSelectedGroupId(null)}
        />
      )}
    </div>
  );
}
