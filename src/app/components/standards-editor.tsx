import { useState, useEffect } from 'react';
import {
  ChevronLeft, Plus, Trash2, Save, RotateCcw, CheckCircle,
  AlertCircle, Info, ChevronDown,
} from 'lucide-react';
import { StandardEntry, TestDefinition } from '../types';
import { TEST_DEFINITIONS } from '../data';
import { loadCustomStandards, saveCustomStandards } from '../utils/standards-storage';

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
  onBack: () => void;
}

type RangeField = 'poor' | 'average' | 'good' | 'excellent';
type MinMax = 'min' | 'max';

interface RowDraft extends StandardEntry {
  _key: string;
}

function makeKey() {
  return Math.random().toString(36).slice(2);
}

function emptyRow(): RowDraft {
  return {
    _key: makeKey(),
    gender: 'both',
    ageMin: 10,
    ageMax: 99,
    poor: { min: 0, max: 0 },
    average: { min: 0, max: 0 },
    good: { min: 0, max: 0 },
    excellent: { min: 0, max: 0 },
  };
}

function toRows(entries: StandardEntry[]): RowDraft[] {
  return entries.map(e => ({ ...e, _key: makeKey() }));
}

function fromRows(rows: RowDraft[]): StandardEntry[] {
  return rows.map(({ _key: _, ...rest }) => rest);
}

