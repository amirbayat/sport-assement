import { ArrowRight, Plus, ClipboardList, Edit, Trash2, FileText, Phone, Calendar, Trophy } from 'lucide-react';
import { Athlete } from '../types';
import { getAge, formatDate, evaluateSession, LEVEL_BG, LEVEL_LABELS, LEVEL_DOT } from '../utils';
import { SPORT_LEVEL_LABELS } from '../data';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  athlete: Athlete;
  onBack: () => void;
  onEdit: () => void;
  onNewSession: () => void;
  onViewSession: (sessionId: string) => void;
  onDeleteAthlete: () => void;
  onViewReport: (sessionId: string) => void;
}

const F = { fontFamily: 'Vazirmatn, sans-serif' };

export function AthleteProfile({ athlete, onBack, onEdit, onNewSession, onViewSession, onDeleteAthlete, onViewReport }: Props) {
  const age = getAge(athlete.birthDate);

  const sortedSessions = [...athlete.sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Build chart data from all sessions (chronological)
  const chronoSessions = [...athlete.sessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const scoreMap: Record<string, number> = { poor: 1, average: 2, good: 3, excellent: 4 };
  const chartData = chronoSessions.map(s => {
    const ev = evaluateSession(s, athlete);
    return {
      label: s.label.split('—')[0].trim() || formatDate(s.date),
      score: scoreMap[ev.overallLevel],
      level: LEVEL_LABELS[ev.overallLevel],
    };
  });

  const handleDelete = () => {
    if (window.confirm(`آیا مطمئن هستید که می‌خواهید پروفایل ${athlete.firstName} ${athlete.lastName} را حذف کنید؟`)) {
      onDeleteAthlete();
    }
  };

  return (
    <div className="max-w-3xl space-y-5 pb-20 lg:pb-0">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
        style={{ color: 'var(--muted-foreground)', ...F }}
      >
        <ArrowRight className="w-4 h-4" />
        بازگشت به لیست
      </button>

      {/* Profile card */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--card)', border: '1px solid rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{
              background: athlete.gender === 'male' ? 'rgba(27,94,54,0.15)' : 'rgba(236,72,153,0.2)',
              color: athlete.gender === 'male' ? '#2e8b57' : '#f472b6',
              fontFamily: 'Vazirmatn',
            }}
          >
            {athlete.firstName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)', ...F }}>
              {athlete.firstName} {athlete.lastName}
            </h2>
            <div className="flex flex-wrap gap-3 mt-2">
              <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)', ...F }}>
                <Trophy className="w-3.5 h-3.5" />
                {athlete.sport} · {SPORT_LEVEL_LABELS[athlete.sportLevel]}
              </span>
              <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)', ...F }}>
                <Calendar className="w-3.5 h-3.5" />
                {age} سال · {athlete.gender === 'male' ? 'آقا' : 'خانم'}
              </span>
              {athlete.mobile && (
                <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)', ...F }}>
                  <Phone className="w-3.5 h-3.5" />
                  {athlete.mobile}
                </span>
              )}
            </div>
            {athlete.injuryHistory && (
              <p className="text-xs mt-2 px-2.5 py-1.5 rounded-lg inline-block" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', ...F }}>
                ⚠️ {athlete.injuryHistory}
              </p>
            )}
            {athlete.notes && (
              <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)', ...F }}>
                {athlete.notes}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
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
      </div>

      {/* Progress chart */}
      {chartData.length >= 2 && (
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--card)', border: '1px solid rgba(0,0,0,0.08)' }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)', ...F }}>
            روند پیشرفت
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'Vazirmatn' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 4]}
                ticks={[1, 2, 3, 4]}
                tickFormatter={v => ['', 'ضعیف', 'متوسط', 'خوب', 'عالی'][v]}
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'Vazirmatn' }}
                tickLine={false}
                axisLine={false}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--card)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 8,
                  fontFamily: 'Vazirmatn',
                  color: 'var(--foreground)',
                }}
                formatter={(v: number) => [['', 'ضعیف', 'متوسط', 'خوب', 'عالی'][v], 'سطح کلی']}
                labelFormatter={l => l}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#1b5e36"
                strokeWidth={2}
                dot={{ fill: '#1b5e36', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sessions */}
      <div
        className="rounded-2xl"
        style={{ background: 'var(--card)', border: '1px solid rgba(0,0,0,0.08)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'rgba(0,0,0,0.08)' }}
        >
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)', ...F }}>
            جلسات ارزیابی ({athlete.sessions.length})
          </h3>
          <button
            onClick={onNewSession}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
            style={{ background: 'rgba(27,94,54,0.15)', color: '#2e8b57', border: '1px solid rgba(27,94,54,0.3)', ...F }}
          >
            <Plus className="w-3.5 h-3.5" />
            جلسه جدید
          </button>
        </div>

        {sortedSessions.length === 0 ? (
          <div className="p-10 text-center">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: 'var(--muted-foreground)' }} />
            <p className="text-sm" style={{ color: 'var(--muted-foreground)', ...F }}>
              هنوز جلسه ارزیابی ثبت نشده است
            </p>
            <button
              onClick={onNewSession}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--primary)', color: '#fff', ...F }}
            >
              <Plus className="w-4 h-4" />
              ثبت اولین جلسه
            </button>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
            {sortedSessions.map((session, idx) => {
              const ev = evaluateSession(session, athlete);
              return (
                <div
                  key={session.id}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full ${LEVEL_DOT[ev.overallLevel]}`} />
                    {idx < sortedSessions.length - 1 && (
                      <div className="w-px flex-1 mt-1" style={{ background: 'rgba(0,0,0,0.1)', minHeight: 24 }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)', ...F }}>
                      {session.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', ...F }}>
                      {formatDate(session.date)} · {session.results.filter(r => r.value !== null).length} تست ثبت‌شده
                    </p>
                    {session.notes && (
                      <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)', ...F }}>
                        {session.notes}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-lg flex-shrink-0 ${LEVEL_BG[ev.overallLevel]}`} style={F}>
                    {LEVEL_LABELS[ev.overallLevel]}
                  </span>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => onViewSession(session.id)}
                      className="p-2 rounded-lg hover:bg-white/5 transition-all"
                      style={{ color: 'var(--muted-foreground)', border: '1px solid rgba(0,0,0,0.1)' }}
                      title="مشاهده نتایج"
                    >
                      <ClipboardList className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onViewReport(session.id)}
                      className="p-2 rounded-lg hover:bg-green-700/10 transition-all"
                      style={{ color: '#2e8b57', border: '1px solid rgba(27,94,54,0.15)' }}
                      title="گزارش"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
