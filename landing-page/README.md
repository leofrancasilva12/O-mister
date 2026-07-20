# Landing page — Mister Intelligence O&G (MIOG)

Página institucional de apresentação da plataforma MIOG.

## Estrutura

```
landing-page/
├── index.html            estrutura e conteúdo
├── css/
│   └── style.css         todo o visual (paleta da marca, responsivo, tema escuro)
├── js/
│   ├── init.js           ativa as animações (carregado no <head>)
│   └── script.js         animações de entrada e efeito de digitação
└── img/
    ├── marca-miog.png    arte institucional do topo
    └── favicon.png       ícone da aba do navegador
```

A pasta é **autossuficiente**: não depende de nenhum arquivo externo, biblioteca,
CDN ou fonte remota. Basta copiá-la inteira para onde quiser.

## Como visualizar

Abra o `index.html` no navegador — funciona direto, sem servidor.

## Como publicar no GitHub Pages

1. Crie um repositório novo e envie o **conteúdo desta pasta** para a raiz dele
   (o `index.html` precisa ficar na raiz, não dentro de uma subpasta).
2. No repositório: **Settings → Pages**.
3. Em *Source*, escolha **Deploy from a branch**, selecione a branch `main` e a
   pasta `/ (root)`. Salve.
4. Em alguns minutos a página fica no ar em
   `https://<seu-usuario>.github.io/<nome-do-repositorio>/`.

## Manutenção

- **Link do aplicativo:** está em dois botões no `index.html`, apontando para
  `https://mister-intelligence.vercel.app`. Se o endereço da plataforma mudar,
  atualize os dois.
- **QR Code:** está embutido como SVG dentro do `index.html` e aponta para o
  mesmo endereço. Se o link mudar, o QR precisa ser gerado de novo.
- **Simulação do aplicativo:** a área que imita a tela do MIOG é feita em
  HTML/CSS, não é uma captura de tela. Para trocar por um print real, substitua
  o bloco `.app-janela` por uma `<img>`.
- **Acessibilidade:** todas as animações respeitam a preferência de
  "movimento reduzido" do sistema operacional.
