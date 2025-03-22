import React from 'react';
import { X, Calendar, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../utils/format';

interface BankAccount {
  bank: string;
  account_number: string;
  account_name: string;
}

interface Member {
  id: string;
  name: string;
  phone: string;
  type: 'regular' | 'vip';
  id_number: string;
  address: string;
  bank_accounts: BankAccount[];
  id_card_front?: string;
  id_card_back?: string;
}

interface Props {
  member: Member;
  onClose: () => void;
  onEdit?: () => void;
}

export default function MemberDetails({ member, onClose, onEdit }: Props) {
  const { data: huiGroups, isLoading } = useQuery({
    queryKey: ['member-hui-groups', member.id],
    queryFn: async () => {
      const [{ data: groups, error: groupsError }, { data: status, error: statusError }] = await Promise.all([
        supabase
        .from('hui_members')
        .select(`
          *,
          hui_groups (
            id,
            name,
            type,
            amount,
            total_slots,
            start_date,
            status,
            hui_payments!inner (
              amount,
              status,
              round_number,
              due_date,
              paid_at
            )
          )
        `)
        .eq('member_id', member.id),
        supabase
          .from('member_payment_status')
          .select('*')
          .eq('member_id', member.id)
          .single()
      ]);

      if (groupsError) throw groupsError;
      if (statusError) throw statusError;

      return {
        groups: groups.map(item => ({
        ...item,
        is_hotted: item.hui_groups.hui_payments?.some(p => p.status === 'paid' && p.round_number === 1),
        total_paid: item.hui_groups.hui_payments
          ?.filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + Number(p.amount), 0) || 0
        })),
        status
      };
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4">
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Thông tin chi tiết hụi viên</h2>
            <button
              onClick={onEdit}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Chỉnh sửa
            </button>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-12 gap-6">
          {/* Thông tin cơ bản */}
          <div className="col-span-12 lg:col-span-8 grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tình trạng thanh toán</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Tổng đã đóng</p>
                    <p className="font-medium">{formatCurrency(huiGroups?.status?.total_paid_amount || 0)} đ</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Công nợ hiện tại</p>
                    <p className={`font-medium ${
                      (huiGroups?.status?.current_debt || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(Math.abs(huiGroups?.status?.current_debt || 0))} đ
                      {(huiGroups?.status?.current_debt || 0) >= 0 ? ' (Dương)' : ' (Âm)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Thanh toán quá hạn</p>
                    <p className="font-medium text-red-600">{huiGroups?.status?.overdue_payments || 0} kỳ</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      huiGroups?.status?.payment_status === 'ahead'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {huiGroups?.status?.payment_status === 'ahead' ? 'Đã đóng đủ' : 'Còn thiếu'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-500">Họ và tên</label>
                <p className="font-medium">{member.name}</p>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-500">CMND/CCCD</label>
                <p className="font-medium">{member.id_number}</p>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-500">Số điện thoại</label>
                <p className="font-medium">{member.phone}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-500">Địa chỉ</label>
                <p className="font-medium">{member.address}</p>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-500">Loại hụi viên</label>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  member.type === 'vip' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {member.type === 'vip' ? 'VIP' : 'Thường'}
                </span>
              </div>
            </div>
          </div>

          {/* CCCD Images */}
          <div className="col-span-12 lg:col-span-4">
            {(member.id_card_front || member.id_card_back) && (
              <div className="grid grid-cols-2 gap-3">
                {member.id_card_front && (
                  <div className="bg-red-50 p-2 rounded-lg">
                    <p className="text-xs font-medium text-red-800 mb-1">Mặt trước</p>
                    <img
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/member-documents/${member.id_card_front}`}
                      alt="CCCD mặt trước"
                      className="w-full h-28 object-cover rounded-lg border-2 border-red-200"
                    />
                  </div>
                )}
                {member.id_card_back && (
                  <div className="bg-red-50 p-2 rounded-lg">
                    <p className="text-xs font-medium text-red-800 mb-1">Mặt sau</p>
                    <img
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/member-documents/${member.id_card_back}`}
                      alt="CCCD mặt sau"
                      className="w-full h-28 object-cover rounded-lg border-2 border-red-200"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tài khoản ngân hàng */}
          <div className="col-span-12">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Tài khoản ngân hàng</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {member.bank_accounts.map((account, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">{account.bank}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      #{index + 1}
                    </span>
                  </div>
                  <p className="font-medium text-sm mb-1">{account.account_number}</p>
                  <p className="text-sm text-gray-600">{account.account_name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Danh sách dây hụi */}
          <div className="col-span-12">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Dây hụi đang tham gia</h3>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
              </div>
            ) : huiGroups?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Chưa tham gia dây hụi nào</p>
            ) : (
              <div className="space-y-4">
                {huiGroups?.groups?.map((item) => (
                  <div key={item.hui_groups.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                    <div className="grid grid-cols-5 gap-4 flex-1">
                      <div>
                        <div className="text-sm text-gray-500">Tên dây</div>
                        <div className="font-medium">{item.hui_groups.name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Chân số</div>
                        <div className="font-medium">{item.slot_number}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Loại</div>
                        <div className="font-medium">
                          {item.hui_groups.type === 'daily' ? 'Ngày' :
                           item.hui_groups.type === 'weekly' ? 'Tuần' : 'Tháng'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Số tiền/kỳ</div>
                        <div className="font-medium">{formatCurrency(item.hui_groups.amount)} đ</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Đã đóng</div>
                        <div className="font-medium">{formatCurrency(item.total_paid)} đ</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.is_hotted
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.is_hotted ? 'Đã hốt' : 'Chưa hốt'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.hui_groups.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.hui_groups.status === 'active' ? 'Đang chạy' : 'Đã kết thúc'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
