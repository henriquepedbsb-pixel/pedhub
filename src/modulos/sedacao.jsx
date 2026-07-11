// src/modulos/sedacao.jsx

import { useState } from "react";
import { Syringe, AlertTriangle, Info, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, Pill, Shield } from "lucide-react";

const CI = '#6366F1';
const CD = '#4338CA';
const CL = "var(--tint-blue)";
const CB = '#C7D2FE';
const CT = '#312E81';

const ABAS = [
  { id: 'procedimentos', label: 'Procedimentos' },
  { id: 'farmacos',      label: 'Fármacos'      },
  { id: 'classificacao', label: 'Classificação'  },
  { id: 'presedacao',    label: 'Pré-sedação'    },
  { id: 'antagonistas',  label: 'Antagonistas'   },
];

const PROCEDIMENTOS = [
  { titulo: 'Laceração / Sutura complexa', nivel: 'Moderada', nivelCor: '#F97316', nivelFundo: "var(--tint-amber)", agentes: ['Cetamina IV/IM', 'Midazolam + Cetamina'], obs: 'Cetamina dissociativa — excelente para procedimentos dolorosos. Pré-medicação com midazolam reduz reações emergentes.', ambiente: 'PS · Pronto Atendimento' },
  { titulo: 'Redução de fratura', nivel: 'Moderada–Profunda', nivelCor: '#EF4444', nivelFundo: "var(--tint-red)", agentes: ['Cetamina IV', 'Cetamina + Midazolam'], obs: 'Associar analgesia local (bloqueio de nervo) quando possível. Monitorização contínua obrigatória.', ambiente: 'PS · Sala de emergência' },
  { titulo: 'Drenagem de abscesso', nivel: 'Moderada', nivelCor: '#F97316', nivelFundo: "var(--tint-amber)", agentes: ['Cetamina IV/IM', 'Midazolam + Fentanil'], obs: 'Cetamina preferida pela manutenção de reflexos protetores de via aérea e rapidez de ação.', ambiente: 'PS · Pronto Atendimento' },
  { titulo: 'Punção lombar / Mielograma', nivel: 'Moderada', nivelCor: '#F97316', nivelFundo: "var(--tint-amber)", agentes: ['Midazolam + Fentanil', 'Cetamina IV/IM'], obs: 'Midazolam + Fentanil em procedimentos semi-eletivos. Cetamina em pacientes muito agitados ou não cooperativos.', ambiente: 'Ambulatório · Enfermaria' },
  { titulo: 'Exame de imagem (TC / RNM)', nivel: 'Leve–Moderada', nivelCor: '#F59E0B', nivelFundo: "var(--tint-amber)", agentes: ['Midazolam VO/IN', 'Óxido nitroso'], obs: 'Sedação mínima/moderada geralmente suficiente. Propofol para casos refratários — requer equipe especializada.', ambiente: 'Radiologia · Ambulatório' },
  { titulo: 'Acesso venoso difícil / PICC', nivel: 'Mínima', nivelCor: '#10B981', nivelFundo: "var(--tint-green)", agentes: ['Midazolam VO/IN', 'Óxido nitroso'], obs: 'Associar EMLA tópico (aplicar 60 min antes) e técnicas não farmacológicas (distração, posicionamento).', ambiente: 'Enfermaria · Ambulatório' },
  { titulo: 'Endoscopia / Colonoscopia', nivel: 'Profunda', nivelCor: '#EF4444', nivelFundo: "var(--tint-red)", agentes: ['Propofol + Fentanil'], obs: 'USO RESTRITO: ambiente de SO ou UTI com anestesiologista ou pediatra certificado em sedação profunda.', ambiente: 'Sala cirúrgica · UTI' },
];

