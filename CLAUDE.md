# PedHub — Contexto e regras para o Claude Code

Repositório: `henriquepedbsb-pixel/pedhub` (privado)
Responsável médico: Dr. Henrique Flávio G. Gomes — CRM-DF 14.611
Última atualização deste documento: 23/07/2026

---

## 1. O que é o projeto

PedHub é uma PWA React de apoio à decisão clínica para pediatras e
neonatologistas brasileiros: calculadoras, protocolos, farmacologia e curvas
de crescimento. É o núcleo clínico do ecossistema PedSuite.

Estado atual: **56 módulos ativos no catálogo** (31 Pediatria Geral +
25 Neonatologia) + 6 módulos "EM BREVE" (placeholders, sem rota) + 2 hubs.
Fase 1 concluída. Nenhum módulo novo está planejado agora — o trabalho atual
é de **plataforma, UX e segurança de cálculo**.

**Reconciliação catálogo × arquivos (não é bug, é intencional):**
- `src/modulos/` contém **57 arquivos `.jsx`** (+ o diretório `__tests__/`).
- Desses 57: **55 são módulos-spoke** + **2 são os hubs** (`pediatria-geral.jsx`
  e `neonatal.jsx`).
- O catálogo `MODULOS` tem **56 entradas**, uma a mais que os 55 arquivos-spoke
  porque **`percentis.jsx` serve 2 rotas**: `/percentis` (completo) e
  `/percentis-oms` (com a prop `somenteOMS`). Um arquivo, dois módulos no
  catálogo. Confira em `App.jsx` (`<Route path="/percentis-oms" element={<Percentis somenteOMS />} />`).

Portanto: 55 arquivos-spoke + 1 rota extra (percentis-oms) = 56 catálogo.

**Os 6 módulos "EM BREVE"** (array `EM_BREVE` em `PedHub.jsx` — placeholders,
sem rota, aparecem só como "em breve" na home):
1. ITU Pediátrica — Coleta · UFC por método · imagem · ATB
2. Cetoacidose Diabética — CAD · debut DM1 · hidratação e insulina
3. Animais Peçonhentos — Escorpião · serpentes · aranhas · soro
4. Enurese Noturna — ICCS · mono × não-monossintomática
5. Convulsão Neonatal — Etiologias · tipos de crise · fenobarbital
6. Sepse Neonatal — Precoce × tardia · fatores de risco · ATB

A contagem exibida na home é derivada do array `MODULOS` em `PedHub.jsx`
(`MODULOS.length` + filtro por `grupo`). Ao criar/remover módulo, essa
entrada do catálogo é obrigatória (ver seção 4), senão a home conta errado e
a busca global não acha o módulo.

---

## 2. Stack

- React + Vite (**rolldown**, mais estrito que esbuild) + **HashRouter**
- Tailwind CSS via estilos inline + **lucide-react 1.17.0** + fonte DM Sans
- `vite-plugin-pwa` (offline-first)
- Deploy: GitHub Actions → GitHub Pages, `base: "/pedhub/"` no `vite.config.js`
- URLs no formato `/pedhub/#/modulo`

**Não introduzir dependência nova sem justificar e perguntar antes.**
`vitest` (`^4.1.10`) **já está instalado e configurado** (`vitest.config.js`,
scripts `npm test` / `npm run test:watch`) e o CI já roda `npm test` antes do
build (`.github/workflows/ci.yml` e `main.yml`) — teste vermelho bloqueia
deploy. `@vitest/coverage-v8` pode ser adicionado se for medir cobertura.

---

## 3. Regras fixas — não questionar, não reverter

1. **HashRouter**, nunca BrowserRouter. GitHub Pages não suporta SPA routing.
2. **Nunca emojis** em produção — usar ícones Lucide. Verificar se o ícone
   existe na versão **1.17.0** antes de usar — checar contra a versão REAL
   instalada, não de memória (`node -e "const L=require('lucide-react'); console.log('Ruler' in L)"`).
   Ícones inexistentes quebram o build (ex.: `Spider` não existe). Quando o
   emoji estiver dentro de string de dado (não JSX), substituir por prefixo
   textual neutro.
