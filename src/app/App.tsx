import { useState, useEffect } from 'react';
import { Athlete, AssessmentSession, View } from './types';
import { INITIAL_ATHLETES } from './data';
import { generateId } from './utils';
import { LoginPage } from './components/login-page';
import { Layout } from './components/layout';
import { Dashboard } from './components/dashboard';
import { AthletesList } from './components/athletes-list';
import { AthleteForm } from './components/athlete-form';
import { AthleteProfile } from './components/athlete-profile';
import { SessionForm } from './components/session-form';
import { SessionDetail } from './components/session-detail';
import { StandardsPage } from './components/standards-page';
import { StandardsEditor } from './components/standards-editor';
import { Report } from './components/report';

const STORAGE_KEY = 'sports-assessment-athletes';

function loadAthletes(): Athlete[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return INITIAL_ATHLETES;
}

function saveAthletes(athletes: Athlete[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(athletes));
  } catch {}
}

const PAGE_TITLES: Partial<Record<View, string>> = {
  dashboard: 'داشبورد',
  athletes: 'ورزشکاران',
  'athlete-new': 'ثبت ورزشکار جدید',
  'athlete-edit': 'ویرایش پروفایل ورزشکار',
  'athlete-profile': 'پروفایل ورزشکار',
  'session-new': 'ثبت جلسه ارزیابی',
  'session-edit': 'ویرایش جلسه ارزیابی',
  'session-detail': 'نتایج ارزیابی',
  standards: 'استانداردهای تست‌ها',
  'standards-edit': 'ویرایش استانداردها',
  report: 'گزارش ارزیابی',
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState<View>('dashboard');
  const [athletes, setAthletes] = useState<Athlete[]>(loadAthletes);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  useEffect(() => {
    saveAthletes(athletes);
  }, [athletes]);

  const selectedAthlete = athletes.find(a => a.id === selectedAthleteId) ?? null;
  const selectedSession = selectedAthlete?.sessions.find(s => s.id === selectedSessionId) ?? null;

  const navigate = (v: View, athleteId?: string, sessionId?: string) => {
    setView(v);
    if (athleteId !== undefined) setSelectedAthleteId(athleteId);
    if (sessionId !== undefined) setSelectedSessionId(sessionId);
  };

  // Athlete operations
  const saveAthlete = (athlete: Athlete) => {
    setAthletes(prev => {
      const exists = prev.find(a => a.id === athlete.id);
      return exists
        ? prev.map(a => a.id === athlete.id ? athlete : a)
        : [...prev, athlete];
    });
    setSelectedAthleteId(athlete.id);
    setView('athlete-profile');
  };

  const deleteAthlete = (id: string) => {
    setAthletes(prev => prev.filter(a => a.id !== id));
    setView('athletes');
    setSelectedAthleteId(null);
  };

  // Session operations
  const saveSession = (session: AssessmentSession) => {
    if (!selectedAthleteId) return;
    setAthletes(prev => prev.map(a => {
      if (a.id !== selectedAthleteId) return a;
      const exists = a.sessions.find(s => s.id === session.id);
      return {
        ...a,
        sessions: exists
          ? a.sessions.map(s => s.id === session.id ? session : s)
          : [...a.sessions, session],
      };
    }));
    setSelectedSessionId(session.id);
    setView('session-detail');
  };

  const deleteSession = (sessionId: string) => {
    if (!selectedAthleteId) return;
    setAthletes(prev => prev.map(a => {
      if (a.id !== selectedAthleteId) return a;
      return { ...a, sessions: a.sessions.filter(s => s.id !== sessionId) };
    }));
    setSelectedSessionId(null);
    setView('athlete-profile');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  const pageTitle = PAGE_TITLES[view] ?? 'سیستم ارزیابی';

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard
            athletes={athletes}
            onViewAthlete={id => navigate('athlete-profile', id)}
            onViewSession={(athleteId, sessionId) => navigate('session-detail', athleteId, sessionId)}
          />
        );

      case 'athletes':
        return (
          <AthletesList
            athletes={athletes}
            onViewAthlete={id => navigate('athlete-profile', id)}
            onNewAthlete={() => navigate('athlete-new')}
          />
        );

      case 'athlete-new':
        return (
          <AthleteForm
            onSave={saveAthlete}
            onBack={() => navigate('athletes')}
          />
        );

      case 'athlete-edit':
        if (!selectedAthlete) return <div />;
        return (
          <AthleteForm
            existingAthlete={selectedAthlete}
            onSave={saveAthlete}
            onBack={() => navigate('athlete-profile', selectedAthleteId ?? undefined)}
          />
        );

      case 'athlete-profile':
        if (!selectedAthlete) return <div />;
        return (
          <AthleteProfile
            athlete={selectedAthlete}
            onBack={() => navigate('athletes')}
            onEdit={() => navigate('athlete-edit', selectedAthleteId ?? undefined)}
            onNewSession={() => navigate('session-new', selectedAthleteId ?? undefined)}
            onViewSession={sessionId => navigate('session-detail', selectedAthleteId ?? undefined, sessionId)}
            onDeleteAthlete={() => deleteAthlete(selectedAthlete.id)}
            onViewReport={sessionId => navigate('report', selectedAthleteId ?? undefined, sessionId)}
          />
        );

      case 'session-new':
        if (!selectedAthlete) return <div />;
        return (
          <SessionForm
            athlete={selectedAthlete}
            onSave={saveSession}
            onBack={() => navigate('athlete-profile', selectedAthleteId ?? undefined)}
          />
        );

      case 'session-edit':
        if (!selectedAthlete || !selectedSession) return <div />;
        return (
          <SessionForm
            athlete={selectedAthlete}
            existingSession={selectedSession}
            onSave={saveSession}
            onBack={() => navigate('session-detail', selectedAthleteId ?? undefined, selectedSessionId ?? undefined)}
          />
        );

      case 'session-detail':
        if (!selectedAthlete || !selectedSession) return <div />;
        return (
          <SessionDetail
            athlete={selectedAthlete}
            session={selectedSession}
            onBack={() => navigate('athlete-profile', selectedAthleteId ?? undefined)}
            onEdit={() => navigate('session-edit', selectedAthleteId ?? undefined, selectedSessionId ?? undefined)}
            onDelete={() => deleteSession(selectedSession.id)}
            onViewReport={() => navigate('report', selectedAthleteId ?? undefined, selectedSessionId ?? undefined)}
          />
        );

      case 'report':
        if (!selectedAthlete || !selectedSession) return <div />;
        return (
          <Report
            athlete={selectedAthlete}
            session={selectedSession}
            onBack={() => navigate('session-detail', selectedAthleteId ?? undefined, selectedSessionId ?? undefined)}
          />
        );

      case 'standards':
        return <StandardsPage onEditStandards={() => navigate('standards-edit')} />;

      case 'standards-edit':
        return <StandardsEditor onBack={() => navigate('standards')} />;

      default:
        return <Dashboard athletes={athletes} onViewAthlete={id => navigate('athlete-profile', id)} onViewSession={(aid, sid) => navigate('session-detail', aid, sid)} />;
    }
  };

  return (
    <Layout
      currentView={view}
      onNavigate={v => navigate(v)}
      onLogout={() => setIsLoggedIn(false)}
      pageTitle={pageTitle}
    >
      {/* MARKER-MAKE-KIT-INVOKED */}
      {renderContent()}
    </Layout>
  );
}
