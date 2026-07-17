# Normas API de roscas e tubos – Visão geral para agente de IA

> Este documento é um resumo original, destinado a ajudar um agente de IA a responder dúvidas técnicas sem reproduzir texto integral das normas API.  
> Para qualquer valor exato, tabela completa ou decisão crítica de engenharia, o usuário deve sempre consultar o texto oficial da norma correspondente.

***

## 1. Visão geral das normas API de roscas e tubos

As normas do American Petroleum Institute (API) relacionadas a roscas e tubos são usadas na indústria de petróleo e gás para padronizar:

- Geometria de roscas e conexões.
- Requisitos de fabricação e inspeção.
- Propriedades mecânicas e de desempenho de tubos.
- Terminologia e classificação de componentes.

Este arquivo foca em:

- Roscas e inspeção de **casing, tubing e line pipe**.  
- Roscas de conexões de perfuração com ombro (rotary shouldered).  
- Tubos de revestimento e produção.  
- Hastes de bombeio.

As normas API relevantes aqui são, principalmente:

- API 5B  
- API 5CT  
- API 5L (dutos)  
- API 7‑2  
- API 7‑1 (produtos de perfuração)  
- API 11B  

***

## 2. API 5B – Rosqueamento, medição e inspeção de roscas

**Nome típico**: API Spec 5B – Threading, Gauging, and Inspection of Casing, Tubing, and Line Pipe Threads.  
**Foco**: perfil de roscas e critérios de inspeção para casing, tubing e line pipe.

### 2.1 Escopo geral

- Define **perfis de rosca** para tubos de revestimento (casing), produção (tubing) e linha (line pipe).  
- Estabelece requisitos para:
  - Preparação das extremidades para rosqueamento.  
  - Dimensões de roscas (ângulos, passos, conicidade).  
  - Calibração mediante calibres (gages).  
  - Critérios de aceitação/rejeição em inspeção.

### 2.2 Principais tipos de rosca abordados

O agente deve conhecer e reconhecer, ao menos:

- **Casing**: LTC (Long Threaded and Coupled), STC (Short Threaded and Coupled), BTC (Buttress Thread and Coupled).  
- **Tubing**: EUE (External Upset End), NUE (Non‑Upset End).  
- **Line pipe**: roscas de acordo com a série aplicável (geralmente compatíveis com roscas tipo API line pipe).

### 2.3 Conceitos importantes para respostas

- Perfil de rosca:  
  - Ângulo do filete (angle).  
  - Taper (conicidade) por polegada.  
  - Passo (threads per inch, TPI).  

- Dimensões críticas:  
  - Diâmetro externo na raiz da rosca.  
  - Diâmetro no topo dos filetes.  
  - Comprimento roscado útil (engagement length).  

- Inspeção:  
  - Verificação com calibres “go / no‑go”.  
  - Critérios de desgaste, danos, refileteamento.  

> Orientação para o agente:  
> - Em perguntas sobre “atende API 5B?”, descreva em linguagem natural que a conformidade envolve seguir os perfis, tolerâncias e métodos de inspeção descritos na 5B.  
> - Nunca invente valores numéricos exatos de diâmetro ou tolerância; oriente a consultar tabelas específicas da API 5B para o tamanho e tipo de rosca em questão.

***

## 3. API 5CT – Tubos de revestimento e produção

**Nome típico**: API Spec 5CT – Casing and Tubing.  
**Foco**: requisitos de fabricação, propriedades mecânicas e tipos de extremidade para tubos de revestimento (casing) e produção (tubing).

### 3.1 Escopo geral

- Define **graus de aço**, faixas de resistência (por exemplo, H40, J55, L80, P110, etc.).  
- Estabelece requisitos de:
  - Dimensões de OD, espessura de parede, comprimento.  
  - Ensaios mecânicos (tração, impacto), testes hidrostáticos.  
  - Tipos de extremidades e conexões (LTC, STC, BTC, EUE, NUE e conexões premium).  

### 3.2 Relação com roscas

- A 5CT especifica os tipos de extremidade (por exemplo, LTC, STC, BTC, EUE, NUE) e remete à **API 5B** para detalhes geométricos e de inspeção das roscas.  
- Para dúvidas sobre perfil ou tolerância de rosca, o agente deve direcionar para API 5B; para dúvidas sobre **classe de tubo, grau de aço, faixas de pressão ou colapso**, direcionar para API 5CT.

### 3.3 Conceitos importantes para respostas

- Diferença entre *casing* e *tubing*.  
- Significado de cada tipo de extremidade:  
  - LTC: rosca longa com acoplamento.  
  - STC: rosca curta com acoplamento.  
  - BTC: rosca buttress de maior capacidade estrutural.  
  - EUE/NUE: extremidade de tubing com ou sem ressalto externo.  

> Orientação para o agente:  
> - Ao responder perguntas sobre seleção de tubo (grau, tipo de conexão), explicar as diferenças conceituais e lembrar que as capacidades exatas (pressão, colapso, burst) dependem da tabela oficial da API 5CT.  
> - Não fornecer tabelas extensas de carga ou colapso; sugerir sempre consulta à edição mais recente da norma.

***

## 4. API 5L – Dutos de linha (line pipe)

**Nome típico**: API Spec 5L – Line Pipe.  
**Foco**: tubos para transporte de petróleo, gás e fluidos em dutos.

### 4.1 Escopo geral

- Define requisitos para tubos de linha (line pipe), incluindo:
  - Graus (por exemplo, X42, X52, X65, X70, etc.).  
  - Dimensões nominais de diâmetro e espessura de parede.  
  - Ensaios mecânicos e requisitos de qualidade.  

### 4.2 Relação com roscas

