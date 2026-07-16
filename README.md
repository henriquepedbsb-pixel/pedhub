# PedHub

Ferramentas clínicas de apoio à decisão para **pediatras e neonatologistas**.
Cálculos, protocolos e referências à beira do leito — em um PWA rápido,
offline e sem coleta de dados de paciente.

> ⚠️ **Apoio à decisão clínica — não substitui o julgamento médico.**
> Doses, fluxos e condutas devem ser sempre conferidos antes da aplicação.

## Sobre

- **~60 módulos** entre Pediatria Geral e Neonatologia (dose por peso,
  diluições/BIC, scores, percentis, protocolos de urgência, entre outros).
- **100% client-side**: sem backend e sem login. O único dado guardado são
  os *favoritos*, salvos no `localStorage` do próprio aparelho — nada sai do
  dispositivo.
- **PWA offline-first**: instalável e utilizável sem conexão.
- Cada módulo cita suas **fontes** (SBP, Ministério da Saúde, AAP, OMS, …).

## Stack

- React 19 + React Router 7
- Vite + `vite-plugin-pwa`
- Tailwind CSS
- Vitest (os cálculos são cobertos por testes — falha bloqueia o deploy)

## Scripts

```bash
npm install      # instala dependências
npm run dev      # ambiente de desenvolvimento (HMR)
npm test         # roda os testes dos cálculos
npm run build    # build de produção
npm run preview  # pré-visualiza o build
npm run lint     # ESLint
```

## Qualidade e segurança

- **CI** (`.github/workflows/ci.yml`): testes + build + `npm audit` em cada PR.
- **Deploy** (`.github/workflows/main.yml`): publica no GitHub Pages a partir
  da `main`; os testes bloqueiam o deploy se um cálculo quebrar.
- **Dependabot** (`.github/dependabot.yml`): atualizações semanais de
  dependências (npm) e das GitHub Actions.

## Autoria e licença

Autoria: **Dr. Henrique Flávio G. Gomes · CRM-DF 14.611**.

Obra proprietária — **todos os direitos reservados**. Reprodução, cópia,
distribuição ou obras derivadas dependem de autorização prévia e por escrito
do autor. Veja [`LICENSE`](./LICENSE).

© 2026 Dr. Henrique Flávio G. Gomes.