3. **Cores em hex fixo — vale para a COR DE IDENTIDADE DE MÓDULO.** A cor
   própria de cada módulo (badge, gradiente do card, destaque) e a lógica
   visual condicional (aba/chip ativo, gravidade, cor de risco) são sempre
   hex literal — nunca `var(--x)`. Abas e chips usam `className` + `!important`,
   não ternário inline de cor.
   **Exceção deliberada — o "chrome" do app usa as variáveis CSS de tema:**
   fundo de página, superfícies de card, bordas, texto e cabeçalhos consomem
   os tokens `--bg`, `--surface`, `--surface-2`, `--border`, `--text`,
   `--text-2`, `--muted`, `--header-bg` para responder ao dark mode (ver
   "Sistema de tema"). A regra do hex fixo é sobre **identidade e semântica de
   cor**, não sobre a moldura neutra do app.
4. **Sub-componentes React sempre definidos FORA do componente principal.**
   Definir dentro causa remount a cada tecla e quebra o foco do teclado
   mobile. (Funções que só retornam objetos de estilo podem ficar dentro.)
5. **Decimal brasileiro:** sempre `.replace(",", ".")` antes de `parseFloat`,
   em todo input do usuário, inclusive edição de célula de tabela.
6. **Lazy loading** em todos os módulos. `PedHub.jsx` importado direto.
7. Primeira linha de todo arquivo = comentário com o caminho:
   `// src/modulos/nome.jsx`. O protocolo de debug depende disso.
8. **Nada de `<` ou `>` soltos em JSXText.** `< 1.000 g` e `> 15 cmH₂O`
   passam no esbuild e quebram no rolldown. Usar `{'<'}` / `&lt;` / `&gt;`.
9. **Nenhum segredo em código de front-end.** O bundle é público mesmo com
   repositório privado. Chaves só via variável de ambiente.
10. Disclaimer no rodapé de cada módulo, texto exato:
    `Apoio à decisão clínica. Não substitui julgamento médico nem protocolo institucional.`
11. **Não refatorar módulos existentes sem pedido explícito.**
12. Cor nova de módulo deve ser checada contra a paleta em uso antes de
    atribuir. Não repetir tons já saturados.

---

## 4. Arquitetura hub-and-spoke — atenção crítica

`PedHub.jsx` mostra 2 cards-portal (Pediatria Geral / Neonatologia) + busca
global. Os módulos aparecem só dentro do hub correspondente ou na busca.

`pediatria-geral.jsx` e `neonatal.jsx` têm listas de cards **totalmente
independentes** do array `MODULOS` do `PedHub.jsx`.

**Criar módulo = 4 pontos no mesmo commit:**
1. array `MODULOS` em `PedHub.jsx`
2. lazy import + `<Route>` + entrada do `MODULO_MAP` em `App.jsx`
3. card no hub (`pediatria-geral.jsx` ou `neonatal.jsx`)
4. o próprio arquivo em `src/modulos/`

**Deletar módulo = remover as 3 referências do `App.jsx` ANTES ou no mesmo
commit da exclusão do arquivo.** Import órfão gera
`Could not resolve ./modulos/X` e derruba **todos** os deploys seguintes em
cadeia.

---

## 5. Erros já ocorridos — checar antes de investigar outra coisa

| Sintoma | Causa mais provável |
|---|---|
| Módulo não aparece, deploy verde | Conteúdo colado no arquivo errado (conferir 1ª linha) → depois: 3 integrações → depois: extensão `.js` em vez de `.jsx` → depois: cache do Service Worker (testar em aba anônima) |
| Build vermelho em cadeia | Procurar o **primeiro** run vermelho, não o último. Típico: import órfão no `App.jsx` |
| Input perde foco no mobile a cada tecla | Sub-componente definido dentro do componente pai |
| Build passa local, falha no CI | `<` ou `>` solto em JSXText (rolldown) |