const FARMACOS = [
  { id: 'midazolam', nome: 'Midazolam', classe: 'Benzodiazepínico', nivel: 'Mínima → Moderada', nivelCor: '#F59E0B', onset: 'VO: 15–30 min · IN: 5–10 min · IV: 2–3 min', duracao: '30–60 min', indicacoes: ['Ansiolítico pré-procedimento', 'Sedação leve/moderada', 'Pré-medicação para cetamina (reduz reações emergentes)'], contraindicacoes: ['Glaucoma de ângulo fechado', 'Apneia do sono grave não tratada', 'Hipersensibilidade a benzodiazepínicos'], monitoracao: ['SatO₂', 'FC', 'FR', 'Nível de consciência'], antagonista: 'Flumazenil', notas: ['Pode causar depressão respiratória dose-dependente — monitorar ventilação', 'Reação paradoxal (agitação) — mais comum em < 6 anos e em TEA/deficiência intelectual', 'Via intranasal (IN): útil sem acesso venoso — biodisponibilidade comparável ao IV'], ambiente: 'PS · Ambulatório · Enfermaria · UTI', cor: '#3B82F6', fundo: "var(--tint-blue)" },
  { id: 'cetamina', nome: 'Cetamina', classe: 'Dissociativo (antagonista NMDA)', nivel: 'Dissociativa', nivelCor: CI, onset: 'IV: 1–2 min · IM: 3–5 min', duracao: 'IV: 10–20 min · IM: 20–30 min', indicacoes: ['Procedimentos dolorosos: lacerações, fraturas, abscessos', 'Pacientes agitados ou não cooperativos', 'Broncoespasmo grave (broncodilatador direto)'], contraindicacoes: ['< 3 meses', 'Hipertensão intracraniana / TCE grave', 'Psicose ativa ou antecedente psiquiátrico grave', 'Procedimentos de laringe/faringe — risco de laringoespasmo'], monitoracao: ['SatO₂', 'FC', 'PA', 'FR', 'Nível de sedação'], antagonista: '— (sem antagonista específico)', notas: ['Mantém tônus muscular e reflexos protetores — vantagem em emergências', 'Pré-medicar com midazolam reduz reações emergentes (agitação, pesadelos)', 'Injeção IV rápida pode causar apneia transitória — administrar em 1–2 min', 'Aumenta PA — favorável em hipovolemia; cuidado em cardiopatia/HAS'], ambiente: 'PS · Emergência · UTI · Qualquer ambiente com monitorização', cor: CI, fundo: CL },
  { id: 'fentanil', nome: 'Fentanil', classe: 'Opioide sintético μ', nivel: 'Analgesia + Moderada', nivelCor: '#F97316', onset: 'IV: 2–5 min · IN: 5–10 min', duracao: '30–60 min', indicacoes: ['Analgesia em procedimentos dolorosos', 'Sedação moderada associado a midazolam', 'Sedoanalgesia em UTI pediátrica'], contraindicacoes: ['Depressão respiratória ativa não tratada', 'Hipersensibilidade conhecida a opioides'], monitoracao: ['SatO₂ contínua', 'FR', 'FC', 'RASS (nível de sedação)'], antagonista: 'Naloxona', notas: ['Depressão respiratória — principal risco; ter NALOXONA disponível sempre', '"Síndrome do tórax rígido" com infusão IV rápida — administrar lentamente (> 2–3 min)', 'Via intranasal (IN) útil em pediatria — boa biodisponibilidade', 'Gotejamento contínuo em UTI → ver módulo Diluição BIC'], ambiente: 'UTI · PS · Sala cirúrgica', cor: '#EF4444', fundo: "var(--tint-red)" },
  { id: 'propofol', nome: 'Propofol', classe: 'Hipnótico IV (não barbitúrico)', nivel: 'Profunda → Anestesia geral', nivelCor: '#7C3AED', onset: 'IV: 30–60 s', duracao: '5–10 min por dose', indicacoes: ['Sedação profunda para endoscopia/colonoscopia', 'Sedação em VM (UTI pediátrica)', 'Procedimentos em sala cirúrgica'], contraindicacoes: ['< 1 mês', 'Cautela em < 3 anos para sedação de procedimento', 'Instabilidade hemodinâmica grave', 'Risco de síndrome de infusão (doses > 4–5 mg/kg/h por > 48h)'], monitoracao: ['SatO₂ contínua', 'FR', 'PA', 'FC', 'Capnografia (ETCO₂) obrigatória', 'Acesso IV seguro e exclusivo'], antagonista: '— (sem antagonista específico)', notas: ['USO RESTRITO: UTI/SO com profissional treinado em sedação profunda e intubação', 'Hipotensão frequente — ter suporte hemodinâmico disponível', 'Apneia após doses de indução — suporte ventilatório OBRIGATÓRIO acessível', 'Síndrome de infusão: acidose, rabdomiólise, arritmia — risco com doses elevadas > 48h', 'Gotejamento contínuo → ver módulo Diluição BIC'], ambiente: 'UTI pediátrica · Sala cirúrgica EXCLUSIVAMENTE', cor: "var(--muted)", fundo: "var(--surface-2)" },
  { id: 'oxido', nome: 'Óxido Nitroso (N₂O)', classe: 'Anestésico inalatório', nivel: 'Mínima → Moderada', nivelCor: '#10B981', onset: '2–5 min', duracao: '5–10 min após suspensão', indicacoes: ['Procedimentos curtos: sutura simples, curativos, acesso venoso', 'Ansiolítico para exames de imagem em crianças colaborativas (≥ 3 anos)', 'Combinação com EMLA tópico'], contraindicacoes: ['Obstrução intestinal / pneumotórax', 'Cirurgia otológica ou ocular recente', 'Deficiência de vitamina B12', 'Agitação intensa ou TEA grave'], monitoracao: ['SatO₂', 'FR', 'Nível de consciência'], antagonista: '— (suspensão imediata do gás)', notas: ['Disponibilidade limitada no Brasil — verificar no serviço antes de planejar', 'Recuperação rápida (5–10 min) — vantagem em procedimentos ambulatoriais curtos', 'Concentração máxima: 70% N₂O + 30% O₂', 'Náuseas pós-procedimento em 10–15% — observar por 30 min'], ambiente: 'PS · Ambulatório · Odontopediatria (onde disponível)', cor: '#10B981', fundo: "var(--tint-green)" },
];

