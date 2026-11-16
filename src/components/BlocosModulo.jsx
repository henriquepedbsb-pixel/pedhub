// src/components/BlocosModulo.jsx
/* Blocos visuais compartilhados pelos módulos de consulta (criados em 11/2026:
   ITU, CAD, Animais Peçonhentos, Enurese, Convulsão Neonatal, Sepse Neonatal).
   Só apresentação — nenhum valor clínico mora aqui.

   Regras do projeto respeitadas:
   - componentes definidos fora dos módulos (regra 4: sem remount a cada tecla);
   - chrome nos tokens de tema; cor de identidade/semântica em hex (regra 3);
   - texto mínimo de 11 px; campo numérico de 48 px com rótulo normal;
   - entrada decimal em texto (inputMode="decimal"), nunca type="number". */
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Info, CheckCircle, ChevronRight, Check } from "lucide-react";
import { limparDecimal } from "../lib/numero";

/* Título de seção dentro do módulo. */
export function Secao({ titulo, cor, Icon, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{
        display: "flex", alignItems: "center", gap: 7,
        fontWeight: 700, fontSize: 14, color: "var(--text)", margin: "0 0 10px",
      }}>
        {Icon && <Icon size={16} color={cor} style={{ flexShrink: 0 }} />}
        {titulo}
      </p>
      {children}
    </div>
  );
}

/* Cartão neutro com filete na cor do módulo. */
export function Cartao({ cor, titulo, children, destaque = false }) {
  return (
    <div style={{
      background: destaque ? cor + "10" : "var(--surface)",
      border: "1px solid " + (destaque ? cor + "40" : "var(--border)"),
      borderLeft: "3px solid " + cor,
      borderRadius: 12, padding: "12px 14px", marginBottom: 10,
    }}>
      {titulo && (
        <p style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text)", margin: "0 0 6px", lineHeight: 1.35 }}>
          {titulo}
        </p>
      )}
      <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

/* Aviso: tom "info" (cor do módulo), "alerta" (âmbar) ou "perigo" (vermelho). */
const TONS = {
  alerta: { cor: "#D97706", fundo: "var(--tint-amber)", Icon: AlertTriangle },
  perigo: { cor: "#DC2626", fundo: "var(--tint-red)", Icon: AlertTriangle },
};
export function Aviso({ tom = "info", cor, children }) {
  const t = TONS[tom] || { cor: cor || "#2563EB", fundo: (cor || "#2563EB") + "12", Icon: Info };
  const { Icon } = t;
  return (
    <div style={{
      display: "flex", gap: 9, alignItems: "flex-start",
      background: t.fundo, border: "1px solid " + t.cor + "40",
      borderRadius: 10, padding: "10px 12px", marginBottom: 10,
    }}>
      <Icon size={15} color={t.cor} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

/* Lista com marcador de check. */
export function Lista({ itens, cor }) {
  return (
    <div>
      {itens.filter(Boolean).map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 7, marginBottom: 5 }}>
          <CheckCircle size={13} color={cor} style={{ flexShrink: 0, marginTop: 3 }} />
          <span style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

/* Item marcável (checklist). `ativo` controla o visual; o estado mora no módulo.
   Usar só para achados/fatores que o médico registra — nunca para critério
   obrigatório ou contraindicação (CLAUDE.md, seção 8). */
export function ItemMarcavel({ texto, sub, ativo, onClick, cor }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      style={{
        width: "100%", display: "flex", alignItems: "flex-start", gap: 10, textAlign: "left",
        background: ativo ? cor + "12" : "var(--surface)",
        border: "1.5px solid " + (ativo ? cor : "var(--border)"),
        borderRadius: 11, padding: "11px 12px", marginBottom: 7, cursor: "pointer",
        fontFamily: "inherit", WebkitTapHighlightColor: "transparent",
      }}
    >
      <span style={{
        width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: ativo ? cor : "transparent",
        border: "1.5px solid " + (ativo ? cor : "var(--muted)"),
      }}>
        {ativo && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)", lineHeight: 1.35 }}>{texto}</span>
        {sub && <span style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.4 }}>{sub}</span>}
      </span>
    </button>
  );
}

/* Campo numérico (decimal brasileiro). `valor` é texto; o módulo converte. */
export function CampoNumero({ id, rotulo, valor, onChange, placeholder, unidade, cor, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label htmlFor={id} style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
        {rotulo}{unidade ? ` (${unidade})` : ""}
      </label>
      <input
        id={id}
        type="text" inputMode="decimal" autoComplete="off"
        placeholder={placeholder}
        value={valor}
        onChange={(e) => onChange(limparDecimal(e.target.value))}
        style={{
          width: "100%", height: 48, padding: "0 14px", borderRadius: 12,
          fontSize: 17, fontWeight: 600, color: "var(--text)",
          border: "1.5px solid " + (valor ? cor : "var(--border)"),
          outline: "none", background: "var(--surface)", boxSizing: "border-box", fontFamily: "inherit",
        }}
      />
      {children}
    </div>
  );
}

/* Número de destaque (resultado). `valor` já formatado com fmtBR. */
export function Resultado({ rotulo, valor, unidade, nota, cor }) {
  return (
    <div style={{
      background: cor + "10", border: "1px solid " + cor + "35",
      borderRadius: 12, padding: "11px 13px", marginBottom: 8,
    }}>
      <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 3px", lineHeight: 1.35 }}>{rotulo}</p>
      <p style={{ fontWeight: 800, fontSize: 20, color: "var(--text)", margin: 0, lineHeight: 1.25, fontVariantNumeric: "tabular-nums" }}>
        {valor} {unidade && <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-2)" }}>{unidade}</span>}
      </p>
      {nota && <p style={{ fontSize: 11.5, color: "var(--muted)", margin: "4px 0 0", lineHeight: 1.4 }}>{nota}</p>}
    </div>
  );
}

/* Atalho para outro módulo — o dono do domínio (regra de não-redundância). */
export function LinkModulo({ rota, texto, cor }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(rota)}
      style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
        minHeight: 44, padding: "8px 12px", marginBottom: 8, borderRadius: 11,
        background: "var(--surface-2)", border: "1px solid var(--border)", cursor: "pointer",
        fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: "var(--text)", textAlign: "left",
      }}
    >
      <span>{texto}</span>
      <ChevronRight size={16} color={cor} style={{ flexShrink: 0 }} />
    </button>
  );
}

/* Linha "rótulo · valor" para tabelas curtas. */
export function Linha({ rotulo, valor, cor }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: cor || "var(--text)", flex: "0 0 34%", lineHeight: 1.4 }}>{rotulo}</span>
      <span style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.45, flex: 1, minWidth: 0 }}>{valor}</span>
    </div>
  );
}