---

## 6. Propriedade clínica por domínio (regra de não-redundância)

Antes de escrever qualquer valor clínico, verificar se o domínio já tem dono:

- Doses individuais por peso → `pedfarma`
- Protocolos de emergência → `urgencias`
- Fluidos e correções → `hidratacao`
- Gotejamento e diluição → `dilucao-bic`
- Classificação de RN por IG/peso/AIG-PIG-GIG → `classificacao-rn`
  (reaproveita curvas de `percentis.jsx`, não duplica tabelas)
- Escolha de ATB por síndrome → `antibioticos`
- Escalas de dor e escada analgésica → `dor` (FLACC é export nomeado de
  `dor.jsx`, consumido por `analgesia-sedacao.jsx` — não reimplementar)
- Valores laboratoriais por faixa etária → `exames-lab`
- Sedação em procedimento → `sedacao`
- Infecções congênitas → `torchs`
- Reflexo vermelho / exame oftalmológico → `oftalmologia`
- Score de Rodwell → `sepse`

**Divergência clínica detectada entre dois módulos → parar e alertar o
usuário antes de prosseguir. Não escolher um valor por conta própria.**

---

## 7. Autoridade clínica

SBP (primária) · AAP Red Book · ESPGHAN/ESPEN 2018 · NASPGHAN · SBIm ·
BRASPEN · NeoFax 2023 · Harriet Lane 22ª ed. · GINA · ILAE · MS-PCDT ·
INTERGROWTH-21st · PNI/MS · AHA PALS 2020 · Surviving Sepsis Campaign.

Todo valor clínico deve ser rastreável a uma fonte citada. **Nenhum valor
inventado, arredondado sem embasamento ou "estimado".** Na dúvida, perguntar
— não preencher.

Compliance ANVISA (RDC 657/2022): permitido busca e síntese conceitual;
proibido receber dados de paciente específico e devolver recomendação
terapêutica direta à família. O app informa; o médico decide.

---

## 8. Princípio de produto — interatividade

Sempre que o conteúdo clínico permitir, privilegiar componentes
editáveis/interativos (calculadora com input, seletor, toggle, card
clicável, checklist marcável) em vez de bloco de texto estático.

**Salvaguarda inegociável:** não forçar interatividade onde ela cria risco.
(a) Não inventar calculadora onde não há lógica real de cálculo — uma tríade
diagnóstica clássica continua sendo lista. (b) Não transformar em checkbox
algo cuja natureza é fixa (contraindicação absoluta, critério obrigatório) de
um jeito que sugira que o usuário pode desmarcá-lo.
Mais interativo, desde que nunca menos seguro nem menos claro.

---

## 9. Padrão visual

- DM Sans (corpo) + DM Serif Display (títulos quando aplicável)
- Cards com borda arredondada, sombra sutil, fundo branco/cinza claro
- Mobile-first — validar em 390px de largura
- Cada módulo tem cor própria em hex

---

## 10. Sistema de tema (claro/escuro)

Dark mode **já implementado**. Não usa Context API nem biblioteca — é a tríade
**atributo no `<html>` + hook mínimo + variáveis CSS**.

**Mecânica:**
- O tema vive no atributo `data-theme` de `document.documentElement`
  (`<html>`): `"dark"` ou `"light"`. Ausência do atributo = seguir
  `prefers-color-scheme` do sistema.
- Persistência na chave **`localStorage["pedhub-theme"]`** (preferência do
  médico, não dado de paciente — `localStorage` é correto aqui).
- **Script anti-flash no `index.html`** (inline, antes da 1ª pintura): lê
  `pedhub-theme` e aplica `data-theme` no `<html>` **antes** do React montar,
  evitando flash de tema errado (FOUC). Não remover nem mover para depois do
  bundle.
- Toggle: hook `useTheme()` em `src/PedHub.jsx` (`useState` local, sem
  provider). Ao alternar, escreve o atributo no `<html>` e grava no
  `localStorage`.

