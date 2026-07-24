import { describe, it, expect } from 'vitest';
import { calcularDose, mlParaGotas } from '../dose';
import { DRUGS } from '../../farmacos';

const farmaco = (id) => DRUGS.find((d) => d.id === id);

describe('mlParaGotas — 1 mL = 20 gotas (1 casa decimal)', () => {
  it('converte e arredonda', () => {
    expect(mlParaGotas(0.5)).toBe(10);
    expect(mlParaGotas(0.75)).toBe(15);
    expect(mlParaGotas(1)).toBe(20);
    expect(mlParaGotas(0.13)).toBe(2.6);
  });
});

describe('calcularDose — guardas', () => {
  it('retorna null sem fármaco, indicação ou peso inválido', () => {
    expect(calcularDose(null, 'geral', 10)).toBeNull();
    expect(calcularDose(farmaco('amoxicilina'), 'inexistente', 10)).toBeNull();
    expect(calcularDose(farmaco('amoxicilina'), 'geral', 0)).toBeNull();
    expect(calcularDose(farmaco('amoxicilina'), 'geral', -3)).toBeNull();
    expect(calcularDose(farmaco('amoxicilina'), 'geral', null)).toBeNull();
  });
});

describe('calcularDose — amoxicilina por indicação (2b)', () => {
  const amox = farmaco('amoxicilina');

  it('otite_media (80–90 ÷2): 10 kg → 800–900 mg/dia, 400–450 mg/dose', () => {
    const r = calcularDose(amox, 'otite_media', 10);
    expect(r.modo).toBe('dia');
    expect(r.diaMin).toBe(800);
    expect(r.diaMax).toBe(900);
    expect(r.excedeuTeto).toBe(false);
    expect(r.porTomada).toEqual([{ tomadas: 2, min: 400, max: 450, alvo: null }]);
  });

  it('pneumonia típica (45–50 ÷3) × alta dose (90 ÷2)', () => {
    const tip = calcularDose(amox, 'pneumonia_tipica', 10);
    expect(tip.diaMin).toBe(450);
    expect(tip.diaMax).toBe(500);
    expect(tip.porTomada[0].tomadas).toBe(3);
    const alta = calcularDose(amox, 'pneumonia_alta', 10);
    expect(alta.diaMin).toBe(900);
    expect(alta.diaMax).toBe(900);
    expect(alta.porTomada[0].tomadas).toBe(2);
  });

  it('faringite (50) e ITU (25–50) existem com as doses certas', () => {
    expect(calcularDose(amox, 'faringite', 10).diaMax).toBe(500);
    const itu = calcularDose(amox, 'itu', 10);
    expect(itu.diaMin).toBe(250);
    expect(itu.diaMax).toBe(500);
  });

  it('teto do fármaco (3 g/dia): otite em 40 kg → 3600 mg/dia excede', () => {
    expect(calcularDose(amox, 'otite_media', 40).excedeuTeto).toBe(true);
  });

  it('volume da suspensão 400 mg/5 mL (÷2) na otite: 5–5,6 mL/dose', () => {
    const r = calcularDose(amox, 'otite_media', 10);
    const susp400 = r.volumes.find((v) => v.label === '400 mg/5 mL');
    expect(susp400.mlMin).toBe(5);
    expect(susp400.mlMax).toBe(5.6);
    expect(susp400.tomadas).toBe(2);
  });

  it('dose-alvo propaga (otite, alvo 85 mg/kg/dia)', () => {
    const r = calcularDose(amox, 'otite_media', 10, 85);
    expect(r.diaAlvo).toBe(850);
    expect(r.porTomada[0].alvo).toBe(425); // 850/2
  });
});

