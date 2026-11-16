import React from 'react';
import { useHalaqat } from '../context/HalaqatContext';
import {
  LayoutDashboard,
  ClipboardCheck,
  BookOpen,
  Users,
  GraduationCap,
  Zap,
  MessageSquare,
  BellRing,
  BarChart3,
  Calendar,
  Crown,
  Camera,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    attendance,
    selectedDate,
    setSelectedDate,
    resetToToday,
    formattedSelectedDateArabic,
    teachers,
    currentRole,
    setIsPaperScannerOpen,
  } = useHalaqat();

  const todayAbsents = attendance.filter((a) => a.date === selectedDate && a.status === 'absent').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم والمؤشرات',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'attendance',
      label: 'التحضير الذكي للغياب',
      icon: ClipboardCheck,
      badge: todayAbsents > 0 ? `${todayAbsents} غائب` : null,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'halaqat',
      label: 'إدارة المراحل والحلقات',
      icon: BookOpen,
      badge: null,
    },
    {
      id: 'teachers',
      label: 'المعلمون والمشرفون',
      icon: GraduationCap,
      badge: `${teachers.length}`,
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'students',
      label: 'الطلاب والأرقام التسلسلية',
      icon: Users,
      badge: null,
    },
    {
      id: 'activities',
      label: 'أزرار البرامج والأنشطة',
      icon: Zap,
      badge: 'تحكم',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'bot',
      label: 'بوت تيليجرام الذكي',
      icon: MessageSquare,
      badge: 'متصل 🟢',
      badgeColor: 'bg-sky-100 text-sky-800',
    },
    {
      id: 'alerts',
      label: 'إشعارات أولياء الأمور',
      icon: BellRing,
      badge: todayAbsents > 0 ? `${todayAbsents}` : null,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'reports',
      label: 'التقارير والإحصائيات',
      icon: BarChart3,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-l border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Director Privilege Badge */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-center gap-2.5">
          <span className="p-1.5 bg-amber-500 text-white rounded-lg shadow-2xs shrink-0">
            <Crown className="w-4 h-4" />
          </span>
          <div className="text-right">
            <div className="text-xs font-bold text-amber-950 flex items-center gap-1">
              <span>مدير الحلقات</span>
              <span className="text-[10px] text-amber-800 font-normal">(تحكم شامل)</span>
            </div>
            <div className="text-[10px] text-amber-800 leading-tight">
              أحقية كاملة لتعديل أي عنصر بالنظام
            </div>
          </div>
        </div>

        {/* Date Selector */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>تاريخ التحضير:</span>
            </label>
            <button
              onClick={resetToToday}
              className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
              title="العودة لتاريخ اليوم"
            >
              اليوم
            </button>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full text-xs font-mono-numbers bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-semibold"
          />
          <div className="text-[10px] font-bold text-emerald-900 bg-emerald-50 border border-emerald-200/60 px-2 py-1 rounded text-center">
            {formattedSelectedDateArabic}
          </div>
        </div>

        {/* Paper Camera OCR Trigger */}
        <button
          onClick={() => setIsPaperScannerOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl bg-linear-to-r from-amber-500/15 via-emerald-600/15 to-amber-500/15 border border-amber-300/80 text-amber-950 hover:bg-amber-100/60 transition-colors cursor-pointer shadow-2xs group"
          title="تصوير الكشف الورقي بالكاميرا وقراءة الأسماء بالذكاء الاصطناعي"
        >
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-700 group-hover:scale-110 transition-transform" />
            <span>تصوير كشف ورقي 📷</span>
          </div>
          <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-full font-extrabold">
            OCR
          </span>
        </button>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-100' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono-numbers shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Info */}
      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span>بوت تيليجرام:</span>
          <span className="font-bold text-sky-700">@DiwanSys_bot 🟢</span>
        </div>
        <div className="flex items-center justify-between">
          <span>القناة الرسمية:</span>
          <span className="truncate max-w-[120px] text-emerald-800 font-medium">حلقات ابن باز</span>
        </div>
      </div>
    </aside>
  );
};