**Paleta — CSS custom properties em `src/index.css`** (definidas em `:root`
claro, no bloco `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])`,
e nos explícitos `:root[data-theme="dark"]` / `:root[data-theme="light"]`):

| Token | Papel |
|---|---|
| `--bg` | Fundo geral da página/app |
| `--surface` | Superfície de card/painel (branco no claro) |
| `--surface-2` | Superfície secundária/recuada (cinza claro) |
| `--border` | Cor de borda e divisórias |
| `--text` | Texto primário |
| `--text-2` | Texto secundário |
| `--muted` | Texto terciário/apagado (labels, hints) |
| `--header-bg` | Fundo translúcido de cabeçalhos/barras fixas (rgba p/ blur) |
| `--tint-blue` / `-red` / `-green` / `-amber` / `-purple` / `-teal` / `-slate` | Fundos suaves (tints) por cor semântica de bloco |
| `--tx-red` / `-amber` / `-green` / `-blue` / `-purple` / `-teal` | **Texto** semântico que inverte de tom por tema (tom escuro no claro, tom claro no escuro) para manter legibilidade sobre superfície escura |
| `color-scheme` | `light`/`dark` nativo (scrollbars, controles do SO) |

Há ainda, no fim do `index.css`, um bloco de **overrides de classes Tailwind**
(`.bg-white`, `.bg-gray-100`, `.text-gray-800`, `.text-red-700`,
`.border-gray-200`, etc.) que remapeia utilitários usados pelos módulos para
esses tokens com `!important` — no claro resolvem para ~os valores originais
(sem mudança visível), no escuro para os valores escuros. É o que faz os 56
módulos herdarem o dark mode sem serem tocados um a um.

---

## 11. Padrão de estado global (sem Context API)

O projeto **não usa React Context**. Estado compartilhado entre telas mora em
módulos `src/lib/*.js` expostos como **external store** via
`useSyncExternalStore`.

Referência canônica: **`src/lib/favoritos.js`** (chave
`localStorage["pedhub-favoritos"]`). Padrão a seguir para qualquer estado
global novo:
- Cache em memória + `Set` de ouvintes; `salvar()` cria nova referência a cada
  mudança (dispara re-render) e notifica os ouvintes.
- Hook reativo (`useFavoritos()`) via `useSyncExternalStore(subscrever, getSnapshot, getSnapshot)`.
- **Degradação silenciosa:** toda leitura/escrita em `localStorage` dentro de
  `try/catch` — armazenamento cheio/indisponível não pode quebrar a UI.
- **Sync entre abas/instâncias do PWA:** ouvir o evento `window "storage"` e
  atualizar o cache quando a chave própria mudar.

Quando (T1) o `PacienteContext` for criado, ele é a **exceção autorizada** a
esse padrão — dado de paciente exige `sessionStorage` e um provider React
próprio (ver T1). Preferência do médico (favoritos, tema, futuros recentes) =
external store + `localStorage`.

---

# PLANO DE EXECUÇÃO — Níveis 1 e 2

Executar **na ordem**. Uma tarefa por PR/commit lógico. Rodar `npm run build`
(Vite real) antes de considerar qualquer tarefa concluída.

**STATUS (atualizado 23/07/2026):**
- **Dark mode: FEITO** (fora do escopo T1–T8; ver seções 10 e 11).
- **T1 — não feito.** Não há `src/contexts/` nem `PacienteContext`.
- **T2 — não feito**, mas a **infra já está pronta**: Vitest instalado e
  configurado, CI roda `npm test` antes do build, e o padrão de lib testada já
  está estabelecido em `src/lib/pa-*.js` (`pa-neonatal.js`, `pa-pediatrica.js`,
  `pa-tratamento.js`) com testes em `src/lib/__tests__/`. Falta o essencial da
  tarefa: **`src/lib/farmacos.js` e `src/lib/calc/` ainda não existem** —
  `pedfarma.jsx` ainda carrega o array de fármacos inline.
