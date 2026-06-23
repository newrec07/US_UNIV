import type { DataSourceType } from './provenance.js';

export interface TimePoint<T> {
  at: string;
  value: T;
  source?: DataSourceType;
}

export type Trend = 'rising' | 'stable' | 'declining' | 'mixed' | 'too_early';

export interface TimedNote {
  date?: string;
  text: string;
}