const NIVEIS = [
  { nivel: 'Mínima / Ansiolítica', definicao: 'Redução da ansiedade com resposta normal a estímulos verbais. Cognição pode estar levemente prejudicada.', viasAereas: 'Não afetadas', ventilacao: 'Não afetada', cardiovascular: 'Não afetada', monitoracao: 'Observação clínica · SatO₂ recomendado', profissional: 'Pediatra geral treinado', farmacos: ['Midazolam VO/IN (baixas doses)', 'Óxido nitroso ≤ 50%'], cor: '#10B981', fundo: "var(--tint-green)", borda: '#A7F3D0' },
  { nivel: 'Moderada (Sedação Consciente)', definicao: 'Resposta proposital a estímulos verbais ou tácteis leves. Paciente mantém vias aéreas sem intervenção.', viasAereas: 'Sem intervenção necessária', ventilacao: 'Adequada', cardiovascular: 'Geralmente mantida', monitoracao: 'SatO₂ contínua · FC · FR · PA · Capnografia (ideal)', profissional: 'Pediatra com treinamento em sedação', farmacos: ['Midazolam IV', 'Cetamina (categoria especial)', 'Midazolam + Fentanil'], cor: '#F97316', fundo: "var(--tint-amber)", borda: '#FED7AA' },
  { nivel: 'Profunda', definicao: 'Resposta apenas a estímulos dolorosos repetidos. Paciente pode não manter vias aéreas espontaneamente.', viasAereas: 'Pode necessitar intervenção', ventilacao: 'Pode ser inadequada — risco de apneia', cardiovascular: 'Geralmente mantida, pode ser comprometida', monitoracao: 'SatO₂ · FC · FR · PA · Capnografia OBRIGATÓRIA (ETCO₂)', profissional: 'Pediatra com treinamento avançado ou anestesiologista', farmacos: ['Propofol ± Fentanil', 'Cetamina em altas doses'], cor: '#EF4444', fundo: "var(--tint-red)", borda: '#FECACA' },
];

