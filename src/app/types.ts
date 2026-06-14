export type Level = 'poor' | 'average' | 'good' | 'excellent';

export interface LevelRange {
  min: number;
  max: number;
}

export interface StandardEntry {
  gender: 'male' | 'female' | 'both';
  ageMin: number;
  ageMax: number;
  excellent: LevelRange;
  good: LevelRange;
  average: LevelRange;
  poor: LevelRange;
}

export interface TestDefinition {
  id: string;
  name: string;
  unit: string;
  description: string;
  category: 'body' | 'power' | 'speed' | 'endurance' | 'flexibility' | 'balance';
  isComputed?: boolean;
  computeFrom?: string[];
  standards: StandardEntry[];
}

export type SportLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional';

export interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  birthDate: string;
  gender: 'male' | 'female';
  sport: string;
  sportLevel: SportLevel;
  injuryHistory: string;
  notes: string;
  createdAt: string;
  sessions: AssessmentSession[];
}

export interface AssessmentSession {
  id: string;
  date: string;
  label: string;
  results: TestResult[];
  notes: string;
}

export interface TestResult {
  testId: string;
  value: number | null;
}

export type View =
  | 'login'
  | 'dashboard'
  | 'athletes'
  | 'athlete-new'
  | 'athlete-edit'
  | 'athlete-profile'
  | 'session-new'
  | 'session-edit'
  | 'session-detail'
  | 'standards'
  | 'standards-edit'
  | 'report';

export interface NavState {
  view: View;
  athleteId?: string;
  sessionId?: string;
}
