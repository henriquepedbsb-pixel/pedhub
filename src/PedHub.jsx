// src/PedHub.jsx — Tela inicial do PedHub
// Importação DIRETA em App.jsx (não lazy)

import { useState, useEffect, startTransition } from "react";
import { useNavigate } from "react-router-dom";
import { useFavoritos } from "./lib/favoritos";
import FavoritoStar from "./components/FavoritoStar";
import {
  Activity,
  AlertTriangle,
  Baby,
  BookOpen,
  Brain,
  Bug,
  Calculator,
  CalendarClock,
  ChevronRight,
  Eye,
  Footprints,
  Milk,
  ClipboardList,
  Droplets,
  FlaskConical,
  Heart,
  Leaf,
  Microscope,
  Moon,
  Pill,
  Scale,
  Search,
  Shield,
  Star,
  Stethoscope,
  Sun,
  Syringe,
  Thermometer,
  Zap,
  Wind,
  Waves,
  Users,
  ScanEye,
} from "lucide-react";

/* ─── Catálogo completo de módulos ───────────────────────────────────────── */
/* Mantido íntegro para que a BUSCA encontre também os módulos individuais,  */
/* mesmo que estes não apareçam no grid da home (acessados via Hub próprio). */
const MODULOS = [
  /* ── Pediatria Geral (ocultos no grid — acessados via Hub; visíveis na busca) ── */
  { rota: "/percentis-oms",    label: "Percentis (OMS)",      desc: "OMS · curva 0–60 meses",                Icon: Scale,         cor: "#3B82F6", grupo: "Pediatria Geral" },
  { rota: "/urgencias",        label: "Urgências",            desc: "Anafilaxia · Asma · Convulsão · Choque", Icon: AlertTriangle, cor: "#EF4444", grupo: "Pediatria Geral" },
  { rota: "/formulas",         label: "Fórmulas",             desc: "Nestlé × Danone · Escada APLV",         Icon: FlaskConical,  cor: "#10B981", grupo: "Pediatria Geral" },
  { rota: "/gastropediatria",  label: "Gastro e Hepato",      desc: "DRGE · APLV · Constipação · Colestase",  Icon: Activity,      cor: "#F59E0B", grupo: "Pediatria Geral" },
  { rota: "/pedfarma",         label: "PedFarma",             desc: "48 medicamentos · dose por peso",       Icon: Pill,          cor: "#8B5CF6", grupo: "Pediatria Geral" },
  { rota: "/vacinal",          label: "Vacinal",              desc: "SBIm 2025/2026 · SUS / Privado",        Icon: Syringe,       cor: "#06B6D4", grupo: "Pediatria Geral" },
  { rota: "/hidratacao",       label: "Hidratação",           desc: "Holliday-Segar · Planos A / B / C",     Icon: Droplets,      cor: "#3B82F6", grupo: "Pediatria Geral" },
  { rota: "/scores",           label: "Scores",               desc: "Gorelick · Westley · PEWS",             Icon: ClipboardList, cor: "#F97316", grupo: "Pediatria Geral" },
  { rota: "/febre-sem-foco",   label: "Febre Sem Foco",       desc: "Fluxo por faixa etária · PECARN",       Icon: Thermometer,   cor: "#EF4444", grupo: "Pediatria Geral" },
  { rota: "/tce-leve",         label: "TCE Leve",             desc: "PECARN · TC vs Observação",             Icon: Brain,         cor: "#7C3AED", grupo: "Pediatria Geral" },
  { rota: "/dnpm",             label: "DNPM",                 desc: "Marcos do desenvolvimento · Alarmes",   Icon: Baby,          cor: "#8B5CF6", grupo: "Pediatria Geral" },
  { rota: "/dermato",          label: "Dermato",              desc: "DA · Impetigo · Escabiose · Urticária", Icon: Shield,        cor: "#EC4899", grupo: "Pediatria Geral" },
  { rota: "/sepse",            label: "Sepse Pediátrica",     desc: "SSC 2026 · BIC e diluição · Phoenix",   Icon: Activity,      cor: "#DC2626", grupo: "Pediatria Geral" },
  { rota: "/isr",              label: "ISR Pediátrica",       desc: "Sequência rápida · doses · via difícil", Icon: Zap,          cor: "#C2410C", grupo: "Pediatria Geral" },
  { rota: "/ventilacao",       label: "Ventilação Mecânica",  desc: "VC · FR · PARDS · desmame",             Icon: Wind,          cor: "#0891B2", grupo: "Pediatria Geral" },
  { rota: "/eletrolitos",      label: "Eletrólitos",          desc: "Na · K · Ca · Mg · correções",          Icon: Droplets,      cor: "#7C3AED", grupo: "Pediatria Geral" },
  { rota: "/bronquiolite",     label: "Bronquiolite",         desc: "Gravidade · OAF · nirsevimab",          Icon: Stethoscope,   cor: "#0D9488", grupo: "Pediatria Geral" },
  { rota: "/analgesia-sedacao",label: "Analgesia e Sedação",  desc: "FLACC · BIC · desmame · WAT-1",         Icon: Moon,          cor: "#F59E0B", grupo: "Pediatria Geral" },
  { rota: "/dor",              label: "Escalas de Dor",       desc: "FLACC · Wong-Baker · NRS · Escada",     Icon: Activity,      cor: "#F97316", grupo: "Pediatria Geral" },
  { rota: "/antibioticos",     label: "Antibioticoterapia",   desc: "Escolha empírica por síndrome clínica", Icon: Stethoscope,   cor: "#0D9488", grupo: "Pediatria Geral" },
  { rota: "/sedacao",          label: "Sedação",              desc: "Cetamina · Midazolam · Fentanil · Checklist", Icon: Syringe, cor: "#6366F1", grupo: "Pediatria Geral" },
  { rota: "/exames-lab",       label: "Exames Laboratoriais", desc: "Hemograma · Hormônios · Gastro · Vitaminas", Icon: Microscope, cor: "#0EA5E9", grupo: "Pediatria Geral" },
  { rota: "/torchs",           label: "Infecções Congênitas", desc: "TORCHS · sífilis, toxo, CMV, herpes, rubéola", Icon: Bug,     cor: "#E11D48", grupo: "Pediatria Geral" },
  { rota: "/intoxicacoes",     label: "Intoxicações",         desc: "Ingestão acidental · CIATOX · antídotos", Icon: AlertTriangle, cor: "#65A30D", grupo: "Pediatria Geral" },
  { rota: "/aleitamento",      label: "Aleitamento",          desc: "Amamentação · técnica · introdução alimentar", Icon: Milk, cor: "#F43F5E", grupo: "Pediatria Geral" },
  { rota: "/oftalmologia",     label: "Oftalmologia",         desc: "Reflexo vermelho · triagem visual",     Icon: Eye,           cor: "#1E3A8A", grupo: "Pediatria Geral" },
  { rota: "/doencas-exantematicas", label: "Doenças Exantemáticas", desc: "Sarampo · rubéola · exantema súbito e outros", Icon: Thermometer, cor: "#7F1D1D", grupo: "Pediatria Geral" },
  { rota: "/convulsao-febril", label: "Convulsão Febril",     desc: "Classificação simples × complexa · critérios de PL", Icon: Zap, cor: "#D946EF", grupo: "Pediatria Geral" },
  { rota: "/cardiologia-pediatrica-basica", label: "Cardiologia Pediátrica", desc: "Sopro inocente × patológico · hipertensão arterial", Icon: Heart, cor: "#BE123C", grupo: "Pediatria Geral" },
  { rota: "/adolescencia",     label: "Adolescência",            desc: "Tanner · saúde mental · contracepção",  Icon: Users,       cor: "#7E22CE", grupo: "Pediatria Geral" },
  { rota: "/teste-tea-tdah",   label: "Rastreio TEA/TDAH",       desc: "M-CHAT-R/F · DSM-5 · fluxo de encaminhamento", Icon: Brain, cor: "#3730A3", grupo: "Pediatria Geral" },

  /* ── Neonatologia (ocultos no grid — acessados via Hub; visíveis na busca) ── */
  { rota: "/cuidados-pele-rn", label: "Pele do RN",              desc: "SBP GPA 140 · Higiene · Emolientes",  Icon: Leaf,        cor: "#0891B2", grupo: "Neonatologia" },
  { rota: "/neonatologia-1",   label: "Reanimação RNPT <34s",    desc: "Sala de parto · SBP 2026",            Icon: Zap,         cor: "#0E7490", grupo: "Neonatologia" },
  { rota: "/neonatologia-6",   label: "Reanimação RN ≥34s",      desc: "Sala de parto · SBP 2026",            Icon: Wind,        cor: "#0284C7", grupo: "Neonatologia" },
  { rota: "/neonatologia-2",   label: "Hipoglicemia Neonatal",   desc: "Hipoglicemia · Gel de Dextrose",      Icon: Heart,       cor: "#0D9488", grupo: "Neonatologia" },
  { rota: "/neonatologia-3",   label: "Icterícia Neonatal",      desc: "Fototerapia AAP 2022 · Causas",       Icon: Stethoscope, cor: "#D97706", grupo: "Neonatologia" },
  { rota: "/colestase-neonatal", label: "Colestase Neonatal",    desc: "Bilirrubina direta · atresia · exames · tratamento", Icon: Droplets, cor: "#CA8A04", grupo: "Neonatologia" },
  { rota: "/neonatologia-4",   label: "Scores Neonatais",        desc: "Apgar · Capurro · Silverman",         Icon: Calculator,  cor: "#7C3AED", grupo: "Neonatologia" },
  { rota: "/neonatologia-5",   label: "NPT Neonatal",            desc: "Nutrição Parenteral Total · Eletrólitos", Icon: Droplets, cor: "#6366F1", grupo: "Neonatologia" },
  { rota: "/hipotermia",       label: "Hipotermia Terapêutica",  desc: "EHI · Thompson · reaquecimento",      Icon: Thermometer, cor: "#4F46E5", grupo: "Neonatologia" },
  { rota: "/surfactante",      label: "Surfactante",             desc: "LISA · INSURE · dose por peso",       Icon: BookOpen,    cor: "#059669", grupo: "Neonatologia" },
  { rota: "/nec",              label: "Enterocolite Necrosante", desc: "Bell · ATB por peso/IG · cirurgia",   Icon: AlertTriangle, cor: "#92400E", grupo: "Neonatologia" },
  { rota: "/canguru",          label: "Canguru",                 desc: "Prescrição e Receituário Neonatal",   Icon: Heart,       cor: "#10B981", grupo: "Neonatologia" },
  { rota: "/tig-neonatal",     label: "TIG Neonatal",            desc: "Taxa de Infusão de Glicose · UCIN",   Icon: Droplets,    cor: "#0891B2", grupo: "Neonatologia" },
  { rota: "/dexametasona-dbp", label: "Dexa DBP",                desc: "DART · Protocolo HMIB · RNPT",        Icon: Pill,        cor: "#0891B2", grupo: "Neonatologia" },
  { rota: "/dilucao-bic",      label: "Diluição e BIC",          desc: "Vasoativas · Sedoanalgesia · PGE1",   Icon: Activity,    cor: "#F97316", grupo: "Neonatologia" },
  { rota: "/dor-neonatal",     label: "Dor Neonatal",            desc: "NIPS · PIPP-R · N-PASS · CRIES",      Icon: Activity,    cor: "#EF4444", grupo: "Neonatologia" },
  { rota: "/idade-gestacional", label: "Idade Gestacional",       desc: "IGPM · idade corrigida · cronológica", Icon: CalendarClock, cor: "#2563EB", grupo: "Neonatologia" },
  { rota: "/percentis",        label: "Percentis (completo)",    desc: "OMS · Intergrowth · Fenton",          Icon: Scale,       cor: "#3B82F6", grupo: "Neonatologia" },
  { rota: "/sala-de-parto",    label: "Sala de Parto",           desc: "TOT · Sonda · Cateteres umbilicais",  Icon: Syringe,     cor: "#B45309", grupo: "Neonatologia" },
  { rota: "/triagem-neonatal", label: "Triagem Neonatal",        desc: "Pezinho · olhinho · orelhinha · coraçãozinho", Icon: Footprints, cor: "#14B8A6", grupo: "Neonatologia" },
  { rota: "/pca",              label: "PCA",                     desc: "Canal arterial · hsPDA · fechamento farmacológico", Icon: Waves, cor: "#BE185D", grupo: "Neonatologia" },
  { rota: "/malformacoes-cirurgicas-neonatais", label: "Malformações Cirúrgicas", desc: "Gastrosquise · onfalocele · hérnia diafragmática", Icon: Wind, cor: "#047857", grupo: "Neonatologia" },
  { rota: "/rop",              label: "Retinopatia da Prematuridade", desc: "Triagem · momento do exame · seguimento", Icon: ScanEye, cor: "#0369A1", grupo: "Neonatologia" },
  { rota: "/seguimento-prematuro-risco", label: "Seguimento do Prematuro", desc: "Equipe · calendário de consultas · sinais de alarme", Icon: Users, cor: "#15803D", grupo: "Neonatologia" },
];