- **T3 — não feito.** Não há `src/components/CalcDose.jsx`.
- **T4 — não feito.** Nenhuma entrada de `MODULOS` tem campo `keywords`; a
  busca ainda indexa só o nome do módulo.
- **T5 — PARCIAL.** Favoritos ✓ (`src/lib/favoritos.js`, chave
  `pedhub-favoritos`). **Recentes ✗** — não há registro de últimos acessados.
- **T6, T7, T8 — não feitos.**

---

## T1 — Contexto global do paciente

**Problema:** o usuário redigita o peso em `pedfarma`, depois em `hidratacao`,
depois em `dilucao-bic`, depois em `urgencias`. ~40s por consulta.

**Entregar:**
- `src/contexts/PacienteContext.jsx` — provider com `peso` (kg), `idade`
  (dias/meses), `idadeGestacional` (semanas + dias), `idadeCorrigida`
  (derivada), `dataNascimento` opcional.
- Persistência em **`sessionStorage`** (não `localStorage` — dado de paciente
  não deve sobreviver ao fechamento do app).
- Barra fina fixa no topo, dentro do `App.jsx`, colapsável, mostrando o que
  está preenchido e permitindo editar. Oculta na tela do `PedHub.jsx` se
  poluir a home — decidir visualmente.
- Botão "limpar paciente" visível e óbvio.

**Critérios de aceite:**
- [ ] Módulos existentes continuam funcionando com o input próprio deles se o
      contexto estiver vazio (**retrocompatibilidade obrigatória — não
      quebrar nenhum dos 56**)
- [ ] Aceita `2,5` e `2.5` como peso (regra 5)
- [ ] Peso 0, negativo, texto e campo vazio não quebram nem produzem `NaN`
      renderizado
- [ ] Idade corrigida só é calculada e exibida quando IG < 37 semanas e
      idade cronológica < 24 meses
- [ ] Layout não quebra em 390px
- [ ] Sem re-render em cascata dos módulos a cada tecla digitada na barra
      (usar estado local no input + commit no contexto no blur/debounce)

**Não fazer nesta tarefa:** ainda não plugar o contexto nos 56 módulos. Só a
infraestrutura + a barra. A adoção módulo a módulo é incremental.

---

## T2 — `src/lib/farmacos.js` + testes Vitest  ·  STATUS: NÃO FEITO (infra Vitest/CI ✓, `pa-*.js` de referência ✓; falta `farmacos.js` + `calc/`)

**Racional:** hoje a correção aritmética das calculadoras depende de revisão
manual. Erro de dose é dano ao paciente. Além disso, o dado de fármaco
precisa virar fonte única para T3.

**Etapa 2a — extração literal (risco zero):**
- Extrair o array de fármacos de `pedfarma.jsx` para `src/lib/farmacos.js`
- **Cópia literal. Nenhum valor clínico alterado, arredondado ou
  "corrigido".** Se algo parecer errado, **reportar ao usuário e parar** —
  não corrigir por conta própria.
- `pedfarma.jsx` passa a importar da lib. Comportamento visual e numérico
  idêntico.

**Etapa 2b — remodelagem para fármaco + indicação:**
A unidade de verdade não é o fármaco, é **fármaco + indicação**. Amoxicilina
em OMA (80–90 mg/kg/dia) ≠ pneumonia (50) ≠ profilaxia. Estrutura alvo:

```js
amoxicilina: {
  nome: "Amoxicilina",
  classe: "antibiotico",
  indicacoes: {
    otite_media: { dose: [80, 90], unidade: "mg/kg/dia", tomadas: 2, fonte: "SBP 2023" },
    pneumonia:   { dose: [50, 50], unidade: "mg/kg/dia", tomadas: 3, fonte: "SBP 2023" },
  },
  apresentacoes: [ /* cada suspensão com sua própria frequência */ ],
  tetos: { porDose: null, porDia: null, porKgDia: null, porFaixaPeso: [] },
}
```

