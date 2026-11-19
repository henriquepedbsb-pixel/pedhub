// src/components/CalcDose.jsx
/* eslint-disable react-refresh/only-export-components -- exporta CAT_CORES e corCategoria, compartilhados com pedfarma.jsx */
// Calculadora de dose reutilizável (T3). Texto mínimo de 11 px (legibilidade
// no celular — padrão de layout de 15/11/2026). Embutível em qualquer módulo:
//   <CalcDose farmaco="amoxicilina" indicacao="otite_media" />
// Consome src/lib/farmacos.js (fonte única — zero duplicação de valor) e o
// peso do paciente via usePaciente() (external store do T1), com input local
// de override. Exibe a fonte da dose junto ao resultado.
//
// Dose escolhida pelo médico (19/11/2026): o resultado é sempre um valor
// ÚNICO, calculado a partir da dose em mg/kg que o médico escolhe. A faixa da
// fonte fica visível como referência (em mg/kg e em valor absoluto para o
// peso), com atalhos "mín" e "máx".
//   - Fonte com valor único (ex.: 90–90, 10–10): o campo já vem preenchido
//     com esse valor, editável.
//   - Fonte com faixa (ex.: 80–90): o campo começa vazio — o app não escolhe
//     um ponto da faixa pelo médico (o máximo seria inadequado, por exemplo,