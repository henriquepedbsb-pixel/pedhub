// src/PedHub.jsx — Tela inicial do PedHub
// Importação DIRETA em App.jsx (não lazy)

import { useState, useEffect, startTransition } from "react";
import { useNavigate } from "react-router-dom";
import { useFavoritos } from "./lib/favoritos";
import FavoritoStar from "./components/FavoritoStar";
import { MODULOS, normalizarBusca, casaBusca, keywordDoMatch } from "./lib/catalogo";
import {
  Baby,
  ChevronRight,
  Moon,
  Search,
  Star,
  Stethoscope,
  Sun,
  TestTube,
  Gauge,
  Biohazard,
  BedDouble,
  BrainCircuit,
  ShieldAlert,
} from "lucide-react";

/* O catálogo de módulos (nome, descrição, ícone, cor, grupo e termos de busca)
   mora em src/lib/catalogo.js — fonte única, compartilhada com o cabeçalho
   (App.jsx) e com os hubs. Fica completo aqui para que a BUSCA encontre também
   os módulos individuais, que não aparecem no grid da home. */

/* ─── Módulos em desenvolvimento (placeholders — sem rota) ─────────────────
   Sem campo `cor`: o BreveCard é neutro por design (cinza dos tokens), para
   não competir visualmente com os módulos que já estão no ar. A cor própria
   de cada um é definida quando o módulo for de fato construído.            */
const EM_BREVE = [
  { label: "ITU Pediátrica",        desc: "Coleta · UFC por método · imagem · ATB",     Icon: TestTube },
  { label: "Cetoacidose Diabética", desc: "CAD · debut DM1 · hidratação e insulina",    Icon: Gauge },
  { label: "Animais Peçonhentos",   desc: "Escorpião · serpentes · aranhas · soro",     Icon: Biohazard },
  { label: "Enurese Noturna",       desc: "ICCS · mono × não-monossintomática",         Icon: BedDouble },
  { label: "Convulsão Neonatal",    desc: "Etiologias · tipos de crise · fenobarbital", Icon: BrainCircuit },
  { label: "Sepse Neonatal",        desc: "Precoce × tardia · fatores de risco · ATB",  Icon: ShieldAlert },
];

/* ─── Estilos de interação (hover/toque/entrada) — injetados uma vez ───────── */
/* Usa custom properties (--sh / --sh-hover) para que o :hover do CSS possa    */
/* animar a sombra sem conflitar com os estilos inline de cada elemento.       */
function HubStyles() {
  return (
    <style>{`
      @keyframes ph-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
      @keyframes ph-toast { from { opacity: 0; transform: translate(-50%, 14px); } to { opacity: 1; transform: translate(-50%, 0); } }
      .ph-press { transition: transform .18s cubic-bezier(.2,.7,.3,1), box-shadow .24s ease, border-color .2s ease; box-shadow: var(--sh, 0 1px 3px rgba(16,24,40,.06)); -webkit-tap-highlight-color: transparent; }
      .ph-press:hover { transform: translateY(-3px); box-shadow: var(--sh-hover, 0 12px 26px rgba(16,24,40,.12)); }
      .ph-press:active { transform: translateY(-1px) scale(.985); transition-duration: .1s; }
      .ph-chev { transition: transform .2s ease; }
      .ph-press:hover .ph-chev { transform: translateX(4px); }
      .ph-rise { animation: ph-rise .5s cubic-bezier(.2,.7,.3,1) both; }
      .ph-search { transition: background .2s ease, border-color .2s ease, box-shadow .2s ease; }
      .ph-search:focus-within { background: rgba(255,255,255,.24); border-color: rgba(255,255,255,.55); box-shadow: 0 0 0 4px rgba(255,255,255,.12); }
      .ph-input::placeholder { color: rgba(255,255,255,.65); }
      @media (prefers-reduced-motion: reduce) {
        .ph-press, .ph-press:hover, .ph-press:active, .ph-rise, .ph-chev, .ph-press:hover .ph-chev {
          transition: none !important; animation: none !important; transform: none !important;
        }
      }
    `}</style>
  );
}

/* ─── Tema claro/escuro ──────────────────────────────────────────────────── */
/* O tema salvo já é aplicado no <head> (index.html) antes da 1ª pintura.     */
function useTheme() {
  const [theme, setTheme] = useState(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "dark" || attr === "light") return attr;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const toggle = () =>
    setTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("pedhub-theme", next); } catch { /* ignora */ }
      return next;
    });
  return [theme, toggle];
}