/* ─── Palavras-chave de busca por módulo ─────────────────────────────────────
   Sinônimos, fármacos, protocolos e condições que NÃO estão no título/desc,
   para a busca encontrar "o que eu preciso" e não só "o nome do módulo". */
const SEARCH_TAGS = {
  "/percentis-oms": "peso altura estatura perimetro cefalico crescimento imc z-escore curva",
  "/urgencias": "adrenalina epinefrina pals rcp parada anafilaxia asma crise convulsiva estado de mal choque cetoacidose cad salbutamol emergencia reanimacao",
  "/formulas": "leite formula infantil hidrolisado aminoacido soja aplv alergia proteina leite vaca desmame nan aptamil",
  "/gastropediatria": "refluxo drge constipacao obstipacao alergia proteina leite vaca aplv omeprazol regurgitacao hepato hepatologia figado colestase colestase neonatal bilirrubina direta conjugada atresia vias biliares kasai ictericia colestatica ursodesoxicolico",
  "/pedfarma": "amoxicilina paracetamol dipirona ibuprofeno azitromicina cefalexina antibiotico corticoide prednisolona dexametasona omeprazol ondansetrona dose bula prescricao medicamento remedio",
  "/vacinal": "vacina imunizacao calendario sbim pni atraso bcg hepatite pentavalente triplice meningo pneumo rotavirus febre amarela hpv",
  "/hidratacao": "manutencao liquido soro reidratacao tro plano volume holliday segar desidratacao venoso",
  "/scores": "gorelick westley pews finnegan crupe desidratacao abstinencia dor triagem escore",
  "/febre-sem-foco": "febre lactente rochester pecarn bacteremia ibg sepse oculta neonato",
  "/tce-leve": "trauma cranio cabeca cranioencefalico pecarn tomografia observacao",
  "/dnpm": "desenvolvimento neuropsicomotor marcos atraso denver",
  "/dermato": "dermatite atopica impetigo escabiose sarna urticaria pele coceira prurido",
  "/sepse": "choque septico ssc surviving phoenix vasoativa noradrenalina lactato rodwell",
  "/isr": "intubacao sequencia rapida via aerea dificil cetamina rocuronio succinilcolina laringoscopia",
  "/ventilacao": "ventilador mecanica pards volume corrente peep desmame indice oxigenacao vm",
  "/eletrolitos": "sodio potassio calcio magnesio hiponatremia hipernatremia hipocalemia hipercalemia correcao kcl gluconato",
  "/bronquiolite": "vsr sibilancia oxigenio alto fluxo oaf nirsevimab lactente chiado",
  "/analgesia-sedacao": "sedacao analgesia flacc wat-1 abstinencia fentanil midazolam morfina bic desmame",
  "/dor": "escala dor flacc wong-baker faces nrs analgesia escada oms",
  "/antibioticos": "antibiotico atb empirico pneumonia itu meningite celulite escolha sindrome",
  "/sedacao": "sedacao procedimento cetamina midazolam fentanil propofol jejum checklist",
  "/exames-lab": "hemograma laboratorio valores referencia hormonio tsh ferritina vitamina d leucograma",
  "/torchs": "torch sifilis toxoplasmose citomegalovirus cmv rubeola herpes zika congenita",
  "/intoxicacoes": "intoxicacao envenenamento ingestao acidental antidoto ciatox acetilcisteina naloxona",
  "/aleitamento": "amamentacao leite materno pega mamada introducao alimentar",
  "/oftalmologia": "reflexo vermelho olhinho catarata visao triagem visual",
  "/doencas-exantematicas": "sarampo rubeola exantema subito escarlatina eritema infeccioso mao pe boca varicela",
  "/convulsao-febril": "convulsao febril crise febre puncao lombar",
  "/cardiologia-pediatrica-basica": "sopro cardiaco coracao cardiopatia inocente patologico hipertensao arterial pressao pa percentil has normotenso pressao alta tratamento anti-hipertensivo dose recem nascido neonatal dionne rn lactente",
  "/adolescencia": "adolescente tanner puberdade contracepcao saude mental",
  "/teste-tea-tdah": "autismo tea tdah m-chat rastreio deficit atencao hiperatividade",
  "/cuidados-pele-rn": "pele recem-nascido banho emoliente cordao umbilical higiene",
  "/neonatologia-1": "reanimacao neonatal sala parto prematuro rnpt vpp apgar",
  "/neonatologia-6": "reanimacao neonatal sala parto termo rnt vpp apgar",
  "/neonatologia-2": "hipoglicemia glicemia gel dextrose glicose neonatal",
  "/neonatologia-3": "ictericia bilirrubina fototerapia exsanguineotransfusao aap kernicterus",
  "/colestase-neonatal": "colestase bilirrubina direta conjugada atresia vias biliares kasai colangiografia acolia coluria fezes claras alagille pfic ursodesoxicolico udca vitaminas lipossoluveis ggt hepatologia colestase neonatal",
  "/neonatologia-4": "apgar capurro silverman ballard idade gestacional score",
  "/neonatologia-5": "npt nutricao parenteral aminoacido lipidio glicose eletrolito neonatal",
  "/hipotermia": "hipotermia terapeutica ehi encefalopatia asfixia thompson resfriamento",
  "/surfactante": "surfactante lisa insure curosurf prematuro sdr membrana hialina",
  "/nec": "enterocolite necrosante bell prematuro abdome",
  "/canguru": "metodo canguru prescricao receituario ucin",
  "/tig-neonatal": "tig taxa infusao glicose vig glicemia npt",
  "/dexametasona-dbp": "dexametasona displasia broncopulmonar dbp dart corticoide prematuro",
  "/dilucao-bic": "bomba infusao bic vasoativa dopamina dobutamina adrenalina noradrenalina milrinona pge1 dose",
  "/dor-neonatal": "dor neonatal nips pipp n-pass cries escala",
  "/idade-gestacional": "idade gestacional corrigida igpm cronologica pos-menstrual prematuro",
  "/percentis": "percentil curva fenton intergrowth oms peso estatura perimetro cefalico",
  "/sala-de-parto": "sala parto tot canula sonda cateter umbilical calibre",
  "/triagem-neonatal": "triagem pezinho olhinho orelhinha coracaozinho teste",
  "/pca": "pca canal arterial persistente hspda ibuprofeno paracetamol indometacina",
  "/malformacoes-cirurgicas-neonatais": "malformacao cirurgica gastrosquise onfalocele hernia diafragmatica atresia",
  "/rop": "retinopatia prematuridade rop triagem oftalmologica",
  "/seguimento-prematuro-risco": "seguimento prematuro follow-up alto risco calendario consultas",
};

