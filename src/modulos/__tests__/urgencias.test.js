// src/modulos/__tests__/urgencias.test.js
// Valores esperados calculados À MÃO a partir das doses por kg do próprio módulo
// (AHA PALS 2020 / SBP) — o teste confere a aritmética, os tetos e os mínimos.
import { describe, it, expect } from 'vitest';
import { calcDoses, estimarBroselow, parseAltura } from '../urgencias.jsx';

describe('calcDoses — criança de 10 kg (sem nenhum teto atingido)', () => {
  const d = calcDoses(10);
  it('PCR: adrenalina 0,01 mg/kg = 0,1 mg = 1 mL da solução 1:10.000', () => {
    expect(d.epiPCR_mg).toBe(0.1);
    expect(d.epiPCR_mL).toBe(1);
  });
  it('adrenalina endotraqueal 0,1 mg/kg = 1 mg', () => expect(d.epiET_mg).toBe(1));
  it('anafilaxia: adrenalina IM 0,01 mg/kg = 0,1 mg = 0,1 mL (1 mg/mL)', () => {
    expect(d.epiIM_mg).toBe(0.1);
    expect(d.epiIM_mL).toBe(0.1);
  });
  it('atropina 0,02 mg/kg = 0,2 mg = 0,4 mL (0,5 mg/mL)', () => {
    expect(d.atropina_mg).toBe(0.2);
    expect(d.atropina_mL).toBe(0.4);
  });
  it('adenosina 0,1 e 0,2 mg/kg (3 mg/mL)', () => {
    expect(d.adeno1_mg).toBe(1);
    expect(d.adeno1_mL).toBe(0.3);
    expect(d.adeno2_mg).toBe(2);
    expect(d.adeno2_mL).toBe(0.7);
  });
  it('desfibrilação 2 → 4 J/kg (máx 10 J/kg) e cardioversão 0,5 → 2 J/kg', () => {
    expect(d.desfib1_J).toBe(20);
    expect(d.desfib2_J).toBe(40);
    expect(d.desfibMax_J).toBe(100);
    expect(d.cardioSinc1_J).toBe(5);
    expect(d.cardioSinc2_J).toBe(20);
  });
  it('antiarrítmicos: amiodarona 5 mg/kg · lidocaína 1 mg/kg', () => {
    expect(d.amiodarona_mg).toBe(50);
    expect(d.lidocaina_mg).toBe(10);
  });
  it('benzodiazepínicos (5 mg/mL)', () => {
    expect(d.diazIV_mg).toBe(3);      // 0,3 mg/kg
    expect(d.diazIV_mL).toBe(0.6);
    expect(d.midaIN_mg).toBe(2);      // 0,2 mg/kg
    expect(d.midaIN_mL).toBe(0.4);
    expect(d.midaIV_mg).toBe(1.5);    // 0,15 mg/kg
    expect(d.midaIV_mL).toBe(0.3);
    expect(d.diazRetal_mg).toBe(5);   // 0,5 mg/kg
  });
  it('2ª linha da convulsão', () => {
    expect(d.fenobarbital_mg).toBe(200);  // 20 mg/kg · 100 mg/mL
    expect(d.fenobarbital_mL).toBe(2);
    expect(d.levetira_mg).toBe(600);      // 60 mg/kg · 100 mg/mL
    expect(d.levetira_mL).toBe(6);
    expect(d.fenitoina_mg).toBe(200);     // 20 mg/kg · 50 mg/mL
    expect(d.fenitoina_mL).toBe(4);
    expect(d.valproato_mg).toBe(400);     // 40 mg/kg
  });
  it('asma: salbutamol respeita o MÍNIMO de 2,5 mg (0,15 mg/kg daria 1,5 mg)', () => {
    expect(d.salbu_mg).toBe(2.5);
    expect(d.salbu_mL).toBe(0.5);         // 5 mg/mL
    expect(d.magnesio_mg).toBe(500);      // 50 mg/kg
    expect(d.magnesio_mL).toBe(5);        // sol. 10%
    expect(d.prednisolona_mg).toBe(10);   // 1 mg/kg
  });
  it('choque e CAD', () => {
    expect(d.bolus20).toBe(200);
    expect(d.bolus10).toBe(100);
    expect(d.glicose10).toBe(20);         // 2 mL/kg
    expect(d.ceftri_mg).toBe(1000);       // 100 mg/kg
    expect(d.insulina_uh).toBe(0.5);      // 0,05 U/kg/h
    expect(d.manitol_glo).toBe(5);        // 0,5 g/kg
    expect(d.manitol_ghi).toBe(10);       // 1 g/kg
    expect(d.manitol_mllo).toBe(25);      // manitol 20%
    expect(d.manitol_mlhi).toBe(50);
  });
});

