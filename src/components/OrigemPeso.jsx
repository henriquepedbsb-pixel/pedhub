// src/components/OrigemPeso.jsx
// Aviso discreto abaixo de um campo de peso quando o valor veio da barra do
// paciente (ver useCampoPeso em src/lib/paciente.js). Deixa a origem do dado
// visível: o médico sabe que não digitou aquele peso neste módulo e que basta
// digitar no campo para usar outro. Chrome neutro (tokens de tema).
import { UserRound } from "lucide-react";

export default function OrigemPeso({ ativo }) {
  if (!ativo) return null;
  return (
    <p
      style={{
        display: "flex", alignItems: "center", gap: 5,
        margin: "5px 0 0", fontSize: 11, lineHeight: 1.35,
        color: "var(--text-2)", fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <UserRound size={12} style={{ flexShrink: 0 }} />
      Peso da barra do paciente — digite aqui para usar outro
    </p>
  );
}
