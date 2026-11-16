import React from 'react';
import { useHalaqat } from '../context/HalaqatContext';
import {
  MessageSquare,
  UserPlus,
  BookOpen,
  Share2,
  Camera,
  ExternalLink,
  Zap,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  Send,
  Activity,
} from 'lucide-react';

interface LeftActionPanelProps {
  onOpenAddHalaqah?: () => void;
}

export const LeftActionPanel: React.FC<LeftActionPanelProps> = ({ onOpenAddHalaqah }) => {
  const {
    selectedDate,
    setIsQuickEnrollOpen,
    setIsPaperScannerOpen,
    requestSendConsolidatedReport,
    openBulkWhatsAppModal,
    openLiveReportModal,
    todayAbsentsCount,
    telegramSession,
    setActiveTab,
  } = useHalaqat();

  const handleAddHalaqahClick = () => {
    if (onOpenAddHalaqah) {
      onOpenAddHalaqah();
    } else {
      setActiveTab('halaqat');
    }
  };

  return (
    <aside className="w-full lg:w-72 shrink-0 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-4" dir="rtl">
      {/* Panel Header */}
      <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center shadow-xs">
            <Zap className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 leading-tight">الإجراءات السريعة</h2>
            <p className="text-[10px] text-slate-500">أوامر وبث فوري للمدير</p>
          </div>
        </div>
        <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200/60">
          👑 بنقرة زر
        </span>
      </div>

      {/* Vertical Action Buttons Stack (Flex Direction: Column / Gap: 12px) */}
      <div className="flex flex-col gap-3">
        {/* 1. Official Telegram Bot Link */}
        <a
          href="https://t.me/DiwanSys_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-right p-3 rounded-xl bg-gradient-to-r from-sky-50 to-teal-50 hover:from-sky-100 hover:to-teal-100 border border-sky-200 text-sky-950 transition-all duration-150 cursor-pointer shadow-xs group flex items-center justify-between"
          title="فتح بوت تيليجرام الرسمي المعتمد لحلقات ابن باز"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-700 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                <span>بوت حلقات ابن باز</span>
                <span className="text-[9px] bg-sky-700 text-white px-1.5 py-0.2 rounded-full font-bold">
                  الرسمي
                </span>
              </div>
              <div className="text-[10px] text-sky-800/80 mt-0.5">
                قناة وتيليجرام @DiwanSys_bot
              </div>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-sky-700 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
        </a>

        {/* 1b. 1-Click Live Reports & Teacher/Sheikh Attendance Modal */}
        <button
          onClick={openLiveReportModal}
          type="button"
          className="w-full text-right p-3 rounded-xl bg-gradient-to-r from-indigo-900 to-slate-900 hover:from-indigo-950 hover:to-slate-950 text-white transition-all duration-150 cursor-pointer shadow-md hover:shadow-lg group flex items-center justify-between border border-indigo-400/30"
          title="فتح مركز التقارير الحية وحضور المعلمين والشيخ بنقرة واحدة"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/40 border border-indigo-300/40 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Activity className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>التقارير الحية والشيخ 📊</span>
                <span className="text-[9px] bg-emerald-400 text-slate-950 px-1.5 py-0.2 rounded-full font-bold">
                  مباشر
                </span>
              </div>
              <div className="text-[10px] text-indigo-200/90 mt-0.5">
                حضور المعلمين والشيخ والتقارير الفورية
              </div>
            </div>
          </div>
          <ChevronLeft className="w-3.5 h-3.5 text-indigo-300 group-hover:-translate-x-0.5 transition-transform shrink-0" />
        </button>

        {/* 2. Quick Enroll Student Button */}
        <button
          onClick={() => setIsQuickEnrollOpen(true)}
          type="button"
          className="w-full text-right p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-600 text-slate-900 transition-all duration-150 cursor-pointer shadow-xs group flex items-center justify-between"
          title="تسجيل فوري لطالب جديد وتعيين حلقته"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <UserPlus className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                تسجيل طالب جديد 👤
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                إضافة فورية وإعطاء رقم تسلسلي
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 group-hover:-translate-x-1 transition-transform">
            +
          </span>
        </button>

        {/* 3. Add Halqah Button */}
        <button
          onClick={handleAddHalaqahClick}
          type="button"
          className="w-full text-right p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-600 text-slate-900 transition-all duration-150 cursor-pointer shadow-xs group flex items-center justify-between"
          title="إنشاء وإضافة حلقة قرآنية جديدة وتعيين المعلم"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <BookOpen className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                إضافة حلقة قرآنية 🕌
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                تأسيس حلقة وتعيين الشيخ
              </div>
            </div>
          </div>
          <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 group-hover:-translate-x-0.5 transition-all shrink-0" />
        </button>

        {/* 4. Preview & Dispatch Consolidated Daily Report */}
        <button
          onClick={() => requestSendConsolidatedReport(selectedDate)}
          type="button"
          className="w-full text-right p-3 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-900 hover:to-teal-950 text-white transition-all duration-150 cursor-pointer shadow-md hover:shadow-lg group flex items-center justify-between"
          title="معاينة وتعديل التقرير اليومي الختامي والمفصل وبثه للمجموعة"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/60 border border-emerald-400/40 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Share2 className="w-4 h-4 text-emerald-100" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>معاينة وبث التقرير 📋</span>
                <span className="text-[9px] bg-emerald-500 text-emerald-950 px-1.5 py-0.2 rounded-full font-bold">
                  آلي
                </span>
              </div>
              <div className="text-[10px] text-emerald-200/90 mt-0.5">
                حضور وغياب وتسميع اليوم
              </div>
            </div>
          </div>
          <ChevronLeft className="w-3.5 h-3.5 text-emerald-300 group-hover:-translate-x-0.5 transition-transform shrink-0" />
        </button>

        {/* 5. Dedicated Instant Bulk Send WhatsApp for All Absents (Students & Teachers) */}
        <button
          onClick={openBulkWhatsAppModal}
          type="button"
          className="w-full text-right p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white transition-all duration-150 cursor-pointer shadow-md hover:shadow-lg group flex items-center justify-between border border-emerald-400/40"
          title="الإرسال الجماعي الفوري لكافة الغائبين من الطلاب والمعلمين دفعة واحدة عبر الواتساب"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Send className="w-4 h-4 text-emerald-100 -rotate-45" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>إرسال للجميع (الغائبين) 🚀</span>
                {todayAbsentsCount > 0 ? (
                  <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                    {todayAbsentsCount} غائب
                  </span>
                ) : (
                  <span className="text-[9px] bg-emerald-400 text-emerald-950 px-1.5 py-0.2 rounded-full font-bold">
                    كامل
                  </span>
                )}
              </div>
              <div className="text-[10px] text-emerald-100/90 mt-0.5">
                تنبيه جماعي للطلاب والمعلمين
              </div>
            </div>
          </div>
          <ChevronLeft className="w-3.5 h-3.5 text-emerald-200 group-hover:-translate-x-0.5 transition-transform shrink-0" />
        </button>

        {/* 6. Paper Roster Camera Scanner Button */}
        <button
          onClick={() => setIsPaperScannerOpen(true)}
          type="button"
          className="w-full text-right p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-300/80 text-amber-950 transition-all duration-150 cursor-pointer shadow-xs group flex items-center justify-between"
          title="تصوير الكشف الورقي بالكاميرا وقراءة الأسماء بالذكاء الاصطناعي"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Camera className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <span>مسح كشف ورقي 📷</span>
                <span className="text-[9px] bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded-full font-bold">
                  OCR AI
                </span>
              </div>
              <div className="text-[10px] text-amber-900/80 mt-0.5">
                قراءة فورية لأسماء الطلاب
              </div>
            </div>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-amber-600 group-hover:rotate-12 transition-transform shrink-0" />
        </button>
      </div>

      {/* Bot Status Mini Indicators */}
      <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span>بوت تيليجرام الرسمي:</span>
          </div>
          <a
            href="https://t.me/DiwanSys_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-sky-700 hover:underline"
            title="فتح بوت تيليجرام المعتمد"
          >
            @DiwanSys_bot 🟢
          </a>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>حالة الربط والاستقبال:</span>
          <span className="text-emerald-700 font-bold">جاهز لاستقبال تقارير المشايخ ✓</span>
        </div>
      </div>
    </aside>
  );
};
