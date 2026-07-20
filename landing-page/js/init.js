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
window.addEventListener("load", function () {
  // Só sobe se não houver âncora na URL (ex.: /#plataforma deve continuar valendo).
  if (!window.location.hash) window.scrollTo(0, 0);
});