const JEJUM = [
  { tipo: 'Líquidos claros (água, chá, suco sem polpa)', tempo: '2 horas' },
  { tipo: 'Leite materno', tempo: '4 horas' },
  { tipo: 'Fórmula infantil / Leite não materno', tempo: '6 horas' },
  { tipo: 'Refeição leve (biscoito, torrada)', tempo: '6 horas' },
  { tipo: 'Refeição completa (sólidos, gordurosos)', tempo: '8 horas' },
];

const ASA_DATA = [
  { classe: 'ASA I',   def: 'Paciente saudável, sem comorbidades',                                                    cor: '#10B981', fundo: "var(--tint-green)" },
  { classe: 'ASA II',  def: 'Doença sistêmica leve e compensada (asma leve, obesidade leve, DM controlado)',           cor: '#84CC16', fundo: "var(--tint-green)" },
  { classe: 'ASA III', def: 'Doença sistêmica grave (asma grave, cardiopatia, obesidade mórbida) — cautela adicional', cor: '#F97316', fundo: "var(--tint-amber)" },
  { classe: 'ASA IV',  def: 'Risco de vida. Sedação APENAS com anestesiologista presente',                             cor: '#EF4444', fundo: "var(--tint-red)" },
];

const CHECKLIST = [
  'Acesso venoso pérvio (ou plano para acesso imediato)',
  'Oxigênio disponível e funcionando (máscara, cateter nasal)',
  'Bolsa-valva-máscara no tamanho correto para o paciente',
  'Aspirador funcionando',
  'Monitor multiparamétrico instalado (SatO₂, FC, PA, FR)',
  'Capnografia disponível (obrigatória em sedação profunda)',
  'Antagonistas na bandeja: Flumazenil + Naloxona preparados',
  'Desfibrilador / DEA acessível',
  'Consentimento informado documentado',
  'Avaliação ASA registrada em prontuário',
  'Jejum confirmado (regra 2-4-6-8)',
];

const ANTAGONISTAS_DATA = [
  { nome: 'Flumazenil', reverte: 'Benzodiazepínicos (Midazolam, Diazepam)', cor: '#3B82F6', fundo: "var(--tint-blue)", borda: '#BFDBFE', indicacao: 'Sedação excessiva ou depressão respiratória por benzodiazepínico', observacoes: ['Onset rápido: 1–2 min IV', 'Duração CURTA: 30–60 min — risco de re-sedação; monitorizar por ≥ 2h', 'Pode ser necessária redose — reavaliar após 5–10 min', 'NÃO usar como rotina para "acordar" o paciente', 'Dose → Pedfarma'], aviso: 'Pode precipitar convulsões em pacientes com uso crônico de benzodiazepínicos ou epilepsia em tratamento.' },
  { nome: 'Naloxona', reverte: 'Opioides (Fentanil, Morfina, Tramadol, Codeína)', cor: '#EF4444', fundo: "var(--tint-red)", borda: '#FECACA', indicacao: 'Depressão respiratória por opioide (FR ↓, SatO₂ em queda, nível de consciência reduzido)', observacoes: ['Onset muito rápido: 1–2 min IV', 'Duração CURTA: 30–90 min — opioide pode durar mais; monitorizar por 2–4h', 'Reverte também a ANALGESIA — pode causar dor intensa e agitação súbita', 'Administrar em doses tituladas pequenas (0,01 mg/kg): objetivo é restaurar ventilação', 'Dose → Pedfarma'], aviso: 'Em dependentes de opioides: pode precipitar síndrome de abstinência aguda grave — dosar com extremo cuidado.' },
];

