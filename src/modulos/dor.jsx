import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, ChevronDown, ChevronUp, Info } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function interpretarDor(score) {
  if (score === 0) return { texto: 'Sem dor detectada', cor: '#10B981', degrau: 0 };
  if (score <= 3) return { texto: 'Dor leve', cor: '#22C55E', degrau: 1 };
  if (score <= 6) return { texto: 'Dor moderada', cor: '#F59E0B', degrau: 2 };
  return { texto: 'Dor intensa', cor: '#EF4444', degrau: 3 };
}

function getCorFace(valor) {
  if (valor === 0)  return '#10B981';
  if (valor === 2)  return '#22C55E';
  if (valor === 4)  return '#84CC16';
  if (valor === 6)  return '#F59E0B';
  if (valor === 8)  return '#F97316';
  return '#EF4444';
}

function FaceSVG({ valor }) {
  const cor = getCorFace(valor);
  const bocaPath = {
    0:  'M 8 15 Q 12 19 16 15',
    2:  'M 8 14 Q 12 17 16 14',
    4:  'M 8 14 L 16 14',
    6:  'M 8 14 Q 12 11 16 14',
    8:  'M 8 15 Q 12 10 16 15',
    10: 'M 8 16 Q 12 9 16 16',
  }[valor] || 'M 8 14 L 16 14';

  return (
    <svg viewBox="0 0 24 24" width="38" height="38" style={{ display: 'block', margin: '0 auto' }}>
      <circle cx="12" cy="12" r="11" fill={cor} />
      {valor < 8 ? (
        <>
          <circle cx="8.5" cy="9" r="1.5" fill="white" />
          <circle cx="15.5" cy="9" r="1.5" fill="white" />
        </>
      ) : (
        <>
          <line x1="7" y1="9" x2="10" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="14" y1="9" x2="17" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          {valor === 10 && (
            <>
              <ellipse cx="8.5" cy="12" rx="0.7" ry="1.2" fill="white" opacity="0.75" />
              <ellipse cx="15.5" cy="12" rx="0.7" ry="1.2" fill="white" opacity="0.75" />
            </>
          )}
        </>
      )}
      <path d={bocaPath} stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ─── Dados ────────────────────────────────────────────────────────────────────

export const FLACC_CATS = [
  {
    id: 'face',
    nome: 'Face',
    opcoes: [
      { v: 0, texto: 'Sem expressão ou sorriso' },
      { v: 1, texto: 'Careta ou franzir de sobrancelha ocasional; introvertido' },
      { v: 2, texto: 'Queixo tremendo; mandíbula crispada com frequência' },
    ],
  },
  {
    id: 'legs',
    nome: 'Pernas',
    opcoes: [
      { v: 0, texto: 'Posição normal ou relaxada' },
      { v: 1, texto: 'Inquieto, agitado, tenso' },
      { v: 2, texto: 'Chutando ou pernas esticadas/rígidas' },
    ],
  },
  {
    id: 'activity',
    nome: 'Atividade',
    opcoes: [
      { v: 0, texto: 'Deitado tranquilo, posição normal, move-se facilmente' },
      { v: 1, texto: 'Se contorcendo, movendo para frente e para trás, tenso' },
      { v: 2, texto: 'Arqueado, rígido ou se sacudindo' },
    ],
  },
  {
    id: 'cry',
    nome: 'Choro',
    opcoes: [
      { v: 0, texto: 'Sem choro (acordado ou dormindo)' },
      { v: 1, texto: 'Gemidos, choramingos, queixa ocasional' },
      { v: 2, texto: 'Choro constante, gritos ou soluços frequentes' },
    ],
  },
  {
    id: 'consolability',
    nome: 'Consolabilidade',
    opcoes: [
      { v: 0, texto: 'Contente, relaxado' },
      { v: 1, texto: 'Confortado pelo toque, abraço ou conversa; distraível' },
      { v: 2, texto: 'Difícil de consolar ou confortar' },
    ],
  },
];

const WONG_FACES = [
  { valor: 0,  desc: 'Sem dor' },
  { valor: 2,  desc: 'Dói um pouco' },
  { valor: 4,  desc: 'Dói mais' },
  { valor: 6,  desc: 'Dói bastante' },
  { valor: 8,  desc: 'Dói muito' },
  { valor: 10, desc: 'Pior dor' },
];

const ESCADA = [
  {
    degrau: 1,
    rotulo: 'Dor Leve (1–3)',
    cor: '#22C55E',
    corFundo: '#F0FDF4',
    drogas: [
      'Dipirona 15–25 mg/kg/dose VO/IV 6/6h (máx 1 g/dose) · ≥ 3 meses',
      'Paracetamol 10–15 mg/kg/dose VO 4/4–6/6h (máx 75 mg/kg/dia ou 4 g/dia)',
      'Ibuprofeno 5–10 mg/kg/dose VO 6/6–8/8h (máx 40 mg/kg/dia) · ≥ 3 meses',
    ],
    alerta: null,
  },
  {
    degrau: 2,
    rotulo: 'Dor Moderada (4–6)',
    cor: '#F59E0B',
    corFundo: '#FFFBEB',
    drogas: [
      'Tramadol 1–2 mg/kg/dose VO/IV 6/6–8/8h (máx 100 mg/dose) · ≥ 1 ano',
      'Associar analgésico não opioide do Degrau 1',
    ],
    alerta: 'Codeína CONTRAINDICADA em < 12 anos (FDA 2013) e pós-adenotonsilectomia < 18 anos — risco de depressão respiratória fatal.',
  },
  {
    degrau: 3,
    rotulo: 'Dor Intensa (7–10)',
    cor: '#EF4444',
    corFundo: '#FFF5F5',
    drogas: [
      'Morfina 0,1–0,2 mg/kg/dose IV/SC 3/3–4/4h (máx 15 mg/dose)',
      'Associar analgésico não opioide do Degrau 1',
      'Ter naloxona disponível: 0,01 mg/kg IV — ver Pedfarma',
    ],
    alerta: 'Monitorizar FR, SpO₂, sedação e função intestinal. Evitar em < 6 meses sem suporte especializado.',
  },
];

const NAO_FARM = [
  {
    faixa: 'RN (0–28 dias)',
    medidas: [
      'Sacarose oral 24%: 0,5–2 mL administrados 2 min antes do procedimento (evidência Ia)',
      'Sucção não nutritiva com chupeta (associar à sacarose — efeito sinérgico)',
      'Contato pele a pele / método canguru durante procedimento',
      'Redução de estímulos ambientais (luz, som) · posicionamento em flexão (ninho)',
    ],
  },
  {
    faixa: 'Lactentes (1–12 meses)',
    medidas: [
      'Sacarose oral 24% + sucção não nutritiva',
      'Amamentação durante procedimentos curtos (analgesia comprovada)',
      'Distração com sons e objetos coloridos',
      'EMLA® 60 min antes de procedimento com agulha (≥ 3 meses)',
    ],
  },
  {
    faixa: 'Pré-escolar (1–6 anos)',
    medidas: [
      'Distração ativa: brinquedo, vídeo, bolhas de sabão',
      'Posicionamento no colo do cuidador (reduz ansiedade e dor percebida)',
      'EMLA® 60 min antes de procedimentos com agulha',
      'Linguagem positiva e preparação prévia ao procedimento',
    ],
  },
  {
    faixa: 'Escolar / Adolescente (≥ 6 anos)',
    medidas: [
      'Técnicas de respiração e relaxamento muscular progressivo',
      'Visualização guiada e distração cognitiva',
      'EMLA® para procedimentos com agulha',
      'Participação ativa nas decisões do procedimento (aumenta senso de controle)',
    ],
  },
];

const CONTRAINDICACOES = [
  'Dipirona: contraindicada em < 3 meses',
  'Ibuprofeno: contraindicado em < 3 meses, dengue suspeita, nefropatia',
  'AAS: contraindicado em < 12 anos (risco de Síndrome de Reye)',
  'Codeína: contraindicada em < 12 anos (FDA 2013) e pós-adenotonsilectomia < 18 anos',
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Dor() {
  const [abaAtiva, setAbaAtiva] = useState('escalas');
  const [escalaAtiva, setEscalaAtiva] = useState('flacc');
  const [flacc, setFlacc] = useState({
    face: null, legs: null, activity: null, cry: null, consolability: null,
  });
  const [wongBaker, setWongBaker] = useState(null);
  const [nrs, setNrs] = useState(null);
  const [expandido, setExpandido] = useState(null);

  // Scores e interpretações
  const flaccScore = Object.values(flacc).reduce((s, v) => s + (v ?? 0), 0);
  const flaccCompleto = Object.values(flacc).every(v => v !== null);
  const flaccInterp = interpretarDor(flaccScore);
  const wongInterp = wongBaker !== null ? interpretarDor(wongBaker) : null;
  const nrsInterp = nrs !== null ? interpretarDor(nrs) : null;

  const resetFlacc = () =>
    setFlacc({ face: null, legs: null, activity: null, cry: null, consolability: null });

  const irParaAnalgesia = degrau => {
    setExpandido(degrau);
    setAbaAtiva('analgesia');
  };

  const toggleAccordion = chave =>
    setExpandido(expandido === chave ? null : chave);

  const ABAS = [
    { id: 'escalas',  label: 'Escalas' },
    { id: 'analgesia', label: 'Analgesia' },
    { id: 'nao-farm', label: 'Não Farmac.' },
  ];

  const ESCALAS_INFO = [
    { id: 'flacc', label: 'FLACC',      idade: '< 3 anos · sem fala' },
    { id: 'wong',  label: 'Wong-Baker', idade: '3–7 anos' },
    { id: 'nrs',   label: 'NRS',        idade: '≥ 8 anos' },
  ];

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', backgroundColor: '#F9FAFB', minHeight: '100vh', padding: '16px' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
        borderRadius: '16px', padding: '20px 20px 18px',
        marginBottom: '16px', color: 'white',
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', margin: 0, lineHeight: 1.2 }}>
          Dor em Pediatria
        </h1>
        <p style={{ fontSize: '13px', margin: '6px 0 0', opacity: 0.9 }}>
          Avaliação · Escada analgésica · Medidas não farmacológicas
        </p>
      </div>

      {/* ── Abas principais ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {ABAS.map(aba => (
          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            style={{
              flex: 1,
              padding: '9px 4px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '700',
              backgroundColor: abaAtiva === aba.id ? '#F97316' : '#F3F4F6',
              color: abaAtiva === aba.id ? '#FFFFFF' : '#6B7280',
            }}
          >
            {aba.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: ESCALAS
      ══════════════════════════════════════════════════════════════════════ */}
      {abaAtiva === 'escalas' && (
        <div>
          {/* Seletor de escala */}
          <div style={{
            backgroundColor: 'white', borderRadius: '12px',
            padding: '14px', marginBottom: '12px', border: '1px solid #FED7AA',
          }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#374151', margin: '0 0 10px' }}>
              Selecionar escala por faixa etária
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {ESCALAS_INFO.map(e => (
                <button
                  key={e.id}
                  onClick={() => setEscalaAtiva(e.id)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: '10px',
                    border: escalaAtiva === e.id ? '2px solid #F97316' : '1px solid #E5E7EB',
                    backgroundColor: escalaAtiva === e.id ? '#FFF7ED' : 'white',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: '700', color: escalaAtiva === e.id ? '#EA580C' : '#374151' }}>
                    {e.label}
                  </div>
                  <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px', lineHeight: 1.3 }}>
                    {e.idade}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── FLACC ─────────────────────────────────────────────────────── */}
          {escalaAtiva === 'flacc' && (
            <div>
              <div style={{
                backgroundColor: '#FFF7ED', borderRadius: '10px',
                padding: '10px 12px', marginBottom: '10px', borderLeft: '3px solid #F97316',
              }}>
                <p style={{ fontSize: '12px', color: '#92400E', margin: 0, lineHeight: 1.5 }}>
                  <strong>FLACC</strong> — Lactentes e crianças sem comunicação verbal efetiva.
                  Score 0–10. Validada a partir de 2 meses.
                  Referência: Merkel et al., Pediatric Nursing 1997.
                </p>
              </div>

              {FLACC_CATS.map(cat => (
                <div key={cat.id} style={{
                  backgroundColor: 'white', borderRadius: '12px',
                  padding: '12px 14px', marginBottom: '8px',
                  border: '1px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>
                      {cat.nome}
                    </span>
                    {flacc[cat.id] !== null && (
                      <span style={{
                        fontSize: '13px', fontWeight: '700', color: '#F97316',
                        backgroundColor: '#FFF7ED', padding: '2px 10px', borderRadius: '8px',
                      }}>
                        {flacc[cat.id]}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {cat.opcoes.map(op => (
                      <button
                        key={op.v}
                        onClick={() => setFlacc(prev => ({ ...prev, [cat.id]: op.v }))}
                        style={{
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: flacc[cat.id] === op.v ? '2px solid #F97316' : '1px solid #E5E7EB',
                          backgroundColor: flacc[cat.id] === op.v ? '#FFF7ED' : '#F9FAFB',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '13px',
                          color: flacc[cat.id] === op.v ? '#EA580C' : '#374151',
                          fontWeight: flacc[cat.id] === op.v ? '600' : '400',
                        }}
                      >
                        <span style={{ fontWeight: '800', marginRight: '8px' }}>{op.v}</span>
                        {op.texto}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Resultado FLACC */}
              <div style={{
                borderRadius: '12px', padding: '18px', marginTop: '4px', textAlign: 'center',
                backgroundColor: flaccCompleto ? flaccInterp.cor : '#D1D5DB',
              }}>
                <div style={{ fontSize: '44px', fontWeight: '800', color: 'white', lineHeight: 1 }}>
                  {flaccScore}
                </div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'white', marginTop: '6px' }}>
                  {flaccCompleto ? flaccInterp.texto : 'Selecione todos os critérios'}
                </div>
                {flaccCompleto && flaccInterp.degrau > 0 && (
                  <button
                    onClick={() => irParaAnalgesia(flaccInterp.degrau)}
                    style={{
                      marginTop: '12px', padding: '9px 20px',
                      backgroundColor: 'white', color: flaccInterp.cor,
                      border: 'none', borderRadius: '8px',
                      fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                    }}
                  >
                    Ver analgesia recomendada
                  </button>
                )}
              </div>

              <button
                onClick={resetFlacc}
                style={{
                  width: '100%', marginTop: '8px', padding: '10px',
                  borderRadius: '10px', border: '1px solid #E5E7EB',
                  backgroundColor: 'white', color: '#9CA3AF',
                  fontSize: '13px', cursor: 'pointer', fontWeight: '600',
                }}
              >
                Limpar avaliação
              </button>
            </div>
          )}

          {/* ── WONG-BAKER ────────────────────────────────────────────────── */}
          {escalaAtiva === 'wong' && (
            <div>
              <div style={{
                backgroundColor: '#FFF7ED', borderRadius: '10px',
                padding: '10px 12px', marginBottom: '10px', borderLeft: '3px solid #F97316',
              }}>
                <p style={{ fontSize: '12px', color: '#92400E', margin: 0, lineHeight: 1.5 }}>
                  <strong>Wong-Baker FACES</strong> — Para crianças de 3–7 anos. Mostrar a escala
                  e perguntar: "Qual desses rostos mostra o quanto você está sentindo dor agora?"
                  Referência: Wong & Baker, 1988.
                </p>
              </div>

              <div style={{
                backgroundColor: 'white', borderRadius: '12px', padding: '16px',
                border: '1px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {WONG_FACES.map(f => (
                    <button
                      key={f.valor}
                      onClick={() => setWongBaker(f.valor)}
                      style={{
                        width: '54px',
                        padding: '8px 4px 6px',
                        borderRadius: '10px',
                        border: wongBaker === f.valor ? '2px solid #F97316' : '1px solid #E5E7EB',
                        backgroundColor: wongBaker === f.valor ? '#FFF7ED' : '#F9FAFB',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <FaceSVG valor={f.valor} />
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#374151', marginTop: '4px' }}>
                        {f.valor}
                      </div>
                      <div style={{ fontSize: '9px', color: '#9CA3AF', lineHeight: 1.3, marginTop: '2px' }}>
                        {f.desc}
                      </div>
                    </button>
                  ))}
                </div>

                {wongBaker !== null && (
                  <div style={{
                    backgroundColor: wongInterp.cor, borderRadius: '10px',
                    padding: '14px', marginTop: '14px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '34px', fontWeight: '800', color: 'white' }}>{wongBaker}</div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'white', marginTop: '4px' }}>
                      {wongInterp.texto}
                    </div>
                    {wongInterp.degrau > 0 && (
                      <button
                        onClick={() => irParaAnalgesia(wongInterp.degrau)}
                        style={{
                          marginTop: '10px', padding: '9px 20px',
                          backgroundColor: 'white', color: wongInterp.cor,
                          border: 'none', borderRadius: '8px',
                          fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                        }}
                      >
                        Ver analgesia recomendada
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── NRS ───────────────────────────────────────────────────────── */}
          {escalaAtiva === 'nrs' && (
            <div>
              <div style={{
                backgroundColor: '#FFF7ED', borderRadius: '10px',
                padding: '10px 12px', marginBottom: '10px', borderLeft: '3px solid #F97316',
              }}>
                <p style={{ fontSize: '12px', color: '#92400E', margin: 0, lineHeight: 1.5 }}>
                  <strong>NRS — Escala Numérica de Dor</strong> — Para crianças ≥ 8 anos e
                  adolescentes. Perguntar: "De 0 a 10, que nota você dá para a sua dor agora?"
                </p>
              </div>

              <div style={{
                backgroundColor: 'white', borderRadius: '12px', padding: '16px',
                border: '1px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[0,1,2,3,4,5,6,7,8,9,10].map(n => {
                    const c = n === 0 ? '#10B981' : n <= 3 ? '#22C55E' : n <= 6 ? '#F59E0B' : '#EF4444';
                    return (
                      <button
                        key={n}
                        onClick={() => setNrs(n)}
                        style={{
                          width: '40px',
                          height: '44px',
                          borderRadius: '10px',
                          border: nrs === n ? `2px solid ${c}` : '1px solid #E5E7EB',
                          backgroundColor: nrs === n ? c : '#F9FAFB',
                          color: nrs === n ? 'white' : '#374151',
                          fontSize: '17px',
                          fontWeight: '800',
                          cursor: 'pointer',
                        }}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingLeft: '4px', paddingRight: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '600' }}>Sem dor</span>
                  <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: '600' }}>Pior dor</span>
                </div>

                {nrs !== null && (
                  <div style={{
                    backgroundColor: nrsInterp.cor, borderRadius: '10px',
                    padding: '14px', marginTop: '14px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '34px', fontWeight: '800', color: 'white' }}>{nrs} / 10</div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'white', marginTop: '4px' }}>
                      {nrsInterp.texto}
                    </div>
                    {nrsInterp.degrau > 0 && (
                      <button
                        onClick={() => irParaAnalgesia(nrsInterp.degrau)}
                        style={{
                          marginTop: '10px', padding: '9px 20px',
                          backgroundColor: 'white', color: nrsInterp.cor,
                          border: 'none', borderRadius: '8px',
                          fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                        }}
                      >
                        Ver analgesia recomendada
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: ANALGESIA
      ══════════════════════════════════════════════════════════════════════ */}
      {abaAtiva === 'analgesia' && (
        <div>
          {/* Contraindicações */}
          <div style={{
            backgroundColor: '#FEF2F2', borderRadius: '12px',
            padding: '12px 14px', marginBottom: '12px', border: '1px solid #FECACA',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <AlertTriangle size={13} color="#DC2626" />
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#991B1B' }}>
                Contraindicações importantes
              </span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px' }}>
              {CONTRAINDICACOES.map((c, i) => (
                <li key={i} style={{ fontSize: '12px', color: '#991B1B', lineHeight: '1.7' }}>{c}</li>
              ))}
            </ul>
          </div>

          {/* Escada analgésica */}
          {ESCADA.map(d => (
            <div key={d.degrau} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: `1px solid ${d.cor}40`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              marginBottom: '10px',
              overflow: 'hidden',
            }}>
              <button
                onClick={() => toggleAccordion(d.degrau)}
                style={{
                  width: '100%', padding: '14px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '8px',
                    backgroundColor: d.cor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: '800', fontSize: '17px', flexShrink: 0,
                  }}>
                    {d.degrau}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>
                      Degrau {d.degrau}
                    </div>
                    <div style={{ fontSize: '12px', color: d.cor, fontWeight: '600' }}>
                      {d.rotulo}
                    </div>
                  </div>
                </div>
                {expandido === d.degrau
                  ? <ChevronUp size={18} color={d.cor} />
                  : <ChevronDown size={18} color="#9CA3AF" />}
              </button>

              {expandido === d.degrau && (
                <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${d.cor}20` }}>
                  <div style={{ backgroundColor: d.corFundo, borderRadius: '8px', padding: '10px 12px', marginTop: '8px' }}>
                    <ul style={{ margin: 0, paddingLeft: '18px' }}>
                      {d.drogas.map((dr, i) => (
                        <li key={i} style={{ fontSize: '13px', color: '#374151', lineHeight: '1.7', marginBottom: '2px' }}>
                          {dr}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {d.alerta && (
                    <div style={{
                      backgroundColor: '#FEF2F2', borderRadius: '8px',
                      padding: '8px 12px', marginTop: '8px', borderLeft: '3px solid #EF4444',
                    }}>
                      <p style={{ fontSize: '12px', color: '#991B1B', margin: 0, lineHeight: 1.5 }}>
                        {d.alerta}
                      </p>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '8px' }}>
                    <Info size={12} color="#9CA3AF" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0, lineHeight: 1.5 }}>
                      Doses resumidas — consultar módulo Pedfarma para posologia completa.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div style={{
            backgroundColor: '#EFF6FF', borderRadius: '10px',
            padding: '12px 14px', marginTop: '4px', border: '1px solid #BFDBFE',
          }}>
            <p style={{ fontSize: '12px', color: '#1E40AF', margin: 0, lineHeight: 1.6 }}>
              Fonte: WHO Analgesic Ladder (adapt. pediátrica) · AAP 2022 · SBP 2020 · SBCP 2021
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: NÃO FARMACOLÓGICO
      ══════════════════════════════════════════════════════════════════════ */}
      {abaAtiva === 'nao-farm' && (
        <div>
          <div style={{
            backgroundColor: '#FFF7ED', borderRadius: '10px',
            padding: '10px 14px', marginBottom: '12px', borderLeft: '3px solid #F97316',
          }}>
            <p style={{ fontSize: '12px', color: '#92400E', margin: 0, lineHeight: 1.5 }}>
              Medidas não farmacológicas são complementares e devem ser associadas
              à analgesia farmacológica quando indicada.
            </p>
          </div>

          {NAO_FARM.map((grupo, i) => (
            <div key={i} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #F3F4F6',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              marginBottom: '10px',
              overflow: 'hidden',
            }}>
              <button
                onClick={() => toggleAccordion('nf' + i)}
                style={{
                  width: '100%', padding: '14px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>
                  {grupo.faixa}
                </span>
                {expandido === 'nf' + i
                  ? <ChevronUp size={18} color="#F97316" />
                  : <ChevronDown size={18} color="#9CA3AF" />}
              </button>

              {expandido === 'nf' + i && (
                <div style={{ padding: '0 16px 14px', borderTop: '1px solid #F3F4F6' }}>
                  <ul style={{ margin: '8px 0 0', paddingLeft: '18px' }}>
                    {grupo.medidas.map((m, j) => (
                      <li key={j} style={{ fontSize: '13px', color: '#374151', lineHeight: '1.7', marginBottom: '2px' }}>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          <div style={{
            backgroundColor: '#EFF6FF', borderRadius: '10px',
            padding: '12px 14px', marginTop: '4px', border: '1px solid #BFDBFE',
          }}>
            <p style={{ fontSize: '12px', color: '#1E40AF', margin: 0, lineHeight: 1.6 }}>
              Fonte: AAP 2022 · SBP 2020 · Cochrane Reviews (sacarose oral neonatal, evidência Ia)
            </p>
          </div>
        </div>
      )}

      {/* ── Disclaimer ─────────────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: '#F3F4F6', borderRadius: '10px', padding: '12px',
        marginTop: '20px', display: 'flex', gap: '8px', alignItems: 'flex-start',
      }}>
        <AlertCircle size={14} style={{ color: '#9CA3AF', flexShrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0, lineHeight: '1.5' }}>
          Apoio à decisão clínica. Não substitui julgamento médico nem protocolo institucional.
          Doses resumidas — consultar módulo Pedfarma para posologia completa.
        </p>
      </div>

    </div>
  );
}
