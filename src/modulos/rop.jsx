import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ScanEye,
  CalendarClock,
  ClipboardList,
  ShieldAlert,
  Activity,
} from "lucide-react";

const COR = "#0369A1"; // sky-700 — cor do módulo ROP

function Section({ title, icon: Icon, open, onToggle, children }) {
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white mb-3">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
          <Icon size={18} style={{ color: COR }} />
          {title}
        </span>
        {open ? (
          <ChevronUp size={18} className="text-gray-400" />
        ) : (
          <ChevronDown size={18} className="text-gray-400" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 text-sm text-gray-700 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

function Bullet({ children }) {
  return (
    <li className="flex gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-300 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function AlertaBox({ children, tone = "amber" }) {
  const tones = {
    amber: "bg-amber-50 border-amber-300 text-amber-900",
    red: "bg-red-50 border-red-300 text-red-900",
    blue: "bg-blue-50 border-blue-300 text-blue-900",
    green: "bg-green-50 border-green-300 text-green-900",
  };
  return (
    <div className={`border rounded-xl px-3 py-2.5 flex gap-2 ${tones[tone]}`}>
      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
      <span className="text-xs leading-relaxed">{children}</span>
    </div>
  );
}

function FonteTag({ children }) {
  return (
    <span className="inline-block text-[10px] font-medium uppercase tracking-wide text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 mr-1">
      {children}
    </span>
  );
}

function ToggleField({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5">
      <span className="text-sm text-gray-700 pr-3">{label}</span>
      <div className="flex gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={
            value === true
              ? "!bg-sky-700 !text-white rounded-lg px-3 py-1.5 text-xs font-semibold"
              : "bg-white text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
          }
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={
            value === false
              ? "!bg-sky-700 !text-white rounded-lg px-3 py-1.5 text-xs font-semibold"
              : "bg-white text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
          }
        >
          Não
        </button>
      </div>
    </div>
  );
}

export default function Rop() {
  const [abertas, setAbertas] = useState({
    triagem: true,
    momento: false,
    classificacao: false,
    seguimento: false,
  });

  const [peso1500, setPeso1500] = useState(null);
  const [ig32, setIg32] = useState(null);
  const [fatorRisco, setFatorRisco] = useState(null);

  const toggle = (chave) => setAbertas((prev) => ({ ...prev, [chave]: !prev[chave] }));

  const respondidoTudo = peso1500 !== null && ig32 !== null && fatorRisco !== null;
  const deveTriar = peso1500 === true || ig32 === true || fatorRisco === true;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Cabeçalho do módulo */}
      <div className="px-4 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${COR}, #075985)` }}>
        <h1 className="text-white text-lg font-bold flex items-center gap-2">
          <ScanEye size={22} />
          ROP — Retinopatia da Prematuridade
        </h1>
        <p className="text-sky-100 text-xs mt-1">
          Critérios de triagem, momento do exame e seguimento
        </p>
      </div>

      {/* Verificador rápido de indicação de triagem */}
      <div className="px-4 pt-4">
        <div className="border border-gray-200 rounded-2xl bg-white p-4">
          <p className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Activity size={16} style={{ color: COR }} />
            Este RN deve ser triado?
          </p>
          <div className="space-y-2">
            <ToggleField label="Peso ao nascer ≤ 1500 g?" value={peso1500} onChange={setPeso1500} />
            <ToggleField label="Idade gestacional ≤ 32 semanas?" value={ig32} onChange={setIg32} />
            <ToggleField label="RN de maior peso/IG, mas com curso clínico instável (O₂ prolongado, sepse, transfusão, etc.) e indicação do neonatologista?" value={fatorRisco} onChange={setFatorRisco} />
          </div>
          {respondidoTudo && (
            <div
              className={`mt-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-center ${
                deveTriar ? "bg-sky-50 text-sky-700 border border-sky-300" : "bg-gray-50 text-gray-600 border border-gray-300"
              }`}
            >
              {deveTriar ? "Indicada triagem oftalmológica para ROP" : "Fora dos critérios habituais — reavaliar conforme julgamento do neonatologista"}
            </div>
          )}
          <p className="text-[11px] text-gray-400 mt-2">
            Critério das Diretrizes Brasileiras de Triagem e Detecção da ROP. O exame é sempre realizado por oftalmologista treinado.
          </p>
        </div>
      </div>

      <div className="px-4 pt-4">
        <Section title="Critérios de triagem" icon={ShieldAlert} open={abertas.triagem} onToggle={() => toggle("triagem")}>
          <p>Devem ser triados todos os recém-nascidos que atendam a pelo menos um critério:</p>
          <ul className="space-y-1.5">
            <Bullet>Peso ao nascer ≤ 1500 g <strong>e/ou</strong> idade gestacional ≤ 32 semanas</Bullet>
            <Bullet>RN de maior peso ou IG, porém com curso clínico instável, a critério do neonatologista (uso prolongado de oxigênio, sepse, hemotransfusão, instabilidade hemodinâmica)</Bullet>
          </ul>
          <AlertaBox tone="blue">
            O critério brasileiro (IG ≤ 32 semanas e/ou peso ≤ 1500 g) é mais amplo que o critério norte-americano da AAP (IG ≤ 30 semanas e/ou peso ≤ 1500 g), refletindo o perfil epidemiológico nacional. Seguir o protocolo institucional/nacional vigente.
          </AlertaBox>
          <p className="font-semibold text-gray-800">Principais fatores de risco associados:</p>
          <ul className="space-y-1.5">
            <Bullet>Menor idade gestacional e menor peso ao nascer (os mais importantes)</Bullet>
            <Bullet>Oxigenoterapia prolongada e saturação fora da faixa-alvo</Bullet>
            <Bullet>Sepse, hemotransfusões, hemorragia intracraniana, baixo ganho ponderal</Bullet>
          </ul>
          <FonteTag>Diretrizes Brasileiras ROP</FonteTag><FonteTag>SBP</FonteTag><FonteTag>SBOP</FonteTag>
        </Section>

        <Section title="Momento do exame" icon={CalendarClock} open={abertas.momento} onToggle={() => toggle("momento")}>
          <ul className="space-y-1.5">
            <Bullet>Primeiro exame entre a <strong>4ª e a 6ª semana de vida</strong> (idade cronológica), ainda durante a internação neonatal</Bullet>
            <Bullet>O início do rastreamento se orienta melhor pela idade pós-menstrual do que pela idade pós-natal isolada — quanto menor a IG ao nascer, mais tardiamente a ROP grave costuma surgir</Bullet>
            <Bullet>Exame sob dilatação pupilar e oftalmoscopia binocular indireta, realizado por oftalmologista com treinamento em ROP</Bullet>
          </ul>
          <AlertaBox tone="amber">
            A ROP grave tem janela de tratamento estreita (em torno da 37ª semana de idade pós-concepção). Exame realizado tarde demais pode perder o momento ideal de tratamento — a triagem no prazo correto é essencial para prevenir cegueira.
          </AlertaBox>
          <FonteTag>Diretrizes Brasileiras ROP</FonteTag><FonteTag>AAP</FonteTag>
        </Section>

        <Section title="Classificação (ICROP)" icon={ClipboardList} open={abertas.classificacao} onToggle={() => toggle("classificacao")}>
          <p>A ROP é descrita por três elementos, conforme a Classificação Internacional (ICROP):</p>
          <p className="font-semibold text-gray-800">Zona (localização):</p>
          <ul className="space-y-1.5">
            <Bullet><strong>Zona I:</strong> a mais posterior, centrada no nervo óptico — a de pior prognóstico</Bullet>
            <Bullet><strong>Zona II:</strong> intermediária</Bullet>
            <Bullet><strong>Zona III:</strong> a mais periférica, temporal — melhor prognóstico</Bullet>
          </ul>
          <p className="font-semibold text-gray-800">Estágio (gravidade):</p>
          <ul className="space-y-1.5">
            <Bullet><strong>1:</strong> linha de demarcação entre retina vascular e avascular</Bullet>
            <Bullet><strong>2:</strong> crista (linha com altura e largura)</Bullet>
            <Bullet><strong>3:</strong> proliferação fibrovascular extrarretiniana (neovasos)</Bullet>
            <Bullet><strong>4:</strong> descolamento parcial da retina (4A poupa a mácula, 4B acomete)</Bullet>
            <Bullet><strong>5:</strong> descolamento total da retina</Bullet>
          </ul>
          <p className="font-semibold text-gray-800">Doença Plus:</p>
          <ul className="space-y-1.5">
            <Bullet>Dilatação e tortuosidade dos vasos do polo posterior — sinal de atividade e gravidade, indica maior urgência de tratamento</Bullet>
          </ul>
          <AlertaBox tone="red">
            ROP em Zona I, presença de doença Plus, ou ROP agressiva posterior (AP-ROP) são situações de gravidade que exigem avaliação e eventual tratamento em caráter de urgência pelo oftalmologista.
          </AlertaBox>
          <FonteTag>ICROP</FonteTag><FonteTag>SBOP</FonteTag>
        </Section>

        <Section title="Seguimento e encerramento" icon={ScanEye} open={abertas.seguimento} onToggle={() => toggle("seguimento")}>
          <p>A periodicidade dos reexames é definida pelo oftalmologista conforme o achado (intervalos habituais de 1 a 3 semanas). O rastreamento agudo pode ser encerrado quando houver:</p>
          <ul className="space-y-1.5">
            <Bullet>Vascularização retiniana completa</Bullet>
            <Bullet>ROP em Zona III sem doença prévia em Zona I ou II</Bullet>
            <Bullet>Idade gestacional corrigida ≥ 45 semanas sem ROP em estágio que exija tratamento</Bullet>
            <Bullet>Regressão completa e estável da ROP</Bullet>
          </ul>
          <AlertaBox tone="blue">
            Mesmo após alta do rastreamento agudo, crianças que tiveram ROP ou prematuridade importante devem manter acompanhamento oftalmológico a longo prazo — risco de miopia, estrabismo, ambliopia e sequelas tardias.
          </AlertaBox>
          <FonteTag>Diretrizes Brasileiras ROP</FonteTag><FonteTag>AAP</FonteTag>
        </Section>
      </div>

      {/* Disclaimer padrão do módulo */}
      <div className="px-4 pt-4">
        <p className="text-[11px] text-gray-400 text-center leading-relaxed">
          Apoio à decisão clínica. Não substitui julgamento médico nem protocolo
          institucional.
        </p>
      </div>
    </div>
  );
}