- API 5L trata majoritariamente de tubos que podem ser soldados ou usar conexões especiais.  
- Quando roscas são usadas em line pipe, as características de rosca podem remeter novamente à API 5B.

> Orientação para o agente:  
> - Utilize a API 5L em respostas sobre dutos de transporte e suas classificações mecânicas, não como referência principal de roscas de casing/tubing.

***

## 5. API 7‑2 – Roscas de perfuração com ombro (rotary shouldered connections)

**Nome típico**: API Spec 7‑2 – Threading and Gauging of Rotary Shouldered Connections.  
**Foco**: conexões de perfuração com ombro de torque (drill pipe, drill collars, HWDP).

### 5.1 Escopo geral

- Define geometria, tolerâncias, rosqueamento e calibração de conexões com ombro.  
- Abrange conexões como:
  - **NC** (Numeric Connection, ex.: NC26, NC31, NC38, NC50).  
  - **REG** (Regular).  
  - **IF** (Internal Flush).  
  - **FH** (Full Hole).  

### 5.2 Conceitos importantes para respostas

- Conexão com ombro:  
  - Parte roscada mais uma face de ombro que transmite torque e compressão axial.  
- Parâmetros típicos:
  - TPI (threads per inch).  
  - Taper (conicidade da rosca).  
  - Diâmetros de pino e caixa.  
  - Comprimento de engate da rosca.  

> Orientação para o agente:  
> - Em perguntas como “NC38 e 3 1/2 REG são compatíveis?”, explique que a compatibilidade depende dos perfis e dimensões definido na API 7‑2, e sugira verificar as tabelas oficiais de compatibilidade.  
> - Evite fornecer torques de make‑up exatos; oriente consultar tabelas de torque recomendadas em manuais de fabricante ou na própria aplicação da norma.

***

## 6. API 7‑1 – Produtos de perfuração (drill stem elements)

**Nome típico**: API Spec 7‑1 – Rotary Drill Stem Elements.  
**Foco**: requisitos de projeto, fabricação e testes para drill pipe, drill collars, HWDP e componentes relacionados.

### 6.1 Escopo geral

- Define propriedades mecânicas, dimensões e tolerâncias gerais de produtos da coluna de perfuração.  
- Complementa a 7‑2, que trata especificamente das roscas e conexões com ombro.

> Orientação para o agente:  
> - Quando a pergunta for sobre **integridade da coluna de perfuração, limites de uso, classes de pipe**, a 7‑1 é mais relevante.  
> - Quando for especificamente sobre **perfil de rosca e calibração de conexão**, 7‑2 é a principal.

***

## 7. API 11B – Hastes de bombeio (sucker rods)

**Nome típico**: API Spec 11B – Sucker Rods and Rod‑Related Products.  
**Foco**: hastes de bombeio mecânico e componentes associados.

### 7.1 Escopo geral

- Define:
  - Dimensões e classes de hastes de bombeio.  
  - Propriedades mecânicas (resistência, fadiga).  
  - Características de roscas e acoplamentos das hastes.  

### 7.2 Conceitos importantes para respostas

- Classificação de hastes por diâmetro, comprimento e capacidade de carga.  
- Padrões de rosca aplicados aos terminais de hastes e acoplamentos.

> Orientação para o agente:  
> - Para perguntas sobre **roscas de hastes de bombeio**, explique em termos gerais e direcione à API 11B para especificações detalhadas.  
> - Evite replicar tabelas completas de carga ou dimensões; use descrições qualitativas.

***

## 8. Como o agente deve usar este arquivo

### 8.1 Identificação rápida da norma relevante

O agente deve mapear a pergunta do usuário para a norma principal, por exemplo:

- Perguntas sobre roscas de **casing/tubing** → API 5B (perfil de rosca) + API 5CT (produto).  
- Perguntas sobre dutos de transporte → API 5L.  
- Perguntas sobre roscas de **drill pipe, drill collar, HWDP** → API 7‑2 (roscas) + API 7‑1 (produto).  
- Perguntas sobre hastes de bombeio → API 11B.

### 8.2 Padrão de resposta recomendado

Sempre que a pergunta envolver dado que tipicamente está em **tabelas numéricas**, o agente deve:

1. Explicar o conceito de forma qualitativa.  
2. Citar a(s) norma(s) relevantes (ex.: “conforme API 5B e API 5CT”).  
3. Incluir um aviso do tipo:
   - “Para dimensionamento final, consulte a edição mais recente da norma API X, tabela Y, pois valores exatos dependem do diâmetro, grau de aço e edição da norma.”  

### 8.3 Limitações intencionais

- O agente **não** deve tentar reproduzir texto extenso do corpo da norma.  
- O agente **não** deve inventar valores de:
  - Diâmetros máximos/mínimos.  
  - Tolerâncias dimensionais.  
  - Torques recomendados.  
  - Resistências exatas (colapso, burst, tensão, etc.).  

Ele deve sempre orientar o usuário a consultar as tabelas e gráficos oficiais da norma correspondente ou manuais de fabricantes.

***

## 9. Ideias de extensões deste arquivo

Você pode adicionar, em seções futuras (outros `.md` ou anexos):

- Pequenos **glossários** de termos de roscas (taper, pitch, lead, crest, root, thread height, etc.).  
- Mapas de compatibilidade simplificados (por exemplo, que tipos de conexões são tipicamente compatíveis ou não), sem reproduzir tabelas completas.  
- Fluxos de decisão simplificados:
  - “Se o componente é casing/tubing → ver 5B/5CT”.  
  - “Se é coluna de perfuração → ver 7‑1/7‑2”.  
  - “Se é haste de bombeio → ver 11B”.

***
