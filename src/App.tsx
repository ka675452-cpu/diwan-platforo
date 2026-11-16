/**
 * نظام إدارة حلقات تحفيظ القرآن الكريم الذكية
 * Smart Quran Halaqat Management System
 */

import React from 'react';
import { HalaqatProvider, useHalaqat } from './context/HalaqatContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LeftActionPanel } from './components/LeftActionPanel';
import { DashboardOverview } from './components/DashboardOverview';
import { SmartAttendance } from './components/SmartAttendance';
import { HalaqatManager } from './components/HalaqatManager';
import { StudentsManager } from './components/StudentsManager';
import { QuickActivities } from './components/QuickActivities';
import { TelegramBotManager } from './components/TelegramBotManager';
import { GuardianAlerts } from './components/GuardianAlerts';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { QuickEnrollModal } from './components/QuickEnrollModal';
import { PaperRosterScannerModal } from './components/PaperRosterScannerModal';
import { DispatchPreviewModal } from './components/DispatchPreviewModal';
import { BulkWhatsAppDispatchModal } from './components/BulkWhatsAppDispatchModal';
import { LiveReportsModal } from './components/LiveReportsModal';
import { TeachersManager } from './components/TeachersManager';
import { DirectorPinLockScreen } from './components/DirectorPinLockScreen';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { Sparkles, X, CheckCircle2, AlertCircle } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isDirectorUnlocked,
    unlockDirector,
    globalNotification,
    dismissGlobalNotification,
    confirmDeleteTarget,
    confirmDeleteAction,
    closeDeleteConfirm,
    isExecutingDelete,
    openAddHalaqahModal,
    isBulkWhatsAppModalOpen,
    closeBulkWhatsAppModal,
  } = useHalaqat();

  if (!isDirectorUnlocked) {
    return <DirectorPinLockScreen onUnlock={unlockDirector} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative" dir="rtl">
      <div className="print:hidden">
        <Header />
      </div>
      <BulkWhatsAppDispatchModal
        isOpen={isBulkWhatsAppModalOpen}
        onClose={closeBulkWhatsAppModal}
      />
      <LiveReportsModal />
      <DispatchPreviewModal />
      <QuickEnrollModal />
      <PaperRosterScannerModal />
      <DeleteConfirmationModal
        isOpen={!!confirmDeleteTarget}
        target={confirmDeleteTarget}
        onConfirm={confirmDeleteAction}
        onCancel={closeDeleteConfirm}
        isDeleting={isExecutingDelete}
      />

      {/* Global Success / Notification Banner (9 seconds + manual dismiss X) */}
      {globalNotification && (
        <div
          className={`print:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold animate-in slide-in-from-bottom-5 duration-200 border max-w-xl text-right backdrop-blur-md ${
            globalNotification.type === 'error'
              ? 'bg-rose-950/95 text-rose-100 border-rose-500/50'
              : globalNotification.type === 'info'
              ? 'bg-sky-950/95 text-sky-100 border-sky-500/50'
              : 'bg-emerald-950/95 text-emerald-100 border-emerald-500/50'
          }`}
        >
          {globalNotification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : globalNotification.type === 'info' ? (
            <Sparkles className="w-5 h-5 text-sky-400 shrink-0 animate-pulse" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-pulse" />
          )}
          <span className="flex-1 leading-relaxed">{globalNotification.message}</span>
          <button
            type="button"
            onClick={dismissGlobalNotification}
            title="إغلاق التنبيه"
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex-1 flex w-full mx-auto max-w-[1600px] px-2 sm:px-4 gap-4 py-4">
        {/* Right Navigation Sidebar (in RTL) */}
        <div className="hidden md:block shrink-0 print:hidden">
          <Sidebar />
        </div>

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 overflow-y-auto space-y-4">
          {/* Mobile Workspace Section Bar (keeps Sidebar tabs accessible on < md screens without cluttering Header) */}
          <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-1 print:hidden">
            {[
              { id: 'dashboard', label: 'لوحة التحكم' },
              { id: 'attendance', label: 'التحضير الذكي' },
              { id: 'halaqat', label: 'الحلقات' },
              { id: 'teachers', label: 'المعلمون' },
              { id: 'students', label: 'الطلاب' },
              { id: 'activities', label: 'الأنشطة' },
              { id: 'bot', label: 'بوت تيليجرام' },
              { id: 'alerts', label: 'إشعارات الأولياء' },
              { id: 'reports', label: 'التقارير' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-emerald-800 text-white border-emerald-800'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'attendance' && <SmartAttendance />}
          {activeTab === 'halaqat' && <HalaqatManager />}
          {activeTab === 'teachers' && <TeachersManager />}
          {activeTab === 'students' && <StudentsManager />}
          {activeTab === 'activities' && <QuickActivities />}
          {activeTab === 'bot' && <TelegramBotManager />}
          {activeTab === 'alerts' && <GuardianAlerts />}
          {activeTab === 'reports' && <ReportsAnalytics />}
        </main>

        {/* Left Quick Action Panel (Stacked Vertically with Gap: 12px) */}
        <div className="hidden xl:block shrink-0 print:hidden">
          <LeftActionPanel onOpenAddHalaqah={openAddHalaqahModal} />
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <HalaqatProvider>
      <MainAppContent />
    </HalaqatProvider>
  );
}