/* ─── Card de módulo ─────────────────────────────────────────────────────── */
function ModuloCard({ modulo, onClick }) {
  const { label, desc, Icon, cor } = modulo;
  return (
    <button
      onClick={onClick}
      className="ph-press"
      style={{
        "--sh": "0 1px 3px rgba(16,24,40,0.06)",
        "--sh-hover": `0 14px 30px ${cor}26, 0 4px 10px rgba(16,24,40,0.08)`,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "15px 13px",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 13,
        background: `linear-gradient(135deg, ${cor}24, ${cor}12)`,
        border: `1px solid ${cor}22`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={20} color={cor} />
      </div>
      <div>
        <p style={{
          fontWeight: 700, fontSize: 15.5,
          color: "var(--text)", margin: "0 0 3px",
          lineHeight: 1.3,
          wordBreak: "break-word", hyphens: "auto",
        }}>{label}</p>
        <p style={{
          fontSize: 12.5, color: "var(--muted)",
          margin: 0, lineHeight: 1.45,
          wordBreak: "break-word",
        }}>{desc}</p>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${cor}, ${cor}44)`, marginTop: "auto" }} />
    </button>
  );
}

/* ─── Card compacto (ícone + rótulo, sem descrição) — usado nos favoritos ─── */
function QuickCard({ modulo, onClick }) {
  const { label, Icon, cor } = modulo;
  return (
    <button
      onClick={onClick}
      className="ph-press ph-rise"
      style={{
        "--sh": "0 1px 3px rgba(16,24,40,0.06)",
        "--sh-hover": `0 12px 24px ${cor}26, 0 3px 8px rgba(16,24,40,0.08)`,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "12px 10px",
        cursor: "pointer",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        width: "100%",
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: `linear-gradient(135deg, ${cor}24, ${cor}12)`,
        border: `1px solid ${cor}22`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={20} color={cor} />
      </div>
      <p style={{
        fontWeight: 700, fontSize: 12.5,
        color: "var(--text)", margin: 0,
        lineHeight: 1.25,
        wordBreak: "break-word", hyphens: "auto",
      }}>{label}</p>
    </button>
  );
}

/* ─── Card "Em breve" (placeholder, não navega) ──────────────────────────── */
function BreveCard({ modulo, onClick }) {
  const { label, desc, Icon } = modulo;
  return (
    <button
      onClick={onClick}
      style={{
        background: "var(--surface)",
        border: "1.5px dashed var(--border)",
        borderRadius: 14,
        padding: "15px 13px",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: "var(--surface-2)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon size={20} color="var(--muted)" />
        </div>
        <span style={{
          fontSize: 9, fontWeight: 700, color: "var(--muted)", background: "var(--surface-2)",
          border: "1px solid var(--border)",
          padding: "3px 7px", borderRadius: 20, letterSpacing: "0.04em", whiteSpace: "nowrap",
        }}>EM BREVE</span>
      </div>
      <div>
        <p style={{
          fontWeight: 700, fontSize: 16, color: "var(--text-2)", margin: "0 0 3px",
          lineHeight: 1.3, wordBreak: "break-word", hyphens: "auto",
        }}>{label}</p>
        <p style={{
          fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.45, wordBreak: "break-word",
        }}>{desc}</p>
      </div>
    </button>
  );
}

/* ─── Card-portal do Hub Pediatria Geral (largura total) ─────────────────── */
function PediatriaGateway({ count, onClick }) {
  return (
    <button
      onClick={onClick}
      className="ph-press ph-rise"
      style={{
        "--sh": "0 4px 16px rgba(30,64,175,0.28)",
        "--sh-hover": "0 18px 38px rgba(30,64,175,0.40)",
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",
        border: "none",
        borderRadius: 18,
        padding: "18px 18px",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
      }}
    >
      <div style={{
        position: "absolute", top: -46, right: -30, width: 150, height: 150, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.28), transparent 70%)", pointerEvents: "none",
      }} />
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: "rgba(255,255,255,0.18)",
        border: "1px solid rgba(255,255,255,0.28)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Stethoscope size={26} color="#fff" />
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <p style={{ fontWeight: 700, fontSize: 17, color: "#fff", margin: "0 0 3px", lineHeight: 1.2 }}>
          Pediatria Geral
        </p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.4 }}>
          {count} ferramentas · ambulatório à emergência pediátrica
        </p>
      </div>
      <ChevronRight size={22} color="#fff" className="ph-chev" style={{ flexShrink: 0, position: "relative" }} />
    </button>
  );
}

/* ─── Card-portal do Hub Neonatal (largura total) ────────────────────────── */
function NeonatalGateway({ count, onClick }) {
  return (
    <button
      onClick={onClick}
      className="ph-press ph-rise"
      style={{
        "--sh": "0 4px 16px rgba(14,116,144,0.28)",
        "--sh-hover": "0 18px 38px rgba(14,116,144,0.40)",
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #0E7490 0%, #155E75 100%)",
        border: "none",
        borderRadius: 18,
        padding: "18px 18px",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
      }}
    >
      <div style={{
        position: "absolute", top: -46, right: -30, width: 150, height: 150, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.24), transparent 70%)", pointerEvents: "none",
      }} />
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: "rgba(255,255,255,0.18)",
        border: "1px solid rgba(255,255,255,0.28)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Baby size={26} color="#fff" />
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <p style={{ fontWeight: 700, fontSize: 17, color: "#fff", margin: "0 0 3px", lineHeight: 1.2 }}>
          Neonatologia
        </p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.4 }}>
          {count} ferramentas · do parto à alta da UCIN
        </p>
      </div>
      <ChevronRight size={22} color="#fff" className="ph-chev" style={{ flexShrink: 0, position: "relative" }} />
    </button>
  );
}

/* ─── Componente principal ───────────────────────────────────────────────── */
export default function PedHub() {
  const navigate = useNavigate();
  const [tema, toggleTema] = useTheme();
  const [busca, setBusca] = useState("");
  const [toastN, setToastN] = useState(0);

  // Navegação como TRANSIÇÃO: o clique repinta o feedback de toque na hora e o
  // render pesado do módulo/sub-hub de destino roda em prioridade baixa (não
  // bloqueia o próximo paint). Melhora o INP dos botões de card/portal do hub.
  const irPara = (rota) => startTransition(() => navigate(rota));

  useEffect(() => {
    if (toastN === 0) return;
    const id = setTimeout(() => setToastN(0), 2500);
    return () => clearTimeout(id);
  }, [toastN]);

  const dispararToast = () => setToastN(n => n + 1);

  const buscando = busca.trim().length > 0;

  const termos = normalizarBusca(busca.trim()).split(/\s+/).filter(Boolean);
  const resultadosBusca = MODULOS.filter(m => casaBusca(m, termos));
  const resultadosBreve = EM_BREVE.filter(m => casaBusca(m, termos));

  const totalPediatria = MODULOS.filter(m => m.grupo === "Pediatria Geral").length;
  const totalNeonatal = MODULOS.filter(m => m.grupo === "Neonatologia").length;

  /* Favoritos do usuário: resolve as rotas salvas para os módulos, na ordem. */
  const favRotas = useFavoritos();
  const favItems = favRotas
    .map(rota => MODULOS.find(m => m.rota === rota))
    .filter(Boolean);

  return (
    <div className="ph-shell" style={{
      fontFamily: "'DM Sans', sans-serif",
      minHeight: "100vh",
      background: "var(--bg)",
    }}>
      <HubStyles />
      {/* Hero */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #1E3A8A 0%, #1E40AF 42%, #0E7490 100%)",
        padding: "30px 20px 26px",
        color: "#fff",
        borderBottomLeftRadius: 26, borderBottomRightRadius: 26,
        boxShadow: "0 10px 30px rgba(14,116,144,0.20)",
      }}>
        {/* brilhos radiais */}
        <div style={{ position: "absolute", top: -70, right: -40, width: 210, height: 210, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -50, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.32), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, letterSpacing: "0.1em", margin: "0 0 4px" }}>
              PEDSUITE
            </p>
            <h1 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 32, margin: "0 0 6px", lineHeight: 1.1,
            }}>
              PedHub
            </h1>
            <p style={{ fontSize: 13, opacity: 0.85, margin: 0 }}>
              Decisão clínica pediátrica · beira do leito
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
            <button
              onClick={toggleTema}
              aria-label={tema === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
              style={{
                width: 38, height: 38, borderRadius: 999,
                background: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.28)",
                backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#fff", flexShrink: 0,
                transition: "background 0.18s ease, transform 0.12s ease",
                WebkitTapHighlightColor: "transparent",
              }}
              onPointerDown={e => { e.currentTarget.style.transform = "scale(0.9)"; }}
              onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
              onPointerLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {tema === "dark" ? <Sun size={18} color="#fff" /> : <Moon size={18} color="#fff" />}
            </button>
            <div style={{
              background: "rgba(255,255,255,0.16)",
              border: "1px solid rgba(255,255,255,0.28)",
              backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
              borderRadius: 999, padding: "6px 12px",
              fontSize: 11, fontWeight: 700, color: "#fff", whiteSpace: "nowrap",
            }}>
              {MODULOS.length} módulos
            </div>
          </div>
        </div>

        {/* Busca */}
        <div className="ph-search" style={{
          position: "relative", zIndex: 1,
          marginTop: 18,
          background: "rgba(255,255,255,0.15)",
          borderRadius: 12,
          display: "flex", alignItems: "center", gap: 10,
          padding: "11px 14px",
          border: "1px solid rgba(255,255,255,0.28)",
        }}>
          <Search size={16} color="rgba(255,255,255,0.75)" />
          <input
            type="text"
            className="ph-input"
            placeholder="Buscar módulo…"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{
              background: "none", border: "none", outline: "none",
              color: "#fff", fontSize: 14, flex: 1, minWidth: 0,
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
          {busca && (
            <button
              onClick={() => setBusca("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 16, padding: 0 }}
            >×</button>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ padding: "16px 16px 40px" }}>
        {buscando ? (
          /* ── Modo busca: todos os grupos ── */
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <p style={{
                fontWeight: 700, fontSize: 12, color: "var(--text-2)", margin: 0,
                letterSpacing: "0.07em", textTransform: "uppercase",
              }}>
                Resultado da busca
              </p>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: 11, color: "var(--muted)" }}>{resultadosBusca.length + resultadosBreve.length}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
              {resultadosBusca.map(m => {
                const kw = keywordDoMatch(m, termos);
                return (
                  <div key={m.rota} style={{ position: "relative" }}>
                    <ModuloCard modulo={m} onClick={() => irPara(m.rota)} />
                    <FavoritoStar rota={m.rota} ativo={favRotas.includes(m.rota)} />
                    {kw && (
                      <p style={{ fontSize: 10, color: "var(--muted)", margin: "3px 2px 0", lineHeight: 1.3 }}>
                        achado por “{kw}”
                      </p>
                    )}
                  </div>
                );
              })}
              {resultadosBreve.map(m => (
                <BreveCard key={m.label} modulo={m} onClick={dispararToast} />
              ))}
            </div>
            {resultadosBusca.length === 0 && resultadosBreve.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", padding: "20px 0" }}>
                Nenhum módulo encontrado para "{busca}"
              </p>
            )}
          </div>
        ) : (
          /* ── Modo navegação: portais em cima, favoritos embaixo ── */
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <p style={{
                  fontWeight: 700, fontSize: 12, color: "var(--text-2)", margin: 0,
                  letterSpacing: "0.07em", textTransform: "uppercase",
                }}>
                  Explorar
                </p>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{totalPediatria + totalNeonatal}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                <PediatriaGateway count={totalPediatria} onClick={() => irPara("/pediatria-geral")} />
                <NeonatalGateway count={totalNeonatal} onClick={() => irPara("/neonatal")} />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <p style={{
                  fontWeight: 700, fontSize: 12, color: "var(--text-2)", margin: 0,
                  letterSpacing: "0.07em", textTransform: "uppercase",
                }}>
                  Favoritos
                </p>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{favItems.length}</span>
              </div>
              {favItems.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))", gap: 10 }}>
                  {favItems.map(m => (
                    <div key={m.rota} style={{ position: "relative" }}>
                      <QuickCard modulo={m} onClick={() => irPara(m.rota)} />
                      <FavoritoStar rota={m.rota} ativo />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  border: "1.5px dashed var(--border)",
                  borderRadius: 14,
                  padding: "18px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                  background: "var(--surface)",
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                    background: "var(--tint-amber)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Star size={19} color="#F59E0B" fill="#F59E0B" />
                  </div>
                  <p style={{ fontSize: 12.5, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
                    Toque na <strong style={{ color: "var(--text-2)" }}>estrela</strong> de qualquer módulo (na busca ou dentro dos grupos) para tê-lo aqui, a um toque.
                  </p>
                </div>
              )}
            </div>

            {EM_BREVE.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <p style={{
                    fontWeight: 700, fontSize: 12, color: "var(--text-2)", margin: 0,
                    letterSpacing: "0.07em", textTransform: "uppercase",
                  }}>
                    Em breve
                  </p>
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{EM_BREVE.length}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {EM_BREVE.map(m => (
                    <BreveCard key={m.label} modulo={m} onClick={dispararToast} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast "em breve" */}
      {toastN > 0 && (
        <div style={{
          position: "fixed", left: "50%", bottom: 24, transform: "translateX(-50%)",
          background: "rgba(17,24,39,0.96)", color: "#fff", fontSize: 13, fontWeight: 600,
          padding: "11px 20px", borderRadius: 999, boxShadow: "0 8px 24px rgba(0,0,0,0.28)",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          zIndex: 200, maxWidth: "90%", textAlign: "center",
          animation: "ph-toast .3s cubic-bezier(.2,.7,.3,1) both",
        }}>
          Em desenvolvimento — em breve no PedHub
        </div>
      )}

      {/* Footer */}
      <div style={{
        textAlign: "center",
        padding: "16px 20px 32px",
        borderTop: "1px solid var(--border)",
      }}>
        <p style={{ fontSize: 11, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
          <strong style={{ color: "var(--text-2)" }}>PedHub · PedSuite</strong><br />
          Apoio à decisão clínica — não substitui julgamento médico<br />
          Dr. Henrique Flávio G. Gomes · CRM-DF 14.611
        </p>
      </div>
    </div>
  );
}
