import { StandardEntry, TestDefinition } from '../types';
import { TEST_DEFINITIONS } from '../data';

const STORAGE_KEY = 'sports-assessment-standards';

type StandardsMap = Record<string, StandardEntry[]>;

export function loadCustomStandards(): StandardsMap {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

export function saveCustomStandards(map: StandardsMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

export function getEffectiveTestDefinitions(): TestDefinition[] {
  const custom = loadCustomStandards();
  return TEST_DEFINITIONS.map(def => {
    if (custom[def.id] !== undefined) {
      return { ...def, standards: custom[def.id] };
    }
    return def;
  });
}