export default function Sedacao() {
  const [aba, setAba] = useState('procedimentos');
  const [expandido, setExpandido] = useState(null);
  const F = { fontFamily: 'DM Sans, sans-serif' };
  const toggle = (id) => setExpandido(prev => prev === id ? null : id);

  return (
    <div style={{ ...F, background: "var(--tint-slate)", minHeight: '100vh', paddingBottom: 80, maxWidth: 420, margin: '0 auto' }}>

      <div style={{ background: CI, padding: '20px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Syringe size={22} color="#fff" />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Sedação em Procedimentos</div>
            <div style={{ fontSize: 12, color: '#fff', opacity: 0.88 }}>Fármacos · Classificação · Checklist · Antagonistas</div>
          </div>
        </div>
      </div>

      <div style={{ background: "var(--surface)", borderBottom: '1px solid var(--border)', padding: '10px 12px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 8, minWidth: 'max-content' }}>
          {ABAS.map(t => (
            <button key={t.id} onClick={() => setAba(t.id)} style={{ padding: '8px 14px', borderRadius: 20, fontSize: 13, ...F, border: `1.5px solid ${aba === t.id ? CI : "var(--border)"}`, background: aba === t.id ? CI : "var(--surface-2)", color: aba === t.id ? '#fff' : "var(--text-2)", fontWeight: aba === t.id ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {aba === 'procedimentos' && (
        <div style={{ padding: '12px' }}>
          <div style={{ background: CL, border: `1px solid ${CB}`, borderRadius: 10, padding: 12, marginBottom: 12, display: 'flex', gap: 8 }}>
            <Info size={16} color={CI} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: CT, lineHeight: 1.6 }}>Guia de <strong>escolha empírica</strong> por procedimento. Doses por peso → <strong>Pedfarma</strong>.</div>
          </div>
          {PROCEDIMENTOS.map((p, i) => (
            <div key={i} style={{ background: "var(--surface)", borderRadius: 12, padding: 14, border: '1px solid var(--border)', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-2)", lineHeight: 1.4, flex: 1 }}>{p.titulo}</div>
                <span style={{ background: p.nivelFundo, color: p.nivelCor, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, flexShrink: 0, whiteSpace: 'nowrap' }}>{p.nivel}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {p.agentes.map((a, ai) => <span key={ai} style={{ background: CL, color: CD, fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20, border: `1px solid ${CB}` }}>{a}</span>)}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 6 }}>{p.obs}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: CI }} />
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Ambiente: {p.ambiente}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {aba === 'farmacos' && (
        <div style={{ padding: '12px' }}>
          <div style={{ background: CL, border: `1px solid ${CB}`, borderRadius: 10, padding: 12, marginBottom: 12, display: 'flex', gap: 8 }}>
            <Info size={16} color={CI} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: CT, lineHeight: 1.6 }}>Perfil clínico de cada fármaco. <strong>Toque para expandir. Doses → Pedfarma.</strong></div>
          </div>
          {FARMACOS.map((f) => {
            const aberto = expandido === f.id;
            return (
              <div key={f.id} style={{ background: "var(--surface)", borderRadius: 12, border: `1.5px solid ${aberto ? f.cor : "var(--border)"}`, marginBottom: 10, overflow: 'hidden' }}>
                <button onClick={() => toggle(f.id)} style={{ width: '100%', textAlign: 'left', padding: '14px', background: aberto ? f.fundo : "var(--surface)", border: 'none', cursor: 'pointer', ...F, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: aberto ? f.cor : '#1F2937' }}>{f.nome}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", background: "var(--surface-2)", padding: '2px 8px', borderRadius: 20 }}>{f.classe}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ background: f.nivelCor + '22', color: f.nivelCor, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{f.nivel}</span>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{f.ambiente}</span>
                    </div>
                  </div>
                  {aberto ? <ChevronUp size={18} color={f.cor} style={{ flexShrink: 0, marginLeft: 8 }} /> : <ChevronDown size={18} color="var(--muted)" style={{ flexShrink: 0, marginLeft: 8 }} />}
                </button>
                {aberto && (
                  <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${f.cor}30` }}>
                    <div style={{ display: 'flex', gap: 10, marginTop: 12, marginBottom: 12 }}>
                      <div style={{ flex: 1, background: "var(--bg)", borderRadius: 8, padding: '8px 12px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: 'uppercase' }}>Onset</div>
                        <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>{f.onset}</div>
                      </div>
                      <div style={{ flex: 1, background: "var(--bg)", borderRadius: 8, padding: '8px 12px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: 'uppercase' }}>Duração</div>
                        <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>{f.duracao}</div>
                      </div>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Indicações</div>
                      {f.indicacoes.map((ind, ii) => <div key={ii} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '3px 0' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: f.cor, flexShrink: 0, marginTop: 4 }} /><span style={{ fontSize: 12, color: "var(--text-2)" }}>{ind}</span></div>)}
                    </div>
                    <div style={{ background: "var(--tint-red)", border: '1px solid #FECACA', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--tx-red)", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Contraindicações</div>
                      {f.contraindicacoes.map((c, ci) => <div key={ci} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '2px 0' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', flexShrink: 0, marginTop: 4 }} /><span style={{ fontSize: 12, color: "var(--tx-red)" }}>{c}</span></div>)}
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Monitoração</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{f.monitoracao.map((m, mi) => <span key={mi} style={{ background: "var(--surface-2)", color: "var(--text-2)", fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>{m}</span>)}</div>
                    </div>
                    <div style={{ background: "var(--tint-blue)", border: '1px solid #BFDBFE', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--tx-blue)", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Notas clínicas</div>
                      {f.notas.map((n, ni) => <div key={ni} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '3px 0' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', flexShrink: 0, marginTop: 4 }} /><span style={{ fontSize: 12, color: "var(--tx-blue)", lineHeight: 1.5 }}>{n}</span></div>)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: "var(--bg)", borderRadius: 8, padding: '8px 10px' }}>
                      <Shield size={14} color="var(--muted)" /><span style={{ fontSize: 12, color: "var(--text-2)" }}><strong>Antagonista:</strong> {f.antagonista}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {aba === 'classificacao' && (
        <div style={{ padding: '12px' }}>
          <div style={{ background: CL, border: `1px solid ${CB}`, borderRadius: 10, padding: 12, marginBottom: 12, display: 'flex', gap: 8 }}>
            <Info size={16} color={CI} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: CT, lineHeight: 1.6 }}>Classificação <strong>AAP/ASA</strong> dos níveis de sedação pediátrica (Cote CJ et al., Pediatrics 2019).</div>
          </div>
          {NIVEIS.map((n, i) => (
            <div key={i} style={{ background: n.fundo, border: `1.5px solid ${n.borda}`, borderRadius: 12, padding: 16, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: n.cor, flexShrink: 0 }} />
                <div style={{ fontSize: 15, fontWeight: 800, color: n.cor }}>{n.nivel}</div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 10, fontStyle: 'italic' }}>"{n.definicao}"</div>
              {[{ label: 'Vias aéreas', value: n.viasAereas }, { label: 'Ventilação', value: n.ventilacao }, { label: 'Cardiovascular', value: n.cardiovascular }, { label: 'Monitoração', value: n.monitoracao }, { label: 'Profissional', value: n.profissional }].map((row, ri) => (
                <div key={ri} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: ri < 4 ? `1px solid ${n.borda}` : 'none' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: n.cor, minWidth: 90, flexShrink: 0 }}>{row.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{row.value}</div>
                </div>
              ))}
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: n.cor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Fármacos típicos</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{n.farmacos.map((f, fi) => <span key={fi} style={{ background: 'rgba(255,255,255,0.7)', color: n.cor, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, border: `1px solid ${n.borda}` }}>{f}</span>)}</div>
              </div>
            </div>
          ))}
          <div style={{ background: CL, border: `1.5px solid ${CB}`, borderRadius: 12, padding: 14 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <AlertCircle size={16} color={CI} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: CD, marginBottom: 4 }}>Cetamina — Categoria Especial (Dissociativa)</div>
                <div style={{ fontSize: 12, color: CT, lineHeight: 1.6 }}>Produz <strong>sedação dissociativa</strong> — não se encaixa na escala convencional. O paciente parece profundamente sedado mas mantém reflexos protetores, tônus muscular e ventilação. Requer monitoração equivalente ao nível moderado.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {aba === 'presedacao' && (
        <div style={{ padding: '12px' }}>
          <div style={{ background: "var(--surface)", borderRadius: 12, padding: 14, border: '1px solid var(--border)', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Clock size={18} color={CI} />
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-2)" }}>Jejum Pré-sedação (Regra 2-4-6-8)</div>
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10, lineHeight: 1.5 }}>Aplicar o tempo mais restritivo compatível com o que foi ingerido por último.</div>
            {JEJUM.map((j, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < JEJUM.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize: 12, color: "var(--text-2)", flex: 1, paddingRight: 10 }}>{j.tipo}</div>
                <div style={{ background: CL, color: CD, fontSize: 13, fontWeight: 800, padding: '4px 12px', borderRadius: 20, flexShrink: 0, border: `1px solid ${CB}` }}>{j.tempo}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "var(--surface)", borderRadius: 12, padding: 14, border: '1px solid var(--border)', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-2)", marginBottom: 10 }}>Classificação ASA — Risco Pré-sedação</div>
            {ASA_DATA.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < ASA_DATA.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'flex-start' }}>
                <span style={{ background: a.fundo, color: a.cor, fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6, flexShrink: 0, minWidth: 58, textAlign: 'center' }}>{a.classe}</span>
                <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{a.def}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "var(--surface)", borderRadius: 12, padding: 14, border: '1px solid var(--border)', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-2)", marginBottom: 4 }}>Checklist de Material</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>Verificar ANTES de iniciar qualquer sedação</div>
            {CHECKLIST.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: i < CHECKLIST.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'flex-start' }}>
                <CheckCircle size={14} color={CI} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "var(--tint-amber)", border: '1.5px solid #FDE68A', borderRadius: 10, padding: 12, marginBottom: 12, display: 'flex', gap: 8 }}>
            <AlertTriangle size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: "var(--tx-amber)", lineHeight: 1.6 }}><strong>Emergência com risco de vida:</strong> Não retardar sedação aguardando jejum. Priorizar suporte de via aérea e ter aspirador pronto.</div>
          </div>
        </div>
      )}

      {aba === 'antagonistas' && (
        <div style={{ padding: '12px' }}>
          <div style={{ background: CL, border: `1px solid ${CB}`, borderRadius: 10, padding: 12, marginBottom: 12, display: 'flex', gap: 8 }}>
            <Info size={16} color={CI} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: CT, lineHeight: 1.6 }}>Antagonistas de resgate. <strong>Ter SEMPRE preparados na bandeja antes de iniciar qualquer sedação.</strong></div>
          </div>
          {ANTAGONISTAS_DATA.map((ant, i) => (
            <div key={i} style={{ background: ant.fundo, border: `1.5px solid ${ant.borda}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: ant.cor }}>{ant.nome}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Reverte: <strong>{ant.reverte}</strong></div>
                </div>
                <Shield size={22} color={ant.cor} style={{ flexShrink: 0 }} />
              </div>
              <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: ant.cor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Indicação</div>
                <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{ant.indicacao}</div>
              </div>
              <div style={{ marginBottom: 10 }}>
                {ant.observacoes.map((obs, oi) => (
                  <div key={oi} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '4px 0', borderBottom: oi < ant.observacoes.length - 1 ? `1px solid ${ant.borda}` : 'none' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: ant.cor, flexShrink: 0, marginTop: 4 }} />
                    <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{obs}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "var(--tint-red)", border: '1px solid #FECACA', borderRadius: 8, padding: '8px 10px', display: 'flex', gap: 8 }}>
                <AlertTriangle size={14} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12, color: "var(--tx-red)", lineHeight: 1.5 }}>{ant.aviso}</span>
              </div>
            </div>
          ))}
          <div style={{ background: "var(--tint-purple)", border: '1.5px solid #DDD6FE', borderRadius: 12, padding: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
            <Pill size={20} color="#8B5CF6" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--tx-purple)" }}>Doses por peso</div>
              <div style={{ fontSize: 12, color: '#7C3AED', marginTop: 2 }}>Flumazenil e Naloxona → calcule doses no módulo <strong>Pedfarma</strong>.</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ margin: '0 12px 12px', padding: '12px 14px', background: "var(--tint-slate)", borderRadius: 10, fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
        <strong>Apoio à decisão clínica.</strong> Não substitui julgamento médico nem protocolo institucional. Sedação deve ser realizada por profissional treinado com estrutura adequada de monitorização e suporte ventilatório. Fontes: Cote CJ et al., Pediatrics 2019 (AAP Sedation Guidelines) · ASA Physical Status Classification 2020 · SBP.
      </div>
    </div>
  );
}