describe('antibióticos por indicação — lote 2 (trava valores clínicos)', () => {
  it('ceftriaxona: padrão 50–75 × meningite 100 (÷1)', () => {
    const cef = farmaco('ceftriaxona');
    const p = calcularDose(cef, 'padrao', 10);
    expect(p.diaMin).toBe(500); expect(p.diaMax).toBe(750);
    const m = calcularDose(cef, 'meningite', 10);
    expect(m.diaMin).toBe(1000); expect(m.diaMax).toBe(1000);
  });
  it('cefalexina: pele 25–50 × grave 50–100 × ITU × faringite', () => {
    const cx = farmaco('cefalexina');
    expect(calcularDose(cx, 'pele_partes_moles', 10).diaMax).toBe(500);
    expect(calcularDose(cx, 'infeccao_grave', 10).diaMax).toBe(1000);
    expect(calcularDose(cx, 'itu', 10).diaMin).toBe(250);
    expect(calcularDose(cx, 'faringite', 10).porTomada[0].tomadas).toBe(2);
  });
  it('nitrofurantoína: tratamento 5–7 (÷4) × profilaxia 1–2 (÷1)', () => {
    const nf = farmaco('nitrofurantoina');
    const t = calcularDose(nf, 'itu_tratamento', 10);
    expect(t.diaMin).toBe(50); expect(t.diaMax).toBe(70);
    expect(t.porTomada[0].tomadas).toBe(4);
    const p = calcularDose(nf, 'profilaxia', 10);
    expect(p.diaMin).toBe(10); expect(p.diaMax).toBe(20);
    expect(p.porTomada[0].tomadas).toBe(1);
  });
  it('TMP-SMX (SMX): ITU 30–60 (÷12h) × pneumocistose 75–100 (÷6h)', () => {
    const t = farmaco('tmpsmt');
    const itu = calcularDose(t, 'itu', 10);
    expect(itu.diaMin).toBe(300); expect(itu.diaMax).toBe(600);
    expect(itu.porTomada[0].tomadas).toBe(2);
    const pcp = calcularDose(t, 'pneumocistose', 10);
    expect(pcp.diaMin).toBe(750); expect(pcp.diaMax).toBe(1000);
    expect(pcp.porTomada[0].tomadas).toBe(4);
  });
});

describe('antifúngico / antiviral por indicação (calculadora nova)', () => {
  it('fluconazol: candida 3–6 × criptococo 6–12 (÷1)', () => {
    const f = farmaco('fluconazol');
    const c = calcularDose(f, 'candida', 10);
    expect(c.diaMin).toBe(30); expect(c.diaMax).toBe(60);
    const k = calcularDose(f, 'criptococo', 10);
    expect(k.diaMin).toBe(60); expect(k.diaMax).toBe(120);
    // teto 400 mg/dia: criptococo 50 kg → 600 > 400 → excede
    expect(calcularDose(f, 'criptococo', 50).excedeuTeto).toBe(true);
  });
  it('aciclovir: varicela 20 mg/kg/dose × herpes 15 mg/kg/dose (÷5)', () => {
    const a = farmaco('aciclovir_oral');
    const v = calcularDose(a, 'varicela', 10);
    expect(v.modo).toBe('dose'); expect(v.doseMin).toBe(200); expect(v.doseMax).toBe(200);
    expect(v.excedeuTeto).toBe(false);
    expect(calcularDose(a, 'varicela', 50).excedeuTeto).toBe(true); // 1000 > 800
    const h = calcularDose(a, 'herpes', 10);
    expect(h.doseMin).toBe(150); expect(h.doseMax).toBe(150);
  });
});

describe('corticoides por indicação', () => {
  it('prednisolona: asma 1–2 (÷1) × APLV 1', () => {
    const p = farmaco('prednisolona');
    const a = calcularDose(p, 'asma', 10);
    expect(a.modo).toBe('dia'); expect(a.diaMin).toBe(10); expect(a.diaMax).toBe(20);
    const ap = calcularDose(p, 'aplv', 10);
    expect(ap.diaMin).toBe(10); expect(ap.diaMax).toBe(10);
  });
  it('dexametasona: crupe dose única 0,15–0,6 × meningite ÷6h', () => {
    const d = farmaco('dexametasona');
    const c = calcularDose(d, 'crupe', 10);
    expect(c.modo).toBe('dose'); expect(c.doseMin).toBe(1.5); expect(c.doseMax).toBe(6);
    expect(c.excedeuTeto).toBe(false);
    // teto 10 mg/dose: 20 kg → 0,6×20 = 12 > 10 → excede
    expect(calcularDose(d, 'crupe', 20).excedeuTeto).toBe(true);
    const m = calcularDose(d, 'meningite', 10);
    expect(m.doseMin).toBe(1.5); expect(m.doseMax).toBe(1.5);
  });
});

