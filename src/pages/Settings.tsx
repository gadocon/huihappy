import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div>
      <div className="flex items-center mb-8">
        <SettingsIcon className="w-6 h-6 mr-2" />
        <h1 className="text-2xl font-bold text-gray-800">Cài đặt</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-500">Chức năng đang được phát triển...</p>
        </div>
      </div>
    </div>
  );
}
