import React from 'react';
import { 
  Home,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  LogOut
} from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Trang chủ', path: '/' },
  { icon: Users, label: 'Quản lý hụi viên', path: '/members' },
  { icon: Calendar, label: 'Dây hụi', path: '/hui' },
  { icon: DollarSign, label: 'Thu/Chi', path: '/transactions' },
  { icon: FileText, label: 'Báo cáo', path: '/reports' },
  { icon: Settings, label: 'Cài đặt', path: '/settings' },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-white h-screen shadow-lg">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Hụi</h1>
      </div>
      <nav className="mt-8">
        {menuItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.label}</span>
          </a>
        ))}
        <button className="flex items-center px-6 py-3 text-red-600 hover:bg-gray-100 w-full mt-auto">
          <LogOut className="w-5 h-5 mr-3" />
          <span>Đăng xuất</span>
        </button>
      </nav>
    </div>
  );
}