Se uma indicação nova precisar de valor que não existe hoje no `pedfarma.jsx`,
**não inventar** — listar as lacunas para o usuário preencher com fonte.

**Etapa 2c — funções puras + testes:**
- Extrair para `src/lib/calc/`: dose por peso (modo mg/kg/dia e mg/kg/dose),
  conversão para mL e gotas (1 mL = 20 gotas, 1 casa decimal), TIG,
  gotejamento/diluição, superfície corporal, percentis Fenton/Intergrowth.
- Configurar Vitest. Casos obrigatórios por função:
  - caminho feliz
  - peso extremo baixo (0,3 kg) e alto (>40 kg)
  - entrada com vírgula decimal
  - entrada inválida (texto, vazio, null, negativo) → retorno controlado, nunca `NaN` vazando
  - teto absoluto por dose, por dia, por kg/dia e por faixa de peso — o teto **avisa, não trava**
  - apresentação em gotas → resultado em gotas com mL entre parênteses
- Adicionar `npm test` ao workflow do GitHub Actions **antes** do passo de
  build. Teste vermelho bloqueia deploy.

**Critérios de aceite:**
- [ ] `pedfarma.jsx` renderiza exatamente os mesmos números de antes
- [ ] Cobertura de teste em `src/lib/calc/` ≥ 90%
- [ ] CI roda testes antes do build e falha o deploy se algum teste quebrar
- [ ] Nenhum valor clínico alterado sem aprovação explícita do usuário
- [ ] Fármacos sem calculadora por decisão clínica permanecem sem: domperidona
      (ESPGHAN não recomenda de rotina, QT longo), ipratrópio e budesonida
      (dose fixa). Salbutamol continua com seletor de gravidade (GINA/SBP),
      não mg/kg.

---

## T3 — Componente `<CalcDose />`

**Objetivo:** eliminar o "vá até o pedfarma" sem duplicar valor nenhum.

- `src/components/CalcDose.jsx` — consome `src/lib/farmacos.js` e o
  `PacienteContext`. Assinatura: `<CalcDose farmaco="amoxicilina" indicacao="otite_media" />`
- Renderiza inline dentro de qualquer módulo, já com o peso do contexto
  preenchido, permitindo sobrescrever localmente.
- Exibe a fonte da dose junto ao resultado.
- `pedfarma.jsx` **continua com todos os fármacos** — o valor dele é ser o
  índice de busca ("qual mesmo a dose de ondansetrona?"). O que muda é que os
  outros módulos param de mandar o usuário até lá.

**Migração incremental:** não sair embutindo em 56 módulos. Embutir sob
demanda, começando pelos de maior tráfego real (o Cloudflare Analytics dirá
quais), **um módulo por commit**.

**Critérios de aceite:**
- [ ] Sub-componente definido fora do componente pai (regra 4)
- [ ] Funciona sem contexto preenchido (input local próprio)
- [ ] Funciona sem props opcionais
- [ ] Legível e clicável em 390px
- [ ] Zero duplicação de valor numérico fora de `src/lib/farmacos.js`

---

## T4 — Busca global por conteúdo  ·  STATUS: NÃO FEITO (nenhum `keywords:` no array `MODULOS`)

**Problema:** o array `MODULOS` só indexa o nome do módulo. Quem digita
"Rodwell", "Finnegan", "Broselow", "FLACC", "hiponatremia" ou "Capurro" não
encontra nada.

- Adicionar campo `keywords: []` a cada entrada do array `MODULOS` em
  `PedHub.jsx` — 10 a 20 termos clínicos por módulo (escalas, scores,
  patologias, sinônimos, siglas).
- Busca deve ser **acento-insensível** e case-insensível
  (`normalize("NFD").replace(/[̀-ͯ]/g, "")`).
- Sem lib nova de fuzzy search. Match por substring já resolve.
- Exibir qual keyword deu match, para o usuário entender o resultado.

**Critérios de aceite:**
- [ ] "rodwell" → sepse · "broselow" → urgencias · "flacc" → dor ·
      "capurro" → neonatologia-4 · "fenton" → percentis
