import { describe, it, expect } from 'vitest';
import { getThompsonClass } from '../hipotermia.jsx';

describe('Thompson (EHI): ≤6 Leve · 7–14 Moderada · ≥15 Grave', () => {
  it('classifica e indica candidatura à hipotermia (cooling)', () => {
    expect(getThompsonClass(6)).toMatchObject({ label: 'EHI Leve', cooling: false });
    expect(getThompsonClass(7)).toMatchObject({ label: 'EHI Moderada', cooling: true });
    expect(getThompsonClass(14)).toMatchObject({ label: 'EHI Moderada', cooling: true });
    expect(getThompsonClass(15)).toMatchObject({ label: 'EHI Grave', cooling: true });
  });
  it('null (score incompleto) → null', () => {
    expect(getThompsonClass(null)).toBeNull();
  });
});
