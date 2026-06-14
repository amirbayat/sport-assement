import { useState, useEffect } from 'react';
import { ArrowRight, Save, RefreshCw } from 'lucide-react';
import { Athlete, AssessmentSession, TestResult } from '../types';
import { getEffectiveTestDefinitions } from '../utils/standards-storage';
import { generateId, computeBMI, evaluateValue, getAge, LEVEL_BG, LEVEL_LABELS } from '../utils';

interface Props {
  athlete: Athlete;
  existingSession?: AssessmentSession;
  onSave: (session: AssessmentSession) => void;
  onBack: () => void;
}

const F = { fontFamily: 'Vazirmatn, sans-serif' };

const inputStyle = {
  background: 'rgba(0,0,0,0.05)',
  border: '1px solid rgba(0,0,0,0.1)',
  color: 'var(--foreground)',
  ...F,
};

const CATEGORIES: Record<string, string> = {
  body: 'ترکیب بدنی',
  power: 'قدرت و توان',
  speed: 'سرعت و چابکی',
  endurance: 'استقامت',
  flexibility: 'انعطاف',
  balance: 'تعادل',
};

export function SessionForm({ athlete, existingSession, onSave, onBack }: Props) {
  const TEST_DEFINITIONS = getEffectiveTestDefinitions();
  const [label, setLabel] = useState(existingSession?.label ?? `ارزیابی — ${new Date().toLocaleDateString('fa-IR')}`);
  const [date, setDate] = useState(existingSession?.date ?? new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState(existingSession?.notes ?? '');
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const def of TEST_DEFINITIONS) {
      if (def.isComputed) continue;
      const existing = existingSession?.results.find(r => r.testId === def.id);
      init[def.id] = existing?.value !== null && existing?.value !== undefined ? String(existing.value) : '';
    }
    return init;
  });

  const age = getAge(athlete.birthDate);

  // Auto-compute BMI
  const bmi = (() => {
    const h = parseFloat(values['height']);
    const w = parseFloat(values['weight']);
    if (h > 0 && w > 0) return computeBMI(h, w);
    return null;
  })();

  const getLevel = (testId: string, val: string) => {
    const n = parseFloat(val);
    if (isNaN(n)) return null;
    return evaluateValue(testId, n, age, athlete.gender);
  };

  const getBmiLevel = () => {
    if (bmi === null) return null;
    return evaluateValue('bmi', bmi, age, athlete.gender);
  };

  const handleSave = () => {
    const results: TestResult[] = [];
    for (const def of TEST_DEFINITIONS) {
      if (def.isComputed) {
        // BMI auto-computed
        results.push({ testId: def.id, value: bmi });
      } else {
        const v = parseFloat(values[def.id]);
        results.push({ testId: def.id, value: isNaN(v) ? null : v });
      }
    }
    const session: AssessmentSession = {
      id: existingSession?.id ?? generateId(),
      date,
      label,
      notes,
      results,
    };
    onSave(session);
  };

  // Group tests by category
  const categoryGroups = Object.entries(CATEGORIES).map(([cat, catLabel]) => ({
    key: cat,
    label: catLabel,
    defs: TEST_DEFINITIONS.filter(d => d.category === cat),
  }));

  return (
    <div className="max-w-2xl space-y-5 pb-20 lg:pb-0">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
        style={{ color: 'var(--muted-foreground)', ...F }}
      >
        <ArrowRight className="w-4 h-4" />
        بازگشت به پروفایل
      </button>

      {/* Session meta */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--card)', border: '1px solid rgba(0,0,0,0.08)' }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)', ...F }}>
          اطلاعات جلسه — {athlete.firstName} {athlete.lastName}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)', ...F }}>
              عنوان جلسه
            </label>
            <input
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={inputStyle}
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="مثال: ارزیابی اول — خرداد"
            />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)', ...F }}>
              تاریخ ارزیابی
            </label>
            <input
              type="date"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={inputStyle}
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)', ...F }}>
            یادداشت جلسه (اختیاری)
          </label>
          <textarea
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={inputStyle}
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="توضیحات کلی درباره جلسه..."
          />
        </div>
      </div>

      {/* Test inputs by category */}
      {categoryGroups.map(group => (
        <div
          key={group.key}
          className="rounded-2xl p-5"
          style={{ background: 'var(--card)', border: '1px solid rgba(0,0,0,0.08)' }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)', ...F }}>
            {group.label}
          </h3>
          <div className="space-y-4">
            {group.defs.map(def => {
              if (def.isComputed) {
                // BMI - auto-computed
                const bmiLevel = getBmiLevel();
                return (
                  <div key={def.id}>
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)', ...F }}>
                      {def.name}
                      <span className="mr-2 opacity-60">({def.unit}) — خودکار</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex-1 px-3 py-2.5 rounded-xl text-sm flex items-center gap-2"
                        style={{
                          background: 'rgba(0,0,0,0.03)',
                          border: '1px solid rgba(0,0,0,0.1)',
                          color: bmi ? 'var(--foreground)' : 'var(--muted-foreground)',
                          ...F,
                        }}
                      >
                        <RefreshCw className="w-3.5 h-3.5 opacity-50" />
                        {bmi !== null ? bmi.toFixed(1) : 'با وارد کردن قد و وزن محاسبه می‌شود'}
                      </div>
                      {bmi !== null && bmiLevel && (
                        <span className={`text-xs px-2.5 py-1 rounded-lg flex-shrink-0 ${LEVEL_BG[bmiLevel]}`} style={F}>
                          {LEVEL_LABELS[bmiLevel]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              const level = getLevel(def.id, values[def.id] ?? '');
              return (
                <div key={def.id}>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)', ...F }}>
                    {def.name}
                    <span className="mr-2 opacity-60">({def.unit})</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.01"
                      className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={inputStyle}
                      value={values[def.id] ?? ''}
                      onChange={e => setValues(v => ({ ...v, [def.id]: e.target.value }))}
                      placeholder={`عدد را وارد کنید (${def.unit})`}
                    />
                    {level && (
                      <span className={`text-xs px-2.5 py-1 rounded-lg flex-shrink-0 ${LEVEL_BG[level]}`} style={F}>
                        {LEVEL_LABELS[level]}
                      </span>
                    )}
                    {!level && values[def.id] && (
                      <span
                        className="text-xs px-2.5 py-1 rounded-lg flex-shrink-0"
                        style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--muted-foreground)', ...F }}
                      >
                        بدون استاندارد
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1 opacity-50" style={{ color: 'var(--muted-foreground)', ...F }}>
                    {def.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Save button */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
          style={{ background: 'var(--primary)', color: '#fff', ...F }}
        >
          <Save className="w-4 h-4" />
          ذخیره جلسه
        </button>
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/5 transition-all"
          style={{ color: 'var(--muted-foreground)', border: '1px solid rgba(0,0,0,0.1)', ...F }}
        >
          انصراف
        </button>
      </div>
    </div>
  );
}
