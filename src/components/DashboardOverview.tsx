import React, { useState } from 'react';
import { useHalaqat } from '../context/HalaqatContext';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Share2,
  BellRing,
  Zap,
  ArrowUpRight,
  MessageSquare,
  Clock,
  Sparkles,
  ShieldCheck,
  UserPlus,
  Crown,
  GraduationCap,
  Hash,
  SlidersHorizontal,
  Camera,
  ExternalLink,
  Send,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import heroImg from '../assets/images/quran_halaqat_hero_1792392346372.jpg';

export const DashboardOverview: React.FC = () => {
  const {
    students,
    halaqat,
    stages,
    attendance,
    selectedDate,
    formattedTodayArabic,
    setActiveTab,
    requestSendConsolidatedReport,
    requestSendAllAbsentAlerts,
    openBulkWhatsAppModal,
    openLiveReportModal,
    todayAbsentsCount,
    logs,
    botSimulations,
    telegramSession,
    setIsQuickEnrollOpen,
    setIsPaperScannerOpen,
    latenessToleranceMinutes,
    setLatenessToleranceMinutes,
    getRingPreparationStatus,
  } = useHalaqat();

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const activeStudents = students.filter((s) => s.status === 'active');
  const todayRecords = attendance.filter((a) => a.date === selectedDate);
  const presentOnTimeCount = activeStudents.filter((s) => {
    const rec = todayRecords.find((a) => a.studentId === s.id);
    return !rec || rec.status === 'present';
  }).length;
  const lateCount = activeStudents.filter(
    (s) => todayRecords.find((a) => a.studentId === s.id)?.status === 'late'
  ).length;
  const presentCount = presentOnTimeCount + lateCount;
  const absentCount = activeStudents.filter(
    (s) => todayRecords.find((a) => a.studentId === s.id)?.status === 'absent'
  ).length;
  const excusedCount = activeStudents.filter(
    (s) => todayRecords.find((a) => a.studentId === s.id)?.status === 'excused'
  ).length;
  const attendanceRate =
    activeStudents.length > 0
      ? ((presentCount / activeStudents.length) * 100).toFixed(1)
      : '0.0';

  const preparedRingsCount = halaqat.filter(
    (h) => getRingPreparationStatus(h.id)?.status === 'completed'
  ).length;

  const handleBroadcastReport = () => {
    requestSendConsolidatedReport(selectedDate);
  };

  const handleNotifyParents = () => {
    requestSendAllAbsentAlerts();
  };

  return (
    <div className="space-y-6">
      {/* Alert notice if action performed */}
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-medium">{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Hero Banner with Generated Islamic Image */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-slate-900 text-white">
        <img
          src={heroImg}
          alt="حلقات القرآن الكريم"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-medium">
              <Sparkles className="w-4 h-4" />
              <span>حلقات ابن باز الذكية · {formattedTodayArabic}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-quran">
              ﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              نظام الإدارة والتحضير الفوري المربوط ببوت تيليجرام الرسمي (@DiwanSys_bot) لحلقات ابن باز. استقبال تقارير المعلمين تلقائياً، تسجيل غياب الحلقات بالأرقام التسلسلية، إشعار فوري لأولياء الأمور، وبث الأنشطة والتقارير بضغطة زر واحدة.
            </p>
          </div>

          {/* Today Live KPI Highlights Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shrink-0 text-white min-w-[240px] space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-white/15">
              <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>مؤشرات اليوم المباشرة</span>
              </span>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                {attendanceRate}% حضور
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white/10 rounded-xl p-2.5">
                <div className="text-[11px] text-emerald-200">الحاضرون</div>
                <div className="text-lg font-black font-mono-numbers text-white mt-0.5">{presentCount}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5">
                <div className="text-[11px] text-rose-200">الغياب</div>
                <div className="text-lg font-black font-mono-numbers text-rose-300 mt-0.5">{absentCount}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={openLiveReportModal}
              className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
              title="فتح مركز التقارير الحية وحضور المعلمين والشيخ بنقرة واحدة"
            >
              <Activity className="w-4 h-4 shrink-0" />
              <span>مركز التقارير الحية والمعلمين/الشيخ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Director Master Access Hub (صلاحيات مدير الحلقات الشاملة) */}
      <div id="director-hub" className="bg-linear-to-r from-amber-500/10 via-emerald-600/10 to-amber-500/10 border border-amber-300/80 rounded-2xl p-5 shadow-xs scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/60">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
              <Crown className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">مركز تحكم وصلاحيات مدير الحلقات الشاملة</h2>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
                  صلاحية كاملة 100%
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                لديك الأحقية الكاملة والمباشرة في التعديل على أي عنصر: الطلاب، الحلقات، المعلمين، الأرقام التسلسلية، والبرامج والأنشطة.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Flexible Lateness Tolerance Setting */}
            <div
              className="flex items-center gap-1.5 bg-white/95 border border-amber-300 px-3 py-1.5 rounded-xl text-xs shadow-2xs"
              title="تحديد وتعديل فترة التسامح واحتساب التأخير للطلاب والمعلمين"
            >
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="font-bold text-amber-950 text-xs">فترة احتساب التأخير:</span>
              <select
                value={latenessToleranceMinutes}
                onChange={(e) => setLatenessToleranceMinutes(Number(e.target.value))}
                className="bg-amber-50 border border-amber-300 text-amber-950 font-bold font-mono text-xs rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer"
              >
                <option value={10}>10 دقائق (مشدد)</option>
                <option value={15}>15 دقيقة (معتمد)</option>
                <option value={20}>20 دقيقة (متوسط)</option>
                <option value={30}>30 دقيقة (مرن)</option>
              </select>
            </div>

            <span className="text-xs font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>جميع الأقسام تحت تصرف المدير المباشر</span>
            </span>
          </div>
        </div>

        {/* 5 Quick Director Action Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3">
          {/* 1. Students */}
          <button
            onClick={() => setActiveTab('students')}
            className="bg-white/90 hover:bg-white border border-amber-200/80 hover:border-emerald-600 p-3 rounded-xl text-right transition-all shadow-2xs group cursor-pointer"
          >
            <div className="flex items-center justify-between text-emerald-800 mb-1.5">
              <span className="p-1.5 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                <Users className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-800">تعديل ↗</span>
            </div>
            <div className="text-xs font-bold text-slate-900">شؤون الطلاب</div>
            <div className="text-[10px] text-slate-500 mt-0.5">تعديل ونقل وحذف الطلاب</div>
          </button>

          {/* 2. Halaqat */}
          <button
            onClick={() => setActiveTab('halaqat')}
            className="bg-white/90 hover:bg-white border border-amber-200/80 hover:border-emerald-600 p-3 rounded-xl text-right transition-all shadow-2xs group cursor-pointer"
          >
            <div className="flex items-center justify-between text-emerald-800 mb-1.5">
              <span className="p-1.5 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                <BookOpen className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-800">تعديل ↗</span>
            </div>
            <div className="text-xs font-bold text-slate-900">المراحل والحلقات</div>
            <div className="text-[10px] text-slate-500 mt-0.5">إضافة وتعديل وحذف الحلقات</div>
          </button>

          {/* 3. Teachers */}
          <button
            onClick={() => setActiveTab('teachers')}
            className="bg-white/90 hover:bg-white border border-amber-200/80 hover:border-emerald-600 p-3 rounded-xl text-right transition-all shadow-2xs group cursor-pointer"
          >
            <div className="flex items-center justify-between text-emerald-800 mb-1.5">
              <span className="p-1.5 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                <GraduationCap className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-800">تعديل ↗</span>
            </div>
            <div className="text-xs font-bold text-slate-900">هيئة المعلمين</div>
            <div className="text-[10px] text-slate-500 mt-0.5">تعديل المعلمين وتوزيعهم</div>
          </button>

          {/* 4. Student Serials */}
          <button
            onClick={() => setActiveTab('students')}
            className="bg-white/90 hover:bg-white border border-amber-200/80 hover:border-emerald-600 p-3 rounded-xl text-right transition-all shadow-2xs group cursor-pointer"
          >
            <div className="flex items-center justify-between text-amber-700 mb-1.5">
              <span className="p-1.5 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
                <Hash className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-amber-700">ترتيب ↗</span>
            </div>
            <div className="text-xs font-bold text-slate-900">الأرقام التسلسلية</div>
            <div className="text-[10px] text-slate-500 mt-0.5">تغيير الأرقام وإعادة التسلسل</div>
          </button>

          {/* 5. Activities & Programs */}
          <button
            onClick={() => setActiveTab('activities')}
            className="bg-white/90 hover:bg-white border border-amber-200/80 hover:border-emerald-600 p-3 rounded-xl text-right transition-all shadow-2xs group cursor-pointer col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between text-emerald-800 mb-1.5">
              <span className="p-1.5 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                <Zap className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-800">تحكم ↗</span>
            </div>
            <div className="text-xs font-bold text-slate-900">البرامج والأنشطة</div>
            <div className="text-[10px] text-slate-500 mt-0.5">تعديل الأزرار ونصوص الواتساب</div>
          </button>
        </div>
      </div>

      {/* Live Telegram & Ring Preparation Feed Banner */}
      <div className="bg-white border border-sky-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900">
              متابعة التحضير المباشر والتحديثات الواردة من تيليجرام
            </h2>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
              {preparedRingsCount} / {halaqat.length} حلقات تم تحضيرها
            </span>
          </div>

          <button
            type="button"
            onClick={openLiveReportModal}
            className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>استعراض التقرير الحي وتحضير المعلمين</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {halaqat.map((h) => {
            const prep = getRingPreparationStatus(h.id);
            const isDone = prep && prep.status === 'completed';
            return (
              <div
                key={h.id}
                className={`px-3 py-2 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                  isDone
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-bold truncate">{h.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {isDone
                      ? `تم تحضيرها بواسطة (${prep.teacherName || h.teacherName}) • ${prep.preparedAt}`
                      : `بانتظار إرسال (${h.teacherName})`}
                  </div>
                </div>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {botSimulations.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
            <span className="font-bold text-sky-800">آخر حدث تيليجرام:</span>
            <span className="font-semibold text-slate-800">{botSimulations[0].senderName}</span>
            <span className="truncate max-w-md text-slate-500">— {botSimulations[0].messageText}</span>
            <span className="font-mono text-[10px] text-slate-400 mr-auto">{botSimulations[0].timestamp}</span>
          </div>
        )}
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total students */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">إجمالي طلاب حلقات ابن باز</span>
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-numbers text-slate-900">{activeStudents.length}</span>
            <span className="text-xs text-slate-500">طالباً مسجلاً</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            موزعون على {halaqat.length} حلقات قرآنية
          </div>
        </div>

        {/* Attendance rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">نسبة حضور اليوم</span>
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-numbers text-emerald-800">{attendanceRate}%</span>
            <span className="text-xs text-slate-500">({presentCount} حاضر {lateCount > 0 ? `منهم ${lateCount} متأخر` : ''})</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {excusedCount > 0 ? `${excusedCount} طلاب مستأذنون بعذر` : 'لا يوجد استئذان'}
          </div>
        </div>

        {/* Total Absent today */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">الغياب المرصود اليوم</span>
            <span className="p-2 bg-rose-50 text-rose-700 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-numbers text-rose-700">{absentCount}</span>
            <span className="text-xs text-slate-500">طلاب غائبون</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <button
              onClick={openBulkWhatsAppModal}
              className="text-white font-bold bg-emerald-700 hover:bg-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              title="إرسال جماعي لكافة الغائبين عبر الواتساب"
            >
              <Send className="w-3 h-3 -rotate-45" />
              <span>إرسال للجميع 🚀</span>
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className="text-emerald-700 hover:underline font-medium cursor-pointer"
            >
              عرض القائمة
            </button>
          </div>
        </div>

        {/* Telegram Official Bot Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">بوت تيليجرام الرسمي</span>
            <span
              className={`p-2 rounded-lg ${
                telegramSession.status === 'connected' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              <Send className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-sm font-bold text-slate-900">
              {telegramSession.status === 'connected' ? 'البوت متصل 🟢' : 'بانتظار الاتصال 🟡'}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="truncate">@{telegramSession.botUsername}</span>
            <button
              onClick={() => setActiveTab('bot')}
              className="text-emerald-700 hover:underline font-medium shrink-0 cursor-pointer"
            >
              إدارة البوت
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Stages Overview + Recent Message Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stages & Halaqat Summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>توزيع الحلقات حسب المراحل الدراسية</span>
            </h2>
            <button
              onClick={() => setActiveTab('halaqat')}
              className="text-xs text-emerald-800 hover:underline font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>إدارة الحلقات والطلاب</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stages.map((stage) => {
              const stageHalaqat = halaqat.filter((h) => h.stageId === stage.id);
              const stageStudents = students.filter((s) => s.stageId === stage.id && s.status === 'active');
              const stageAbsent = stageStudents.filter((s) => {
                const rec = todayRecords.find((a) => a.studentId === s.id);
                return rec?.status === 'absent';
              }).length;

              return (
                <div
                  key={stage.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-600/40 transition-colors shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{stage.name}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">{stage.description}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-mono-numbers">
                    <span>{stageHalaqat.length} حلقات</span>
                    <span>{stageStudents.length} طلاب</span>
                    <span className={stageAbsent > 0 ? 'text-rose-600 font-semibold' : 'text-emerald-700'}>
                      {stageAbsent > 0 ? `${stageAbsent} غائب` : 'حضور كامل'}
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-1.5">
                    {stageHalaqat.map((h) => {
                      const prep = getRingPreparationStatus(h.id);
                      const isDone = prep && prep.status === 'completed';
                      return (
                        <div
                          key={h.id}
                          className="text-[11px] text-slate-700 flex items-center justify-between hover:bg-slate-50/80 px-2 py-1.5 rounded-lg border border-slate-100"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${isDone ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                            <span className="font-bold text-slate-800 truncate">{h.name}</span>
                            <span className="text-[10px] text-slate-400">({h.teacherName})</span>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0 ${
                              isDone
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {isDone ? `🟢 تم تحضيرها (${prep.preparedAt})` : '⏳ بانتظار التحضير'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Activities Trigger Banner */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-amber-200/60 text-amber-900 rounded-lg text-lg">⚽</span>
              <div>
                <h4 className="text-xs font-bold text-amber-950">أزرار الأنشطة السريعة لمدير الحلقات</h4>
                <p className="text-[11px] text-amber-800">
                  أرسل إعلان نشاط كرة القدم، التكريم الشهري، أو تنبيه الطوارئ لمجموعة الواتساب بضغطة زر فورية.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('activities')}
              className="px-3.5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors"
            >
              لوحة الأنشطة
            </button>
          </div>
        </div>

        {/* Live Broadcast & Telegram Message Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>سجل الرسائل وتقارير تيليجرام</span>
            </h2>
            <button
              onClick={() => setActiveTab('bot')}
              className="text-xs text-emerald-800 hover:underline font-medium cursor-pointer"
            >
              إدارة البوت
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-xs max-h-[500px] overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">لا توجد رسائل مسجلة بعد.</div>
            ) : (
              logs.slice(0, 8).map((log) => (
                <div key={log.id} className="p-3 text-xs space-y-1 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-700">{log.recipientName}</span>
                    <span className="font-mono-numbers">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-600 line-clamp-2 leading-relaxed text-[11px]">{log.text}</p>
                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        log.type === 'group_broadcast'
                          ? 'bg-emerald-50 text-emerald-700'
                          : log.type === 'parent_alert'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {log.type === 'group_broadcast'
                        ? 'إذاعة للمجموعة'
                        : log.type === 'parent_alert'
                        ? 'إشعار ولي أمر'
                        : 'وارد من المعلم'}
                    </span>
                    <span className="text-emerald-700 flex items-center gap-1 font-mono-numbers">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{log.status === 'delivered' ? 'تم التسليم' : 'مكتمل'}</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
