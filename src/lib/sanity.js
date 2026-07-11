// Guardas de sanidade para entradas clínicas.
// Filosofia: AVISAR (não bloquear) quando o valor está fora da faixa plausível
// em pediatria/neonatologia — pega erro de digitação antes de gerar dose errada.
// Retornam uma string de aviso ou null (sem aviso).

// Peso em quilogramas (0,3 kg — prematuro extremo — a 150 kg — adolescente obeso)
export function avisoPesoKg(kg) {
  if (kg == null || kg === '' || isNaN(kg) || kg <= 0) return null;
  if (kg < 0.3) return 'Peso muito baixo. Confira se o valor está em kg (não gramas).';
  if (kg > 150) return 'Peso acima do esperado para pediatria. Confira o valor digitado.';
  return null;
}

// Peso em gramas (campos neonatais): 300 g a 10.000 g (10 kg)
export function avisoPesoG(g) {
  if (g == null || g === '' || isNaN(g) || g <= 0) return null;
  if (g < 300) return 'Peso muito baixo. Confira se o valor está em gramas.';
  if (g > 10000) return 'Peso acima de 10 kg. Confira se o campo é em gramas.';
  return null;
}

// Idade em anos (0 a 18 na pediatria)
export function avisoIdadeAnos(anos) {
  if (anos == null || anos === '' || isNaN(anos) || anos < 0) return null;
  if (anos > 18) return 'Idade acima de 18 anos — fora da faixa pediátrica. Confira o valor.';
  return null;
}