describe('calcularDose — dosagem por DOSE (paracetamol 10–15 mg/kg/dose)', () => {
  const para = farmaco('paracetamol');

  it('criança de 10 kg: 100–150 mg/dose', () => {
    const r = calcularDose(para, 'geral', 10);
    expect(r.modo).toBe('dose');
    expect(r.doseMin).toBe(100);
    expect(r.doseMax).toBe(150);
    expect(r.excedeuTeto).toBe(false);
  });

  it('gotas 200 mg/mL: 0,5–0,75 mL → 10–15 gotas', () => {
    const r = calcularDose(para, 'geral', 10);
    const gotas = r.volumes.find((v) => v.gotas);
    expect(gotas.mlMin).toBe(0.5);
    expect(gotas.mlMax).toBe(0.75);
    expect(gotas.gtMin).toBe(10);
    expect(gotas.gtMax).toBe(15);
  });

  it('teto diário absoluto: peso alto → excede 4 g/dia', () => {
    // 100 kg × 15 mg/kg × 4 tomadas = 6000 mg/dia > 4000
    expect(calcularDose(para, 'geral', 100).excedeuTeto).toBe(true);
  });
});

describe('calcularDose — teto por kg/dia em dia-mode (valproato 60 mg/kg/dia)', () => {
  const valp = farmaco('valproato_oral');

  it('dentro da faixa (≤ 60 mg/kg/dia) não excede', () => {
    expect(calcularDose(valp, 'geral', 20).excedeuTeto).toBe(false);        // máx 60
    expect(calcularDose(valp, 'geral', 20, 60).excedeuTeto).toBe(false);    // alvo = teto
  });

  it('alvo acima de 60 mg/kg/dia excede o teto', () => {
    expect(calcularDose(valp, 'geral', 20, 70).excedeuTeto).toBe(true);
  });
});

describe('calcularDose — teto por faixa de peso', () => {
  it('ondansetrona (dose): < 40 kg limita a 4 mg/dose', () => {
    // 0,15 mg/kg × 30 kg = 4,5 mg > 4 mg → excede
    expect(calcularDose(farmaco('ondansetrona'), 'geral', 30).excedeuTeto).toBe(true);
    // ≥ 40 kg limita a 8 mg: 0,15 × 50 = 7,5 < 8 → não excede
    expect(calcularDose(farmaco('ondansetrona'), 'geral', 50).excedeuTeto).toBe(false);
  });

  it('esomeprazol (dia): ≥ 20 kg limita a 40 mg/dia', () => {
    // 1 mg/kg/dia × 45 kg = 45 mg > 40 mg → excede
    expect(calcularDose(farmaco('esomeprazol'), 'geral', 45).excedeuTeto).toBe(true);
    // 30 kg → 30 mg < 40 → não excede
    expect(calcularDose(farmaco('esomeprazol'), 'geral', 30).excedeuTeto).toBe(false);
  });
});

describe('calcularDose — consistência em TODO o catálogo', () => {
  it('nenhuma indicação quebra e mg/dose ≤ mg/dia', () => {
    for (const d of DRUGS) {
      const keys = d.indicacoes ? Object.keys(d.indicacoes) : [];
      for (const k of keys) {
        const r = calcularDose(d, k, 12);
        expect(r, `${d.id}/${k} retornou null`).not.toBeNull();
        if (r.modo === 'dia') {
          expect(r.diaMax).toBeGreaterThanOrEqual(r.diaMin);
          // cada dose fracionada nunca supera o total diário
          for (const t of r.porTomada) expect(t.max).toBeLessThanOrEqual(r.diaMax + 0.05);
        } else {
          expect(r.doseMax).toBeGreaterThanOrEqual(r.doseMin);
        }
      }
    }
  });
});
