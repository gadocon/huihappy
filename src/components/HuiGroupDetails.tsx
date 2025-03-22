import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../utils/format';
import { X, Edit, Trash, Calendar, DollarSign, Users, Clock } from 'lucide-react';

interface HuiGroup {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly';
  amount: number;
  total_slots: number;
  start_date: string;
  status: 'active' | 'completed';
  description?: string;
  created_at: string;
}

interface HuiMember {
  id: string;
  hui_group_id: string;
  member_id: string;
  slot_number: number;
  is_admin: boolean;
  created_at: string;
  members: {
    id: string;
    name: string;
    phone: string;
  };
}

interface HuiPayment {
  id: string;
  hui_group_id: string;
  member_id: string;
  round_number: number;
  amount: number;
  due_date: string;
  paid_at: string | null;
  status: 'pending' | 'paid';
}

interface Props {
  huiGroup: HuiGroup;
  onClose: () => void;
  onEdit?: () => void;
}

export default function HuiGroupDetails({ huiGroup, onClose, onEdit }: Props) {
  const [members, setMembers] = useState<HuiMember[]>([]);
  const [payments, setPayments] = useState<HuiPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'payments'>('members');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch members
        const { data: membersData, error: membersError } = await supabase
          .from('hui_members')
          .select(`
            *,
            members (
              id,
              name,
              phone
            )
          `)
          .eq('hui_group_id', huiGroup.id);

        if (membersError) throw membersError;
        setMembers(membersData || []);

        // Fetch payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('hui_payments')
          .select('*')
          .eq('hui_group_id', huiGroup.id)
          .order('round_number', { ascending: true });

        if (paymentsError) throw paymentsError;
        setPayments(paymentsData || []);

        setError(null);
      } catch (err) {
        console.error('Error fetching hui group details:', err);
        setError('Không thể tải thông tin chi tiết dây hụi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [huiGroup.id]);

  const getHuiTypeText = (type: string) => {
    switch (type) {
      case 'daily': return 'Ngày';
      case 'weekly': return 'Tuần';
      case 'monthly': return 'Tháng';
      default: return type;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Đang chạy';
      case 'completed': return 'Đã kết thúc';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusClass = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50 rounded-t-lg sticky top-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Chi tiết dây hụi</h2>
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
              >
                <Edit size={14} />
                <span>Chỉnh sửa</span>
              </button>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : (
          <>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{huiGroup.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(huiGroup.status)}`}>
                      {getStatusText(huiGroup.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Loại hụi</p>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} className="text-gray-600" />
                        <p className="font-medium">{getHuiTypeText(huiGroup.type)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Số tiền mỗi kỳ</p>
                      <div className="flex items-center gap-1">
                        <DollarSign size={16} className="text-gray-600" />
                        <p className="font-medium">{formatCurrency(huiGroup.amount)} đ</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tổng số chân</p>
                      <div className="flex items-center gap-1">
                        <Users size={16} className="text-gray-600" />
                        <p className="font-medium">{huiGroup.total_slots}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ngày bắt đầu</p>
                      <div className="flex items-center gap-1">
                        <Clock size={16} className="text-gray-600" />
                        <p className="font-medium">{new Date(huiGroup.start_date).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                  </div>
                  
                  {huiGroup.description && (
                    <div>
                      <p className="text-sm text-gray-500">Mô tả</p>
                      <p className="mt-1">{huiGroup.description}</p>
                    </div>
                  )}
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Tổng quan</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Tổng thành viên</p>
                      <p className="font-medium text-lg">{members.length} / {huiGroup.total_slots}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tổng giá trị</p>
                      <p className="font-medium text-lg">{formatCurrency(huiGroup.amount * huiGroup.total_slots)} đ</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Kỳ đã hoàn thành</p>
                      <p className="font-medium text-lg">
                        {payments.filter(p => p.status === 'paid').length / members.length} / {huiGroup.total_slots}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Đã thanh toán</p>
                      <p className="font-medium text-lg">
                        {formatCurrency(
                          payments
                            .filter(p => p.status === 'paid')
                            .reduce((sum, p) => sum + Number(p.amount), 0)
                        )} đ
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-b mb-4">
                <div className="flex space-x-4">
                  <button
                    className={`px-4 py-2 font-medium ${
                      activeTab === 'members'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('members')}
                  >
                    Thành viên
                  </button>
                  <button
                    className={`px-4 py-2 font-medium ${
                      activeTab === 'payments'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('payments')}
                  >
                    Lịch sử thanh toán
                  </button>
                </div>
              </div>
              
              {activeTab === 'members' ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Chân số
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tên
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số điện thoại
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vai trò
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày tham gia
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {members.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                            Chưa có thành viên nào
                          </td>
                        </tr>
                      ) : (
                        members.map((member) => (
                          <tr key={member.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {member.slot_number}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium">{member.members.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {member.members.phone}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {member.is_admin ? (
                                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                  Quản trị
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                  Thành viên
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(member.created_at).toLocaleDateString('vi-VN')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kỳ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thành viên
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số tiền
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày đến hạn
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày thanh toán
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                            Chưa có thanh toán nào
                          </td>
                        </tr>
                      ) : (
                        payments.map((payment) => {
                          const member = members.find(m => m.member_id === payment.member_id);
                          return (
                            <tr key={payment.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                  {payment.round_number}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium">
                                  {member ? member.members.name : 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Chân {member ? member.slot_number : 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {formatCurrency(payment.amount)} đ
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(payment.due_date).toLocaleDateString('vi-VN')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {payment.paid_at 
                                  ? new Date(payment.paid_at).toLocaleDateString('vi-VN')
                                  : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusClass(payment.status)}`}>
                                  {payment.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
