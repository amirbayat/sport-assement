import { ArrowRight, FileText, Edit, Trash2, CheckCircle, XCircle, MinusCircle, Star } from 'lucide-react';
import { Athlete, AssessmentSession } from '../types';
import { getEffectiveTestDefinitions } from '../utils/standards-storage';
import {
  getAge, formatDate, evaluateSession, evaluateValue, LEVEL_BG, LEVEL_LABELS,
  LEVEL_COLORS, getSummary
} from '../utils';

interface Props {
  athlete: Athlete;
  session: AssessmentSession;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewReport: () => void;
}

const F = { fontFamily: 'Vazirmatn, sans-serif' };

const CATEGORIES: Record<string, string> = {
  body: 'ترکیب بدنی',
  power: 'قدرت و توان',
  speed: 'سرعت و چابکی',
  endurance: 'استقامت',
  flexibility: 'انعطاف',
  balance: 'تعادل',
};

const LevelIcon = ({ level }: { level: string | null }) => {
  if (level === 'excellent') return <Star className="w-4 h-4 text-emerald-400" />;
  if (level === 'good') return <CheckCircle className="w-4 h-4 text-green-700" />;
  if (level === 'average') return <MinusCircle className="w-4 h-4 text-yellow-400" />;
  if (level === 'poor') return <XCircle className="w-4 h-4 text-red-400" />;
  return null;
};

export function SessionDetail({ athlete, session, onBack, onEdit, onDelete, onViewReport }: Props) {
  const TEST_DEFINITIONS = getEffectiveTestDefinitions();
  const age = getAge(athlete.birthDate);
  const { overallLevel } = evaluateSession(session, athlete);

  const evaluatedResults = session.results.map(r => ({
    testId: r.testId,
    value: r.value,
    level: r.value !== null ? evaluateValue(r.testId, r.value, age, athlete.gender) : null,
  }));

  const { strengths, weaknesses, recommendations } = getSummary(evaluatedResults, athlete.gender, age);

  const handleDelete = () => {
    if (window.confirm('آیا مطمئن هستید که این جلسه را حذف کنید؟')) {
      onDelete();
    }
  };

  const categoryGroups = Object.entries(CATEGORIES).map(([cat, catLabel]) => ({
    key: cat,
    label: catLabel,
    results: evaluatedResults.filter(r => {
      const def = TEST_DEFINITIONS.find(d => d.id === r.testId);
      return def?.category === cat;
    }),
  })).filter(g => g.results.some(r => r.value !== null));

  return (
    <div className="max-w-3xl space-y-5 pb-20 lg:pb-0">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
        style={{ color: 'var(--muted-foreground)', ...F }}
      >
        <ArrowRight className="w-4 h-4" />
        بازگشت به پروفایل
      </button>

      {/* Header */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--card)', border: '1px solid rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h2 className="text-base font-bold" style={{ color: 'var(--foreground)', ...F }}>
              {session.label}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)', ...F }}>
              {athlete.firstName} {athlete.lastName} · {formatDate(session.date)}
            </p>
            {session.notes && (
              <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)', ...F }}>
                {session.notes}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={onViewReport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium hover:opacity-90 transition-all"
              style={{ background: 'rgba(27,94,54,0.15)', color: '#2e8b57', border: '1px solid rgba(27,94,54,0.3)', ...F }}
            >
              <FileText className="w-3.5 h-3.5" />
              گزارش
            </button>
            <button
              onClick={onEdit}
              className="p-2 rounded-xl hover:bg-white/5 transition-all"
              style={{ color: 'var(--muted-foreground)', border: '1px solid rgba(0,0,0,0.1)' }}
              title="ویرایش"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl hover:bg-red-500/10 transition-all"
              style={{ color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
              title="حذف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Overall level */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs" style={{ color: 'var(--muted-foreground)', ...F }}>
            سطح کلی:
          </span>
          <span className={`text-sm px-3 py-1 rounded-lg font-semibold ${LEVEL_BG[overallLevel]}`} style={F}>
            {LEVEL_LABELS[overallLevel]}
          </span>
        </div>
      </div>

      {/* Results by category */}
      {categoryGroups.map(group => (
        <div
          key={group.key}
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid rgba(0,0,0,0.08)' }}
        >
          <div
            className="px-5 py-3 border-b"
            style={{ borderColor: 'rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.02)' }}
          >
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)', ...F }}>
              {group.label}
            </h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
            {group.results.map(r => {
              const def = TEST_DEFINITIONS.find(d => d.id === r.testId);
              if (!def) return null;
              return (
                <div key={r.testId} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)', ...F }}>
                      {def.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', ...F }}>
                      {def.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {r.value !== null ? (
                      <>
                        <span className="text-base font-semibold font-mono" style={{ color: 'var(--foreground)' }}>
                          {r.value}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)', ...F }}>
                          {def.unit}
                        </span>
                        {r.level ? (
                          <div className="flex items-center gap-1.5">
                            <LevelIcon level={r.level} />
                            <span className={`text-xs font-medium ${LEVEL_COLORS[r.level]}`} style={F}>
                              {LEVEL_LABELS[r.level]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--muted-foreground)', ...F }}>
                            —
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)', ...F }}>
                        ثبت نشده
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Summary */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: 'var(--card)', border: '1px solid rgba(0,0,0,0.08)' }}
        >
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)', ...F }}>
            جمع‌بندی ارزیابی
          </h3>

          {strengths.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: '#10b981', ...F }}>
                نقاط قوت:
              </p>
              <div className="flex flex-wrap gap-2">
                {strengths.map(s => (
                  <span
                    key={s}
                    className="text-xs px-2.5 py-1 rounded-lg"
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)', ...F }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {weaknesses.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: '#f59e0b', ...F }}>
                نقاط نیازمند بهبود:
              </p>
              <div className="flex flex-wrap gap-2">
                {weaknesses.map(s => (
                  <span
                    key={s}
                    className="text-xs px-2.5 py-1 rounded-lg"
                    style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)', ...F }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {recommendations.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: '#2e8b57', ...F }}>
                پیشنهادهای تمرینی:
              </p>
              <ul className="space-y-1.5">
                {recommendations.map((rec, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs"
                    style={{ color: 'var(--muted-foreground)', ...F }}
                  >
                    <span className="text-green-700 mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
