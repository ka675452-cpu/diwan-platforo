import React, { useState } from 'react';
import { useHalaqat } from '../context/HalaqatContext';
import { StageId, Halaqah } from '../types';
import {
  BookOpen,
  Plus,
  Users,
  MapPin,
  Clock,
  Phone,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  ArrowUpDown,
  ShieldCheck,
} from 'lucide-react';
import { hasValidGuardianPhone } from '../data/mockData';

export const HalaqatManager: React.FC = () => {
  const {
    stages,
    halaqat,
    teachers,
    students,
    addHalaqah,
    updateHalaqah,
    deleteHalaqah,
    autoRenumberHalaqah,
    openDeleteConfirm,
    showGlobalNotification,
    isAddHalaqahModalOpen,
    setIsAddHalaqahModalOpen,
  } = useHalaqat();

  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHalaqah, setEditingHalaqah] = useState<Halaqah | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Sync external add trigger from LeftActionPanel
  React.useEffect(() => {
    if (isAddHalaqahModalOpen) {
      handleOpenAdd();
      setIsAddHalaqahModalOpen(false);
    }
  }, [isAddHalaqahModalOpen]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    stageId: 'intermediate' as StageId,
    teacherName: '',
    teacherPhone: '',
    timeSlot: 'after_asr' as Halaqah['timeSlot'],
    timeSlotLabel: 'بعد صلاة العصر مباشرة',
    location: 'جامع ابن باز - الصحن الرئيسي',
    roomNumber: '',
    targetMemorization: '',
  });

  const filteredHalaqat =
    selectedStage === 'all'
      ? halaqat
      : halaqat.filter((h) => h.stageId === selectedStage);

  const handleOpenAdd = () => {
    setEditingHalaqah(null);
    setFormData({
      name: '',
      stageId: 'intermediate',
      teacherName: teachers[0]?.fullName || 'مصباح نور الدين',
      teacherPhone: teachers[0]?.phoneNumber || '',
      timeSlot: 'after_asr',
      timeSlotLabel: 'بعد صلاة العصر مباشرة',
      location: 'جامع ابن باز',
      roomNumber: 'قاعة جديدة',
      targetMemorization: 'حفظ ومراجعة الأجزاء المقررة',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (h: Halaqah) => {
    setEditingHalaqah(h);
    setFormData({
      name: h.name,
      stageId: h.stageId,
      teacherName: h.teacherName,
      teacherPhone: h.teacherPhone,
      timeSlot: h.timeSlot,
      timeSlotLabel: h.timeSlotLabel,
      location: h.location,
      roomNumber: h.roomNumber,
      targetMemorization: h.targetMemorization,
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHalaqah) {
      updateHalaqah({
        ...editingHalaqah,
        ...formData,
      });
      setFeedback(`تم تحديث بيانات "${formData.name}" بنجاح!`);
      showGlobalNotification(`تم تحديث بيانات "${formData.name}" بنجاح ✅`, 'success');
    } else {
      addHalaqah(formData);
      setFeedback(`تمت إضافة الحلقة القرآنية "${formData.name}" بنجاح!`);
      showGlobalNotification(`تمت إضافة الحلقة القرآنية "${formData.name}" بنجاح ✅`, 'success');
    }
    setIsAddModalOpen(false);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleDelete = (h: Halaqah) => {
    const halaqahStudentsCount = students.filter((s) => s.halaqahId === h.id).length;
    openDeleteConfirm(
      {
        id: h.id,
        name: h.name,
        type: 'halaqah',
        subtext: `معلم الحلقة: ${h.teacherName} (${h.teacherPhone})`,
        details: {
          'عدد الطلاب المسجلين': `${halaqahStudentsCount} طالب`,
          'الموقع بالجامع': h.location,
          'الموعد اليومي': h.timeSlotLabel,
        },
      },
      () => {
        deleteHalaqah(h.id);
        setFeedback(`تم حذف الحلقة بنجاح ونقل طلابها.`);
        showGlobalNotification(`تم حذف الحلقة القرآنية "${h.name}" بنجاح ونقل طلابها 🗑️`, 'info');
      }
    );
  };

  const handleRenumber = (h: Halaqah) => {
    openDeleteConfirm(
      {
        id: h.id,
        name: `إعادة ترقيم طلاب حلقة "${h.name}"`,
        type: 'action',
        subtext: 'سيتم تحديث الأرقام التسلسلية لطلاب الحلقة هجائياً من [01] إلى [N].',
        details: {
          'اسم الحلقة': h.name,
          'معلم الحلقة': h.teacherName,
        },
      },
      () => {
        autoRenumberHalaqah(h.id, 'alphabetical');
        setFeedback(`تمت إعادة ترتيب وتسلسل طلاب "${h.name}" أبجدياً بنجاح!`);
        showGlobalNotification(`تمت إعادة ترتيب وتسلسل طلاب "${h.name}" أبجدياً بنجاح 🔢`, 'success');
        setTimeout(() => setFeedback(null), 3500);
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-800" />
            <span>إدارة الحلقات والمراحل الدراسية (تحكم المدير الكامل)</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
              صلاحية كاملة 👑
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إضافة، تعديل، وحذف الحلقات، تعيين المعلمين، وإعادة ضبط تسلسل أرقام الطلاب داخل كل حلقة.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة حلقة جديدة</span>
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-semibold">{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Stage Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => setSelectedStage('all')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            selectedStage === 'all'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          جميع المراحل ({halaqat.length})
        </button>
        {stages.map((stage) => {
          const count = halaqat.filter((h) => h.stageId === stage.id).length;
          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                selectedStage === stage.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {stage.shortName} ({count})
            </button>
          );
        })}
      </div>

      {/* Halaqat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHalaqat.map((halaqah) => {
          const halaqahStudents = students.filter(
            (s) => s.halaqahId === halaqah.id && s.status === 'active'
          );
          const stage = stages.find((s) => s.id === halaqah.stageId);

          return (
            <div
              key={halaqah.id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-600/40 transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {stage?.shortName}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{halaqah.name}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleRenumber(halaqah)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                      title="إعادة تسلسل وترتيب طلاب الحلقة أبجدياً (1..N)"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(halaqah)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      title="تعديل بيانات الحلقة"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {halaqat.length > 1 && (
                      <button
                        onClick={() => handleDelete(halaqah)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="حذف الحلقة بالكامل"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 shrink-0">المعلم:</span>
                    <span className="font-medium text-slate-800">{halaqah.teacherName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {hasValidGuardianPhone(halaqah.teacherPhone) ? (
                      <span className="font-mono-numbers text-slate-700 font-semibold" dir="ltr">
                        {halaqah.teacherPhone}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                        لا يوجد رقم
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{halaqah.timeSlotLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{halaqah.location} ({halaqah.roomNumber})</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-2.5 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700 block mb-0.5">المقرر المستهدف:</span>
                  <span className="line-clamp-2">{halaqah.targetMemorization}</span>
                </div>
              </div>

              {/* Footer details */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <Users className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{halaqahStudents.length} طلاب مسجلين</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono-numbers">
                  أرقامهم: [01] ⟵ [{halaqahStudents.length.toString().padStart(2, '0')}]
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Add / Edit Halaqah */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingHalaqah ? 'تعديل بيانات الحلقة بالكامل' : 'إضافة حلقة قرآنية جديدة'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم الحلقة:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: حلقة الصفوف الأولية"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">المرحلة الدراسية:</label>
                  <select
                    value={formData.stageId}
                    onChange={(e) => setFormData({ ...formData, stageId: e.target.value as StageId })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">وقت الانعقاد:</label>
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => {
                      const val = e.target.value as Halaqah['timeSlot'];
                      const labelMap: Record<Halaqah['timeSlot'], string> = {
                        after_asr: 'بعد صلاة العصر مباشرة',
                        after_maghrib: 'بين المغرب والعشاء',
                        after_isha: 'بعد صلاة العشاء',
                        after_fajr: 'بعد صلاة الفجر',
                      };
                      setFormData({
                        ...formData,
                        timeSlot: val,
                        timeSlotLabel: labelMap[val] || 'بعد العصر',
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="after_asr">بعد صلاة العصر</option>
                    <option value="after_maghrib">بين المغرب والعشاء</option>
                    <option value="after_isha">بعد صلاة العشاء</option>
                    <option value="after_fajr">بعد صلاة الفجر</option>
                  </select>
                </div>
              </div>

              {/* Teacher selector from existing teachers */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اختر المعلم من الكادر المعتمد:</label>
                <select
                  onChange={(e) => {
                    const t = teachers.find((tc) => tc.id === e.target.value);
                    if (t) {
                      setFormData({
                        ...formData,
                        teacherName: t.fullName,
                        teacherPhone: t.phoneNumber,
                      });
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 mb-2"
                >
                  <option value="">-- اختر معلماً مسجلاً أو عدّل يدوياً أدناه --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({hasValidGuardianPhone(t.phoneNumber) ? t.phoneNumber : 'لا يوجد رقم'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">اسم المعلم:</label>
                  <input
                    type="text"
                    required
                    value={formData.teacherName}
                    onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">هاتف المعلم / تيليجرام:</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="اختياري (+966...)"
                    value={formData.teacherPhone}
                    onChange={(e) => setFormData({ ...formData, teacherPhone: e.target.value })}
                    className="w-full font-mono-numbers bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">مكان الانعقاد بالمسجد:</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">القاعة / الرواق:</label>
                  <input
                    type="text"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">المقرر المستهدف:</label>
                <textarea
                  rows={2}
                  value={formData.targetMemorization}
                  onChange={(e) => setFormData({ ...formData, targetMemorization: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  {editingHalaqah ? 'حفظ التعديلات' : 'إضافة الحلقة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