/* Normaliza para busca: remove acentos e caixa (ex.: "ictericia" acha "Icterícia"). */
const normalizarBusca = (s) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/* Casa se TODAS as palavras da busca aparecem em label + desc + tags. */
const casaBusca = (m, termos) => {
  const hay = normalizarBusca(`${m.label} ${m.desc} ${SEARCH_TAGS[m.rota] || ""}`);
  return termos.every(t => hay.includes(t));
};

/* ─── Módulos em desenvolvimento (placeholders — sem rota) ───────────────── */
const EM_BREVE = [];

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
        background: "#FAFAFA",
        border: "1.5px dashed #D1D5DB",
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
          width: 40, height: 40, borderRadius: 12, background: "#F3F4F6",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon size={20} color="#9CA3AF" />
        </div>
        <span style={{
          fontSize: 9, fontWeight: 700, color: "#6B7280", background: "#E5E7EB",
          padding: "3px 7px", borderRadius: 20, letterSpacing: "0.04em", whiteSpace: "nowrap",
        }}>EM BREVE</span>
      </div>
      <div>
        <p style={{
          fontWeight: 700, fontSize: 16, color: "#6B7280", margin: "0 0 3px",
          lineHeight: 1.3, wordBreak: "break-word", hyphens: "auto",
        }}>{label}</p>
        <p style={{
          fontSize: 13, color: "#9CA3AF", margin: 0, lineHeight: 1.45, wordBreak: "break-word",
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
              {resultadosBusca.map(m => (
                <div key={m.rota} style={{ position: "relative" }}>
                  <ModuloCard modulo={m} onClick={() => irPara(m.rota)} />
                  <FavoritoStar rota={m.rota} ativo={favRotas.includes(m.rota)} />
                </div>
              ))}
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
