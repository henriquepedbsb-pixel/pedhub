// src/lib/html-estatico.js
// Ponto ÚNICO por onde passa todo HTML bruto injetado no DOM (via
// dangerouslySetInnerHTML ou document.write). Concentrar aqui torna cada
// injeção auditável e evita que novos pontos apareçam espalhados.
//
// USO PREVISTO: apenas HTML CONFIÁVEL definido no próprio código-fonte
// (constantes dos módulos) ou DOM já renderizado pelo próprio app.
// NÃO use com texto vindo do usuário, de rede, de URL ou de conteúdo
// editável — para isso seria necessário um sanitizador completo (ex.: DOMPurify).
//
// `sanitizarEstatico` é um BACKSTOP de defesa em profundidade: se um dia a
// origem desse HTML mudar sem querer, ele remove os vetores mais óbvios de
// XSS (<script>, handlers on*=, javascript:, tags de carregamento externo).
// Sobre conteúdo confiável ele é um no-op — a saída é igual à entrada.

const PERIGOS = [
  // Blocos de script inteiros.
  /<script\b[\s\S]*?<\/script\s*>/gi,
  /<script\b[^>]*>/gi,
  // Tags que carregam/embarcam recurso externo ou reescrevem a base.
  /<\/?(?:iframe|object|embed|link|meta|base|form)\b[^>]*>/gi,
  // Handlers de evento inline: onClick=, onerror=, onload= …
  /\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
  // URIs perigosas em href/src.
  /\b(?:href|src)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]+)/gi,
];

export function sanitizarEstatico(html) {
  if (typeof html !== "string") return "";
  return PERIGOS.reduce((s, re) => s.replace(re, ""), html);
}

// Devolve as props prontas para espalhar num elemento:
//   <div {...htmlEstatico(item.body)} />
export function htmlEstatico(html) {
  return { dangerouslySetInnerHTML: { __html: sanitizarEstatico(html) } };
}
