import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BankAccount {
  bank: string;
  account_number: string;
  account_name: string;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMemberForm({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([{ bank: '', account_number: '', account_name: '' }]);
  const [idCardFront, setIdCardFront] = useState<File | null>(null);
  const [idCardBack, setIdCardBack] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Upload CCCD images if provided
      let idCardFrontUrl = '';
      let idCardBackUrl = '';
      
      if (idCardFront) {
        const { data: frontData, error: frontError } = await supabase.storage
          .from('member-documents')
          .upload(`cccd/${Date.now()}-front`, idCardFront);
        
        if (frontError) throw frontError;
        idCardFrontUrl = frontData.path;
      }
      
      if (idCardBack) {
        const { data: backData, error: backError } = await supabase.storage
          .from('member-documents')
          .upload(`cccd/${Date.now()}-back`, idCardBack);
        
        if (backError) throw backError;
        idCardBackUrl = backData.path;
      }

      const memberData = {
        name: formData.get('name'),
        id_number: formData.get('id_number'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        type: formData.get('type'),
        bank_accounts: bankAccounts,
        id_card_front: idCardFrontUrl,
        id_card_back: idCardBackUrl
      };

      const { error } = await supabase.from('members').insert(memberData);
      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Có lỗi xảy ra khi thêm hụi viên');
    } finally {
      setLoading(false);
    }
  };

  const addBankAccount = () => {
    setBankAccounts([...bankAccounts, { bank: '', account_number: '', account_name: '' }]);
  };

  const removeBankAccount = (index: number) => {
    setBankAccounts(bankAccounts.filter((_, i) => i !== index));
  };

  const handleBankAccountChange = (index: number, field: keyof BankAccount, value: string) => {
    const newAccounts = [...bankAccounts];
    newAccounts[index][field] = value;
    setBankAccounts(newAccounts);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">Thêm hụi viên mới</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Thông tin cá nhân</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CMND/CCCD
                </label>
                <input
                  type="text"
                  name="id_number"
                  required
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <textarea
                  name="address"
                  required
                  rows={3}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại hụi viên
                </label>
                <select
                  name="type"
                  required
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="regular">Thường</option>
                  <option value="vip">VIP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CCCD mặt trước
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setIdCardFront(e.target.files?.[0] || null)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CCCD mặt sau
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setIdCardBack(e.target.files?.[0] || null)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Tài khoản ngân hàng</h3>
                <button
                  type="button"
                  onClick={addBankAccount}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Thêm tài khoản
                </button>
              </div>

              {bankAccounts.map((account, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Tài khoản {index + 1}</span>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeBankAccount(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Tên ngân hàng
                    </label>
                    <input
                      type="text"
                      value={account.bank}
                      onChange={(e) => handleBankAccountChange(index, 'bank', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Số tài khoản
                    </label>
                    <input
                      type="text"
                      value={account.account_number}
                      onChange={(e) => handleBankAccountChange(index, 'account_number', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Tên chủ tài khoản
                    </label>
                    <input
                      type="text"
                      value={account.account_name}
                      onChange={(e) => handleBankAccountChange(index, 'account_name', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                </div>
              ))}
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
              {loading ? 'Đang xử lý...' : 'Thêm hụi viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
