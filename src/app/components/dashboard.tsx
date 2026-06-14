import { Users, ClipboardList, TrendingUp, Award, ChevronLeft } from 'lucide-react';
import { Athlete } from '../types';
import { evaluateSession, LEVEL_LABELS, LEVEL_BG, getAge, formatDate } from '../utils';
import { getEffectiveTestDefinitions } from '../utils/standards-storage';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  athletes: Athlete[];
  onViewAthlete: (id: string) => void;
  onViewSession: (athleteId: string, sessionId: string) => void;
}

const F = { fontFamily: 'Vazirmatn, sans-serif' };

export function Dashboard({ athletes, onViewAthlete, onViewSession }: Props) {
  const TEST_DEFINITIONS = getEffectiveTestDefinitions();
  const totalSessions = athletes.reduce((s, a) => s + a.sessions.length, 0);

  // Recent sessions across all athletes
  const recentSessions = athletes
    .flatMap(a =>
      a.sessions.map(s => ({ ...s, athlete: a }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Sport distribution
  const sportCounts: Record<string, number> = {};
  for (const a of athletes) {
    sportCounts[a.sport] = (sportCounts[a.sport] || 0) + 1;
  }
  const sportData = Object.entries(sportCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  // Level distribution
  const levelCounts = { poor: 0, average: 0, good: 0, excellent: 0 };
  for (const a of athletes) {
    for (const s of a.sessions) {
      const ev = evaluateSession(s, a);
      levelCounts[ev.overallLevel]++;
    }
  }

  const statCards = [
    {
      label: 'کل ورزشکاران',
      value: athletes.length,
      icon: <Users className="w-5 h-5" />,
      color: '#1b5e36',
      bg: 'rgba(27,94,54,0.12)',
    },
    {
      label: 'کل جلسات ارزیابی',
      value: totalSessions,
      icon: <ClipboardList className="w-5 h-5" />,
      color: '#6b9f7e',
      bg: 'rgba(139,92,246,0.12)',
    },
    {
      label: 'جلسات عالی',
      value: levelCounts.excellent,
      icon: <Award className="w-5 h-5" />,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.12)',
    },
    {
      label: 'نیاز به بهبود',
      value: levelCounts.poor + levelCounts.average,
      icon: <TrendingUp className="w-5 h-5" />,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.12)',
    },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="rounded-2xl p-4"
            style={{ background: 'var(--card)', border: '1px solid rgba(0,0,0,0.08)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: card.bg, color: card.color }}
              >
                {card.icon}
              </div>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)', ...F }}>
                {card.label}
              </p>
            </div>
            <p className="text-3xl font-bold" style={{ color: 'var(--foreground)', ...F }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sport chart */}
        {sportData.length > 0 && (
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--card)', border: '1px solid rgba(0,0,0,0.08)' }}
          >
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)', ...F }}>
              توزیع رشته‌های ورزشی
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={sportData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'Vazirmatn' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={70}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'Vazirmatn' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 8,
                    fontFamily: 'Vazirmatn',
                    color: 'var(--foreground)',
                  }}
                  formatter={(v: number) => [v + ' ورزشکار', 'تعداد']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {sportData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={['#1b5e36', '#e07828', '#2e7d52', '#f59e0b', '#dc2626', '#6b9f7e'][idx % 6]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Level distribution */}
        {totalSessions > 0 && (
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--card)', border: '1px solid rgba(0,0,0,0.08)' }}
          >
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)', ...F }}>
              توزیع سطح کلی جلسات
            </h3>
            <div className="space-y-3">
              {(Object.entries(levelCounts) as [keyof typeof levelCounts, number][]).map(([lvl, count]) => {
                const pct = totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0;
                const colorMap = {
                  poor: '#ef4444',
                  average: '#f59e0b',
                  good: '#1b5e36',
                  excellent: '#10b981',
                };
                return (
                  <div key={lvl}>
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--muted-foreground)', ...F }}>
                      <span>{LEVEL_LABELS[lvl]}</span>
                      <span>{count} جلسه ({pct}٪)</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: 'rgba(0,0,0,0.08)' }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${pct}%`, background: colorMap[lvl] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div
          className="rounded-2xl"
          style={{ background: 'var(--card)', border: '1px solid rgba(0,0,0,0.08)' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)', ...F }}>
              آخرین جلسات ارزیابی
            </h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
            {recentSessions.map(s => {
              const ev = evaluateSession(s, s.athlete);
              return (
                <button
                  key={s.id}
                  onClick={() => onViewSession(s.athlete.id, s.id)}
                  className="w-full flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition-colors text-right"
                  style={{ borderColor: 'rgba(0,0,0,0.05)' }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                    style={{ background: 'rgba(27,94,54,0.15)', color: '#2e8b57', fontFamily: 'Vazirmatn' }}
                  >
                    {s.athlete.firstName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)', ...F }}>
                      {s.athlete.firstName} {s.athlete.lastName}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)', ...F }}>
                      {s.label} — {formatDate(s.date)}
                    </p>
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-lg font-medium flex-shrink-0"
                    style={{ ...F }}
                  >
                    <span className={LEVEL_BG[ev.overallLevel] + ' px-2.5 py-1 rounded-lg text-xs'}>
                      {LEVEL_LABELS[ev.overallLevel]}
                    </span>
                  </span>
                  <ChevronLeft className="w-4 h-4 text-gray-500 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {athletes.length === 0 && (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'var(--card)', border: '1px solid rgba(0,0,0,0.08)' }}
        >
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: 'var(--muted-foreground)' }} />
          <p className="text-base font-medium" style={{ color: 'var(--foreground)', ...F }}>
            هنوز ورزشکاری ثبت نشده است
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)', ...F }}>
            از منوی ورزشکاران اولین پروفایل را بسازید
          </p>
        </div>
      )}
    </div>
  );
}