describe('calcDoses — adolescente de 60 kg (tetos de dose)', () => {
  const d = calcDoses(60);
  it('adrenalina: PCR abaixo do teto de 1 mg; IM limitada a 0,5 mg; ET a 2,5 mg', () => {
    expect(d.epiPCR_mg).toBe(0.6);
    expect(d.epiPCR_mL).toBe(6);
    expect(d.epiIM_mg).toBe(0.5);
    expect(d.epiET_mg).toBe(2.5);
  });
  it('atropina: teto de 0,5 mg por dose também acima de 30 kg (AHA PALS 2020)', () => {
    expect(d.atropina_mg).toBe(0.5);
    expect(d.atropina_mL).toBe(1);
  });
  it('adenosina: tetos de 6 e 12 mg', () => {
    expect(d.adeno1_mg).toBe(6);
    expect(d.adeno2_mg).toBe(12);
  });
  it('energia: 4 J/kg limitada a 200 J; cardioversão a 100 J', () => {
    expect(d.desfib1_J).toBe(120);
    expect(d.desfib2_J).toBe(200);
    expect(d.desfibMax_J).toBe(200);
    expect(d.cardioSinc2_J).toBe(100);
  });
  it('tetos dos demais fármacos', () => {
    expect(d.amiodarona_mg).toBe(300);
    expect(d.diazIV_mg).toBe(10);
    expect(d.midaIN_mg).toBe(10);
    expect(d.diazRetal_mg).toBe(20);
    expect(d.fenobarbital_mg).toBe(1000);
    expect(d.fenitoina_mg).toBe(1000);
    expect(d.levetira_mg).toBe(3600);     // abaixo do teto de 4.500 mg
    expect(d.valproato_mg).toBe(2400);    // abaixo do teto de 3.000 mg
    expect(d.salbu_mg).toBe(5);
    expect(d.magnesio_mg).toBe(2000);
    expect(d.prednisolona_mg).toBe(40);
    expect(d.ceftri_mg).toBe(4000);
  });
});

describe('calcDoses — lactente de 3 kg (doses mínimas)', () => {
  const d = calcDoses(3);
  it('atropina respeita o mínimo de 0,1 mg (0,02 mg/kg daria 0,06 mg)', () => {
    expect(d.atropina_mg).toBe(0.1);
    expect(d.atropina_mL).toBe(0.2);
  });
  it('adrenalina na PCR: 0,03 mg = 0,3 mL', () => {
    expect(d.epiPCR_mg).toBe(0.03);
    expect(d.epiPCR_mL).toBe(0.3);
  });
  it('salbutamol mantém o mínimo de 2,5 mg', () => expect(d.salbu_mg).toBe(2.5));
  it('desfibrilação 2 J/kg = 6 J', () => expect(d.desfib1_J).toBe(6));
});

describe('calcDoses — atropina: teto único de 0,5 mg (AHA PALS 2020)', () => {
  it('24 kg ainda fica abaixo do teto (0,48 mg)', () => expect(calcDoses(24).atropina_mg).toBe(0.48));
  it('a partir de 25 kg a dose trava em 0,5 mg, em qualquer peso', () => {
    for (const kg of [25, 29, 30, 40, 60, 80]) {
      expect(calcDoses(kg).atropina_mg).toBe(0.5);
      expect(calcDoses(kg).atropina_mL).toBe(1);
    }
  });
});

describe('calcDoses — nenhum campo vaza NaN', () => {
  it.each([0.5, 3, 10, 25, 60, 120])('peso %s kg', (w) => {
    for (const [k, v] of Object.entries(calcDoses(w))) {
      expect(Number.isFinite(v), `${k} com ${w} kg`).toBe(true);
      expect(v, `${k} com ${w} kg`).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('fita de Broselow', () => {
  it('parseAltura aceita vírgula e ponto e rejeita valores fora de 0–220 cm', () => {
    expect(parseAltura('115,5')).toBe(115.5);
    expect(parseAltura('115.5')).toBe(115.5);
    expect(parseAltura('0')).toBeNull();
    expect(parseAltura('230')).toBeNull();
    expect(parseAltura('abc')).toBeNull();
    expect(parseAltura('')).toBeNull();
  });
  it('zonas por comprimento', () => {
    expect(estimarBroselow(115).nome).toBe('Azul');
    expect(estimarBroselow(130).nome).toBe('Laranja');
    expect(estimarBroselow(140).nome).toBe('Verde');
  });
  it('fora da fita → null', () => {
    expect(estimarBroselow(151)).toBeNull();
    expect(estimarBroselow(20)).toBeNull();
  });
  it('peso estimado sempre dentro da faixa de peso da zona', () => {
    for (let cm = 50; cm <= 150; cm += 0.5) {
      const z = estimarBroselow(cm);
      if (!z) continue;
      expect(z.pesoEstimado).toBeGreaterThanOrEqual(z.pesoMin);
      expect(z.pesoEstimado).toBeLessThanOrEqual(z.pesoMax);
    }
  });
});
