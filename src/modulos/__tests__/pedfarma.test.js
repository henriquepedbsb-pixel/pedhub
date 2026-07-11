import { describe, it, expect } from 'vitest';
import { calcularDose, DRUGS } from '../pedfarma.jsx';

const drug = (id) => DRUGS.find((d) => d.id === id).calc;

describe('calcularDose — guardas', () => {
  it('retorna null sem fármaco ou peso inválido', () => {
    expect(calcularDose(null, 10)).toBeNull();
    expect(calcularDose(drug('amoxicilina'), 0)).toBeNull();
    expect(calcularDose(drug('amoxicilina'), -3)).toBeNull();
    expect(calcularDose(drug('amoxicilina'), null)).toBeNull();
  });
});

describe('calcularDose — dosagem por DIA (amoxicilina 40–90 mg/kg/dia)', () => {
  const amox = drug('amoxicilina');

  it('criança de 10 kg: mg/dia e fracionamento por tomada', () => {
    const r = calcularDose(amox, 10);
    expect(r.modo).toBe('dia');
    expect(r.diaMin).toBe(400);
    expect(r.diaMax).toBe(900);
    expect(r.excedeuTeto).toBe(false);
    // 2 tomadas → 200–450 mg/dose ; 3 tomadas → 133,3–300 mg/dose
    expect(r.porTomada).toEqual([
      { tomadas: 2, min: 200, max: 450, alvo: null },
      { tomadas: 3, min: 133.3, max: 300, alvo: null },
    ]);
  });

  it('volume da suspensão 250 mg/5 mL (3 tomadas): 2,7–6 mL/dose', () => {
    const r = calcularDose(amox, 10);
    const susp250 = r.volumes.find((v) => v.label === '250 mg/5 mL');
    expect(susp250.mlMin).toBe(2.7);
    expect(susp250.mlMax).toBe(6);
    expect(susp250.tomadas).toBe(3);
  });

  it('teto diário: 40 kg → 3600 mg/dia excede 3 g/dia', () => {
    expect(calcularDose(amox, 40).excedeuTeto).toBe(true);
  });

  it('dose-alvo escolhida propaga para mg e mL', () => {
    const r = calcularDose(amox, 10, 50); // 50 mg/kg/dia
    expect(r.diaAlvo).toBe(500);
    expect(r.porTomada[0].alvo).toBe(250); // 500/2
  });
});

describe('calcularDose — dosagem por DOSE (paracetamol 10–15 mg/kg/dose)', () => {
  const para = drug('paracetamol');

  it('criança de 10 kg: 100–150 mg/dose', () => {
    const r = calcularDose(para, 10);
    expect(r.modo).toBe('dose');
    expect(r.doseMin).toBe(100);
    expect(r.doseMax).toBe(150);
    expect(r.excedeuTeto).toBe(false);
  });

  it('gotas 200 mg/mL: 0,5–0,75 mL → 10–15 gotas', () => {
    const r = calcularDose(para, 10);
    const gotas = r.volumes.find((v) => v.gotas);
    expect(gotas.mlMin).toBe(0.5);
    expect(gotas.mlMax).toBe(0.75);
    expect(gotas.gtMin).toBe(10);
    expect(gotas.gtMax).toBe(15);
  });

  it('teto diário absoluto: peso alto → excede 4 g/dia', () => {
    // 100 kg × 15 mg/kg × 4 tomadas = 6000 mg/dia > 4000
    expect(calcularDose(para, 100).excedeuTeto).toBe(true);
  });
});

describe('calcularDose — consistência em TODO o catálogo', () => {
  it('nenhum fármaco quebra e mg/dose ≤ mg/dia', () => {
    for (const d of DRUGS) {
      if (!d.calc) continue;
      const r = calcularDose(d.calc, 12);
      expect(r, `${d.id} retornou null`).not.toBeNull();
      if (r.modo === 'dia') {
        expect(r.diaMax).toBeGreaterThanOrEqual(r.diaMin);
        // cada dose fracionada nunca supera o total diário
        for (const t of r.porTomada) expect(t.max).toBeLessThanOrEqual(r.diaMax + 0.05);
      } else {
        expect(r.doseMax).toBeGreaterThanOrEqual(r.doseMin);
      }
    }
  });
});
