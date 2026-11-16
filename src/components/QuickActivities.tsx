import React, { useState } from 'react';
import { useHalaqat } from '../context/HalaqatContext';
import { ActivityQuickPreset } from '../types';
import {
  Zap,
  Send,
  Plus,
  Clock,
  MapPin,
  CheckCircle,
  Copy,
  Share2,
  Calendar,
  X,
  MessageSquare,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import activityBannerImg from '../assets/images/halaqat_activities_banner_1792392346982.jpg';

export const QuickActivities: React.FC = () => {
  const {
    presets,
    requestSendActivityBroadcast,
    addPreset,
    updatePreset,
    deletePreset,
    logs,
    telegramSession,
    openDeleteConfirm,
    showGlobalNotification,
  } = useHalaqat();

  const [selectedPreset, setSelectedPreset] = useState<ActivityQuickPreset>(presets[0] || {} as ActivityQuickPreset);
  const [customLocation, setCustomLocation] = useState<string>(presets[0]?.defaultLocation || '');
  const [customTime, setCustomTime] = useState<string>(presets[0]?.defaultTime || '');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Modal to add or edit preset
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPresetTarget, setEditingPresetTarget] = useState<ActivityQuickPreset | null>(null);

  const [presetFormData, setPresetFormData] = useState({
    title: '',
    category: 'custom' as ActivityQuickPreset['category'],
    icon: '🎯',
    defaultLocation: '',
    defaultTime: '',
    templateMessage: '',
  });

  const handleSelectPreset = (p: ActivityQuickPreset) => {
    setSelectedPreset(p);
    setCustomLocation(p.defaultLocation || '');
    setCustomTime(p.defaultTime || '');
  };

  const getComputedMessage = () => {
    if (!selectedPreset?.templateMessage) return '';
    return selectedPreset.templateMessage
      .replace('{location}', customLocation || selectedPreset.defaultLocation || 'الموقع المحدد')
      .replace('{time}', customTime || selectedPreset.defaultTime || 'الموعد المحدد');
  };

  const handleBroadcast = () => {
    if (!selectedPreset?.id) return;
    requestSendActivityBroadcast(selectedPreset.id, customLocation, customTime);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(getComputedMessage());
    setSuccessNotice('تم نسخ نص الرسالة إلى الحافظة.');
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingPresetTarget(null);
    setPresetFormData({
      title: '',
      category: 'custom',
      icon: '🎯',
      defaultLocation: 'جامع ابن باز',
      defaultTime: 'يوم الخميس القادم',
      templateMessage: `🌟 *إعلان فعالية جديدة بحلقات ابن باز* 🌟\n\nالمكان: {location}\nالموعد: {time}\n\nنسأل الله لأبنائنا التوفيق والسداد.`,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (preset: ActivityQuickPreset, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPresetTarget(preset);
    setPresetFormData({
      title: preset.title,
      category: preset.category,
      icon: preset.icon,
      defaultLocation: preset.defaultLocation || '',
      defaultTime: preset.defaultTime || '',
      templateMessage: preset.templateMessage,
    });
    setIsModalOpen(true);
  };

  const handleDeletePreset = (preset: ActivityQuickPreset, e: React.MouseEvent) => {
    e.stopPropagation();
    openDeleteConfirm(
      {
        id: preset.id,
        name: preset.title,
        type: 'preset',
        subtext: `أيقونة النشاط: ${preset.icon} · التصنيف: ${preset.category}`,
        details: {
          'الموقع الافتراضي': preset.defaultLocation || 'جامع ابن باز',
          'الموعد الافتراضي': preset.defaultTime || 'غير محدد',
        },
      },
      () => {
        deletePreset(preset.id);
        if (selectedPreset?.id === preset.id && presets.length > 1) {
          setSelectedPreset(presets.find((p) => p.id !== preset.id) || presets[0]);
        }
        setSuccessNotice(`تم حذف زر النشاط "${preset.title}".`);
        showGlobalNotification(`تم حذف زر النشاط "${preset.title}" بنجاح 🗑️`, 'info');
      }
    );
  };

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPresetTarget) {
      const updated: ActivityQuickPreset = {
        ...editingPresetTarget,
        ...presetFormData,
      };
      updatePreset(updated);
      setSelectedPreset(updated);
      setSuccessNotice(`تم تحديث قالب النشاط "${presetFormData.title}" بنجاح!`);
      showGlobalNotification(`تم تحديث قالب النشاط "${presetFormData.title}" بنجاح ✅`, 'success');
    } else {
      addPreset(presetFormData);
      setSuccessNotice(`تمت إضافة زر النشاط الجديد "${presetFormData.title}" بنجاح!`);
      showGlobalNotification(`تمت إضافة زر النشاط الجديد "${presetFormData.title}" بنجاح ✅`, 'success');
    }
    setIsModalOpen(false);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const broadcastLogs = logs.filter((l) => l.type === 'group_broadcast');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            <span>أزرار الأنشطة والبرامج (تحكم المدير الكامل)</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
              تعديل وحذف متاح 👑
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            يحق للمدير تعديل قوالب الرسائل المحفوظة، تخصيص الأماكن والمواعيد، حذف أو إضافة أي نشاط، والبث المباشر.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء زر نشاط جديد</span>
        </button>
      </div>

      {/* Success Notice Banner */}
      {successNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-medium">{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Activities Banner Card */}
      <div className="relative rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 bg-slate-900 text-white min-h-[160px] flex items-center">
        <img
          src={activityBannerImg}
          alt="أنشطة حلقات القرآن"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 p-6 max-w-xl space-y-1.5">
          <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wide">
            منظومة البث الفوري · إدارة البرامج والأنشطة
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            أنشطة وفعاليات حلقات ابن باز القرآنية
          </h2>
          <p className="text-slate-200 text-xs leading-relaxed">
            اختر أي نشاط ترغب في الإعلان عنه، وعدّل المكان أو الوقت إن لزم، أو عدّل القالب بالكامل، ثم اضغط زر الإرسال
            لبثه فوراً لجميع أولياء الأمور في مجموعة الواتساب المعتمدة.
          </p>
        </div>
      </div>

      {/* Main Preset Grid & WhatsApp Preview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Preset Activity Buttons (Left 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-700">الأزرار المحفوظة (اضغط للاختيار أو التعديل):</h2>
            <span className="text-xs text-slate-400 font-mono-numbers">{presets.length} أزرار نشطة</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presets.map((preset) => {
              const isSelected = selectedPreset?.id === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-4 rounded-xl text-right transition-all cursor-pointer flex flex-col justify-between border relative group ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-700/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 w-full">
                    <span className="text-2xl">{preset.icon}</span>

                    {/* Director Quick Edit/Delete Icons on each card */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleOpenEdit(preset, e)}
                        className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                        title="تعديل قالب ورسالة هذا النشاط"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {presets.length > 1 && (
                        <button
                          onClick={(e) => handleDeletePreset(preset, e)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="حذف هذا الزر"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <h3 className="text-xs font-bold text-slate-900">{preset.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{preset.defaultLocation}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 w-full flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate max-w-[140px]">{preset.defaultTime}</span>
                    <span className="text-emerald-700 font-medium">معاينة ⟵</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Location & Time Override controls */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>تخصيص تفاصيل هذا النشاط قبل الإرسال:</span>
              {selectedPreset && (
                <button
                  onClick={(e) => handleOpenEdit(selectedPreset, e as any)}
                  className="text-xs text-emerald-800 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>تعديل نص القالب الأصلي</span>
                </button>
              )}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>المكان / الملعب:</span>
                </label>
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="الموقع..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>الموعد / التوقيت:</span>
                </label>
                <input
                  type="text"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  placeholder="الوقت..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Broadcast Message Preview & Action (Right 5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>معاينة رسالة الإعلان:</span>
            </h2>
            <span className="text-[11px] text-slate-400">تنسيق النشر</span>
          </div>

          {/* Realistic Chat Bubble Container */}
          <div className="bg-[#EFEAE2] border border-slate-300 rounded-2xl p-4 shadow-inner space-y-3 relative overflow-hidden">
            <div className="text-center">
              <span className="bg-white/80 text-[10px] text-slate-600 px-3 py-1 rounded-full shadow-xs">
                إرسال إلى: بوت وقناة حلقات ابن باز (@{telegramSession.botUsername})
              </span>
            </div>

            {/* WhatsApp message bubble */}
            <div className="bg-white rounded-xl rounded-tr-none p-3.5 shadow-sm text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans border-r-4 border-emerald-600">
              {getComputedMessage()}
              <div className="mt-2 text-[10px] text-slate-400 text-left font-mono-numbers">
                {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })} ✓✓
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={handleBroadcast}
                className="flex-1 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>معاينة وبث النشاط للمجموعة 🚀</span>
              </button>

              <button
                onClick={handleCopyMessage}
                className="p-2.5 bg-white text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 shadow-xs cursor-pointer"
                title="نسخ نص الرسالة"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Past Activity Broadcast Logs */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800">سجل الإرسال الحديث للمجموعة</h3>
            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {broadcastLogs.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">لا توجد رسائل مبثوثة مؤخراً.</div>
              ) : (
                broadcastLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="py-2 text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-semibold text-slate-700">{log.recipientName}</span>
                      <span className="font-mono-numbers text-[10px]">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-600 truncate">{log.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add or Edit Activity Preset */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingPresetTarget ? `تعديل زر النشاط: ${editingPresetTarget.title}` : 'إنشاء زر نشاط جديد'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePreset} className="space-y-3 text-xs">
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">عنوان النشاط / الزر:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: نشاط كرة القدم الأسبوعي"
                    value={presetFormData.title}
                    onChange={(e) => setPresetFormData({ ...presetFormData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الرمز (Emoji):</label>
                  <input
                    type="text"
                    required
                    value={presetFormData.icon}
                    onChange={(e) => setPresetFormData({ ...presetFormData, icon: e.target.value })}
                    className="w-full text-center text-base bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الموقع الافتراضي:</label>
                  <input
                    type="text"
                    placeholder="المكان الافتراضي"
                    value={presetFormData.defaultLocation}
                    onChange={(e) => setPresetFormData({ ...presetFormData, defaultLocation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الموعد الافتراضي:</label>
                  <input
                    type="text"
                    placeholder="الوقت الافتراضي"
                    value={presetFormData.defaultTime}
                    onChange={(e) => setPresetFormData({ ...presetFormData, defaultTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  نص الرسالة المحفوظة (يمكنك استخدام المتغيرات {'{location}'} و {'{time}'}):
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder={`🏆 *إعلان نشاط...*\nالمكان: {location}\nالوقت: {time}`}
                  value={presetFormData.templateMessage}
                  onChange={(e) => setPresetFormData({ ...presetFormData, templateMessage: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-sans leading-relaxed"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  {editingPresetTarget ? 'حفظ تعديلات القالب' : 'حفظ الزر الجديد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
