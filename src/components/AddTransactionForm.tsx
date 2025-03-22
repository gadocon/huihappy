import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTransactionForm({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      const transactionData = {
        type: formData.get('type'),
        amount: Number(formData.get('amount')),
        description: formData.get('description'),
        transaction_date: formData.get('transaction_date'),
        payment_method: formData.get('payment_method'),
        hui_group_id: formData.get('hui_group_id') || null,
        member_id: formData.get('member_id') || null,
        category: formData.get('category'),
        notes: formData.get('notes')
      };

      const { error } = await supabase
        .from('transactions')
        .insert(transactionData);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Có lỗi xảy ra khi thêm giao dịch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Thêm giao dịch mới</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại giao dịch
              </label>
              <select
                name="type"
                required
                className="w-full p-2 border rounded-lg"
              >
                <option value="income">Thu</option>
                <option value="expense">Chi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số tiền
              </label>
              <input
                type="number"
                name="amount"
                required
                min="0"
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày giao dịch
              </label>
              <input
                type="date"
                name="transaction_date"
                required
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phương thức thanh toán
              </label>
              <select
                name="payment_method"
                required
                className="w-full p-2 border rounded-lg"
              >
                <option value="cash">Tiền mặt</option>
                <option value="bank_transfer">Chuyển khoản</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục
              </label>
              <select
                name="category"
                required
                className="w-full p-2 border rounded-lg"
              >
                <option value="hui_payment">Thu hụi</option>
                <option value="hui_payout">Chi hụi</option>
                <option value="commission">Hoa hồng</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <input
                type="text"
                name="description"
                required
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <textarea
                name="notes"
                rows={3}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Thêm giao dịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
