import { useState } from 'react';
import { ArrowRight, Save } from 'lucide-react';
import { Athlete, SportLevel } from '../types';
import { SPORTS, SPORT_LEVEL_LABELS } from '../data';
import { generateId } from '../utils';

interface Props {
  existingAthlete?: Athlete;
  onSave: (athlete: Athlete) => void;
  onBack: () => void;
}

const F = { fontFamily: 'Vazirmatn, sans-serif' };

const inputClass = `w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all`;
const inputStyle = {
  background: 'rgba(0,0,0,0.05)',
  border: '1px solid rgba(0,0,0,0.1)',
  color: 'var(--foreground)',
  ...F,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm mb-1.5" style={{ color: 'var(--muted-foreground)', ...F }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function AthleteForm({ existingAthlete, onSave, onBack }: Props) {
  const [form, setForm] = useState({
    firstName: existingAthlete?.firstName ?? '',
    lastName: existingAthlete?.lastName ?? '',
    mobile: existingAthlete?.mobile ?? '',
    birthDate: existingAthlete?.birthDate ?? '',
    gender: existingAthlete?.gender ?? 'male',
    sport: existingAthlete?.sport ?? 'فوتبال',
    sportLevel: existingAthlete?.sportLevel ?? ('intermediate' as SportLevel),
    injuryHistory: existingAthlete?.injuryHistory ?? '',
    notes: existingAthlete?.notes ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'نام الزامی است';
    if (!form.lastName.trim()) e.lastName = 'نام خانوادگی الزامی است';
    if (!form.birthDate) e.birthDate = 'تاریخ تولد الزامی است';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const athlete: Athlete = {
      id: existingAthlete?.id ?? generateId(),
      ...form,
      gender: form.gender as 'male' | 'female',
      sportLevel: form.sportLevel as SportLevel,
      createdAt: existingAthlete?.createdAt ?? new Date().toISOString().slice(0, 10),
      sessions: existingAthlete?.sessions ?? [],
    };
    onSave(athlete);
  };

  return (
    <div className="max-w-2xl pb-20 lg:pb-0">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm mb-5 hover:opacity-80 transition-opacity"
        style={{ color: 'var(--muted-foreground)', ...F }}
      >
        <ArrowRight className="w-4 h-4" />
        بازگشت
      </button>

      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--card)', border: '1px solid rgba(0,0,0,0.08)' }}
      >
        <h2 className="text-base font-semibold mb-6" style={{ color: 'var(--foreground)', ...F }}>
          {existingAthlete ? 'ویرایش پروفایل ورزشکار' : 'ثبت ورزشکار جدید'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="نام *">
              <input
                className={inputClass}
                style={{ ...inputStyle, borderColor: errors.firstName ? '#ef4444' : 'rgba(0,0,0,0.1)' }}
                value={form.firstName}
                onChange={e => set('firstName', e.target.value)}
                placeholder="نام"
              />
              {errors.firstName && <p className="text-xs mt-1" style={{ color: '#f87171', ...F }}>{errors.firstName}</p>}
            </Field>
            <Field label="نام خانوادگی *">
              <input
                className={inputClass}
                style={{ ...inputStyle, borderColor: errors.lastName ? '#ef4444' : 'rgba(0,0,0,0.1)' }}
                value={form.lastName}
                onChange={e => set('lastName', e.target.value)}
                placeholder="نام خانوادگی"
              />
              {errors.lastName && <p className="text-xs mt-1" style={{ color: '#f87171', ...F }}>{errors.lastName}</p>}
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="شماره موبایل">
              <input
                className={inputClass}
                style={inputStyle}
                value={form.mobile}
                onChange={e => set('mobile', e.target.value)}
                placeholder="09xxxxxxxxx"
                type="tel"
              />
            </Field>
            <Field label="تاریخ تولد *">
              <input
                type="date"
                className={inputClass}
                style={{ ...inputStyle, borderColor: errors.birthDate ? '#ef4444' : 'rgba(0,0,0,0.1)' }}
                value={form.birthDate}
                onChange={e => set('birthDate', e.target.value)}
              />
              {errors.birthDate && <p className="text-xs mt-1" style={{ color: '#f87171', ...F }}>{errors.birthDate}</p>}
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="جنسیت">
              <div className="flex gap-2">
                {(['male', 'female'] as const).map(g => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => set('gender', g)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: form.gender === g ? (g === 'male' ? 'rgba(27,94,54,0.15)' : 'rgba(236,72,153,0.2)') : 'rgba(0,0,0,0.05)',
                      color: form.gender === g ? (g === 'male' ? '#2e8b57' : '#f472b6') : 'var(--muted-foreground)',
                      border: form.gender === g
                        ? `1px solid ${g === 'male' ? 'rgba(27,94,54,0.35)' : 'rgba(236,72,153,0.4)'}`
                        : '1px solid rgba(0,0,0,0.1)',
                      ...F,
                    }}
                  >
                    {g === 'male' ? 'آقا' : 'خانم'}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="سطح ورزشی">
              <select
                className={inputClass}
                style={inputStyle}
                value={form.sportLevel}
                onChange={e => set('sportLevel', e.target.value)}
              >
                {(Object.entries(SPORT_LEVEL_LABELS) as [SportLevel, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="رشته ورزشی">
            <select
              className={inputClass}
              style={inputStyle}
              value={form.sport}
              onChange={e => set('sport', e.target.value)}
            >
              {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="سابقه آسیب">
            <textarea
              className={`${inputClass} resize-none`}
              style={inputStyle}
              rows={2}
              value={form.injuryHistory}
              onChange={e => set('injuryHistory', e.target.value)}
              placeholder="شرح آسیب‌های قبلی (اختیاری)"
            />
          </Field>

          <Field label="توضیحات تکمیلی">
            <textarea
              className={`${inputClass} resize-none`}
              style={inputStyle}
              rows={3}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="هر اطلاعات اضافی در مورد ورزشکار (اختیاری)"
            />
          </Field>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
              style={{ background: 'var(--primary)', color: '#fff', ...F }}
            >
              <Save className="w-4 h-4" />
              {existingAthlete ? 'ذخیره تغییرات' : 'ثبت ورزشکار'}
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
        </form>
      </div>
    </div>
  );
}
