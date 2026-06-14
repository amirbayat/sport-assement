import { Level, TestDefinition, StandardEntry, Athlete, AssessmentSession, TestResult } from './types';
import { TEST_DEFINITIONS } from './data';

export function getAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function computeBMI(height: number, weight: number): number {
  const h = height / 100;
  return Math.round((weight / (h * h)) * 10) / 10;
}

export function getTestDef(testId: string): TestDefinition | undefined {
  return TEST_DEFINITIONS.find(t => t.id === testId);
}

export function findStandard(
  def: TestDefinition,
  age: number,
  gender: 'male' | 'female'
): StandardEntry | undefined {
  return def.standards.find(
    s =>
      (s.gender === 'both' || s.gender === gender) &&
      age >= s.ageMin &&
      age <= s.ageMax
  );
}

export function evaluateValue(
  testId: string,
  value: number,
  age: number,
  gender: 'male' | 'female'
): Level | null {
  const def = getTestDef(testId);
  if (!def || def.standards.length === 0) return null;

  const std = findStandard(def, age, gender);
  if (!std) return null;

  // For BMI: special range evaluation (excellent is a middle range)
  if (testId === 'bmi') {
    if (value >= std.excellent.min && value <= std.excellent.max) return 'excellent';
    if (value >= std.good.min && value <= std.good.max) return 'good';
    if (value >= std.average.min && value <= std.average.max) return 'average';
    return 'poor';
  }

  // For range-based (lower is better) tests: agility, speed
  const lowerIsBetter = ['agility', 'speed'].includes(testId);

  if (lowerIsBetter) {
    if (value <= std.excellent.max) return 'excellent';
    if (value <= std.good.max) return 'good';
    if (value <= std.average.max) return 'average';
    return 'poor';
  }

  // Higher is better
  if (value >= std.excellent.min) return 'excellent';
  if (value >= std.good.min) return 'good';
  if (value >= std.average.min) return 'average';
  return 'poor';
}

export function getOverallLevel(levels: (Level | null)[]): Level {
  const valid = levels.filter(Boolean) as Level[];
  if (valid.length === 0) return 'average';
  const scores: Record<Level, number> = { poor: 1, average: 2, good: 3, excellent: 4 };
  const avg = valid.reduce((s, l) => s + scores[l], 0) / valid.length;
  if (avg >= 3.5) return 'excellent';
  if (avg >= 2.5) return 'good';
  if (avg >= 1.5) return 'average';
  return 'poor';
}

export function evaluateSession(
  session: AssessmentSession,
  athlete: Athlete
): { results: Array<{ testId: string; value: number | null; level: Level | null }>; overallLevel: Level } {
  const age = getAge(athlete.birthDate);
  const results = session.results.map(r => ({
    testId: r.testId,
    value: r.value,
    level: r.value !== null ? evaluateValue(r.testId, r.value, age, athlete.gender) : null,
  }));
  const levels = results.map(r => r.level);
  return { results, overallLevel: getOverallLevel(levels) };
}

export const LEVEL_LABELS: Record<Level, string> = {
  poor: 'ضعیف',
  average: 'متوسط',
  good: 'خوب',
  excellent: 'عالی',
};

export const LEVEL_COLORS: Record<Level, string> = {
  poor: 'text-red-400',
  average: 'text-yellow-400',
  good: 'text-blue-400',
  excellent: 'text-emerald-400',
};

export const LEVEL_BG: Record<Level, string> = {
  poor: 'bg-red-500/10 border border-red-500/30 text-red-400',
  average: 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400',
  good: 'bg-blue-500/10 border border-blue-500/30 text-blue-400',
  excellent: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400',
};

export const LEVEL_DOT: Record<Level, string> = {
  poor: 'bg-red-400',
  average: 'bg-yellow-400',
  good: 'bg-blue-400',
  excellent: 'bg-emerald-400',
};

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function getSummary(
  evaluatedResults: Array<{ testId: string; level: Level | null }>,
  _gender: 'male' | 'female',
  _age: number
): { strengths: string[]; weaknesses: string[]; recommendations: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  const nameMap: Record<string, string> = {
    vertical_jump: 'پرش عمودی',
    agility: 'چابکی',
    balance: 'تعادل',
    flexibility: 'انعطاف',
    grip_strength: 'قدرت دست',
    speed: 'سرعت',
    endurance: 'استقامت',
    bmi: 'شاخص توده بدنی',
    body_fat: 'درصد چربی',
  };

  const recMap: Record<string, string> = {
    vertical_jump: 'تمرینات پلیومتریک و پرش برای بهبود توان انفجاری',
    agility: 'تمرینات نردبانی و مخروطی برای افزایش چابکی',
    balance: 'تمرینات تعادلی روی تخته تعادل و یوگا',
    flexibility: 'کشش منظم و تمرینات یوگا برای افزایش انعطاف',
    grip_strength: 'تمرینات تقویت ساعد و گرفتن دمبل',
    speed: 'تمرینات دوهای سرعتی و تناوبی برای افزایش سرعت',
    endurance: 'دویدن تداومی و تمرینات هوازی برای بهبود استقامت',
    bmi: 'بازبینی رژیم غذایی و تعادل کالری دریافتی',
    body_fat: 'رژیم غذایی متعادل و تمرینات هوازی برای کاهش چربی',
  };

  for (const r of evaluatedResults) {
    const name = nameMap[r.testId];
    if (!name) continue;
    if (r.level === 'excellent' || r.level === 'good') {
      strengths.push(name);
    } else if (r.level === 'poor' || r.level === 'average') {
      weaknesses.push(name);
      const rec = recMap[r.testId];
      if (rec) recommendations.push(rec);
    }
  }

  return { strengths, weaknesses, recommendations };
}
