// src/lib/catalogo.js
// FONTE ÚNICA do catálogo de módulos. Tudo o que descreve um módulo para o
// usuário — nome, descrição, ícone, cor, grupo, seção do hub e termos de busca —
// mora aqui e só aqui. Consumidores:
//   • src/PedHub.jsx              → busca global, favoritos e contagens da home
//   • src/App.jsx                 → cabeçalho (nome + cor) e destino do botão voltar
//   • src/modulos/pediatria-geral.jsx e neonatal.jsx → cards e seções dos hubs
// Criar módulo = 1 entrada aqui + lazy import e <Route> em App.jsx + o arquivo
// em src/modulos/. A ordem das entradas é a ordem dos cards no hub.
import {
  Activity, AlertTriangle, Baby, BookOpen, Brain, Bug, Calculator, CalendarClock, ClipboardList, Droplets, Eye, FlaskConical, Footprints, Heart, Leaf, Microscope, Milk, Moon, Pill, Ruler, Scale, ScanEye, Shield, Stethoscope, Syringe, Thermometer, Users, Waves, Wind, Zap,
} from "lucide-react";

/* ─── Hubs (portais) ─────────────────────────────────────────────────────── */
export const HUBS = {
  "/pediatria-geral": { label: "Pediatria Geral", cor: "#1E40AF", grupo: "Pediatria Geral" },
  "/neonatal":        { label: "Neonatologia", cor: "#0E7490", grupo: "Neonatologia" },
};

/* ─── Seções de cada hub, na ordem de exibição ───────────────────────────── */
const SECOES = {
  "/pediatria-geral": [
    { titulo: "Emergências", Icon: AlertTriangle },
    { titulo: "Terapia Intensiva & Procedimentos", Icon: Zap },
    { titulo: "Farmacologia & Imunização", Icon: Pill },
    { titulo: "Crescimento & Avaliação", Icon: Scale },
    { titulo: "Especialidades Pediátricas", Icon: FlaskConical },
  ],
  "/neonatal": [
    { titulo: "Sala de Parto", Icon: Zap },
    { titulo: "Cuidados Intensivos", Icon: Thermometer },
    { titulo: "Metabólico & Nutrição", Icon: Droplets },
    { titulo: "Avaliação & Conforto", Icon: Stethoscope },
    { titulo: "Especialidades", Icon: Microscope },
  ],
};

/* ─── Módulos ────────────────────────────────────────────────────────────────
   label → nome completo: cabeçalho do módulo, busca e favoritos.
   curto → (opcional) nome usado só no card do hub, quando o completo é longo
           ou redundante ali.
   desc  → linha de apoio do card e da busca.
   cor   → cor de identidade do módulo (hex fixo — CLAUDE.md, regra 3).
   tags  → termos de busca que NÃO estão no nome/descrição: sinônimos, siglas,
           fármacos, escalas. Só incluir termo cujo conteúdo existe no módulo. */