- [ ] "icterícia" e "ictericia" retornam o mesmo resultado
- [ ] Nenhum módulo existente foi tocado além do array em `PedHub.jsx`

---

## T5 — Favoritos + recentes  ·  STATUS: PARCIAL (favoritos ✓ em `src/lib/favoritos.js` / chave `pedhub-favoritos`; recentes ✗)

- `localStorage` (aqui pode: é preferência do médico, não dado de paciente)
- Ícone de estrela no card do hub; seção "Seus módulos" no topo do `PedHub.jsx`
- "Recentes": últimos 5 acessados, registrado no `App.jsx` na resolução da rota
- Estado vazio tratado (primeiro acesso não pode mostrar seção vazia órfã)

**Critérios de aceite:**
- [ ] Funciona com `localStorage` indisponível/cheio (try/catch, degrada em
      silêncio)
- [ ] Não quebra se um módulo favoritado for removido do app no futuro
- [ ] ~30 linhas no `PedHub.jsx`, sem novo arquivo de estado global

---

## T6 — Copiar resultado como texto

- Botão "copiar" nas calculadoras que geram conduta: `pedfarma`, `isr`,
  `dilucao-bic`, `hidratacao`, `canguru`, `tig-neonatal`
- Gera bloco de texto plano colável em prontuário eletrônico
- `canguru.jsx` já tem estrutura de impressão — generalizar a partir dela em
  `src/lib/exportarTexto.js`, sem refatorar o módulo
- Usar `navigator.clipboard` com fallback e feedback visual de sucesso
- **Nunca incluir nome ou identificador de paciente no texto gerado** — só
  peso, idade e a conduta calculada
- Incluir no rodapé do texto: `Calculado em PedHub — apoio à decisão. Conferir antes de prescrever.`

---

## T7 — Rodapé padronizado de revisão

- Componente `src/components/RodapeModulo.jsx`:
  `Revisado em MM/AAAA · Fonte principal: X` + o disclaimer padrão
- Substitui o disclaimer solto atual em cada módulo
- Aplicar módulo a módulo, agrupado por lotes pequenos de commit
- Data e fonte de cada módulo vêm do usuário quando não forem óbvias pelo
  conteúdo do arquivo — **não inventar data de revisão**

---

## T8 — Migração para `pedhub.app`

Domínio já é do usuário. Ordem obrigatória:
1. Configurar os 4 registros A do GitHub Pages no registrador de DNS
2. Definir o domínio custom em GitHub Settings → Pages (arquivo `CNAME`)
3. Alterar `base` no `vite.config.js` de `"/pedhub/"` para `"/"`
4. Verificar `start_url` e `scope` no manifest da PWA
5. Testar instalação da PWA, modo offline e todas as rotas `#/` após a troca
6. Avisar o usuário para desregistrar o Service Worker antigo no primeiro
   acesso (DevTools → Application → Service Workers → Unregister → Clear site
   data)

**Não executar esta tarefa junto de nenhuma outra.** É a única que muda o
`base` do build e tem chance de deixar o app inacessível se algo passar.

---

## 12. Como trabalhar comigo (Claude Code)

- Entregar **arquivo completo**, nunca diff parcial, quando o usuário for
  colar manualmente. Dentro do Claude Code, editar direto no repositório.
- Rodar `npm run build` (Vite real) antes de declarar qualquer tarefa pronta.
  O build do rolldown pega erros que o esbuild deixa passar.
- Sinalizar explicitamente quando uma mudança exigir alteração em `App.jsx`,
  `PedHub.jsx` ou nos hubs.
- Ao final de cada tarefa, reportar em 3 linhas:
  **O QUE FOI FEITO · O QUE FALTA · PRÓXIMO PASSO**
- Ambiguidade clínica: **apontar antes de codar**, nunca silenciar nem
  escolher um valor por conta própria.
- Divergência de dose entre dois módulos: **parar e alertar**. Não é decisão
  de engenharia.
