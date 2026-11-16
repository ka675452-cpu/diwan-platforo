import React, { useState } from 'react';
import { useHalaqat } from '../context/HalaqatContext';
import { UserPlus, X, Sparkles, CheckCircle2, Hash, BookOpen } from 'lucide-react';

export const QuickEnrollModal: React.FC = () => {
  const { isQuickEnrollOpen, setIsQuickEnrollOpen, halaqat, students, stages, quickEnrollStudent } = useHalaqat();

  const [fullName, setFullName] = useState('');
  const [halaqahId, setHalaqahId] = useState(halaqat[0]?.id || '');
  const [age, setAge] = useState<number>(12);
  const [guardianPhone, setGuardianPhone] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ name: string; serial: number; halaqahName: string } | null>(null);

  if (!isQuickEnrollOpen) return null;

  const targetHalaqah = halaqat.find((h) => h.id === halaqahId) || halaqat[0];
  const existingInHalaqah = students.filter((s) => s.halaqahId === targetHalaqah?.id);
  const nextSerial = existingInHalaqah.reduce((max, s) => Math.max(max, s.halaqahSerial), 0) + 1;

  // Compute inferred stage
  let inferredStage = 'المرحلة المتوسطة';
  if (age <= 9) inferredStage = 'المرحلة الأولية (صفوف مبكرة)';
  else if (age <= 12) inferredStage = 'المرحلة الابتدائية العليا';
  else if (age <= 15) inferredStage = 'المرحلة المتوسطة';
  else inferredStage = 'المرحلة الثانوية';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !halaqahId) return;

    const newStudent = quickEnrollStudent({
      fullName: fullName.trim(),
      halaqahId,
      age: Number(age) || 12,
      guardianPhone: guardianPhone.trim() || undefined,
    });

    setSuccessInfo({
      name: newStudent.fullName,
      serial: newStudent.halaqahSerial,
      halaqahName: targetHalaqah.name,
    });

    // Reset fields
    setFullName('');
    setGuardianPhone('');

    setTimeout(() => {
      setSuccessInfo(null);
      setIsQuickEnrollOpen(false);
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <UserPlus className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">تسجيل طالب جديد فوري</h3>
              <p className="text-[11px] text-slate-500">اكتب الاسم والحلقة والعمر، والنظام يحدد رقمه تلقائياً</p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickEnrollOpen(false)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Confirmation Animation */}
        {successInfo ? (
          <div className="py-8 text-center space-y-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="w-12 h-12 bg-emerald-700 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">تمت إضافة الطالب تلقائياً!</h4>
              <p className="text-xs text-emerald-900 font-semibold mt-1">
                {successInfo.name}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 text-xs text-slate-700 font-mono-numbers shadow-2xs">
                <span>الرقم التسلسلي الممنوح له:</span>
                <span className="font-bold text-emerald-800 text-sm">[{successInfo.serial.toString().padStart(2, '0')}]</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">في {successInfo.halaqahName}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* 1. Student Name */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                1. اسم الطالب الجديد: <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="اكتب اسم الطالب كاملاً (مثال: عبد العزيز بن فهد التميمي)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                autoFocus
              />
            </div>

            {/* 2. Halaqah */}
            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span>2. الحلقة المراد إلحاقه بها: <span className="text-rose-600">*</span></span>
                <span className="text-[11px] text-emerald-800 font-mono-numbers">
                  الرقم القادم: [{nextSerial.toString().padStart(2, '0')}]
                </span>
              </label>
              <select
                value={halaqahId}
                onChange={(e) => setHalaqahId(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                {halaqat.map((h) => {
                  const count = students.filter((s) => s.halaqahId === h.id && s.status === 'active').length;
                  return (
                    <option key={h.id} value={h.id}>
                      {h.name} — المعلم: {h.teacherName} ({count} طلاب حالياً)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 3. Age & Automatic Calculation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  3. عمر الطالب (بالسنوات): <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  min={5}
                  max={25}
                  required
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value, 10) || 10)}
                  className="w-full text-xs font-bold font-mono-numbers bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-500 mb-1">هاتف ولي الأمر (اختياري):</label>
                <input
                  type="text"
                  placeholder="+9665xxxxxxxx"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  className="w-full text-xs font-mono-numbers bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            {/* Smart System Auto-Detection Preview Card */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>ما سيقوم به النظام تلقائياً:</span>
              </div>
              <div className="grid grid-cols-2 gap-1 pt-1 text-slate-700 font-mono-numbers">
                <div>• الرقم التسلسلي: <span className="font-bold text-emerald-800">[{nextSerial.toString().padStart(2, '0')}]</span></div>
                <div>• المرحلة: <span className="font-bold text-slate-800">{inferredStage}</span></div>
                <div>• سنة الميلاد: <span className="font-bold">{new Date().getFullYear() - age}م</span></div>
                <div>• حالة الحضور: <span className="font-bold text-emerald-700">حاضر اليوم تلقائياً</span></div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsQuickEnrollOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-2 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة الطالب فورياً</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
