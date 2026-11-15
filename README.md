# PedHub

Aplicativo web (PWA) de apoio à decisão clínica para pediatras e
neonatologistas: calculadoras, protocolos, farmacologia e curvas de
crescimento. Faz parte do ecossistema PedSuite.

- **Aplicativo publicado:** https://henriquepedbsb-pixel.github.io/pedhub/
- **Situação:** em fase de testes.
- **Responsável médico:** Dr. Henrique Flávio G. Gomes — CRM-DF 14.611.

> Apoio à decisão clínica. Não substitui julgamento médico nem protocolo
> institucional.

## Direitos

Todos os direitos reservados. O repositório está público apenas para viabilizar
a publicação durante os testes; isso não concede licença de uso do código nem
do conteúdo. Veja [LICENSE](LICENSE).

## Desenvolvimento

Requer Node 22.

```bash
npm ci          # instala as dependências
npm run dev     # servidor local
npm run lint    # ESLint
npm test        # testes das calculadoras (Vitest)
npm run build   # build de produção (Vite)
```

O deploy é automático: todo push em `main` passa por lint, testes e build e é
publicado no GitHub Pages. As regras do projeto estão em [CLAUDE.md](CLAUDE.md).
