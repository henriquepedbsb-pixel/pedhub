// src/components/RodapeModulo.jsx
/* Rodapé padronizado de revisão (T7). Substitui o disclaimer solto de cada
   módulo por uma linha de rastreabilidade + o disclaimer padrão obrigatório.

   Formato:
     Revisado em MM/AAAA · Fontes: <fonte(s)>
     Apoio à decisão clínica. Não substitui julgamento médico nem protocolo institucional.

   (O plano falava "Fonte principal: X"; por decisão do usuário preservamos a
   citação completa de cada módulo, então o rótulo é "Fontes:".)

   Regras:
   - O disclaimer é literal e obrigatório (CLAUDE.md, regra 10) — vive aqui,
     fonte única, para não divergir entre módulos.
   - `revisao` (MM/AAAA) e `fonte` vêm SEMPRE do módulo que usa o rodapé.
     Nunca inventar data de revisão — se `revisao` não for passada, a linha de
     rastreabilidade some e fica só o disclaimer.
   - Chrome neutro (tokens de tema), sem cor de identidade — é moldura, não
     conteúdo clínico. */

export const DISCLAIMER_PADRAO =
  "Apoio à decisão clínica. Não substitui julgamento médico nem protocolo institucional.";

export default function RodapeModulo({ revisao, fonte, nota, marginTop = 20 }) {
  const rastreio = [
    revisao ? `Revisado em ${revisao}` : null,
    fonte ? `Fontes: ${fonte}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div style={{ marginTop, background: "var(--surface-2)", borderRadius: 10, padding: 12 }}>
      <p style={{ margin: 0, fontSize: 10, color: "var(--muted)", textAlign: "center", lineHeight: 1.6 }}>
        {rastreio && (
          <>
            {rastreio}
            <br />
          </>
        )}
        {DISCLAIMER_PADRAO}
      </p>
      {nota && (
        <p style={{ margin: "6px 0 0", fontSize: 10, color: "var(--muted)", textAlign: "center", lineHeight: 1.5 }}>
          {nota}
        </p>
      )}
    </div>
  );
}
