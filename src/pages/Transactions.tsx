import React, { useState } from 'react';
import { DollarSign, Plus, Search, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../utils/format';
import AddTransactionForm from '../components/AddTransactionForm';

export default function Transactions() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', searchTerm, filterType, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          hui_groups (
            name
          ),
          members (
            name
          )
        `)
        .gte('transaction_date', dateRange.from)
        .lte('transaction_date', dateRange.to)
        .order('transaction_date', { ascending: false });

      if (searchTerm) {
        query = query.ilike('description', `%${searchTerm}%`);
      }

      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const totals = transactions?.reduce((acc, transaction) => {
    const amount = Number(transaction.amount);
    if (transaction.type === 'income') {
      acc.income += amount;
    } else {
      acc.expense += amount;
    }
    return acc;
  }, { income: 0, expense: 0 });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <DollarSign className="w-6 h-6 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Thu/Chi</h1>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm giao dịch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Tổng thu</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totals?.income || 0)} đ
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Tổng chi</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totals?.expense || 0)} đ
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Số dư</h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency((totals?.income || 0) - (totals?.expense || 0))} đ
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 relative min-w-[200px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm giao dịch..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        
        <div className="flex gap-4">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            className="px-4 py-2 border rounded-lg"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            className="px-4 py-2 border rounded-lg"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">Tất cả</option>
          <option value="income">Thu</option>
          <option value="expense">Chi</option>
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
                <th className="text-left p-4 font-medium text-gray-500">Ngày</th>
                <th className="text-left p-4 font-medium text-gray-500">Mô tả</th>
                <th className="text-left p-4 font-medium text-gray-500">Danh mục</th>
                <th className="text-left p-4 font-medium text-gray-500">Thu/Chi</th>
                <th className="text-left p-4 font-medium text-gray-500">Số tiền</th>
                <th className="text-left p-4 font-medium text-gray-500">Phương thức</th>
              </tr>
            </thead>
            <tbody>
              {transactions?.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    {new Date(transaction.transaction_date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="p-4">{transaction.description}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      transaction.category === 'hui_payment'
                        ? 'bg-blue-100 text-blue-800'
                        : transaction.category === 'hui_payout'
                        ? 'bg-green-100 text-green-800'
                        : transaction.category === 'commission'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {transaction.category === 'hui_payment' && 'Thu hụi'}
                      {transaction.category === 'hui_payout' && 'Chi hụi'}
                      {transaction.category === 'commission' && 'Hoa hồng'}
                      {transaction.category === 'other' && 'Khác'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      transaction.type === 'income'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'income' ? 'Thu' : 'Chi'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(transaction.amount)} đ
                    </span>
                  </td>
                  <td className="p-4">
                    {transaction.payment_method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddForm && (
        <AddTransactionForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            // Refresh transaction list
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
