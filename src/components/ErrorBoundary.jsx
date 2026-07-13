// src/components/ErrorBoundary.jsx
// Rede de segurança de runtime: se um módulo lazy quebrar ao renderizar, em vez
// de deixar a tela em branco no plantão, mostramos um cartão com recuperação
// (recarregar o módulo / voltar ao início / reportar). Resetamos ao trocar de
// rota — assim um erro num módulo não "gruda" ao navegar para outro.

import { Component } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

class ErrorBoundaryInner extends Component {
  constructor(props) {
    super(props);
    this.state = { erro: null };
  }

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidUpdate(prevProps) {
    // Trocou de rota depois de um erro → limpa para tentar renderizar o novo módulo.
    if (this.state.erro && prevProps.rotaKey !== this.props.rotaKey) {
      this.setState({ erro: null });
    }
  }

  render() {
    const { erro } = this.state;
    if (!erro) return this.props.children;

    const assunto = encodeURIComponent("Erro no PedHub");
    const corpo = encodeURIComponent(
      `Rota: ${this.props.rotaKey || "/"}\nErro: ${erro?.message || erro}`
    );

    return (
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          maxWidth: 480,
          margin: "0 auto",
          padding: "48px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "var(--tint-amber)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertTriangle size={28} color="#F59E0B" />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0 }}>
          Algo deu errado neste módulo
        </h2>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.55 }}>
          Nenhum dado foi perdido. Você pode recarregar o módulo ou voltar ao início.
          Se persistir, avise para corrigirmos.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 6 }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "#3B82F6", color: "#fff", border: "none",
              borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <RotateCcw size={15} /> Recarregar
          </button>
          <a
            href="/pedhub/"
            style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "var(--surface)", color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 700,
              cursor: "pointer", textDecoration: "none",
            }}
          >
            <Home size={15} /> Início
          </a>
        </div>

        <a
          href={`mailto:henriquepedbsb@gmail.com?subject=${assunto}&body=${corpo}`}
          style={{
            fontSize: 11, color: "var(--muted)", textDecoration: "underline",
            marginTop: 4,
          }}
        >
          Reportar este erro
        </a>
      </div>
    );
  }
}

// Wrapper funcional para injetar a rota atual (a classe reseta ao mudar de rota).
export default function ErrorBoundary({ rotaKey, children }) {
  return <ErrorBoundaryInner rotaKey={rotaKey}>{children}</ErrorBoundaryInner>;
}
