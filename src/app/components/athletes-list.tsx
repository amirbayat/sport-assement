import { useState } from 'react';
import { Plus, Search, ChevronLeft, User } from 'lucide-react';
import { Athlete } from '../types';
import { getAge, formatDate, evaluateSession, LEVEL_BG, LEVEL_LABELS } from '../utils';
import { SPORT_LEVEL_LABELS } from '../data';

interface Props {
  athletes: Athlete[];
  onViewAthlete: (id: string) => void;
  onNewAthlete: () => void;
}

const F = { fontFamily: 'Vazirmatn, sans-serif' };

export function AthletesList({ athletes, onViewAthlete, onNewAthlete }: Props) {
  const [search, setSearch] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  const [filterSport, setFilterSport] = useState('all');

  const sports = Array.from(new Set(athletes.map(a => a.sport)));

  const filtered = athletes.filter(a => {
    const fullName = `${a.firstName} ${a.lastName}`;
    const matchSearch = !search || fullName.includes(search) || a.mobile.includes(search) || a.sport.includes(search);
    const matchGender = filterGender === 'all' || a.gender === filterGender;
    const matchSport = filterSport === 'all' || a.sport === filterSport;
    return matchSearch && matchGender && matchSport;
  });

  const getLastSessionLevel = (athlete: Athlete) => {
    if (athlete.sessions.length === 0) return null;
    const lastSession = [...athlete.sessions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    const ev = evaluateSession(lastSession, athlete);
    return ev.overallLevel;
  };

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      {/* Header actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            placeholder="جستجو بر اساس نام، موبایل یا رشته ورزشی..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pr-9 pl-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: 'var(--card)',
              border: '1px solid rgba(0,0,0,0.1)',
              color: 'var(--foreground)',
              ...F,
            }}
          />
        </div>
        <button
          onClick={onNewAthlete}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap hover:opacity-90 active:scale-[0.98] transition-all"
          style={{ background: 'var(--primary)', color: '#fff', ...F }}
        >
          <Plus className="w-4 h-4" />
          ورزشکار جدید
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterGender('all')}
          className="px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{
            background: filterGender === 'all' ? 'rgba(27,94,54,0.15)' : 'var(--card)',
            color: filterGender === 'all' ? '#2e8b57' : 'var(--muted-foreground)',
            border: filterGender === 'all' ? '1px solid rgba(27,94,54,0.35)' : '1px solid rgba(0,0,0,0.08)',
            ...F,
          }}
        >
          همه
        </button>
        <button
          onClick={() => setFilterGender('male')}
          className="px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{
            background: filterGender === 'male' ? 'rgba(27,94,54,0.15)' : 'var(--card)',
            color: filterGender === 'male' ? '#2e8b57' : 'var(--muted-foreground)',
            border: filterGender === 'male' ? '1px solid rgba(27,94,54,0.35)' : '1px solid rgba(0,0,0,0.08)',
            ...F,
          }}
        >
          آقایان
        </button>
        <button
          onClick={() => setFilterGender('female')}
          className="px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{
            background: filterGender === 'female' ? 'rgba(27,94,54,0.15)' : 'var(--card)',
            color: filterGender === 'female' ? '#2e8b57' : 'var(--muted-foreground)',
            border: filterGender === 'female' ? '1px solid rgba(27,94,54,0.35)' : '1px solid rgba(0,0,0,0.08)',
            ...F,
          }}
        >
          خانم‌ها
        </button>
        {sports.length > 0 && (
          <select
            value={filterSport}
            onChange={e => setFilterSport(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs outline-none"
            style={{
              background: 'var(--card)',
              color: 'var(--muted-foreground)',
              border: '1px solid rgba(0,0,0,0.08)',
              ...F,
            }}
          >
            <option value="all">همه رشته‌ها</option>
            {sports.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>

      {/* Athletes count */}
      <p className="text-xs" style={{ color: 'var(--muted-foreground)', ...F }}>
        {filtered.length} ورزشکار
      </p>

      {/* Athletes grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(athlete => {
            const age = getAge(athlete.birthDate);
            const lastLevel = getLastSessionLevel(athlete);
            const lastSession = athlete.sessions.length > 0
              ? [...athlete.sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
              : null;

            return (
              <button
                key={athlete.id}
                onClick={() => onViewAthlete(athlete.id)}
                className="text-right rounded-2xl p-5 transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: 'var(--card)',
                  border: '1px solid rgba(0,0,0,0.08)',
                }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                    style={{
                      background: athlete.gender === 'male' ? 'rgba(27,94,54,0.15)' : 'rgba(236,72,153,0.2)',
                      color: athlete.gender === 'male' ? '#2e8b57' : '#f472b6',
                      fontFamily: 'Vazirmatn',
                    }}
                  >
                    {athlete.firstName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold" style={{ color: 'var(--foreground)', ...F }}>
                      {athlete.firstName} {athlete.lastName}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', ...F }}>
                      {athlete.sport} · {age} سال · {athlete.gender === 'male' ? 'آقا' : 'خانم'}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', ...F }}>
                      سطح: {SPORT_LEVEL_LABELS[athlete.sportLevel]}
                    </p>
                  </div>
                  {lastLevel && (
                    <span className={`text-xs px-2 py-1 rounded-lg flex-shrink-0 ${LEVEL_BG[lastLevel]}`} style={F}>
                      {LEVEL_LABELS[lastLevel]}
                    </span>
                  )}
                </div>

                <div
                  className="flex items-center justify-between pt-3 border-t"
                  style={{ borderColor: 'rgba(0,0,0,0.08)' }}
                >
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)', ...F }}>
                    {athlete.sessions.length} جلسه ارزیابی
                    {lastSession && ` · آخرین: ${formatDate(lastSession.date)}`}
                  </p>
                  <ChevronLeft className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'var(--card)', border: '1px solid rgba(0,0,0,0.08)' }}
        >
          <User className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: 'var(--muted-foreground)' }} />
          {search ? (
            <p className="text-sm" style={{ color: 'var(--muted-foreground)', ...F }}>
              نتیجه‌ای برای "{search}" یافت نشد
            </p>
          ) : (
            <>
              <p className="text-base font-medium mb-1" style={{ color: 'var(--foreground)', ...F }}>
                هنوز ورزشکاری ثبت نشده است
              </p>
              <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)', ...F }}>
                اولین پروفایل ورزشکار را بسازید
              </p>
              <button
                onClick={onNewAthlete}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--primary)', color: '#fff', ...F }}
              >
                <Plus className="w-4 h-4" />
                ورزشکار جدید
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
