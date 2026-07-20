/* Marca que o JavaScript está ativo, ainda no <head>, antes da página pintar.
   O CSS só esconde os elementos para animar quando esta classe existe — assim,
   se o JavaScript falhar ou estiver desligado, o conteúdo aparece normalmente
   em vez de ficar invisível. */
document.documentElement.classList.add("js-ativo");
