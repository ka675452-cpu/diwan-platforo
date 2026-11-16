import React from 'react';
import { useHalaqat } from '../context/HalaqatContext';
import { LayoutDashboard, Lock, Crown } from 'lucide-react';
import emblemImg from '../assets/images/halaqat_badge_emblem_1792392345633.jpg';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    lockDirector,
    formattedTodayArabic,
  } = useHalaqat();

  const handleGoToDashboard = () => {
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToDirectorHub = () => {
    setActiveTab('dashboard');
    setTimeout(() => {
      const hub = document.getElementById('director-hub');
      if (hub) {
        hub.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200" dir="rtl">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 sm:gap-8 h-16">
          {/* Zone 1: Brand Wordmark + Clean Date */}
          <div className="flex items-center gap-3 shrink-0 min-w-0">
            <img
              src={emblemImg}
              alt="شعار حلقات ابن باز"
              className="w-9 h-9 rounded-full object-cover ring-1 ring-emerald-700/20 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-base font-bold text-slate-900 whitespace-nowrap shrink-0">
                حلقات ابن باز
              </span>
              <span className="hidden lg:inline text-slate-300" aria-hidden="true">
                ·
              </span>
              <span className="hidden lg:inline text-xs font-medium text-slate-500 whitespace-nowrap shrink-0">
                {formattedTodayArabic}
              </span>
            </div>
          </div>

          {/* Zone 2: Primary Home / Dashboard Button */}
          <nav className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleGoToDashboard}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                activeTab === 'dashboard'
                  ? 'text-emerald-800 font-bold border-emerald-700'
                  : 'text-slate-600 hover:text-emerald-800 font-medium border-transparent'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>لوحة المتابعة / الرئيسية</span>
            </button>
          </nav>

          {/* Zone 3: Director Access & System Lock Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleGoToDirectorHub}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300/90 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="الانتقال إلى مركز صلاحيات مدير الحلقات"
            >
              <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>مدير الحلقات</span>
            </button>

            <button
              type="button"
              onClick={lockDirector}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="قفل لوحة تحكم المدير برمز المرور"
            >
              <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>قفل النظام</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