export function StandardsEditor({ onBack }: Props) {
  const [activeCategory, setActiveCategory] = useState('body');
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, RowDraft[]>>({});
  const [savedTests, setSavedTests] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  // Load existing custom standards into drafts on mount
  useEffect(() => {
    const custom = loadCustomStandards();
    const initial: Record<string, RowDraft[]> = {};
    TEST_DEFINITIONS.forEach(def => {
      const source = custom[def.id] ?? def.standards;
      if (source.length > 0) {
        initial[def.id] = toRows(source);
      }
    });
    setDrafts(initial);
  }, []);

  const categoryTests = TEST_DEFINITIONS.filter(d => d.category === activeCategory);
  const selectedDef = TEST_DEFINITIONS.find(d => d.id === selectedTestId);
  const rows = selectedTestId ? (drafts[selectedTestId] ?? []) : [];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSelectTest = (id: string) => {
    setSelectedTestId(id);
  };

  const addRow = () => {
    if (!selectedTestId) return;
    setDrafts(prev => ({
      ...prev,
      [selectedTestId]: [...(prev[selectedTestId] ?? []), emptyRow()],
    }));
  };

  const deleteRow = (key: string) => {
    if (!selectedTestId) return;
    setDrafts(prev => ({
      ...prev,
      [selectedTestId]: (prev[selectedTestId] ?? []).filter(r => r._key !== key),
    }));
  };

  const updateRow = (key: string, field: keyof RowDraft, value: unknown) => {
    if (!selectedTestId) return;
    setDrafts(prev => ({
      ...prev,
      [selectedTestId]: (prev[selectedTestId] ?? []).map(r =>
        r._key === key ? { ...r, [field]: value } : r
      ),
    }));
  };

  const updateRange = (key: string, range: RangeField, side: MinMax, raw: string) => {
    const num = parseFloat(raw);
    if (isNaN(num)) return;
    if (!selectedTestId) return;
    setDrafts(prev => ({
      ...prev,
      [selectedTestId]: (prev[selectedTestId] ?? []).map(r =>
        r._key === key ? { ...r, [range]: { ...r[range], [side]: num } } : r
      ),
    }));
  };

  const resetTest = () => {
    if (!selectedTestId) return;
    const def = TEST_DEFINITIONS.find(d => d.id === selectedTestId);
    if (!def) return;
    setDrafts(prev => ({ ...prev, [selectedTestId]: toRows(def.standards) }));
    setSavedTests(prev => { const s = new Set(prev); s.delete(selectedTestId); return s; });
    showToast('استانداردها به پیش‌فرض بازگشتند');
  };

  const saveTest = () => {
    if (!selectedTestId) return;
    const custom = loadCustomStandards();
    custom[selectedTestId] = fromRows(rows);
    saveCustomStandards(custom);
    setSavedTests(prev => new Set([...prev, selectedTestId]));
    showToast('استانداردها ذخیره شدند ✓');
  };

  const saveAll = () => {
    const custom = loadCustomStandards();
    Object.entries(drafts).forEach(([id, rows]) => {
      custom[id] = fromRows(rows);
    });
    saveCustomStandards(custom);
    const allIds = new Set(TEST_DEFINITIONS.map(d => d.id));
    setSavedTests(allIds);
    showToast('تمام استانداردها ذخیره شدند ✓');
  };

  const hasRows = rows.length > 0;

  return (
    <div className="space-y-5 pb-20 lg:pb-0" style={F}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm transition-all px-3 py-1.5 rounded-lg"
          style={{ color: 'var(--muted-foreground)', background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <ChevronLeft className="w-4 h-4" />
          بازگشت
        </button>
        <button
          onClick={saveAll}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-all hover:opacity-90"
          style={{ background: 'var(--primary)', color: '#fff' }}
        >
          <Save className="w-4 h-4" />
          ذخیره همه
        </button>
      </div>

      {/* Info banner */}
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(27,94,54,0.08)', border: '1px solid rgba(27,94,54,0.2)' }}
      >
        <Info className="w-4 h-4 text-green-700 mt-0.5 flex-shrink-0" />
        <p className="text-xs" style={{ color: 'var(--foreground)' }}>
          در این صفحه می‌توانید برای هر تست، استانداردهای ارزیابی (محدوده ضعیف / متوسط / خوب / عالی) را بر اساس گروه سنی و جنسیت تعریف کنید. این استانداردها هنگام ارزیابی نتایج به‌صورت خودکار اعمال می‌شوند.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left panel: test list */}
        <div className="lg:w-64 flex-shrink-0">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {Object.entries(CATEGORIES).map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setActiveCategory(key); setSelectedTestId(null); }}
                className="px-2.5 py-1 rounded-lg text-xs transition-all"
                style={{
                  background: activeCategory === key ? 'var(--primary)' : 'var(--card)',
                  color: activeCategory === key ? '#fff' : 'var(--muted-foreground)',
                  border: activeCategory === key ? '1px solid var(--primary)' : '1px solid var(--border)',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
          >
            {categoryTests.map((def, idx) => {
              const isActive = selectedTestId === def.id;
              const hasDraft = (drafts[def.id]?.length ?? 0) > 0;
              const isSaved = savedTests.has(def.id);
              return (
                <button
                  key={def.id}
                  onClick={() => handleSelectTest(def.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm transition-all text-right"
                  style={{
                    background: isActive ? 'rgba(27,94,54,0.1)' : 'transparent',
                    borderBottom: idx < categoryTests.length - 1 ? '1px solid var(--border)' : 'none',
                    borderRight: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-medium truncate"
                      style={{ color: isActive ? 'var(--primary)' : 'var(--foreground)' }}
                    >
                      {def.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      {def.unit}
                    </p>
                  </div>
                  {isSaved ? (
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mr-2" style={{ color: '#2e8b57' }} />
                  ) : hasDraft ? (
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 mr-2"
                      style={{ background: '#e07828' }}
                    />
                  ) : (
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 mr-2"
                      style={{ background: 'rgba(0,0,0,0.15)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right panel: editor */}
        <div className="flex-1 min-w-0">
          {!selectedTestId ? (
            <div
              className="rounded-2xl p-10 text-center"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <ChevronDown className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--muted-foreground)' }} />
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                یک تست از لیست سمت راست انتخاب کنید
              </p>
            </div>
          ) : (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              {/* Test header */}
              <div
                className="px-5 py-4 border-b flex items-center justify-between"
                style={{ borderColor: 'var(--border)', background: 'rgba(27,94,54,0.04)' }}
              >
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                    {selectedDef?.name}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {selectedDef?.description} — واحد: {selectedDef?.unit}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetTest}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
                    style={{ color: 'var(--muted-foreground)', border: '1px solid var(--border)', background: 'transparent' }}
                    title="بازگشت به پیش‌فرض"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    ریست
                  </button>
                  <button
                    onClick={saveTest}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
                    style={{ background: 'var(--primary)', color: '#fff' }}
                  >
                    <Save className="w-3.5 h-3.5" />
                    ذخیره
                  </button>
                </div>
              </div>

              {/* Rows */}
              <div className="p-4 space-y-3">
                {!hasRows && (
                  <div
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs"
                    style={{ background: 'rgba(224,120,40,0.08)', border: '1px solid rgba(224,120,40,0.2)', color: '#e07828' }}
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    هنوز استانداردی تعریف نشده. با دکمه «افزودن ردیف» شروع کنید.
                  </div>
                )}

                {rows.map((row, idx) => (
                  <StandardRow
                    key={row._key}
                    row={row}
                    index={idx}
                    onDelete={() => deleteRow(row._key)}
                    onUpdateField={(field, val) => updateRow(row._key, field, val)}
                    onUpdateRange={(range, side, val) => updateRange(row._key, range, side, val)}
                  />
                ))}

                <button
                  onClick={addRow}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-all"
                  style={{
                    border: '2px dashed rgba(27,94,54,0.3)',
                    color: 'var(--primary)',
                    background: 'rgba(27,94,54,0.03)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(27,94,54,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(27,94,54,0.03)')}
                >
                  <Plus className="w-4 h-4" />
                  افزودن ردیف سنی
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm"
          style={{ background: 'var(--primary)', color: '#fff', ...F }}
        >
          <CheckCircle className="w-4 h-4" />
          {toast}
        </div>
      )}
    </div>
  );
}

// ---- Single standard row editor ----

interface RowProps {
  row: RowDraft;
  index: number;
  onDelete: () => void;
  onUpdateField: (field: keyof RowDraft, value: unknown) => void;
  onUpdateRange: (range: RangeField, side: MinMax, value: string) => void;
}

function StandardRow({ row, index, onDelete, onUpdateField, onUpdateRange }: RowProps) {
  const inputCls = "w-full px-2 py-1.5 rounded-lg text-xs outline-none transition-all text-center font-mono";
  const inputStyle = {
    background: 'var(--input-background)',
    border: '1px solid var(--border)',
    color: 'var(--foreground)',
  };

  const levelConfig: { key: RangeField; label: string; color: string; bg: string }[] = [
    { key: 'poor', label: 'ضعیف', color: '#dc2626', bg: 'rgba(220,38,38,0.06)' },
    { key: 'average', label: 'متوسط', color: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
    { key: 'good', label: 'خوب', color: '#1b5e36', bg: 'rgba(27,94,54,0.06)' },
    { key: 'excellent', label: 'عالی', color: '#10b981', bg: 'rgba(16,185,129,0.06)' },
  ];

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ border: '1px solid var(--border)', background: 'var(--background)' }}
    >
      {/* Row header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
          ردیف {index + 1}
        </span>
        <button
          onClick={onDelete}
          className="p-1 rounded-lg transition-all"
          style={{ color: '#dc2626' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Gender + age range */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>جنسیت</label>
          <select
            value={row.gender}
            onChange={e => onUpdateField('gender', e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
            style={{ ...inputStyle, fontFamily: 'Vazirmatn, sans-serif' }}
          >
            <option value="both">هر دو</option>
            <option value="male">آقایان</option>
            <option value="female">خانم‌ها</option>
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>سن از</label>
          <input
            type="number"
            value={row.ageMin}
            onChange={e => onUpdateField('ageMin', Number(e.target.value))}
            className={inputCls}
            style={inputStyle}
            min={1}
            max={99}
          />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>سن تا</label>
          <input
            type="number"
            value={row.ageMax}
            onChange={e => onUpdateField('ageMax', Number(e.target.value))}
            className={inputCls}
            style={inputStyle}
            min={1}
            max={99}
          />
        </div>
      </div>

      {/* Level ranges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {levelConfig.map(({ key, label, color, bg }) => (
          <div
            key={key}
            className="rounded-lg p-2.5 space-y-1.5"
            style={{ background: bg, border: `1px solid ${color}22` }}
          >
            <p className="text-xs font-semibold text-center" style={{ color }}>
              {label}
            </p>
            <div className="space-y-1">
              <div>
                <label className="block text-xs mb-0.5" style={{ color: 'var(--muted-foreground)' }}>از</label>
                <input
                  type="number"
                  step="0.1"
                  value={row[key].min}
                  onChange={e => onUpdateRange(key, 'min', e.target.value)}
                  className={inputCls}
                  style={{ ...inputStyle, fontSize: '11px' }}
                />
              </div>
              <div>
                <label className="block text-xs mb-0.5" style={{ color: 'var(--muted-foreground)' }}>تا</label>
                <input
                  type="number"
                  step="0.1"
                  value={row[key].max}
                  onChange={e => onUpdateRange(key, 'max', e.target.value)}
                  className={inputCls}
                  style={{ ...inputStyle, fontSize: '11px' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
