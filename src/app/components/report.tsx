import { ArrowRight, Printer, Share2, Download, MessageCircle, Send } from 'lucide-react';
import { Athlete, AssessmentSession } from '../types';
import { TEST_DEFINITIONS } from '../data';
import { SPORT_LEVEL_LABELS } from '../data';
import {
  getAge, formatDate, evaluateSession, evaluateValue, LEVEL_BG, LEVEL_LABELS,
  LEVEL_COLORS, getSummary
} from '../utils';

interface Props {
  athlete: Athlete;
  session: AssessmentSession;
  onBack: () => void;
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

export function Report({ athlete, session, onBack }: Props) {
  const age = getAge(athlete.birthDate);
  const { overallLevel } = evaluateSession(session, athlete);

  const evaluatedResults = session.results.map(r => ({
    testId: r.testId,
    value: r.value,
    level: r.value !== null ? evaluateValue(r.testId, r.value, age, athlete.gender) : null,
  }));

  const { strengths, weaknesses, recommendations } = getSummary(evaluatedResults, athlete.gender, age);

  const categoryGroups = Object.entries(CATEGORIES).map(([cat, catLabel]) => ({
    key: cat,
    label: catLabel,
    results: evaluatedResults.filter(r => {
      const def = TEST_DEFINITIONS.find(d => d.id === r.testId);
      return def?.category === cat && r.value !== null;
    }),
  })).filter(g => g.results.length > 0);

  const handlePrint = () => {
    window.print();
  };

  const buildShareText = () => {
    const lines = [
      `📊 گزارش ارزیابی جسمانی`,
      `👤 ${athlete.firstName} ${athlete.lastName}`,
      `📅 ${formatDate(session.date)}`,
      `🏅 سطح کلی: ${LEVEL_LABELS[overallLevel]}`,
      '',
      `✅ نقاط قوت: ${strengths.join('، ') || '—'}`,
      `⚠️ نیاز به بهبود: ${weaknesses.join('، ') || '—'}`,
      '',
      '🏋️ پیشنهادهای تمرینی:',
      ...recommendations.map(r => `• ${r}`),
      '',
      'مرکز سنجش آمادگی جسمانی',
    ];
    return lines.join('\n');
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(buildShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareTelegram = () => {
    const text = encodeURIComponent(buildShareText());
    window.open(`https://t.me/share/url?url=&text=${text}`, '_blank');
  };

  return (
    <div className="max-w-3xl pb-20 lg:pb-0">
      {/* Controls - hidden on print */}
      <div className="no-print mb-5 flex flex-wrap gap-3 items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
          style={{ color: 'var(--muted-foreground)', ...F }}
        >
          <ArrowRight className="w-4 h-4" />
          بازگشت
        </button>

        <div className="flex gap-2 mr-auto flex-wrap">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
            style={{ background: 'rgba(0,0,0,0.1)', color: 'var(--foreground)', border: '1px solid rgba(0,0,0,0.1)', ...F }}
          >
            <Printer className="w-4 h-4" />
            چاپ
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
            style={{ background: 'rgba(27,94,54,0.15)', color: '#2e8b57', border: '1px solid rgba(27,94,54,0.3)', ...F }}
          >
            <Download className="w-4 h-4" />
            دانلود PDF
          </button>
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
            style={{ background: 'rgba(37,211,102,0.15)', color: '#4ade80', border: '1px solid rgba(37,211,102,0.3)', ...F }}
          >
            <MessageCircle className="w-4 h-4" />
            واتساپ
          </button>
          <button
            onClick={shareTelegram}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
            style={{ background: 'rgba(0,136,204,0.15)', color: '#38bdf8', border: '1px solid rgba(0,136,204,0.3)', ...F }}
          >
            <Send className="w-4 h-4" />
            تلگرام
          </button>
        </div>
      </div>

      {/* Report content - printable */}
      <div
        id="report-content"
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid rgba(0,0,0,0.08)' }}
      >
        {/* Report Header */}
        <div
          className="px-8 py-6"
          style={{ background: 'var(--primary)', borderBottom: '1px solid rgba(0,0,0,0.1)' }}
        >
          <div className="flex items-start gap-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(27,94,54,0.1)' }}
            >
              <span className="text-2xl">🏋️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white" style={F}>
                گزارش ارزیابی آمادگی جسمانی
              </h1>
              <p className="text-sm mt-1 text-blue-200" style={F}>
                مرکز سنجش آمادگی جسمانی
              </p>
            </div>
          </div>
        </div>

        {/* Athlete info */}
        <div className="px-8 py-5 border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {[
              { label: 'نام و نام خانوادگی', value: `${athlete.firstName} ${athlete.lastName}` },
              { label: 'تاریخ ارزیابی', value: formatDate(session.date) },
              { label: 'جنسیت', value: athlete.gender === 'male' ? 'آقا' : 'خانم' },
              { label: 'سن', value: `${age} سال` },
              { label: 'رشته ورزشی', value: athlete.sport },
              { label: 'سطح ورزشی', value: SPORT_LEVEL_LABELS[athlete.sportLevel] },
              { label: 'عنوان جلسه', value: session.label },
              { label: 'سطح کلی', value: LEVEL_LABELS[overallLevel] },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-2">
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--muted-foreground)', ...F, minWidth: 120 }}>
                  {label}:
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: label === 'سطح کلی' ? (
                    overallLevel === 'excellent' ? '#34d399' :
                    overallLevel === 'good' ? '#2e8b57' :
                    overallLevel === 'average' ? '#fbbf24' : '#f87171'
                  ) : 'var(--foreground)', ...F }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Test results */}
        {categoryGroups.map(group => (
          <div key={group.key} className="border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
            <div
              className="px-8 py-3"
              style={{ background: 'rgba(0,0,0,0.02)' }}
            >
              <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)', ...F }}>
                {group.label}
              </h3>
            </div>
            <div className="px-8">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <th className="text-right py-2 text-xs font-semibold" style={{ color: 'var(--muted-foreground)', ...F }}>تست</th>
                    <th className="text-center py-2 text-xs font-semibold" style={{ color: 'var(--muted-foreground)', ...F }}>نتیجه</th>
                    <th className="text-center py-2 text-xs font-semibold" style={{ color: 'var(--muted-foreground)', ...F }}>واحد</th>
                    <th className="text-center py-2 text-xs font-semibold" style={{ color: 'var(--muted-foreground)', ...F }}>سطح</th>
                  </tr>
                </thead>
                <tbody>
                  {group.results.map((r, idx) => {
                    const def = TEST_DEFINITIONS.find(d => d.id === r.testId);
                    if (!def) return null;
                    return (
                      <tr
                        key={r.testId}
                        style={{
                          borderBottom: idx < group.results.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                        }}
                      >
                        <td className="py-2.5 text-xs font-medium" style={{ color: 'var(--foreground)', ...F }}>
                          {def.name}
                        </td>
                        <td className="py-2.5 text-center text-sm font-bold font-mono" style={{ color: 'var(--foreground)' }}>
                          {r.value}
                        </td>
                        <td className="py-2.5 text-center text-xs" style={{ color: 'var(--muted-foreground)', ...F }}>
                          {def.unit}
                        </td>
                        <td className="py-2.5 text-center">
                          {r.level ? (
                            <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${LEVEL_BG[r.level]}`} style={F}>
                              {LEVEL_LABELS[r.level]}
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: 'var(--muted-foreground)', ...F }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Summary */}
        <div className="px-8 py-6 space-y-5">
          <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)', ...F }}>
            جمع‌بندی و پیشنهادات
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {strengths.length > 0 && (
              <div
                className="p-4 rounded-xl"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                <p className="text-xs font-bold mb-2" style={{ color: '#34d399', ...F }}>
                  ✅ نقاط قوت
                </p>
                <ul className="space-y-1">
                  {strengths.map(s => (
                    <li key={s} className="text-xs" style={{ color: '#a7f3d0', ...F }}>• {s}</li>
                  ))}
                </ul>
              </div>
            )}

            {weaknesses.length > 0 && (
              <div
                className="p-4 rounded-xl"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
              >
                <p className="text-xs font-bold mb-2" style={{ color: '#fbbf24', ...F }}>
                  ⚠️ نیاز به بهبود
                </p>
                <ul className="space-y-1">
                  {weaknesses.map(s => (
                    <li key={s} className="text-xs" style={{ color: '#fde68a', ...F }}>• {s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {recommendations.length > 0 && (
            <div
              className="p-4 rounded-xl"
              style={{ background: 'rgba(27,94,54,0.08)', border: '1px solid rgba(27,94,54,0.15)' }}
            >
              <p className="text-xs font-bold mb-2" style={{ color: '#2e8b57', ...F }}>
                🏋️ پیشنهادهای تمرینی
              </p>
              <ul className="space-y-1.5">
                {recommendations.map((rec, i) => (
                  <li key={i} className="text-xs" style={{ color: '#bfdbfe', ...F }}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}

          {session.notes && (
            <div
              className="p-4 rounded-xl"
              style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.1)' }}
            >
              <p className="text-xs font-bold mb-1" style={{ color: 'var(--muted-foreground)', ...F }}>
                یادداشت جلسه:
              </p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)', ...F }}>
                {session.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-8 py-4 border-t text-center"
          style={{ borderColor: 'rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.02)' }}
        >
          <p className="text-xs" style={{ color: 'var(--muted-foreground)', ...F }}>
            این گزارش توسط سیستم مدیریت مرکز سنجش آمادگی جسمانی تولید شده است · {formatDate(new Date().toISOString().slice(0, 10))}
          </p>
          <div
            className="mt-4 pt-4 border-t flex justify-between text-xs"
            style={{ borderColor: 'rgba(0,0,0,0.08)', color: 'var(--muted-foreground)', ...F }}
          >
            <span>امضای مسئول مرکز: ________________________</span>
            <span>مهر مرکز: ________________________</span>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; direction: rtl; font-family: Vazirmatn, sans-serif; }
          #report-content { border: 1px solid #e5e7eb !important; box-shadow: none !important; color-scheme: light; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}
