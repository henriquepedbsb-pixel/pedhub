// src/lib/calc/dose.js
// Cálculo puro de dose por peso (T2 etapa 2c). Extraído de pedfarma.jsx sem
// alterar a aritmética — o teste em __tests__/dose.test.js é a rede de
// segurança (mesmos números). Consome o modelo fármaco+indicação de
// src/lib/farmacos.js: recebe (farmaco, indicacao, peso, alvo) e resolve
// dose/apresentacoes/tetos, reconstruindo internamente o objeto `c` de cálculo.

// Conversão de volume para gotas. Padrão do app: 1 mL = 20 gotas, 1 casa decimal.
export const GOTAS_POR_ML = 20;
export function mlParaGotas(ml) {
  return +(ml * GOTAS_POR_ML).toFixed(1);
}

export function calcularDose(farmaco, indicacao, peso, alvo) {
  const ind = farmaco?.indicacoes?.[indicacao];
  if (!ind) return null;
  // Dose fixa (não depende do peso): zinco, vitamina D, etc.
  if (ind.doseFixa) {
    return { modo: "fixa", fixaMin: ind.doseFixa[0], fixaMax: ind.doseFixa[1], unidade: ind.unidade };
  }
  if (!peso || peso <= 0) return null;
  const tetos = farmaco.tetos || {};
  const ehDose = ind.unidade === "mg/kg/dose";
  const c = {
    min: ind.dose[0], max: ind.dose[1],
    unidade: ehDose ? "dose" : "dia",
    tomadas: ind.tomadas,
    tomadasDiaMax: ind.tomadasDiaMax,
    susp: farmaco.apresentacoes || [],
    tetoPorPeso: (tetos.porFaixaPeso && tetos.porFaixaPeso.length) ? tetos.porFaixaPeso : null,
  };
  c.tetoMgKgDia = tetos.porKgDia; // teto por kg/dia — vale nos dois modos
  if (ehDose) {
    c.tetoMg = tetos.porDose;
    c.tetoTipo = tetos.porDose != null ? "dose" : null;
    c.tetoMgDia = tetos.porDia;
  } else if (tetos.porDose != null) {
    c.tetoMg = tetos.porDose; c.tetoTipo = "dose";
  } else if (tetos.porDia != null) {
    c.tetoMg = tetos.porDia; c.tetoTipo = "dia";
  }

  // ── Fármacos dosados por DOSE (mg/kg/dose): analgésicos, alguns outros ──
  if (c.unidade === "dose") {
    const doseMin = +(c.min * peso).toFixed(1);
    const doseMax = +(c.max * peso).toFixed(1);
    const doseAlvo = alvo != null ? +(alvo * peso).toFixed(1) : null;
    const ref = doseAlvo != null ? doseAlvo : doseMax;
    // teto absoluto por dose (mg)
    let excedeuTeto = c.tetoMg != null && c.tetoTipo === "dose" && ref > c.tetoMg;
    // teto por kg/dia (ex.: paracetamol 75 mg/kg/dia) e teto absoluto/dia (4 g/dia)
    // usa a frequência máxima (menor intervalo) para estimar o total diário
    const tomadasDia = c.tomadasDiaMax || 1;
    const totalDiaKg = (alvo != null ? alvo : c.max) * tomadasDia;
    const totalDiaMg = ref * tomadasDia;
    if (c.tetoMgKgDia != null && totalDiaKg > c.tetoMgKgDia) excedeuTeto = true;
    if (c.tetoMgDia != null && totalDiaMg > c.tetoMgDia) excedeuTeto = true;
    // teto por faixa de peso (ex.: ondansetrona 4 mg <40 kg / 8 mg ≥40 kg) — limite por dose
    if (c.tetoPorPeso) {
      const faixa = c.tetoPorPeso.find((f) => peso < f.pesoMax) || c.tetoPorPeso[c.tetoPorPeso.length - 1];
      if (faixa && ref > faixa.tetoMg) excedeuTeto = true;
    }
    const volumes = (c.susp || []).map((s) => {
      const mlMin = +(((doseAlvo != null ? doseAlvo : doseMin) / s.mgPerMl)).toFixed(2);
      const mlMax = +(((doseAlvo != null ? doseAlvo : doseMax) / s.mgPerMl)).toFixed(2);
      return {
        label: s.label,
        freqLabel: s.freqLabel || null,
        gotas: !!s.gotas,
        mlMin, mlMax,
        gtMin: s.gotas ? mlParaGotas(mlMin) : null,
        gtMax: s.gotas ? mlParaGotas(mlMax) : null,
      };
    });
    return { modo: "dose", doseMin, doseMax, doseAlvo, excedeuTeto, volumes };
  }

  // ── Fármacos dosados por DIA (mg/kg/dia): antibióticos ──
  const diaMin = +(c.min * peso).toFixed(1);
  const diaMax = +(c.max * peso).toFixed(1);
  const diaAlvo = alvo != null ? +(alvo * peso).toFixed(1) : null;
  const porTomada = c.tomadas.map((t) => ({
    tomadas: t,
    min: +(diaMin / t).toFixed(1),
    max: +(diaMax / t).toFixed(1),
    alvo: diaAlvo != null ? +(diaAlvo / t).toFixed(1) : null,
  }));
  const totalDia = diaAlvo != null ? diaAlvo : diaMax;
  let excedeuTeto =
    c.tetoTipo === "dia" ? totalDia > c.tetoMg : porTomada[0].max > c.tetoMg;
  // teto por faixa de peso (ex.: esomeprazol 20 mg <20 kg / 40 mg ≥20 kg) — limite por dia
  if (c.tetoPorPeso) {
    const faixa = c.tetoPorPeso.find((f) => peso < f.pesoMax) || c.tetoPorPeso[c.tetoPorPeso.length - 1];
    if (faixa && totalDia > faixa.tetoMg) excedeuTeto = true;
  }
  // teto por kg/dia (ex.: valproato 60 mg/kg/dia) — mg/kg/dia = alvo ou máximo
  if (c.tetoMgKgDia != null && (alvo != null ? alvo : c.max) > c.tetoMgKgDia) excedeuTeto = true;
  const volumes = (c.susp || []).map((s) => {
    const t = s.tomadas || c.tomadas[0];
    const refMin = (diaAlvo != null ? diaAlvo : diaMin) / t;
    const refMax = (diaAlvo != null ? diaAlvo : diaMax) / t;
    const mlMin = +((refMin / s.mgPer5) * 5).toFixed(1);
    const mlMax = +((refMax / s.mgPer5) * 5).toFixed(1);
    return {
      label: s.label,
      freqLabel: s.freqLabel || null,
      tomadas: t,
      gotas: !!s.gotas,
      mlMin, mlMax,
      gtMin: s.gotas ? mlParaGotas(mlMin) : null,
      gtMax: s.gotas ? mlParaGotas(mlMax) : null,
    };
  });
  return { modo: "dia", diaMin, diaMax, diaAlvo, porTomada, excedeuTeto, volumes };
}
