import React from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert, Check } from 'lucide-react';
import { DeleteConfirmTarget } from '../types';

export type { DeleteConfirmTarget };

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  target: DeleteConfirmTarget | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  target,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  if (!isOpen || !target) return null;

  const typeLabels: Record<string, string> = {
    student: 'طالب',
    halaqah: 'حلقة قرآنية',
    teacher: 'معلم / مشرف',
    preset: 'برنامج / نشاط',
    notification: 'سجل إشعار',
    action: 'إجراء حساس',
  };

  const typeLabel = typeLabels[target.type] || 'عنصر';
  const isAction = target.type === 'action';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-rose-200 overflow-hidden transform animate-in zoom-in-95 duration-200">
        {/* Top Warning Banner */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 text-white p-5 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-700/80 border border-rose-500/50 flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-200 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-600/40">
                إجراء إداري مباشر · تحكم المدير
              </span>
              <button
                onClick={onCancel}
                disabled={isDeleting}
                className="text-rose-200 hover:text-white p-1 rounded-lg hover:bg-rose-700/50 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-base font-bold text-white mt-1.5">
              {isAction ? `تأكيد تنفيذ: ${target.name}` : `تأكيد حذف ${typeLabel} نهائياً`}
            </h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <p className="text-sm font-bold text-slate-800">
              هل أنت متأكد من رغبتك في حذف {typeLabel} التالية؟
            </p>
            <div className="bg-rose-50/80 border border-rose-200/90 rounded-xl p-3.5 text-right">
              <div className="text-sm font-extrabold text-rose-950">
                {target.name}
              </div>
              {target.subtext && (
                <div className="text-xs text-rose-800/90 mt-0.5">
                  {target.subtext}
                </div>
              )}

              {target.details && (
                <div className="mt-2.5 pt-2 border-t border-rose-200/60 space-y-1 text-xs">
                  {Object.entries(target.details).map(([key, val]) => (
                    val ? (
                      <div key={key} className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-500">{key}:</span>
                        <span className="font-semibold text-slate-800 font-mono-numbers">{val}</span>
                      </div>
                    ) : null
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Security Warning */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold">تحذير أمني:</strong> هذا الإجراء نهائي ولا يمكن التراجع عنه. سيؤدي إلى مسح سجلات الحضور، الغياب، والتسميع المرتبطة بهذا العنصر في قاعدة البيانات.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'جاري الحذف...' : 'تأكيد الحذف النهائي'}</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              إلغاء التراجع
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
