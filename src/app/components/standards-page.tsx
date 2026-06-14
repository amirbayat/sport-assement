import { useState } from 'react';
import { BookOpen, Info, Settings } from 'lucide-react';
import { getEffectiveTestDefinitions } from '../utils/standards-storage';

const F = { fontFamily: 'Vazirmatn, sans-serif' };

const CATEGORIES: Record<string, string> = {
  body: 'ترکیب بدنی',
  power: 'قدرت و توان',
  speed: 'سرعت و چابکی',
  endurance: 'استقامت',
  flexibility: 'انعطاف',
  balance: 'تعادل',
};

interface Props {
  onEditStandards?: () => void;
}

export function StandardsPage({ onEditStandards }: Props) {
  const [activeCategory, setActiveCategory] = useState('body');
  const [activeGender, setActiveGender] = useState<'male' | 'female'>('male');

  const TEST_DEFINITIONS = getEffectiveTestDefinitions();
  const activeDefs = TEST_DEFINITIONS.filter(d => d.category === activeCategory && d.standards.length > 0);

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div />
        {onEditStandards && (
          <button
            onClick={onEditStandards}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-all hover:opacity-90"
            style={{ background: 'var(--primary)', color: '#fff', ...F }}
          >
            <Settings className="w-4 h-4" />
            ویرایش استانداردها
          </button>
        )}
      </div>

      {/* Info */}
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(27,94,54,0.08)', border: '1px solid rgba(27,94,54,0.15)' }}
      >
        <Info className="w-4 h-4 text-green-700 mt-0.5 flex-shrink-0" />
        <p className="text-xs" style={{ color: '#93c5fd', ...F }}>
          استانداردهای تعریف‌شده در سیستم برای ارزیابی خودکار نتایج تست‌ها استفاده می‌شوند. هنگام وارد کردن نتایج، سیستم به‌صورت خودکار سطح هر تست را تشخیص می‌دهد.
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(CATEGORIES).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className="px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{
              background: activeCategory === key ? 'rgba(27,94,54,0.15)' : 'var(--card)',
              color: activeCategory === key ? '#2e8b57' : 'var(--muted-foreground)',
              border: activeCategory === key ? '1px solid rgba(27,94,54,0.35)' : '1px solid rgba(0,0,0,0.08)',
              ...F,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Gender filter */}
      <div className="flex gap-2">
        {(['male', 'female'] as const).map(g => (
          <button
            key={g}
            onClick={() => setActiveGender(g)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeGender === g
                ? (g === 'male' ? 'rgba(27,94,54,0.15)' : 'rgba(236,72,153,0.2)')
                : 'var(--card)',
              color: activeGender === g
                ? (g === 'male' ? '#2e8b57' : '#f472b6')
                : 'var(--muted-foreground)',
              border: activeGender === g
                ? `1px solid ${g === 'male' ? 'rgba(27,94,54,0.35)' : 'rgba(236,72,153,0.4)'}`
                : '1px solid rgba(0,0,0,0.08)',
              ...F,
            }}
          >
            {g === 'male' ? 'آقایان' : 'خانم‌ها'}
          </button>
        ))}
      </div>

      {activeDefs.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: 'var(--card)', border: '1px solid rgba(0,0,0,0.08)' }}
        >
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: 'var(--muted-foreground)' }} />
          <p className="text-sm" style={{ color: 'var(--muted-foreground)', ...F }}>
            استانداردی برای این دسته تعریف نشده است
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {activeDefs.map(def => {
            const genderStandards = def.standards.filter(
              s => s.gender === 'both' || s.gender === activeGender
            );

            if (genderStandards.length === 0) {
              return (
                <div
                  key={def.id}
                  className="rounded-2xl p-5"
                  style={{ background: 'var(--card)', border: '1px solid rgba(0,0,0,0.08)' }}
                >
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)', ...F }}>
                    {def.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)', ...F }}>
                    استانداردی برای این جنسیت تعریف نشده است
                  </p>
                </div>
              );
            }

            const isLowerBetter = ['agility', 'speed'].includes(def.id);

            return (
              <div
                key={def.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--card)', border: '1px solid rgba(0,0,0,0.08)' }}
              >
                <div
                  className="px-5 py-3 border-b"
                  style={{ borderColor: 'rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.02)' }}
                >
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)', ...F }}>
                      {def.name}
                    </h3>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)', ...F }}>
                      ({def.unit})
                    </span>
                    {isLowerBetter && (
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', ...F }}
                      >
                        زمان کمتر بهتر
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', ...F }}>
                    {def.description}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        <th className="text-right px-5 py-2.5 text-xs font-semibold" style={{ color: 'var(--muted-foreground)', ...F }}>
                          گروه سنی
                        </th>
                        <th className="text-center px-4 py-2.5 text-xs font-semibold" style={{ color: '#ef4444', ...F }}>
                          ضعیف
                        </th>
                        <th className="text-center px-4 py-2.5 text-xs font-semibold" style={{ color: '#f59e0b', ...F }}>
                          متوسط
                        </th>
                        <th className="text-center px-4 py-2.5 text-xs font-semibold" style={{ color: '#1b5e36', ...F }}>
                          خوب
                        </th>
                        <th className="text-center px-4 py-2.5 text-xs font-semibold" style={{ color: '#10b981', ...F }}>
                          عالی
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {genderStandards.map((std, idx) => {
                        const formatRange = (min: number, max: number) => {
                          if (min <= -50) return `< ${max}`;
                          if (max >= 999) return `> ${min}`;
                          return `${min} – ${max}`;
                        };

                        return (
                          <tr
                            key={idx}
                            style={{
                              borderBottom: idx < genderStandards.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                            }}
                          >
                            <td className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--foreground)', ...F }}>
                              {std.ageMin}–{std.ageMax} سال
                            </td>
                            <td className="px-4 py-3 text-center text-xs font-mono" style={{ color: '#f87171' }}>
                              {formatRange(std.poor.min, std.poor.max)}
                            </td>
                            <td className="px-4 py-3 text-center text-xs font-mono" style={{ color: '#fbbf24' }}>
                              {formatRange(std.average.min, std.average.max)}
                            </td>
                            <td className="px-4 py-3 text-center text-xs font-mono" style={{ color: '#2e8b57' }}>
                              {formatRange(std.good.min, std.good.max)}
                            </td>
                            <td className="px-4 py-3 text-center text-xs font-mono" style={{ color: '#34d399' }}>
                              {formatRange(std.excellent.min, std.excellent.max)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
