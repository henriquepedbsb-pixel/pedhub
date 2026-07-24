# Handoff — continuar amanhã (T2 do plano)

> Nota de trabalho temporária. Pode ser removida antes do merge final do PR.
> Data: 2026-07-24. Branch: `claude/repository-inventory-1a5l2j`.

## Onde estamos

- **T1 (estado global do paciente): FEITO e MERJADO** na `main` (PR #17).
  `src/lib/paciente.js` (external store, sessionStorage, chave `pedhub-paciente`)
  + `src/components/BarraPaciente.jsx` (barra fixa no topo, montada no `App.jsx`).
- **T2 etapa 2a (extração literal de DRUGS): MERJADA** na `main` (junto no PR #17).
  `src/lib/farmacos.js`.
- **T2 etapas 2b + 2c (parcial): no PR #18, ABERTO** (branch acima da `main`).

### Commits na branch além da `main` (todos pushed, PR #18)
```
5c9492c T2c (3/n) — gotejamento (rateA/rateB) → src/lib/calc/gotejamento.js
2af2f1e T2c (2/n) — TIG → src/lib/calc/tig.js
38e24b5 chore — @vitest/coverage-v8 + config de cobertura + test:coverage
53dc648 T2c (1/n) — calcularDose → src/lib/calc/dose.js (+ mlParaGotas)
be1200a ativa teto porKgDia do valproato (60) em dia-mode
8459fb8 T2b — modelo fármaco+indicação (conversão fiel, Caminho A)
```

## Estado do T2

### 2b — modelo fármaco + indicação (FEITO, Caminho A, fiel)
- `farmacos.js` remodelado: `indicacoes` / `apresentacoes` / `tetos`.
  Cada fármaco tem 1 indicação `geral` = faixa de hoje. Números idênticos.
- `fonte` default `"Harriet Lane/SBP"`.
- Tetos aprovados pelo médico e ativados: **paracetamol `porKgDia=75`**,
  **valproato `porKgDia=60`** (antes só no `obs`, não aplicados no cálculo).
- `calcularDose(farmaco, indicacao, peso, alvo)` — aritmética byte a byte igual.

### 2c — extração de cálculos puros para `src/lib/calc/` (3 de 5)
| Cálculo | Status | Arquivo |
|---|---|---|
| Dose por peso + mL/gotas | ✅ | `src/lib/calc/dose.js` (`calcularDose`, `mlParaGotas`) |
| TIG | ✅ | `src/lib/calc/tig.js` (`tigGlicoseGramasDia`, `tigConcentracao`) |
| Gotejamento/diluição | ✅ | `src/lib/calc/gotejamento.js` (`rateA`, `rateB`) |
| Superfície corporal | ⛔ NÃO EXISTE no código | — |
| Percentis Fenton/Intergrowth | ⏳ pendente (delicado) | `src/modulos/percentis.jsx` |

- Cobertura: `npm run test:coverage` (config em `vitest.config.js`, foco em
  `src/lib/calc/**`). dose.js 98% stmts / 100% linhas; tig e gotejamento 100%.
- Padrão de cada extração: mover função pura para `src/lib/calc/<x>.js`,
  o módulo passa a importar de lá, testes de fórmula pura co-localizados em
  `src/lib/calc/__tests__/`, testes acoplados a dados clínicos ficam no módulo.

## DECISÕES PENDENTES (retomar por aqui)

1. **Superfície corporal:** não há fórmula de BSA (Mosteller `√(peso·altura/3600)`)
   em nenhum módulo. Os "SC" que aparecem são SCORAD (dermato) e SCQ de
   queimadura (área queimada — outro conceito). Não inventar. **Decidir:**
   (a) remover do escopo do 2c, ou (b) é feature nova de BSA (com fonte).
2. **Percentis:** funções `classify`, `classifyOMS`, `percFromBand3/5`,
   `zFromBand`, `getPretermPercs` vivem em `percentis.jsx` (serve 2 rotas,
   `/percentis` e `/percentis-oms`) e são reusadas por outros módulos
   (`classificacao-rn`). Já têm teste próprio (`percentis.test.js`). Extrair
   com cuidado (repontar consumidores, mover teste, não duplicar). **Aguardando
   ok** para fazer como 1 commit isolado.
3. **PR #18:** acumulou 2b + valproato + início do 2c (dose/TIG/gotejamento).
   A descrição do #18 diz que as extrações cross-module viriam em "PR próprio" —
   **reconciliar a descrição** (ou decidir mergear #18 e reiniciar a branch da
   `main` para o restante do 2c). Recomendação: mergear #18 quando satisfeito,
   reiniciar a branch designada da `main`, seguir percentis lá.

## Regras a não esquecer (do CLAUDE.md)
- Rodar `npm test` **e** `npm run build` (rolldown) antes de declarar pronto.
- Nenhum valor clínico inventado/arredondado; divergência ou dúvida → parar e
  perguntar ao médico.
- Desenvolver na branch `claude/repository-inventory-1a5l2j`; PR já merjado
  não recebe trabalho novo (reiniciar da `main`, mesmo nome).
- Não introduzir dependência nova sem perguntar.

## Como retomar rápido
```
git checkout claude/repository-inventory-1a5l2j
git fetch origin main
npm install && npm test && npm run build   # confirmar base verde
```
Próximo passo natural: resolver decisão (1) e (2) acima e, com o ok, extrair
`percentis` como `src/lib/calc/percentis.js`.
