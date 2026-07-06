// Preview — Reanimação RN ≥34 semanas · Diretrizes SBP 2026
import { useState } from "react";
import { Heart, Wind, Activity, AlertTriangle, CheckCircle, XCircle, Zap, Info } from "lucide-react";

const BG  = "#0284C7";
const BGL = "#F0F9FF";
const TXT = "#0369A1";
const BRD = "#BAE6FD";

const SPO2 = [
  { min: 2,  alvo: "65–70%" },
  { min: 3,  alvo: "70–75%" },
  { min: 4,  alvo: "75–80%" },
  { min: 5,  alvo: "80–85%" },
  { min: 10, alvo: "85–95%" },
];

const CANULAS = [
  { ig: "28–34", peso: "1000–2000 g", mm: "3,0", lamina: "0" },
  { ig: "35–38", peso: "2000–3000 g", mm: "3,5", lamina: "1" },
  { ig: ">38",   peso: ">3000 g",     mm: "3,5–4,0", lamina: "1" },
];

const PROFUNDIDADE = [
  { ig: "33–34", peso: "1500–1800 g", cm: 7.5 },
  { ig: "35–37", peso: "1900–2400 g", cm: 8.0 },
  { ig: "38–40", peso: "2500–3100 g", cm: 8.5 },
  { ig: "40–43", peso: "3200–4200 g", cm: 9.0 },
];