export const MODULOS = [
  /* ══ Pediatria Geral ══ */
  /* ── Emergências ── */
  { rota: "/urgencias", label: "Urgências", desc: "Anafilaxia · Asma · Convulsão · Choque", Icon: AlertTriangle, cor: "#EF4444", grupo: "Pediatria Geral", secao: "Emergências",
    tags: "adrenalina epinefrina pals rcp parada anafilaxia asma crise convulsiva estado de mal choque cetoacidose cad salbutamol emergencia reanimacao broselow fita comprimento dose peso emergencia desfibrilacao cardioversao amiodarona adenosina atropina midazolam diazepam fenitoina hipoglicemia glicose sulfato magnesio tubo" },
  { rota: "/febre-sem-foco", label: "Febre Sem Foco", desc: "Fluxo por faixa etária · PECARN", Icon: Thermometer, cor: "#EF4444", grupo: "Pediatria Geral", secao: "Emergências",
    tags: "febre lactente rochester pecarn bacteremia ibg sepse oculta neonato" },
  { rota: "/convulsao-febril", label: "Convulsão Febril", desc: "Simples × complexa · critérios de PL", Icon: Zap, cor: "#D946EF", grupo: "Pediatria Geral", secao: "Emergências",
    tags: "convulsao febril crise febre puncao lombar" },
  { rota: "/tce-leve", label: "TCE Leve", desc: "PECARN · TC vs Observação", Icon: Brain, cor: "#7C3AED", grupo: "Pediatria Geral", secao: "Emergências",
    tags: "trauma cranio cabeca cranioencefalico pecarn tomografia observacao" },
  { rota: "/sepse", label: "Sepse Pediátrica", desc: "SSC 2026 · BIC e diluição · Phoenix", Icon: Activity, cor: "#DC2626", grupo: "Pediatria Geral", secao: "Emergências",
    tags: "choque septico ssc surviving phoenix vasoativa noradrenalina lactato rodwell cristaloide hidrocortisona antibiotico adrenalina perfusao" },
  { rota: "/bronquiolite", label: "Bronquiolite", desc: "Gravidade · OAF · nirsevimab", Icon: Stethoscope, cor: "#0D9488", grupo: "Pediatria Geral", secao: "Emergências",
    tags: "vsr sibilancia oxigenio alto fluxo oaf nirsevimab lactente chiado nirsevimabe palivizumab palivizumabe salina hipertonica cpap apneia" },
  { rota: "/intoxicacoes", label: "Intoxicações", desc: "Ingestão acidental · CIATOX · antídotos", Icon: AlertTriangle, cor: "#65A30D", grupo: "Pediatria Geral", secao: "Emergências",
    tags: "intoxicacao envenenamento ingestao acidental antidoto ciatox acetilcisteina naloxona paracetamol ferro carvao ativado flumazenil benzodiazepinico rumack deferoxamina caustico monoxido" },
  /* ── Terapia Intensiva & Procedimentos ── */
  { rota: "/isr", label: "ISR Pediátrica", desc: "Sequência rápida · doses · via difícil", Icon: Zap, cor: "#C2410C", grupo: "Pediatria Geral", secao: "Terapia Intensiva & Procedimentos",
    tags: "intubacao sequencia rapida via aerea dificil cetamina rocuronio succinilcolina laringoscopia tubo lamina atropina fentanil propofol midazolam pre-oxigenacao tot" },
  { rota: "/ventilacao", label: "Ventilação Mecânica", desc: "VC · FR · PARDS · desmame", Icon: Wind, cor: "#0891B2", grupo: "Pediatria Geral", secao: "Terapia Intensiva & Procedimentos",
    tags: "ventilador mecanica pards volume corrente peep desmame indice oxigenacao vm driving pressure hipercapnia permissiva fio2 extubacao" },
  { rota: "/eletrolitos", label: "Distúrbios Eletrolíticos", desc: "Na · K · Ca · Mg · correções", Icon: Droplets, cor: "#7C3AED", grupo: "Pediatria Geral", secao: "Terapia Intensiva & Procedimentos",
    tags: "eletrolitos eletrolito disturbio hidroeletrolitico sodio potassio calcio magnesio hiponatremia hipernatremia hipocalemia hipercalemia correcao kcl gluconato schwartz tfg creatinina osmolaridade sodio corrigido bicarbonato acidose hiperglicemia" },
  { rota: "/analgesia-sedacao", label: "Analgesia e Sedação", desc: "FLACC · BIC · desmame · WAT-1", Icon: Moon, cor: "#F59E0B", grupo: "Pediatria Geral", secao: "Terapia Intensiva & Procedimentos",
    tags: "sedacao analgesia flacc wat-1 abstinencia fentanil midazolam morfina bic desmame" },
  { rota: "/sedacao", label: "Sedação em Procedimentos", desc: "Cetamina · Midazolam · Fentanil · Checklist", Icon: Syringe, cor: "#6366F1", grupo: "Pediatria Geral", secao: "Terapia Intensiva & Procedimentos",
    tags: "sedacao procedimento cetamina midazolam fentanil propofol jejum checklist" },
  /* ── Farmacologia & Imunização ── */
  { rota: "/pedfarma", label: "PedFarma", desc: "48 medicamentos · dose por peso", Icon: Pill, cor: "#8B5CF6", grupo: "Pediatria Geral", secao: "Farmacologia & Imunização",
    tags: "amoxicilina paracetamol dipirona ibuprofeno azitromicina cefalexina antibiotico corticoide prednisolona dexametasona omeprazol ondansetrona dose bula prescricao medicamento remedio equivalencia hidrocortisona metilprednisolona prednisona salbutamol claritromicina ceftriaxona cefuroxima sulfametoxazol metronidazol clindamicina nitrofurantoina loratadina cetirizina hidroxizina esomeprazol lactulose simeticona fenobarbital levetiracetam carbamazepina valproato diazepam fluconazol nistatina aciclovir oseltamivir montelucaste sulfato ferroso ferro zinco vitamina d vitamina a naloxona difenidramina ipratropio budesonida domperidona" },
  { rota: "/antibioticos", label: "Antibioticoterapia", desc: "Escolha empírica por síndrome clínica", Icon: Stethoscope, cor: "#0D9488", grupo: "Pediatria Geral", secao: "Farmacologia & Imunização",
    tags: "antibiotico atb empirico pneumonia itu meningite celulite escolha sindrome otite oma faringite amigdalite sepse mastoidite pielonefrite erisipela abscesso" },
  { rota: "/vacinal", label: "Calendário Vacinal", desc: "SBIm 2026/2027 · SUS / Privado", Icon: Syringe, cor: "#06B6D4", grupo: "Pediatria Geral", secao: "Farmacologia & Imunização",
    tags: "vacina imunizacao calendario sbim pni atraso bcg hepatite pentavalente triplice meningo pneumo rotavirus febre amarela hpv dengue qdenga covid polio vip varicela nirsevimabe nirsevimab vsr" },
  /* ── Crescimento & Avaliação ── */
  { rota: "/percentis-oms", label: "Percentis (OMS)", desc: "OMS · curva 0–60 meses", Icon: Scale, cor: "#3B82F6", grupo: "Pediatria Geral", secao: "Crescimento & Avaliação",
    tags: "peso altura estatura perimetro cefalico crescimento imc z-escore curva" },
  { rota: "/dnpm", label: "DNPM", desc: "Marcos do desenvolvimento · Alarmes", Icon: Baby, cor: "#8B5CF6", grupo: "Pediatria Geral", secao: "Crescimento & Avaliação",
    tags: "desenvolvimento neuropsicomotor marcos atraso denver" },
  { rota: "/scores", label: "Scores Pediátricos", desc: "Gorelick · Westley · PEWS", Icon: ClipboardList, cor: "#F97316", grupo: "Pediatria Geral", secao: "Crescimento & Avaliação",
    tags: "gorelick westley pews finnegan crupe desidratacao abstinencia dor triagem escore laringotraqueobronquite laringite croup" },
  { rota: "/dor", label: "Escalas de Dor", desc: "FLACC · Wong-Baker · NRS · Escada", Icon: Activity, cor: "#F97316", grupo: "Pediatria Geral", secao: "Crescimento & Avaliação",
    tags: "escala dor flacc wong-baker faces nrs analgesia escada oms tramadol morfina paracetamol dipirona ibuprofeno codeina opioide" },
  { rota: "/exames-lab", label: "Exames Laboratoriais", desc: "Hemograma · Hormônios · Gastro · Vitaminas", Icon: Microscope, cor: "#0EA5E9", grupo: "Pediatria Geral", secao: "Crescimento & Avaliação",
    tags: "hemograma laboratorio valores referencia hormonio tsh ferritina vitamina d leucograma hemoglobina plaquetas pcr procalcitonina creatinina ureia tgo tgp bilirrubina gasometria t4 livre urina glicemia ferro b12 neutrofilos" },
  { rota: "/adolescencia", label: "Adolescência", desc: "Tanner · saúde mental · contracepção", Icon: Users, cor: "#7E22CE", grupo: "Pediatria Geral", secao: "Crescimento & Avaliação",
    tags: "adolescente tanner puberdade contracepcao saude mental" },
  { rota: "/teste-tea-tdah", label: "Rastreio TEA/TDAH", desc: "M-CHAT-R/F · DSM-5 · encaminhamento", Icon: Brain, cor: "#3730A3", grupo: "Pediatria Geral", secao: "Crescimento & Avaliação",
    tags: "autismo tea tdah m-chat rastreio deficit atencao hiperatividade" },
  /* ── Especialidades Pediátricas ── */
  { rota: "/gastropediatria", label: "Gastro e Hepato", desc: "DRGE · APLV · Constipação · Colestase", Icon: Activity, cor: "#F59E0B", grupo: "Pediatria Geral", secao: "Especialidades Pediátricas",
    tags: "refluxo drge constipacao obstipacao alergia proteina leite vaca aplv omeprazol regurgitacao hepato hepatologia figado colestase colestase neonatal bilirrubina direta conjugada atresia vias biliares kasai ictericia colestatica ursodesoxicolico" },
  { rota: "/formulas", label: "Fórmulas Infantis", desc: "Nestlé × Danone · Escada APLV", Icon: FlaskConical, cor: "#10B981", grupo: "Pediatria Geral", secao: "Especialidades Pediátricas",
    tags: "leite formula infantil hidrolisado aminoacido soja aplv alergia proteina leite vaca desmame nan aptamil" },
  { rota: "/hidratacao", label: "Hidratação", desc: "Holliday-Segar · Planos A / B / C", Icon: Droplets, cor: "#3B82F6", grupo: "Pediatria Geral", secao: "Especialidades Pediátricas",
    tags: "manutencao liquido soro reidratacao tro plano volume holliday segar desidratacao venoso plano a plano b plano c sro expansao glicose sodio potassio" },
  { rota: "/dermato", label: "Dermatologia", desc: "DA · Impetigo · Escabiose · Urticária", Icon: Shield, cor: "#EC4899", grupo: "Pediatria Geral", secao: "Especialidades Pediátricas",
    tags: "dermatite atopica impetigo escabiose sarna urticaria pele coceira prurido" },
  { rota: "/torchs", label: "Infecções Congênitas", desc: "TORCHS · sífilis, toxo, CMV, herpes, rubéola", Icon: Bug, cor: "#E11D48", grupo: "Pediatria Geral", secao: "Especialidades Pediátricas",
    tags: "torch sifilis toxoplasmose citomegalovirus cmv rubeola herpes zika congenita" },
  { rota: "/aleitamento", label: "Aleitamento Materno", desc: "Amamentação · técnica · introdução alimentar", Icon: Milk, cor: "#F43F5E", grupo: "Pediatria Geral", secao: "Especialidades Pediátricas",
    tags: "amamentacao leite materno pega mamada introducao alimentar" },
  { rota: "/oftalmologia", label: "Oftalmologia", desc: "Reflexo vermelho · triagem visual", Icon: Eye, cor: "#1E3A8A", grupo: "Pediatria Geral", secao: "Especialidades Pediátricas",
    tags: "reflexo vermelho olhinho catarata visao triagem visual" },
  { rota: "/doencas-exantematicas", label: "Doenças Exantemáticas", desc: "Sarampo · rubéola · exantema súbito e outros", Icon: Thermometer, cor: "#7F1D1D", grupo: "Pediatria Geral", secao: "Especialidades Pediátricas",
    tags: "sarampo rubeola exantema subito escarlatina eritema infeccioso mao pe boca varicela" },
  { rota: "/cardiologia-pediatrica-basica", label: "Cardiologia Pediátrica", desc: "Sopro inocente × patológico · hipertensão arterial", Icon: Heart, cor: "#BE123C", grupo: "Pediatria Geral", secao: "Especialidades Pediátricas",
    tags: "sopro cardiaco coracao cardiopatia inocente patologico hipertensao arterial pressao pa percentil has normotenso pressao alta tratamento anti-hipertensivo dose recem nascido neonatal dionne rn lactente" },
  /* ══ Neonatologia ══ */
  /* ── Sala de Parto ── */
  { rota: "/neonatologia-1", label: "Reanimação RNPT <34s", desc: "Sala de parto · SBP 2026", Icon: Zap, cor: "#0E7490", grupo: "Neonatologia", secao: "Sala de Parto",
    tags: "reanimacao neonatal sala parto prematuro rnpt vpp apgar" },
  { rota: "/neonatologia-6", label: "Reanimação RN ≥34s", desc: "Sala de parto · SBP 2026", Icon: Wind, cor: "#0284C7", grupo: "Neonatologia", secao: "Sala de Parto",
    tags: "reanimacao neonatal sala parto termo rnt vpp apgar" },
  { rota: "/neonatologia-4", label: "Scores Neonatais", desc: "Apgar · Capurro · Silverman", Icon: Calculator, cor: "#7C3AED", grupo: "Neonatologia", secao: "Sala de Parto",
    tags: "apgar capurro silverman ballard idade gestacional score" },
  { rota: "/classificacao-rn", label: "Classificação do RN", desc: "IG · Peso · Estatura ao nascer", Icon: Ruler, cor: "#DB2777", grupo: "Neonatologia", secao: "Sala de Parto",
    tags: "classificacao recem-nascido rn aig pig gig peso ao nascer baixo peso muito baixo extremo baixo simetrico assimetrico termo pos-termo prematuro extremo intergrowth fenton perimetro cefalico idade gestacional" },
  { rota: "/sala-de-parto", label: "Sala de Parto", desc: "TOT · Sonda · Cateteres umbilicais", Icon: Syringe, cor: "#B45309", grupo: "Neonatologia", secao: "Sala de Parto",
    tags: "sala parto tot canula sonda cateter umbilical calibre tubo profundidade" },
  { rota: "/malformacoes-cirurgicas-neonatais", label: "Malformações Cirúrgicas", desc: "Gastrosquise · onfalocele · hérnia diafragmática", Icon: AlertTriangle, cor: "#047857", grupo: "Neonatologia", secao: "Sala de Parto",
    tags: "malformacao cirurgica gastrosquise onfalocele hernia diafragmatica atresia" },
  /* ── Cuidados Intensivos ── */
  { rota: "/hipotermia", label: "Hipotermia Terapêutica", desc: "EHI · Thompson · reaquecimento", Icon: Thermometer, cor: "#4F46E5", grupo: "Neonatologia", secao: "Cuidados Intensivos",
    tags: "hipotermia terapeutica ehi encefalopatia asfixia thompson resfriamento aeeg reaquecimento criterios" },
  { rota: "/surfactante", label: "Surfactante", desc: "LISA · INSURE · dose por peso", Icon: BookOpen, cor: "#059669", grupo: "Neonatologia", secao: "Cuidados Intensivos",
    tags: "surfactante lisa insure curosurf prematuro sdr membrana hialina survanta mist fio2" },
  { rota: "/nec", label: "Enterocolite Necrosante", desc: "Bell · ATB por peso/IG · cirurgia", Icon: AlertTriangle, cor: "#92400E", grupo: "Neonatologia", secao: "Cuidados Intensivos",
    tags: "enterocolite necrosante bell prematuro abdome pneumatose pneumoperitonio metronidazol ampicilina gentamicina walsh" },
  { rota: "/dexametasona-dbp", label: "Dexa DBP", desc: "DART · Protocolo HMIB · RNPT", Icon: Pill, cor: "#0891B2", grupo: "Neonatologia", secao: "Cuidados Intensivos",
    tags: "dexametasona displasia broncopulmonar dbp dart corticoide prematuro" },
  { rota: "/pca", label: "PCA", desc: "Canal arterial · hsPDA · fechamento farmacológico", Icon: Waves, cor: "#BE185D", grupo: "Neonatologia", secao: "Cuidados Intensivos",
    tags: "pca canal arterial persistente hspda ibuprofeno paracetamol indometacina" },
  { rota: "/dilucao-bic", label: "Diluição e BIC", desc: "Vasoativas · Sedoanalgesia · PGE1", Icon: Activity, cor: "#F97316", grupo: "Neonatologia", secao: "Cuidados Intensivos",
    tags: "bomba infusao bic vasoativa dopamina dobutamina adrenalina noradrenalina milrinona pge1 dose prostaglandina alprostadil fentanil midazolam morfina insulina gotejamento diluicao" },
  /* ── Metabólico & Nutrição ── */
  { rota: "/neonatologia-2", label: "Hipoglicemia Neonatal", desc: "Hipoglicemia · Gel de Dextrose", Icon: Heart, cor: "#0D9488", grupo: "Neonatologia", secao: "Metabólico & Nutrição",
    tags: "hipoglicemia glicemia gel dextrose glicose neonatal diazoxido hiperinsulinismo bolus filho de mae diabetica" },
  { rota: "/neonatologia-5", label: "NPT Neonatal", desc: "Nutrição Parenteral · Eletrólitos", Icon: Droplets, cor: "#6366F1", grupo: "Neonatologia", secao: "Metabólico & Nutrição",
    tags: "npt nutricao parenteral aminoacido lipidio glicose eletrolito neonatal" },
  { rota: "/tig-neonatal", label: "TIG Neonatal", desc: "Taxa de Infusão de Glicose · UCIN", Icon: Droplets, cor: "#0891B2", grupo: "Neonatologia", secao: "Metabólico & Nutrição",
    tags: "tig taxa infusao glicose vig glicemia npt concentracao hiperglicemia hipoglicemia acesso periferico" },
  { rota: "/canguru", label: "Canguru", desc: "Prescrição e Receituário Neonatal", Icon: Heart, cor: "#10B981", grupo: "Neonatologia", secao: "Metabólico & Nutrição",
    tags: "metodo canguru prescricao receituario ucin fm85 ferro zinco fosfato tricalcico vitamina d colecalciferol polivitaminico dieta enteral sulfato ferroso" },
  { rota: "/seguimento-prematuro-risco", label: "Seguimento do Prematuro", desc: "Equipe · calendário de consultas · sinais de alarme", Icon: Users, cor: "#15803D", grupo: "Neonatologia", secao: "Metabólico & Nutrição",
    tags: "seguimento prematuro follow-up alto risco calendario consultas doenca metabolica ossea fosfatase alcalina idade corrigida ferro anemia" },
  /* ── Avaliação & Conforto ── */
  { rota: "/idade-gestacional", label: "Idade Gestacional", desc: "IGPM · idade corrigida · cronológica", Icon: CalendarClock, cor: "#2563EB", grupo: "Neonatologia", secao: "Avaliação & Conforto",
    tags: "idade gestacional corrigida igpm cronologica pos-menstrual prematuro" },
  { rota: "/percentis", label: "Percentis (completo)", curto: "Percentis", desc: "OMS · Intergrowth · Fenton", Icon: Scale, cor: "#3B82F6", grupo: "Neonatologia", secao: "Avaliação & Conforto",
    tags: "percentil curva fenton intergrowth oms peso estatura perimetro cefalico" },
  { rota: "/dor-neonatal", label: "Dor Neonatal", desc: "NIPS · PIPP-R · N-PASS · CRIES", Icon: Activity, cor: "#EF4444", grupo: "Neonatologia", secao: "Avaliação & Conforto",
    tags: "dor neonatal nips pipp n-pass cries escala" },
  { rota: "/neonatologia-3", label: "Icterícia Neonatal", desc: "Fototerapia AAP 2022 · Causas", Icon: Stethoscope, cor: "#D97706", grupo: "Neonatologia", secao: "Avaliação & Conforto",
    tags: "ictericia bilirrubina fototerapia exsanguineotransfusao aap kernicterus tsb tcb transcutanea zona sbp albumina imunoglobulina hemolise g6pd incompatibilidade colestase" },
  /* ── Especialidades ── */
  { rota: "/cuidados-pele-rn", label: "Pele do RN", desc: "SBP GPA 140 · Higiene · Emolientes", Icon: Leaf, cor: "#0891B2", grupo: "Neonatologia", secao: "Especialidades",
    tags: "pele recem-nascido banho emoliente cordao umbilical higiene" },
  { rota: "/rop", label: "Retinopatia da Prematuridade", curto: "Retinopatia (ROP)", desc: "Triagem · momento do exame · seguimento", Icon: ScanEye, cor: "#0369A1", grupo: "Neonatologia", secao: "Especialidades",
    tags: "retinopatia prematuridade rop triagem oftalmologica" },
  { rota: "/colestase-neonatal", label: "Colestase Neonatal", desc: "Bilirrubina direta · atresia · exames · tratamento", Icon: Droplets, cor: "#CA8A04", grupo: "Neonatologia", secao: "Especialidades",
    tags: "colestase bilirrubina direta conjugada atresia vias biliares kasai colangiografia acolia coluria fezes claras alagille pfic ursodesoxicolico udca vitaminas lipossoluveis ggt hepatologia colestase neonatal" },
  { rota: "/triagem-neonatal", label: "Triagem Neonatal", desc: "Pezinho · olhinho · orelhinha · coraçãozinho", Icon: Footprints, cor: "#14B8A6", grupo: "Neonatologia", secao: "Especialidades",
    tags: "triagem pezinho olhinho orelhinha coracaozinho teste linguinha oximetria emissoes otoacusticas peate fenilcetonuria hipotireoidismo fibrose cistica hiperplasia adrenal biotinidase frenulo" },
];

/* Hub (rota) a que cada grupo pertence. */
const HUB_DO_GRUPO = Object.fromEntries(Object.entries(HUBS).map(([rota, h]) => [h.grupo, rota]));

/* Nome do card no hub. */
export const nomeNoHub = (m) => m.curto || m.label;

/* Seções de um hub já com seus módulos, na ordem do catálogo. */
export function secoesDoHub(rotaHub) {
  const grupo = HUBS[rotaHub].grupo;
  return SECOES[rotaHub].map((s) => ({
    ...s,
    mods: MODULOS.filter((m) => m.grupo === grupo && m.secao === s.titulo),
  }));
}

/* Mapa rota → { label, cor, voltar } para o cabeçalho global (App.jsx).
   Hubs voltam para a home ("/"); módulos voltam para o hub do seu grupo. */
export const MODULO_MAP = {
  ...Object.fromEntries(Object.entries(HUBS).map(([rota, h]) => [rota, { label: h.label, cor: h.cor }])),
  ...Object.fromEntries(MODULOS.map((m) => [m.rota, { label: m.label, cor: m.cor, voltar: HUB_DO_GRUPO[m.grupo] }])),
};
