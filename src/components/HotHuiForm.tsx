import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../utils/format';

interface Props {
  groupId: string;
  memberId: string;
  memberName: string;
  baseAmount: number;
  totalSlots: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function HotHuiForm({ 
  groupId, 
  memberId, 
  memberName,
  baseAmount,
  totalSlots,
  onClose, 
  onSuccess 
}: Props) {
  const [loading, setLoading] = useState(false);
  const [thamAmount, setThamAmount] = useState<number>(baseAmount * 0.1); // Start with 10% as minimum

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate minimum thăm amount (10% of base amount)
      const minThamAmount = baseAmount * 0.1;
      if (thamAmount < minThamAmount) {
        throw new Error(`Số tiền thăm tối thiểu là ${formatCurrency(minThamAmount)} đ`);
      }

      // Calculate tiền hốt (total received amount)
      const tienHot = baseAmount * totalSlots;
      
      // Update the first round payment with hot status and tham amount
      const { error: paymentError } = await supabase
        .from('hui_payments')
        .update({
          amount: tienHot - (thamAmount * (totalSlots - 1)), // Actual amount after subtracting tham
          status: 'paid',
          paid_at: new Date().toISOString(),
          tham_amount: thamAmount
        })
        .eq('hui_group_id', groupId)
        .eq('member_id', memberId)
        .eq('round_number', 1);

      if (paymentError) throw paymentError;

      // Add transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          type: 'expense',
          amount: tienHot,
          description: `Chi hụi - ${memberName} hốt`,
          transaction_date: new Date().toISOString(),
          payment_method: 'bank_transfer',
          category: 'hui_payout',
          hui_group_id: groupId,
          member_id: memberId
        });

      if (transactionError) throw transactionError;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error processing hot hui:', error);
      alert('Có lỗi xảy ra khi xử lý hốt hụi');
    } finally {
      setLoading(false);
    }
  };

  // Calculate thăm amount limits
  const minThamAmount = baseAmount * 0.1; // 10% minimum
  const maxThamAmount = baseAmount * 0.3; // 30% maximum

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Xác nhận hốt hụi</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hụi viên
              </label>
              <input
                type="text"
                value={memberName}
                disabled
                className="w-full p-2 border rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số tiền thăm kêu
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="number"
                value={thamAmount}
                onChange={(e) => setThamAmount(Number(e.target.value))}
                min={minThamAmount}
                max={maxThamAmount}
                required
                className="w-full p-2 border rounded-lg"
              />
              <p className="text-sm mt-1 flex justify-between">
                <span className="text-red-600">Tối thiểu: {formatCurrency(minThamAmount)} đ</span>
                <span className="text-gray-500">Tối đa: {formatCurrency(maxThamAmount)} đ</span>
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tiền hụi gốc:</span>
                <span>{formatCurrency(baseAmount)} đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Số chân:</span>
                <span>{totalSlots}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tiền thăm/chân:</span>
                <span className="text-blue-600 font-medium">{formatCurrency(thamAmount)} đ</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Tổng tiền nhận:</span>
                <span className="text-green-600">
                  {formatCurrency(baseAmount * totalSlots)} đ
                </span>
              </div>
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
              {loading ? 'Đang xử lý...' : 'Xác nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