const ABAS = ["Avaliação", "VPP", "Avançado", "Medicações"];

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 ${className}`}>
      {children}
    </div>
  );
}

function AlertaInfo({ children }) {
  return (
    <div style={{ background: BGL, borderColor: BRD }} className="rounded-xl border p-3 flex gap-2 mt-2">
      <Info size={14} style={{ color: TXT }} className="flex-shrink-0 mt-0.5" />
      <p className="text-xs leading-relaxed" style={{ color: TXT }}>{children}</p>
    </div>
  );
}

function AlertaAviso({ children }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 mt-2">
      <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-amber-800 leading-relaxed">{children}</p>
    </div>
  );
}

function AlertaRisco({ children }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 mt-2">
      <AlertTriangle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-red-800 font-semibold leading-relaxed">{children}</p>
    </div>
  );
}

function TabAvaliacao({ vitaboa, setVitaboa, meconio, setMeconio }) {
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-base font-bold text-gray-800 mb-3">Avaliação ao Nascimento</h2>
        <p className="text-sm text-gray-600 mb-3">
          RN está <strong>respirando ou chorando</strong> E com <strong>tônus muscular em flexão</strong>?
        </p>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setVitaboa(true)}
            className="flex-1 py-3 rounded-2xl text-sm font-bold border-2 transition-all"
            style={vitaboa === true
              ? { background: "#10B981", borderColor: "#10B981", color: "#fff" }
              : { background: "#f9fafb", borderColor: "#e5e7eb", color: "#4b5563" }}
          ><span className="inline-flex items-center justify-center gap-1"><CheckCircle size={15} /> Sim — Boa vitalidade</span></button>
          <button
            onClick={() => setVitaboa(false)}
            className="flex-1 py-3 rounded-2xl text-sm font-bold border-2 transition-all"
            style={vitaboa === false
              ? { background: "#EF4444", borderColor: "#EF4444", color: "#fff" }
              : { background: "#f9fafb", borderColor: "#e5e7eb", color: "#4b5563" }}
          ><span className="inline-flex items-center justify-center gap-1"><XCircle size={15} /> Não — Sem vitalidade</span></button>
        </div>
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500 mb-2 font-medium">Líquido amniótico meconial?</p>
          <div className="flex gap-2">
            {[true, false].map(v => (
              <button key={String(v)} onClick={() => setMeconio(v)}
                className="px-4 py-2 rounded-full text-xs font-bold border transition-all"
                style={meconio === v
                  ? { background: v ? "#F59E0B" : "#9CA3AF", borderColor: v ? "#F59E0B" : "#9CA3AF", color: "#fff" }
                  : { background: "#fff", borderColor: "#d1d5db", color: "#6b7280" }}
              >{v ? "Sim" : "Não"}</button>
            ))}
          </div>
        </div>
      </Card>

      {vitaboa === true && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={18} className="text-emerald-500" />
            <h3 className="font-bold text-emerald-700">Boa Vitalidade — Junto à parturiente</h3>
          </div>
          <div className="space-y-2">
            {[
              "Clampear cordão ≥60 seg após nascimento — preferencialmente após início da respiração espontânea",
              "Contato pele-a-pele: coberto com tecido seco e aquecido; boca e narinas visíveis",
              "Normotermia: 36,5–37,5°C · sala a 23–25°C · touca na cabeça",
              "Monitorar continuamente: FC (estetoscópio), padrão respiratório, tônus muscular",
              "Estimular amamentação o mais precocemente possível (Passo 4 — IHAC)",
            ].map((txt, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0" style={{ background: "#10B981" }}>{i+1}</span>
                <p className="text-sm text-gray-700">{txt}</p>
              </div>
            ))}
          </div>
          {meconio === true && (
            <AlertaInfo>Mecônio presente + boa vitalidade: manter junto à parturiente. Aspiração somente se obstrução evidente. Não aspirar de rotina.</AlertaInfo>
          )}
        </Card>
      )}

      {vitaboa === false && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-500" />
            <h3 className="font-bold text-red-700">Sem Boa Vitalidade — Agir imediatamente!</h3>
          </div>
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-sm font-bold text-amber-800">1. Estímulo Tátil — ANTES de clampear o cordão</p>
              <p className="text-sm text-amber-700 mt-1">Fricção circular no dorso · ~15 segundos · Delicado · Nunca chacoalhar o RN</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-sm font-bold text-gray-800 mb-2">2. Após estímulo tátil — manejo do cordão:</p>
              <div className="space-y-2">
                <div className="flex gap-2 items-start">
                  <span className="text-emerald-600 font-bold text-sm flex-shrink-0">→</span>
                  <div><p className="text-sm font-semibold text-emerald-700">Respirou:</p><p className="text-sm text-gray-700">Clampear ≥60 seg após nascimento</p></div>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="text-red-600 font-bold text-sm flex-shrink-0">→</span>
                  <div><p className="text-sm font-semibold text-red-700">Não respirou:</p><p className="text-sm text-gray-700">Clampear &lt;30 seg · Mesa de reanimação sob calor radiante</p></div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">* Opção: ordenha de cordão intacto (20 cm, 2 seg, 3×) antes do clampeamento &lt;60 seg</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm font-bold text-red-800">3. Mesa de Reanimação — Passos Iniciais (≤30 seg)</p>
              <ul className="text-sm text-red-700 mt-1 space-y-0.5">
                <li>• Ligar fonte de calor radiante · Sala a 23–25°C</li>
                <li>• Secar cabeça e corpo · Desprezar campos úmidos · Touca</li>
                <li>• Posicionar: decúbito dorsal, pescoço em leve extensão</li>
                <li>• NÃO aspirar de rotina (mesmo com mecônio)</li>
                <li>• Aspirar SOMENTE se obstrução: sonda 8–10 F, pressão máx 80–100 mmHg</li>
              </ul>
            </div>
          </div>
          {meconio === true && (
            <AlertaAviso>Mecônio presente: NÃO aspirar na passagem do polo cefálico. Laringoscopia e aspiração traqueal de rotina NÃO indicadas — atrasam VPP. Se apneia ou FC &lt;100: VPP imediata nos primeiros 60 seg.</AlertaAviso>
          )}
        </Card>
      )}

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} style={{ color: BG }} />
          <h3 className="font-bold text-gray-800">SpO₂ Alvo Pré-ductal (pulso radial direito)</h3>
        </div>
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: BG }}>
                <th className="py-2 px-3 text-left text-white text-xs font-semibold">Minutos após nascimento</th>
                <th className="py-2 px-3 text-right text-white text-xs font-semibold">SpO₂ alvo</th>
              </tr>
            </thead>
            <tbody>
              {SPO2.map((r, i) => (
                <tr key={r.min} style={{ background: i % 2 === 0 ? "#fff" : BGL }}>
                  <td className="py-2 px-3 text-gray-700">{r.min} min</td>
                  <td className="py-2 px-3 text-right font-bold" style={{ color: TXT }}>{r.alvo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">SpO₂ &gt;90% é atingida normalmente após 5–10 min em RN saudáveis respirando ar ambiente.</p>
      </Card>
    </div>
  );
}

function TabVPP() {
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Wind size={16} style={{ color: BG }} />
          <h2 className="font-bold text-gray-800">VPP — Ventilação com Pressão Positiva</h2>
        </div>
        <div className="bg-red-50 border border-red-300 rounded-xl p-3 mb-4">
          <p className="text-sm font-bold text-red-800">⏱ Minuto de Ouro — Indicação</p>
          <p className="text-sm text-red-700 mt-0.5">Apneia ou respiração irregular e/ou FC &lt;100 bpm após passos iniciais</p>
          <p className="text-xs text-red-600 font-semibold mt-1">Risco de morte ou morbidade aumenta 16% a cada 30 seg de atraso</p>
        </div>
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Concentração de O₂ Inicial</p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <p className="text-sm font-bold text-emerald-800">Ar ambiente — O₂ 21% (RN ≥34 semanas)</p>
            <p className="text-xs text-emerald-700 mt-1">Metanálise: reduz mortalidade intrahospitalar em 27% vs O₂ 100%.</p>
          </div>
          <AlertaInfo>Se sem melhora: verificar e corrigir TÉCNICA antes de aumentar O₂. Ajustar ±20% a cada 30 seg guiado pela SpO₂ alvo.</AlertaInfo>
        </div>
        <div className="space-y-3">
          <div className="border-2 rounded-2xl p-3" style={{ borderColor: BG }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: BG }}>Preferível</span>
              <p className="text-sm font-bold text-gray-800">VMM-Peça-T</p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
              <span>Fluxo: ~10 L/min</span><span>PIP: 20–30 cmH₂O</span>
              <span>PEEP: 5 cmH₂O</span><span>Limite máx: 40 cmH₂O</span>
              <span className="col-span-2">Freq: 30–60 mpm · "ocluuui / solta / solta"</span>
            </div>
          </div>
          <div className="border border-gray-200 rounded-2xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-500 text-white">Sempre disponível</span>
              <p className="text-sm font-bold text-gray-800">Balão Autoinflável (~240 mL)</p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
              <span>Escape: 30–40 cmH₂O</span><span>PIP: 20–30 cmH₂O</span>
              <span>Freq: 30–60 mpm</span><span>Sem PEEP confiável</span>
              <span className="col-span-2">"aperta / solta / solta" · Usar manômetro acoplado</span>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-gray-800 mb-3">Escalada de Interfaces</h3>
        <div className="space-y-3">
          {[
            { n: "1ª", cor: "#10B981", titulo: "Máscara facial", desc: "Técnica C-E · Queixo → nariz · Pescoço em leve extensão · Reavaliar FC a cada 30 seg" },
            { n: "2ª", cor: "#F59E0B", titulo: "Máscara laríngea (se facial falhar)", desc: "≥34 sem, peso ≥2000 g · Confirmar posição: CO₂ colorimétrico · Não usar durante massagem cardíaca" },
            { n: "3ª", cor: "#EF4444", titulo: "Cânula traqueal (se laríngea falhar ou massagem)", desc: "Ato médico · Confirmar posição: CO₂ colorimétrico (<10 seg) · Via oral · Lâmina reta" },
          ].map(item => (
            <div key={item.n} className="flex gap-3">
              <span className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0" style={{ background: item.cor }}>{item.n}</span>
              <div>
                <p className="text-sm font-bold text-gray-800">{item.titulo}</p>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-gray-800 mb-3">Ações Corretivas (VPP sem melhora)</h3>
        <div className="space-y-2">
          {[
            ["1","Ajuste inadequado face/máscara","Readaptar delicadamente (técnica C-E)"],
            ["2","Obstrução de via aérea","Reposicionar pescoço em leve extensão"],
            ["3","Secreções","Aspirar boca e depois as narinas"],
            ["4","Boca fechada","Ventilar com boca levemente aberta"],
            ["5","Pressão insuficiente","↑ ~5 cmH₂O por ajuste (máximo 40 cmH₂O)"],
          ].map(([n, prob, sol]) => (
            <div key={n} className="flex gap-3 items-start bg-gray-50 rounded-xl p-2.5">
              <span className="w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0" style={{ background: BG }}>{n}</span>
              <div>
                <p className="text-xs text-gray-500">{prob}</p>
                <p className="text-sm font-semibold text-gray-800">{sol}</p>
              </div>
            </div>
          ))}
        </div>
        <AlertaAviso>Em VPP com máscara facial prolongada: inserir sonda orogástrica aberta para descomprimir o estômago.</AlertaAviso>
      </Card>

      <Card>
        <h3 className="font-bold text-gray-800 mb-2">CPAP em Sala de Parto</h3>
        <AlertaAviso>CPAP em RN ≥34 sem aumenta risco de pneumotórax em 5,5× (OR 5,5; IC95% 4,4–6,8). Decidir com cautela.</AlertaAviso>
        <div className="mt-3 space-y-1.5 text-sm text-gray-700">
          <p><strong>Indicar somente se:</strong> FC ≥100 bpm + respiração espontânea + desconforto respiratório + SpO₂ abaixo do alvo</p>
          <p><strong>Parâmetros:</strong> VMM-Peça-T + máscara facial · Fluxo ~10 L/min · Pressão 5–6 cmH₂O</p>
          <p><strong>CPAP prolongado:</strong> inserir sonda orogástrica aberta</p>
        </div>
      </Card>
    </div>
  );
}

function TabAvancado({ tube, prof, igN }) {
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Heart size={16} className="text-red-500" />
          <h2 className="font-bold text-gray-800">Massagem Cardíaca</h2>
        </div>
        <div className="bg-red-50 border border-red-300 rounded-xl p-3 mb-3">
          <p className="text-sm font-bold text-red-800">Indicação</p>
          <p className="text-sm text-red-700">FC &lt;60 bpm após 30 seg de VPP eficaz com <strong>cânula traqueal</strong> e técnica adequada</p>
          <p className="text-xs text-red-600 mt-1">Somente após expansão e ventilação pulmonares bem estabelecidas</p>
        </div>
        <div className="space-y-3">
          <div className="border border-gray-200 rounded-xl p-3">
            <p className="text-sm font-bold text-gray-800 mb-1">Técnica dos 2 Polegares (preferível)</p>
            <ul className="text-sm text-gray-600 space-y-0.5">
              <li>• Local: terço inferior do esterno, abaixo da linha intermamilar</li>
              <li>• Profundidade: 1/3 do diâmetro anteroposterior do tórax</li>
              <li>• Reexpansão plena entre compressões · Polegares mantidos no esterno</li>
              <li>• Posicionar-se atrás da cabeça do RN</li>
            </ul>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
            <p className="text-sm font-bold text-orange-800 mb-2">Relação 3:1 — 120 eventos/min</p>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-black text-orange-600">90</p>
                <p className="text-xs text-orange-700">compressões/min</p>
              </div>
              <p className="text-orange-300 text-2xl font-light">+</p>
              <div className="text-center">
                <p className="text-3xl font-black text-orange-600">30</p>
                <p className="text-xs text-orange-700">ventilações/min</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <p className="text-xs font-bold text-red-800">O₂ durante massagem</p>
              <p className="text-2xl font-black text-red-600">100%</p>
              <p className="text-xs text-red-700 mt-0.5">Reduzir após FC &gt;60 + SpO₂ confiável</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
              <p className="text-xs font-bold text-gray-800">Reavaliar FC após</p>
              <p className="text-2xl font-black text-gray-700">60 seg</p>
              <p className="text-xs text-gray-600 mt-0.5">Trocar compressor a cada 2–5 min</p>
            </div>
          </div>
          <div className="border border-gray-200 rounded-xl p-3">
            <div className="mb-2">
              <p className="text-sm font-bold text-emerald-700 flex items-center gap-1"><CheckCircle size={14} /> Melhora: FC &gt;60 bpm</p>
              <p className="text-sm text-gray-600">Parar massagem · Manter VPP · Reduzir O₂ pela SpO₂</p>
            </div>
            <div className="border-t border-gray-100 pt-2">
              <p className="text-sm font-bold text-red-700 flex items-center gap-1"><XCircle size={14} /> Falha: FC &lt;60 após 60 seg</p>
              <p className="text-sm text-gray-600">Verificar técnica → <strong>Adrenalina IV</strong> (cateter venoso umbilical de urgência)</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-gray-800 mb-3">Intubação Traqueal</h3>
        {tube && igN > 0 && (
          <div className="rounded-2xl p-3 mb-3 border-2" style={{ background: BGL, borderColor: BRD }}>
            <p className="text-xs font-bold uppercase mb-1" style={{ color: TXT }}>Para IG {igN} semanas</p>
            <p className="text-lg font-black" style={{ color: BG }}>Cânula: {tube.mm} · Lâmina nº {tube.lamina}</p>
            {prof && <p className="text-sm font-bold mt-0.5" style={{ color: TXT }}>Lábio superior: {prof} cm</p>}
          </div>
        )}
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Cânula por IG e peso</p>
        <div className="rounded-xl overflow-hidden border border-gray-200 mb-3">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: BG }}>
                {["IG (sem)","Peso","Cânula","Lâmina"].map(h => (
                  <th key={h} className="py-2 px-2 text-left text-white font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CANULAS.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : BGL }}>
                  <td className="py-2 px-2 text-gray-700">{r.ig}</td>
                  <td className="py-2 px-2 text-gray-700">{r.peso}</td>
                  <td className="py-2 px-2 font-bold text-gray-800">{r.mm} mm</td>
                  <td className="py-2 px-2 text-gray-700">Nº {r.lamina}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Profundidade no lábio superior</p>
        <div className="rounded-xl overflow-hidden border border-gray-200 mb-3">
          <table className="w-full text-xs">
            <thead className="bg-gray-100">
              <tr>{["IG (sem)","Peso","Lábio sup."].map(h => <th key={h} className="py-2 px-2 text-left text-gray-600 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {PROFUNDIDADE.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                  <td className="py-2 px-2 text-gray-700">{r.ig}</td>
                  <td className="py-2 px-2 text-gray-700">{r.peso}</td>
                  <td className="py-2 px-2 font-bold text-gray-800">{r.cm} cm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AlertaInfo>Confirmar posição: detector colorimétrico de CO₂ exalado — resultado em &lt;10 seg.</AlertaInfo>
        <AlertaRisco>Intubação traqueal é ato médico. Cada tentativa: máximo 30 segundos. Em caso de insucesso: reiniciar VPP com máscara.</AlertaRisco>
      </Card>

      <Card>
        <h3 className="font-bold text-gray-800 mb-3">Aspectos Éticos</h3>
        <div className="space-y-3">
          {[
            { cor: "#FBBF24", titulo: "Discutir interrupção", desc: "~20 min após nascimento, se sem retorno da circulação espontânea apesar de todo suporte avançado" },
            { cor: "#93C5FD", titulo: "Apgar 0 ou 1 no 10º minuto", desc: "Não exclui sobrevida sem sequela grave — especialmente com hipotermia terapêutica. 2 em 5 sobrevivem; 1 em 5 sem sequela moderada/grave." },
            { cor: "#D1D5DB", titulo: "Dúvida sobre não reanimar", desc: "Na incerteza, realizar todos os procedimentos. Decisões sobre suporte vital retomadas com família após admissão na unidade neonatal." },
          ].map(item => (
            <div key={item.titulo} className="flex gap-3 items-start">
              <div className="w-1 self-stretch rounded-full flex-shrink-0 mt-1" style={{ background: item.cor }} />
              <div>
                <p className="text-sm font-bold text-gray-800">{item.titulo}</p>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function TabMeds({ adrIV, adrET, exVol, p }) {
  const temPeso = p > 0;
  return (
    <div className="space-y-4">
      {!temPeso && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
          <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">Informe o peso do paciente no topo da tela para calcular as doses.</p>
        </div>
      )}

      <Card>
        <div className="flex items-center gap-2 mb-1">
          <Zap size={16} className="text-red-500" />
          <h2 className="font-bold text-gray-800">Adrenalina</h2>
        </div>
        <p className="text-xs text-gray-500 mb-3">Indicada: FC &lt;60 bpm após VPP com cânula + O₂ 100% + massagem ≥60 seg</p>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 mb-4">
          <p className="text-xs font-bold text-gray-600 uppercase mb-1">Diluição obrigatória (qualquer via)</p>
          <p className="text-sm font-black text-gray-800">1 mL ampola (1 mg/mL) + 9 mL SF = 10 mL com 0,1 mg/mL</p>
          <p className="text-xs text-gray-400 mt-1">Proteger da luz · Descartar se rosada/marrom · Rotular com concentração, data e hora</p>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Via preferencial</span>
            <p className="text-sm font-bold text-gray-800">Intravascular (veia umbilical)</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3">
            <p className="text-xs text-gray-600 mb-2">0,2 mL/kg · Seringa 1 mL · Infundir rápido + flush 3,0 mL SF</p>
            {temPeso ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">Volume para {p} kg</p>
                  <p className="text-xs text-gray-400">+ flush 3,0 mL SF imediatamente após</p>
                </div>
                <p className="text-3xl font-black text-red-600">{adrIV} <span className="text-base font-normal text-gray-500">mL</span></p>
              </div>
            ) : <p className="text-sm text-gray-400 italic">Aguardando peso...</p>}
            <p className="text-xs text-red-700 font-semibold mt-2">Repetir a cada 3–5 min se sem melhora da FC</p>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Uso único</span>
            <p className="text-sm font-bold text-gray-800">Endotraqueal (enquanto cateteriza veia)</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
            <p className="text-xs text-gray-600 mb-2">1,0 mL/kg · Seringa 5 mL · Direto na cânula · Ventilar a seguir · SEM flush</p>
            {temPeso ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">Volume para {p} kg</p>
                <p className="text-3xl font-black text-amber-700">{adrET} <span className="text-base font-normal text-gray-500">mL</span></p>
              </div>
            ) : <p className="text-sm text-gray-400 italic">Aguardando peso...</p>}
          </div>
        </div>
        <AlertaRisco>Dose máxima: 0,1 mg/kg (qualquer via). Doses superiores causam hipertensão grave e disfunção miocárdica.</AlertaRisco>
        <AlertaAviso>Absorção ET é lenta e imprevisível. Não atrasar o acesso vascular. A via ET não substitui a intravascular.</AlertaAviso>
      </Card>

      <Card>
        <h3 className="font-bold text-gray-800 mb-1">Expansor de Volume</h3>
        <p className="text-xs text-gray-500 mb-3">Suspeita de hipovolemia: FC sem melhora + palidez + pulsos débeis + perda sanguínea aguda</p>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
          <p className="text-sm font-bold text-blue-800">Soro Fisiológico 0,9% — 10 mL/kg IV</p>
          <p className="text-xs text-blue-600 mt-0.5">Lentamente em 5–10 min · Veia umbilical</p>
          {temPeso ? (
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-sm text-gray-700">Volume para {p} kg</p>
                <p className="text-xs text-gray-400">Dose adicional de 10 mL/kg se sem resposta</p>
              </div>
              <p className="text-3xl font-black text-blue-700">{exVol} <span className="text-base font-normal text-gray-500">mL</span></p>
            </div>
          ) : <p className="text-sm text-gray-400 italic mt-2">Aguardando peso...</p>}
        </div>
        <AlertaRisco>Expansor sem hipovolemia confirmada pode piorar disfunção miocárdica hipóxico-isquêmica.</AlertaRisco>
      </Card>

      <Card>
        <h3 className="font-bold text-gray-800 mb-3">Não usar em sala de parto</h3>
        <div className="space-y-2.5">
          {[
            ["Bicarbonato de sódio","Sem evidência de benefício. Pode causar hipernatremia, hiperosmolaridade e agravamento da acidose venosa."],
            ["Naloxone","Sem evidências de efeito clinicamente importante em depressão respiratória por opioides maternos."],
            ["Atropina, albumina, vasopressores","Não referenciados nas Diretrizes SBP 2026 para reanimação ao nascimento."],
          ].map(([med, desc]) => (
            <div key={med} className="flex gap-2 items-start">
              <span className="text-red-500 font-black text-sm mt-0.5 flex-shrink-0">✕</span>
              <div>
                <p className="text-sm font-bold text-gray-800">{med}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function App() {
  const [aba,     setAba]     = useState(0);
  const [peso,    setPeso]    = useState("");
  const [ig,      setIg]      = useState("");
  const [vitaboa, setVitaboa] = useState(null);
  const [meconio, setMeconio] = useState(null);

  const p   = parseFloat(peso.replace(",", ".")) || 0;
  const igN = parseFloat(ig.replace(",", "."))   || 0;

  const adrIV = p > 0 ? (p * 0.2).toFixed(1) : null;
  const adrET = p > 0 ? (p * 1.0).toFixed(1) : null;
  const exVol = p > 0 ? Math.round(p * 10)   : null;

  let tube = null;
  if      (igN >= 28 && igN <= 34) tube = { mm: "3,0 mm", lamina: "0" };
  else if (igN > 34  && igN <= 38) tube = { mm: "3,5 mm", lamina: "1" };
  else if (igN > 38)               tube = { mm: "3,5–4,0 mm", lamina: "1" };

  const pG = p * 1000;
  let prof = null;
  if      (pG >= 1500 && pG <= 1800) prof = 7.5;
  else if (pG > 1800  && pG <= 2400) prof = 8.0;
  else if (pG > 2400  && pG <= 3100) prof = 8.5;
  else if (pG > 3100  && pG <= 4200) prof = 9.0;

  return (
    <div className="min-h-screen bg-gray-50 pb-12" style={{ fontFamily: "system-ui, sans-serif", maxWidth: 430, margin: "0 auto" }}>

      {/* CABEÇALHO */}
      <div style={{ background: BG }} className="px-4 pt-4 pb-5 text-white">
        <p className="text-xs font-bold uppercase tracking-widest opacity-70">Neonatologia · SBP 2026</p>
        <h1 className="text-xl font-bold leading-tight mt-0.5">Reanimação RN ≥34 semanas</h1>
        <p className="text-sm opacity-80 mt-0.5">Sala de Parto — Diretrizes PRN-SBP · Jun/2026</p>
      </div>

      {/* CAMPOS */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex gap-3">
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1 font-medium">Peso estimado (kg)</p>
          <input
            inputMode="decimal" placeholder="ex: 3,2" value={peso}
            onChange={e => setPeso(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1 font-medium">IG (semanas)</p>
          <input
            inputMode="decimal" placeholder="ex: 37" value={ig}
            onChange={e => setIg(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* ABAS */}
      <div className="bg-white border-b border-gray-200 flex overflow-x-auto" style={{ position: "sticky", top: 0, zIndex: 10 }}>
        {ABAS.map((t, i) => (
          <button key={t} onClick={() => setAba(i)}
            className="flex-shrink-0 px-4 py-3 text-sm border-b-2 transition-colors whitespace-nowrap"
            style={aba === i
              ? { color: BG, borderColor: BG, fontWeight: 700 }
              : { color: "#6b7280", borderColor: "transparent" }}
          >{t}</button>
        ))}
      </div>

      {/* CONTEÚDO */}
      <div className="px-4 py-4">
        {aba === 0 && <TabAvaliacao vitaboa={vitaboa} setVitaboa={setVitaboa} meconio={meconio} setMeconio={setMeconio} />}
        {aba === 1 && <TabVPP />}
        {aba === 2 && <TabAvancado tube={tube} prof={prof} igN={igN} />}
        {aba === 3 && <TabMeds adrIV={adrIV} adrET={adrET} exVol={exVol} p={p} />}
      </div>

      {/* DISCLAIMER */}
      <div className="mx-4 mt-2 mb-4 bg-gray-100 rounded-2xl p-3">
        <p style={{ fontSize: 11 }} className="text-gray-400 text-center leading-relaxed">
          Fonte: Almeida MFB, Guinsburg R; PRN-SBP. Diretrizes SBP 2026. doi:10.25060/PRN-SBP-2026-1 ·
          Apoio à decisão clínica. Não substitui julgamento médico nem protocolo institucional.
        </p>
      </div>
    </div>
  );
}
