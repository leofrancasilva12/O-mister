/* Marca que o JavaScript está ativo, ainda no <head>, antes da página pintar.
   O CSS só esconde os elementos para animar quando esta classe existe — assim,
   se o JavaScript falhar ou estiver desligado, o conteúdo aparece normalmente
   em vez de ficar invisível. */
document.documentElement.classList.add("js-ativo");

/* Ao atualizar a página, sempre começar do topo.
   Por padrão o navegador restaura a posição em que o usuário estava —
   aqui isso é desligado para a apresentação começar sempre do início. */
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
function irParaTopo() {
  // Sempre volta ao topo — inclusive se a URL tiver uma âncora antiga
  // (ex.: um atalho salvo de quando existia o link "#plataforma").
  // "instant" ignora o "scroll-behavior: smooth" do CSS: sem isso, o salto
  // vira uma animação suave que pode ser interrompida antes de chegar ao topo.
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  /* No Chrome para Android, ao restaurar uma aba (troca de app, várias abas
     abertas), o navegador às vezes reaplica a posição de rolagem salva LOGO
     DEPOIS deste evento, sobrescrevendo o reset acima. Insiste por um
     instante para vencer essa restauração tardia. */
  [50, 150, 300, 600].forEach(function (atraso) {
    setTimeout(function () {
      if (window.scrollY > 0) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, atraso);
  });
}
window.addEventListener("load", irParaTopo);
/* "pageshow" cobre o caso do navegador restaurar a página do cache
   (voltar/avançar, trocar de app no celular) sem disparar "load" de novo. */
window.addEventListener("pageshow", irParaTopo);
