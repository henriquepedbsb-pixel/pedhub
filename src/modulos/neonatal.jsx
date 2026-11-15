// src/modulos/neonatal.jsx
// Hub Neonatal — tela de entrada para os módulos de Neonatologia.
// Layout e cards em src/components/HubModulos.jsx; conteúdo em src/lib/catalogo.js.
import HubModulos from "../components/HubModulos";

export default function Neonatal() {
  return <HubModulos rotaHub="/neonatal" />;
}
