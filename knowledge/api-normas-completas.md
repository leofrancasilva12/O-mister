# Base de Conhecimento API — Normas de Roscas, Tubos e Qualidade

> Este documento consolida normas API de roscas/tubos + API Specification Q1 (Quality Management System).
> É um resumo original destinado a um agente de IA especializado. Para valores exatos, sempre consulte a norma oficial.

---

## ÍNDICE
1. [Visão Geral das Normas API](#1-visão-geral-das-normas-api)
2. [API Specification Q1 — Quality Management System](#2-api-specification-q1--quality-management-system)
3. [Normas de Roscas e Tubos (5B, 5CT, 5L, 7-1, 7-2, 11B)](#3-normas-de-roscas-e-tubos)
4. [Glossário Técnico Integrado](#4-glossário-técnico-integrado)
5. [Roteamento de Perguntas → Normas](#5-roteamento-de-perguntas--normas)
6. [Tabelas de Roteamento Rápido](#6-tabelas-de-roteamento-rápido)

---

# 1. VISÃO GERAL DAS NORMAS API

## Normas de Roscas e Tubos

| Norma | Título Típico | Foco Principal | Componentes |
|-------|---------------|---|---|
| **API 5B** | Threading, Gauging, and Inspection of Casing, Tubing, and Line Pipe Threads | Geometria de roscas, calibração, inspeção | Casing, tubing, line pipe |
| **API 5CT** | Casing and Tubing | Produtos, graus de aço, propriedades mecânicas | Tubos de revestimento e produção |
| **API 5L** | Line Pipe | Dutos de transporte de petróleo e gás | Tubos para gasodutos e oleodutos |
| **API 7-1** | Rotary Drill Stem Elements | Produtos de perfuração (pipe, collars, HWDP) | Componentes da coluna de perfuração |
| **API 7-2** | Threading and Gauging of Rotary Shouldered Connections | Roscas de perfuração com ombro | Conexões NC, REG, IF, FH |
| **API 7G-2** | Inspection Procedures for Drill Stem Elements in Service | Inspeção em serviço de componentes usados | Drill pipe/collar usado em poço |
| **API 11B** | Sucker Rods and Rod-Related Products | Hastes de bombeio mecânico | Hastes e acoplamentos de bombeio |
| **API 6A** | Wellhead and Christmas Tree Equipment | Equipamentos de cabeça de poço | Wellhead, árvore de natal, válvulas |

---

# 2. API SPECIFICATION Q1 — QUALITY MANAGEMENT SYSTEM

> Base desta seção: **API Specification Q1, 10ª edição, setembro de 2023** ("Quality Management System
> Requirements for Organizations Providing Products for the Petroleum and Natural Gas Industry"), incluindo
> Errata 1–3 (out/2023, out/2024, nov/2024) e Adendos 1–2 (out/2024, jun/2025). Data de vigência do Programa
> de Monograma API para esta edição: 18/set/2024 (adendos: 25/dez/2025).
> Texto **traduzido e reorganizado em resumo próprio** — não é cópia literal da norma, que é protegida por
> direitos autorais da API. Para linguagem exata e valores contratuais, sempre consulte o documento oficial.

## 2.1 Escopo e Aplicabilidade

**Escopo (Seção 1):** Q1 estabelece os requisitos mínimos de sistema de gestão da qualidade (QMS) para
organizações que fornecem **produto** para uso na indústria de petróleo e gás natural.

**Referência normativa (Seção 2):** ISO 9000:2015 (Quality management systems — Fundamentals and vocabulary).

### O que mudou na 10ª edição (em relação à 9ª)

- Alinhamento com os requisitos da ISO 9001:2015.
- **Escopo ampliado**: antes cobria só quem fabricava produto físico, fazia serviço em produto físico ou
  processos relacionados à manufatura. Agora cobre também engenharia/design isolado e atividades relacionadas
  a produto (distribuição, logística, desenvolvimento de software).
- Definição de "produto" ampliada para acompanhar o novo escopo.
- **Prazo de retenção de registros ampliado para 10 anos** (era menor antes).
- Removida referência a uma versão desatualizada da ISO 9000.
- Adicionadas alternativas ao Manual da Qualidade tradicional (não precisa mais ser um documento único).
- "Design and Development" virou apenas "**Design**".
- Esclarecimento sobre validação de processos.
- Linguagem revisada sobre inspeção de produto e processo de aceitação final.
- Processo de avaliação de fornecedores revisado.
- **Seção de ação preventiva removida** (não existe mais como requisito separado).
- Definições novas e revisadas.

### Quem precisa atender a Q1 (organizações cobertas)

- **Manufatura** de produto.
- **Engenharia/design.**
- Prestadores de atividades físicas de realização de produto: **soldagem, tratamento térmico,
  revestimento/pintura (coating/plating), usinagem, inspeção, teste, serviço (servicing)**.
- Prestadores de atividades relacionadas a produto físico: **distribuição, logística, desenvolvimento de
  software**.

### Definição de "Produto" (3.1.16)

> "Output (saída) de uma organização destinado a ser fornecido a um cliente."

Inclui, sem se limitar a: hardware, software, atividades de produção, ou atividades relacionadas a produto
como serviço (servicing), armazenagem, distribuição e logística.

---

## 2.2 Termos e Definições Essenciais (Seção 3)

| Termo (EN) | Definição resumida |
|---|---|
| **Acceptance criteria** | Requisitos especificados de aceitabilidade aplicados a características de produto ou processo. |
| **Acceptance inspection** | Demonstração, por monitoramento ou medição, de que o produto atende aos requisitos especificados. |
| **Calibration** | Comparação com um padrão de precisão conhecida, contra os critérios de aceitação do TMMDE, e ajuste se necessário. Equipamento não ajustável: chama-se "verificação". |
| **Compliance** | Ato de satisfazer (verbo) ou status de ter satisfeito (substantivo) requisitos **legais**. |
| **Critical** | Considerado pela organização, pela especificação do produto, ou pelo cliente como de importância significativa, exigindo ação específica. |
| **Delivery** | Momento em que ocorre a transferência de propriedade combinada. |
| **DAC — Design acceptance criteria** | Requisitos aplicados a características (ou combinações delas) de materiais, produtos ou componentes para atingir conformidade aos requisitos de design e/ou desempenho de design exigido. DAC **pode** ser igual ao MAC. |
| **Design validation** | Processo de provar o design por meio de testes, demonstrando que o produto atende aos requisitos de design e desempenha como pretendido (ex.: testes de protótipo, funcionais/operacionais, exigidos por norma/regulação, testes e revisões de campo). |
| **Design verification** | Processo de examinar as saídas do design para determinar conformidade com os requisitos especificados (ex.: cálculos alternativos, revisão de documentos de saída, comparação com designs similares comprovados). |
| **KPI — Key performance indicator** | Medida quantificável usada para avaliar ou comparar desempenho. |
| **Legal requirement** | Requisitos estatutários ou regulatórios. |
| **Management personnel** | Pessoa ou grupo com autoridade e responsabilidade pela condução e controle de toda ou parte de uma organização. |
| **MAC — Manufacturing acceptance criteria** | Requisitos aplicados a características (ou combinações) de materiais, produtos ou componentes para atingir conformidade ao DAC aplicável e a outros requisitos de manufatura do produto. MAC **pode** ser igual ao DAC. Para serviços, "manufacturing" pode ser lido como "realização do produto". |
| **Outsource** | Função ou processo desempenhado por um fornecedor externo em nome da organização. |
| **Procedure** | Método documentado da organização para desempenhar uma atividade sob condições controladas, visando conformidade com requisitos especificados. Pode ser instrução de trabalho, fluxograma ou manual. |
| **Product realization** | Conjunto de atividades inter-relacionadas ou interativas necessárias para fornecer o produto. |
| **Remote assessment** | Avaliação conduzida por pessoa(s) fisicamente ausente(s) do local avaliado. |
| **Risk** | Situação ou circunstância com probabilidade de ocorrer e consequência potencialmente negativa. |
| **Servicing** | Manutenção, ajuste e/ou reparo realizado após entrega e/ou instalação em campo. |
| **Supply chain** | Fornecedores e subfornecedores associados, necessários para a realização do produto. |

**Abreviações principais:** DAC, ITP (inspection test plan), KPI, MAC, MOC (management of change), MPS
(manufacturing process specification), PCP (process control plan), QAP (quality activity plan), QMS, QP
(quality plan), TMMDE (testing, measuring, monitoring, and detection equipment).

---

## 2.3 Seção 4 — Requisitos do Sistema de Gestão da Qualidade

### 4.1 Quality Management System

- **4.1.1 Geral:** a organização deve planejar, estabelecer, documentar, implementar e manter **a todo
  momento** um QMS conforme os requisitos da Q1, dentro do escopo definido por ela mesma. Deve medir e
  melhorar a efetividade do QMS.
- **4.1.2 Política da Qualidade:** definida, documentada, revisada e aprovada pela alta direção. Deve ser
  apropriada à organização, servir de base para os objetivos da qualidade, ser comunicada/entendida/mantida,
  disponível às partes interessadas relevantes, e incluir compromisso com conformidade e melhoria contínua.
- **4.1.3 Objetivos da Qualidade:** estabelecidos nas funções e níveis relevantes, com aprovação da alta
  direção. Devem ser mensuráveis, comunicados e coerentes com a política.
- **4.1.4 Planejamento do QMS:**
  - **4.1.4.1 Geral** — a organização deve: definir o escopo do QMS (produtos cobertos, limitações e
    exclusões); identificar questões internas/externas relevantes; determinar partes interessadas e seus
    requisitos; determinar sequência e interação dos processos; determinar critérios/métodos de operação e
    controle; identificar objetivos da qualidade (ações, recursos, responsabilidades, prazo, forma de
    monitoramento); endereçar riscos identificados (5.3) e oportunidades de melhoria (6.4); identificar
    pessoal-chave.
  - **4.1.4.2 Exclusões** — se a organização desempenha atividades cobertas pela Q1 (inclusive terceirizadas),
    **não pode excluí-las**. Exclusões só são permitidas nestas seções específicas, e exigem justificativa
    documentada: **5.4 Design**, **5.6.4 Validação de Processos**, **5.6.7 Propriedade de Terceiros**,
    **5.6.8 Preservação do Produto**, **5.8 TMMDE**.
- **4.1.5 Comunicação:**
  - **Interna** — processos para comunicar, nos níveis/funções relevantes, a importância de satisfazer
    requisitos do cliente/legais e os resultados da análise de dados (6.3).
  - **Externa** — processo para comunicação com organizações externas, incluindo clientes: execução de
    consultas/contratos/pedidos e suas alterações; determinação de requisitos ao longo do contrato;
    fornecimento de informação de produto (incluindo não conformidades); feedback e reclamações de clientes;
    comunicação de planos de qualidade e suas mudanças; comunicação de mudanças e riscos associados (MOC).

### 4.2 Management Responsibility (Responsabilidade da Direção)

- **4.2.1 Geral** — a alta direção deve demonstrar liderança e comprometimento: aprovando os objetivos da
  qualidade; provendo recursos (humanos, infraestrutura, financeiros, tecnologia); engajando e apoiando o
  pessoal; atribuindo responsabilidades e autoridades para que os processos atinjam os resultados pretendidos.
- **4.2.2 Responsabilidade e Autoridade** — devem ser definidas, documentadas e comunicadas em toda a
  organização.
- **4.2.3 Representante da Direção** — a alta direção deve nomear um membro do pessoal de gestão responsável
  por: garantir conformidade do QMS à Q1; garantir que os processos do QMS sejam estabelecidos/implementados/
  mantidos; reportar à alta direção sobre desempenho do QMS e necessidade de melhoria; garantir ações para
  tratar não conformidades; promover a consciência sobre requisitos do cliente na organização.

### 4.3 Organization Capability (Capacidade Organizacional)

- **4.3.1 Recursos e Conhecimento** — determinar e alocar recursos necessários; determinar o conhecimento
  necessário para operar os processos e manter conformidade do produto (pode vir de experiência, estudo,
  treinamento, lições aprendidas, boas práticas).
- **4.3.2 Recursos Humanos:**
  - **Competência do pessoal** — procedimento documentado que trate: como as competências são identificadas;
    como educação/treinamento/experiência necessários são identificados; avaliação da eficácia das ações
    tomadas; critérios e métodos de avaliação/reavaliação; responsáveis por avaliar competência. Registros
    obrigatórios.
  - **Treinamento** — procedimento que trate: conteúdo e frequência exigidos; treinamento em QMS; treinamento
    do cargo (incluindo relevância das atividades para os objetivos da qualidade); treinamento exigido/
    fornecido pelo cliente; avaliação de eficácia; registros exigidos.
- **4.3.3 Ambiente de Trabalho** — determinar, prover, gerenciar e manter: instalações/espaço de trabalho e
  utilidades; equipamento de processo (hardware e software); serviços de apoio (transporte, comunicação,
  sistemas de informação); condições físicas/ambientais do trabalho.

### 4.4 Documentation Requirements (Requisitos de Documentação)

- **4.4.1 Geral** — a documentação do QMS deve incluir: escopo do QMS e justificativa de exclusões; política
  e objetivos da qualidade; requisitos legais/aplicáveis identificados; identificação dos processos que
  exigem validação; procedimentos/documentos/registros necessários ao planejamento, operação e controle dos
  processos. (Pode ser um único "manual da qualidade" ou vários documentos/formatos.)
- **4.4.2 Procedimentos** — todos os procedimentos exigidos pela norma devem ser documentados, implementados
  e mantidos atualizados. Um único procedimento pode cobrir vários requisitos, e vice-versa.
- **4.4.3 Controle de Documentos Internos** — procedimento para identificação, distribuição e controle de
  documentos internos (inclui revisões, traduções e atualizações), tratando: responsabilidades de aprovação/
  reaprovação; revisão de adequação antes do uso; revisões periódicas; identificação de mudanças e status de
  revisão atual; legibilidade e identificação; disponibilidade no local de uso. Documentos obsoletos devem ser
  retirados de circulação ou sinalizados para evitar uso indevido.
- **4.4.4 Controle e Uso de Documentos Externos** — procedimento para documentos de origem externa usados na
  realização do produto (normas API e outras), tratando: identificação/documentação; acesso e distribuição
  (versões relevantes); integração nos processos; identificação de mudanças (adendos, erratas, atualizações);
  avaliação de impacto; integração das mudanças aplicáveis.

### 4.5 Control of Records (Controle de Registros)

Registros — incluindo os originados de atividades terceirizadas — devem existir e ser controlados como
evidência de conformidade. Procedimento documentado deve tratar: identificação; coleta; legibilidade;
correção; armazenamento; proteção contra alteração/dano/perda não intencional; recuperação; **tempo de
retenção**; e destinação final.

> **Retenção mínima: 10 anos**, ou conforme exigência do cliente/legal — o que for mais longo.

---

## 2.4 Seção 5 — Product Realization (Realização do Produto)

### 5.1 Contract Review (Revisão de Contrato)

Procedimento documentado para revisão dos requisitos ligados ao fornecimento do produto, tratando:
- **Determinação de requisitos** — os especificados pelo cliente; requisitos legais/aplicáveis; requisitos
  não declarados pelo cliente mas considerados necessários pela organização. Se o cliente não fornece
  declaração documentada, a organização deve confirmar os requisitos com ele e registrar.
- **Revisão de requisitos** — conduzida **antes** do compromisso de entrega, confirmando que os requisitos
  estão identificados/documentados, que divergências foram resolvidas, e que a organização tem capacidade de
  atendê-los. Mudanças de requisito exigem atualização dos documentos relevantes e comunicação ao pessoal.
  Registros do resultado da revisão são obrigatórios.

### 5.2 Planning (Planejamento)

A organização deve identificar e planejar os processos e documentos necessários para a realização do produto,
endereçando: recursos e ambiente de trabalho (4.3); requisitos do produto e do cliente (5.1); requisitos
legais/aplicáveis; requisitos de design (5.4); planejamento de contingência (5.3.3); atividades de
verificação/validação/monitoramento/medição/inspeção/teste e critérios de aceitação; MOC (5.10); registros
que evidenciem conformidade (4.5). A saída do planejamento deve ser documentada e atualizada quando houver
mudanças.

### 5.3 Risk Management (Gestão de Risco)

- **5.3.1 Geral** — procedimento documentado para identificar e controlar riscos associados à **entrega** e à
  **qualidade** do produto, tratando: técnicas de identificação/avaliação de risco; ferramentas de avaliação;
  critérios de severidade (incluindo consequências potenciais de falha do produto); ações de mitigação;
  avaliação do risco remanescente; planejamento de contingência (quando exigido pela avaliação do risco
  remanescente).
- **5.3.2 Avaliação de Risco:**
  - **Entrega do produto** — deve incluir disponibilidade de instalações/equipamentos (inclusive manutenção)
    e desempenho de entrega/disponibilidade de material dos fornecedores.
  - **Qualidade do produto** — deve incluir entrega de produto não conforme (5.9) e disponibilidade de
    pessoal competente.
  - **Mudanças que impactam a qualidade** — exigem nova avaliação de risco quando envolvem: mudança na
    estrutura organizacional; mudança de pessoal-chave; mudança na cadeia de suprimento de produtos/
    componentes/atividades críticas; mudança no escopo/procedimentos do sistema de gestão; mudança na
    capacidade da organização de executar os processos de realização do produto.
- **5.3.3 Planejamento de Contingência** — quando exigido pelo risco avaliado, o plano deve incluir no
  mínimo: ações para reduzir efeitos de incidentes disruptivos; identificação/atribuição de responsabilidades
  e autoridades; controles de comunicação interna/externa (4.1.5).
- **5.3.4 Registros** — de avaliação e gestão de risco, incluindo ações tomadas.

### 5.4 Design

*(Aplicável apenas quando a organização é responsável pelo design do produto — pode ser excluído do escopo
com justificativa, ver 4.1.4.2.)*

- **5.4.1 Geral** — aplica-se quando a organização é responsável pelo design.
- **5.4.2 Planejamento do Design** — procedimento documentado tratando: plano(s) de design e suas
  atualizações; etapas do design; recursos/responsabilidades/autoridades e suas interfaces; atividades de
  revisão/verificação/validação necessárias em cada etapa; requisitos para revisão final (5.4.6); requisitos
  de revisão/aprovação de mudanças de design (5.4.8). Quando o design é terceirizado ou feito em local
  diferente, o procedimento deve identificar os controles — a organização **permanece responsável** pelo
  design mesmo terceirizando.
- **5.4.3 Entradas de Design (Design Inputs)** — devem ser identificadas e revisadas quanto a adequação,
  completude, falta de ambiguidade e de conflito. Incluem: requisitos especificados pelo cliente; requisitos
  de fontes externas (inclusive especificações API); condições ambientais/operacionais; metodologia,
  premissas e fórmulas; desempenho histórico de designs similares; requisitos legais; consequências de
  potencial falha do produto (quando exigido por lei, norma, cliente, ou considerado necessário). Registros
  obrigatórios.
- **5.4.4 Saídas de Design (Design Outputs)** — documentadas para permitir verificação contra as entradas.
  Devem: atender às entradas; fornecer informação para compras/produção/inspeção/teste/serviço; identificar
  ou referenciar o **DAC**; identificar produtos/componentes/atividades críticos ao design; incluir resultados
  de cálculos aplicáveis; especificar as características essenciais para a finalidade e funcionamento seguro
  do produto. Registros obrigatórios.
- **5.4.5 Revisão de Design** — em etapas adequadas, para avaliar adequação/efetividade dos resultados e
  identificar problemas, com participação de representantes das funções envolvidas. Registros obrigatórios.
- **5.4.6 Verificação de Design e Revisão Final** — para garantir que as saídas atendem às entradas.
  Registros obrigatórios.
- **5.4.7 Validação e Aprovação de Design** — validação conforme o procedimento, para garantir que o produto
  resultante é capaz de satisfazer os requisitos especificados; completada antes da entrega, quando possível.
  O design completo deve ser **aprovado por pessoa competente diferente** de quem o desenvolveu. Registros
  obrigatórios.
- **5.4.8 Mudanças de Design** — identificadas, revisadas/verificadas/validadas conforme apropriado, e
  aprovadas antes da implementação. A revisão deve avaliar o efeito da mudança no produto e em produto já
  entregue, e se a mudança exige notificação ao cliente (quando afeta negativamente a capacidade de
  desempenho especificada). Registros obrigatórios.

### 5.5 Purchasing (Compras)

- **5.5.1 Controle de Compras:**
  - **Procedimento** — deve tratar: determinação de produtos/componentes/atividades críticos; avaliação e
    seleção inicial de fornecedores; uso do risco identificado para definir o método de avaliação inicial em
    compras críticas; tipo/extensão do controle sobre a cadeia de suprimento; critérios/escopo/frequência de
    reavaliação; identificação de fornecedores aprovados; fornecedores especificados pelo cliente ou limitados
    por requisito proprietário/legal.
  - **Avaliação inicial — compras críticas** — deve ser específica por local do fornecedor e incluir:
    verificação da implementação/conformidade do QMS do fornecedor; verificação do tipo/extensão de controle
    aplicado pelo fornecedor (internamente e à própria cadeia dele); avaliação da capacidade do fornecedor por
    um ou mais destes métodos, com base no risco identificado: **avaliação in loco**; **avaliação remota**
    (verificação por áudio/vídeo em tempo real); **inspeção/teste/verificação** de características do produto
    recebido. Fornecedores críticos de **alto risco** sem avaliação in loco exigem avaliação remota **e**
    inspeção/teste/verificação.
  - **Compras críticas especificadas pelo cliente ou limitadas por proprietário/legal** — avaliação inicial
    reduzida: verificação do QMS conforme requisitos da organização e/ou do cliente; identificação de como o
    produto/componente/atividade fornecida atende aos requisitos especificados. Escopo de aprovação limitado
    ao contrato do cliente relevante quando a avaliação completa não foi feita.
  - **Compras não críticas** — critérios de avaliação seguem os mesmos da compra crítica, ou: verificação de
    conformidade do QMS do fornecedor; avaliação do atendimento aos requisitos de compra; avaliação do
    produto/componente na entrega ou da atividade na conclusão.
  - **Reavaliação de fornecedores** — frequência definida com base em risco (5.3) e desempenho de qualidade;
    segue os mesmos critérios da avaliação inicial (crítica, cliente-especificada, ou não crítica, conforme o
    caso).
  - **Registros** — resultados de avaliações (com evidência objetiva) e ações resultantes; identificação de
    fornecedores aprovados, especificados pelo cliente, e limitados por proprietário/legal.
  - **Terceirização (Outsourcing)** — ao terceirizar um processo/atividade do QMS, a organização deve
    verificar que o fornecedor satisfaz os requisitos aplicáveis do próprio QMS da organização. Ao
    terceirizar um processo/atividade de realização do produto, a organização **mantém a responsabilidade**
    pela conformidade do produto, incluindo especificações API/externas aplicáveis. Registros obrigatórios.
- **5.5.2 Informação de Compra** — a organização deve garantir a adequação da informação antes de comunicá-la
  ao fornecedor, descrevendo o produto/componente/atividade, incluindo conforme aplicável: critérios de
  aceitação; requisitos de aprovação de procedimentos/processos/equipamentos do fornecedor; versão aplicável
  de especificações/desenhos/requisitos de processo/instruções de inspeção/rastreabilidade; requisitos de
  qualificação de pessoal do fornecedor; requisitos do QMS; requisitos de aprovação de liberação do produto;
  requisitos de verificação nas instalações do fornecedor (se a organização ou o cliente forem verificar lá).
- **5.5.3 Verificação de Produtos/Componentes/Atividades Comprados:**
  - **Compras críticas** — procedimento deve tratar: revisão da documentação exigida do fornecedor;
    verificação de que as versões aplicáveis foram usadas (specs, desenhos, requisitos de processo,
    rastreabilidade); requisitos/métodos/frequência/responsável pela inspeção/teste/verificação, definidos
    com base no risco (5.3) e desempenho do fornecedor.
  - **Compras não críticas** — verificadas conforme procedimento documentado da organização.
  - **Registros** — de atividades de verificação e evidência de conformidade.

### 5.6 Control of Product Realization (Controle da Realização do Produto)

- **5.6.1 Geral** — procedimento tratando: determinação e implementação do **MAC**; identificação/
  documentação de processos críticos à realização; implementação do plano de qualidade (quando aplicável);
  conformidade a requisitos de design e mudanças relacionadas; disponibilidade e uso de equipamento de
  realização e TMMDE; uso de instruções de trabalho aplicáveis; documentos de controle de processo (5.6.3);
  manutenção de identificação/rastreabilidade (5.6.5); implementação de monitoramento/medição; implementação
  da liberação do produto (5.7), incluindo entrega e pós-entrega; revisão e controle de mudanças na
  realização, aprovações e registros.
- **5.6.2 Plano de Qualidade** — quando exigido por contrato, deve especificar os processos do QMS
  (incluindo realização do produto) e os recursos aplicados. No mínimo: descrição do produto/escopo do plano;
  processos/documentação exigidos (inspeções, testes, registros); identificação de atividades terceirizadas;
  identificação de cada procedimento/especificação/documento referenciado; pontos de retenção
  (hold)/testemunho (witness)/monitoramento/revisão documental exigidos. Deve ser documentado, aprovado e
  comunicado ao cliente (com revisões). *(Outros nomes usados na prática: PQP, ITP, MPS, PCP, QAP.)*
- **5.6.3 Documentos de Controle de Processo** — devem incluir ou referenciar: requisitos de verificação de
  conformidade com planos de qualidade, especificações API, requisitos do cliente e outras normas/códigos
  aplicáveis; instruções e critérios de aceitação para processos/testes/inspeções; pontos de retenção/
  testemunho/monitoramento/revisão do cliente, quando aplicável.
- **5.6.4 Validação de Processos** — exigida quando a saída de um processo **não pode ser verificada** por
  monitoramento/medição subsequente (deficiências só aparecem depois de entregue/em uso). Se a especificação
  do produto identifica quais processos exigem validação, só esses exigem. Se não houver especificação
  aplicável (ou ela não identificar), a validação mínima aplicável cobre: **NDE/NDT** (ensaio não destrutivo),
  **soldagem**, **tratamento térmico**, e **coating/plating** (quando identificado como crítico). Procedimento
  documentado deve tratar: equipamento exigido; qualificação de pessoal; métodos e parâmetros operacionais;
  critérios de aceitação do processo; registros; revalidação. Se terceirizado, a organização deve manter
  evidência de que os requisitos foram atendidos.
- **5.6.5 Identificação e Rastreabilidade** — estabelecidas e mantidas durante toda a realização (inclusive
  entrega e pós-entrega); requisitos de rastreabilidade definidos pela organização, cliente e/ou especificação
  do produto; procedimento documentado tratando: métodos de identificação; informação necessária para
  rastreabilidade; requisitos de manutenção/reaplicação da identificação; ações para tratar perda de
  identificação/rastreabilidade. Registros obrigatórios. *(Aplica-se também a componentes e matéria-prima.)*
- **5.6.6 Status de Inspeção/Teste** — procedimento para identificar o status de inspeção/teste ao longo da
  realização, indicando conformidade ou não conformidade do produto.
- **5.6.7 Propriedade de Terceiros (Externally Owned Property)** — procedimento para controle de propriedade
  externa (inclusive do cliente) incorporada ao produto, incluindo propriedade intelectual e dados não
  públicos, tratando: identificação; verificação; salvaguarda; preservação; manutenção; e comunicação ao
  proprietário externo em caso de perda/dano/inadequação. Registros obrigatórios.
- **5.6.8 Preservação do Produto** — procedimento descrevendo métodos de preservação do produto e componentes
  durante realização e entrega: identificação/marcação de rastreabilidade; armazenamento (áreas/estoques
  designados); avaliação periódica de condição; transporte; manuseio; embalagem; proteção. Registros dos
  resultados das avaliações.
- **5.6.9 Inspeção, Teste e Verificação:**
  - **Em processo** — inspeção/teste/verificação em etapas planejadas, conforme plano de qualidade, documentos
    de controle de processo e/ou procedimentos. Evidência de conformidade com os critérios de aceitação deve
    ser mantida.
  - **Final** — determina e documenta a conformidade do produto acabado aos requisitos especificados. Salvo
    quando feita por sistema automatizado, a **inspeção de aceitação final** deve ser feita por pessoal
    **diferente** de quem executou ou supervisionou diretamente a realização.
  - **Registros** — de toda inspeção/teste/verificação/aceitação final exigida.
- **5.6.10 Manutenção Preventiva** — procedimento para manutenção preventiva de equipamento usado na
  realização do produto, tratando: tipo de equipamento coberto; frequência; pessoal responsável. Registros
  obrigatórios. *(Pode basear-se em risco, histórico de uso, recomendações do fabricante, normas/códigos.)*

### 5.7 Product Release (Liberação do Produto)

Procedimento para liberação do produto ao cliente. A liberação **não deve prosseguir** até que os arranjos
planejados (Seção 5.6) tenham sido concluídos satisfatoriamente. A organização só deve liberar produto que
**esteja conforme** os requisitos ou que **esteja autorizado sob concessão** (5.9.3). Registros devem permitir
identificar quem liberou o produto.

### 5.8 Testing, Measuring, Monitoring, and Detection Equipment (TMMDE)

- **5.8.1 Geral** — a organização determina os requisitos de teste/medição/monitoramento/detecção e o TMMDE
  necessário para evidenciar conformidade. TMMDE próprio, de funcionário, ou de outras fontes (terceiro,
  proprietário, cliente) usado para evidenciar conformidade ou monitorar parâmetros que afetam conformidade
  deve ser **controlado**. Deve ser calibrado em intervalos especificados; se o intervalo é baseado na data de
  primeiro uso, essa data deve ser documentada.
- **5.8.2 Procedimento** — procedimento documentado tratando: identificação única; status de calibração;
  rastreabilidade a padrões internacionais/nacionais (ou base registrada, se não existirem); método de
  calibração e critérios de aceitação; frequência e início do intervalo de calibração; documentação das
  medições antes e depois de ajustes ("as-found"/"as-left"); ações para prevenir uso não intencional de TMMDE
  fora de calibração; quando fora de calibração — avaliação da validade de medições anteriores e ações sobre
  o TMMDE e o produto (incluindo notificação ao cliente se produto suspeito foi enviado); uso de TMMDE de
  terceiro/proprietário/funcionário/cliente; manutenção; adequação às atividades planejadas.
- **5.8.3 Equipamento** — o TMMDE deve: ser calibrado; ter status de calibração identificável antes/durante o
  uso; ser protegido contra ajustes que invalidem o resultado/status; ser protegido contra dano/deterioração;
  ser usado em condições ambientais adequadas. Software usado em teste/monitoramento/medição/detecção deve
  ter sua capacidade confirmada antes do uso inicial e reconfirmada quando necessário.
- **5.8.4 TMMDE de Outras Fontes** — quando terceiro/proprietário/cliente, a organização deve confirmar que
  está calibrado antes do uso; se limitado por cliente/contrato/licenciamento, alguns subitens do 5.8.2 não
  se aplicam.
- **5.8.5 Registros** — registro de todo o TMMDE identificado, com identificação única; resultados de
  calibração; e, quando a calibração de TMMDE de terceiro é limitada por cliente/contrato/licença, registro
  dessa limitação.

### 5.9 Control of Nonconforming Product (Controle de Produto Não Conforme)

- **5.9.1 Procedimento:**
  - **Durante a realização** — deve tratar: identificação/controle do produto para prevenir uso ou entrega não
    intencional; tratamento da não conformidade detectada (5.9.2); ação para impedir seu uso/entrega
    pretendidos originalmente; autorização de uso/liberação/aceitação sob concessão pela autoridade
    responsável e, quando exigido, pelo cliente (5.9.3).
  - **Após a entrega** — deve tratar: identificação/documentação/relato do produto não conforme; análise da
    não conformidade (quando o produto ou evidência documentada está disponível, para apoiar a determinação
    da causa); ação apropriada aos efeitos (ou efeitos potenciais); autorização sob concessão pela autoridade
    responsável e, quando exigido, pelo cliente.
- **5.9.2 Produto Não Conforme** — a organização deve tratá-lo por um ou mais destes: **reparo/retrabalho**
  com inspeção subsequente; **reclassificação (re-grade)** para aplicação alternativa; **liberação sob
  concessão** (5.9.3); e/ou **rejeição/sucateamento**.
- **5.9.3 Liberação de Produto Não Conforme Sob Concessão** — permitida quando a autoridade responsável avaliou
  e autorizou, desde que: (a) o produto continue satisfazendo o DAC aplicável e critérios do cliente; ou
  (b) o MAC violado é determinado como desnecessário para satisfazer o DAC e/ou critérios do cliente; ou
  (c) o DAC é alterado (5.4.8) e os produtos afetados satisfazem o DAC/MAC revisados — se o DAC foi
  previamente acordado com o cliente, a mudança **exige autorização do cliente**. A organização **não deve**
  liberar produto fora do DAC ou requisitos contratuais sem autorização do cliente.
- **5.9.4 Notificação ao Cliente de Produto Não Conforme** — obrigatória quando o produto entregue não
  atende ao DAC ou aos requisitos contratuais. Registros da notificação obrigatórios.
- **5.9.5 Registros** — de não conformidades, incluindo: descrição; ações subsequentes (inclusive concessões
  obtidas); justificativa para a liberação sob concessão; autoridade responsável.

### 5.10 Management of Change — MOC (Gestão de Mudanças)

- **5.10.1 Geral** — procedimento documentado para manter a integridade do QMS quando ocorrem mudanças,
  tratando: descrição da mudança e sua necessidade; disponibilidade/alocação de recursos (inclusive pessoal);
  riscos potenciais (5.3); revisão/aprovação/implementação; notificações (5.10.3); verificação da conclusão
  das atividades de MOC e seu impacto no QMS.
- **5.10.2 Aplicação do MOC** — usado para mudanças que **podem impactar negativamente** a qualidade do
  produto (ver gatilhos em 5.3.2.3: estrutura organizacional, pessoal-chave, cadeia de suprimento crítica,
  escopo/procedimentos do sistema de gestão, capacidade da organização).
- **5.10.3 Notificação do MOC** — pessoal interno relevante deve ser notificado da mudança e do risco
  associado; quando exigido por contrato, o cliente também deve ser notificado. Notificações documentadas.
- **5.10.4 Registros** — das atividades de MOC.

---

## 2.5 Seção 6 — Monitoramento, Medição, Análise e Melhoria do QMS

### 6.1 Geral

A organização deve planejar e implementar os processos de monitoramento, medição, análise e melhoria
necessários para assegurar conformidade do QMS à Q1 e melhorar continuamente sua efetividade, determinando os
métodos aplicáveis (inclusive técnicas de análise de dados) e sua extensão de uso.

### 6.2 Monitoring, Measuring, and Improving

- **6.2.1 Satisfação do Cliente** — procedimento documentado tratando frequência/métodos de determinação e
  KPIs de satisfação do cliente. Registros obrigatórios.
- **6.2.2 Auditoria Interna:**
  - **Geral** — auditorias internas para informar se o QMS está implementado, mantido e conforme à Q1 e aos
    próprios requisitos da organização. Procedimento documentado define responsabilidades de
    planejamento/condução/documentação. Critérios/escopo/frequência/métodos devem considerar resultados de
    auditorias anteriores (internas e externas) e a criticidade do processo auditado. **Todos os processos do
    QMS devem ser auditados pelo menos a cada 12 meses** (não além do mesmo mês-calendário do ano anterior) —
    não precisa ser uma auditoria única consolidada, mas se dividida, o intervalo entre partes não pode passar
    de 12 meses. Processos identificados como críticos à realização exigem observação da atividade sendo
    executada.
  - **Execução** — realizada por pessoal competente e **independente** de quem executou/supervisionou
    diretamente a atividade auditada, para garantir objetividade e imparcialidade. Registros devem evidenciar
    que o QMS está implementado e mantido.
  - **Revisão e Encerramento** — a organização define prazos de resposta para tratar não conformidades
    detectadas; o responsável pela área auditada garante que correções e ações corretivas sigam 6.4.2.
    Registros das auditorias obrigatórios.
- **6.3 Análise de Dados** — procedimento documentado para identificação, coleta e análise de dados,
  demonstrando adequação e efetividade do QMS. A análise deve incluir dados de monitoramento/medição,
  auditorias internas, auditorias externas, revisões da direção e outras fontes relevantes. A saída da análise
  deve fornecer informação (incluindo tendências) sobre: satisfação do cliente; não conformidade a requisitos
  durante a realização; não conformidades e falhas de produto identificadas após entrega/uso (quando produto
  ou evidência disponível); desempenho de processo; desempenho de fornecedores; cumprimento dos objetivos da
  qualidade. A organização deve usar esses dados para avaliar onde é possível melhorar continuamente o QMS.

### 6.4 Improvement (Melhoria)

- **6.4.1 Geral** — melhoria contínua da efetividade do QMS por meio de objetivos da qualidade, auditoria
  interna, análise de dados, ação corretiva e revisão da direção.
- **6.4.2 Ação Corretiva** — procedimento documentado para tratar não conformidades (inclusive as resultantes
  de reclamações de clientes) e tomar ações corretivas internamente e com fornecedores, proporcionais ao(s)
  efeito(s) da não conformidade. Deve tratar: critérios para iniciar o processo; revisão da não conformidade;
  determinação/implementação de correções; identificação da causa raiz; implementação de ação corretiva para
  reduzir a probabilidade de recorrência; prazo e responsável; verificação da eficácia; critérios para
  atualizar riscos/oportunidades identificados no planejamento (4.1.4); uso do MOC (5.10) quando a ação
  corretiva exige novos controles; avaliação de não conformidades potenciais similares. Registros obrigatórios,
  identificando as atividades de verificação da eficácia.

### 6.5 Management Review (Revisão pela Direção)

- **6.5.1 Geral** — o QMS deve ser revisado **pelo menos a cada 12 meses** (não além do mesmo mês-calendário
  do ano anterior) pelo pessoal de gestão, avaliando continuidade de adequação/suficiência/efetividade,
  incluindo oportunidades de melhoria, adequação de recursos, e necessidade de mudanças (inclusive política e
  objetivos da qualidade).
- **6.5.2 Entradas (mínimo)** — status/eficácia de ações de revisões anteriores; resultados de auditorias
  internas e externas; mudanças que possam afetar o QMS (requisitos legais, normas do setor, questões
  internas/externas); análise de satisfação do cliente; feedback relevante de clientes/partes interessadas;
  desempenho de processo; resultados de avaliação de risco e eficácia das ações; status de ações corretivas;
  análise de desempenho de fornecedores; análise de conformidade de produto (inclusive não conformidades pós-
  entrega); desempenho real vs. objetivos da qualidade; recomendações de melhoria.
- **6.5.3 Saídas** — avaliação-resumo da efetividade do QMS; mudanças exigidas nos processos; decisões e
  ações; recursos necessários; melhorias a produtos para atender requisitos do cliente. A alta direção deve
  revisar e aprovar a saída. Revisões documentadas e registradas.

---

## 2.6 Anexo A (informativo) — Programa de Monograma API

O **Monograma API** é uma marca de certificação registrada, licenciada pela API a fabricantes cujos produtos
atendam às especificações de produto aplicáveis e sejam fabricados sob um QMS conforme a Q1. Pontos-chave:

- Licenças exigem **auditoria in loco** prévia confirmando implementação e manutenção contínua do QMS Q1 e
  conformidade do produto à(s) especificação(ões) API aplicável(is).
- **Produto monogramável**: recém-fabricado por um licenciado, sob QMS Q1 totalmente implementado, atendendo
  a todos os requisitos da(s) especificação(ões)/norma(s) aplicável(is). Produto colocado em serviço/uso **não**
  é "recém-fabricado".
- O Monograma e o número de licença são **específicos do local (site)** licenciado — só podem ser aplicados
  lá, e sua aplicação constitui garantia de conformidade.
- **Capacidade de manufatura**: instalações limitadas a inspeção/teste final, compra/venda/distribuição de
  produto acabado, atividades de design isoladas, desmontagem/remontagem, ou reparo/remanufatura de produto
  usado/desgastado **não atendem** aos requisitos de capacidade de manufatura e não podem ser licenciadas com
  base só nisso.
- **Reaplicação do Monograma**: só é permitida sob cenários e aprovação específicos da API (ex.: manutenção/
  reparo/remanufatura que reinstale a placa de identificação original sem modificá-la).
- **Marcação**: deve referenciar a especificação/norma API aplicável (ex. "API 6A"), usar as unidades
  especificadas (padrão USC, salvo indicação contrária), e incluir Monograma + número de licença na plaqueta
  de identificação, quando aplicável.
- **Relato de não conformidade**: a API pede que clientes relatem produtos monogramados não conformes ou
  falhas de campo pelo sistema API Nonconformance Reporting.

*(Este anexo é informativo — relevante para fabricantes licenciados. Não confundir exigência de Monograma com
exigência geral de conformidade à Q1: qualquer organização pode alegar conformidade à Q1 sem ser licenciada
para aplicar o Monograma.)*

---

## 2.7 Seções Críticas para Segurança Técnica

### Design Acceptance Criteria (DAC) vs. Manufacturing Acceptance Criteria (MAC)

- **DAC** (3.1.7 / 5.4.4): requisitos aplicados a características (ou combinações) de materiais, produtos ou
  componentes para atingir conformidade aos **requisitos de design** e/ou desempenho de design exigido.
- **MAC** (3.1.13 / 5.6.1): requisitos aplicados a características (ou combinações) para atingir conformidade
  ao **DAC aplicável** e a outros requisitos de manufatura do produto.

### Regra de Ouro

> A norma admite explicitamente que "DAC pode ser igual a MAC" — mas isso é uma possibilidade, não uma regra
> geral. **Nunca assuma equivalência automaticamente.** Verifique sempre a especificação do cliente e do
> produto antes de tratar os dois como idênticos.

### Retenção de registros — atenção à mudança de edição

A 10ª edição ampliou a retenção mínima de registros para **10 anos**. Se o usuário perguntar sobre uma
organização certificada sob edição anterior (9ª ou mais antiga), avise que o prazo pode ter sido menor
naquela época — o prazo vigente hoje é 10 anos (ou o exigido por cliente/lei, se maior).

---

# 3. NORMAS DE ROSCAS E TUBOS

## 3.1 API 5B — Threading, Gauging, and Inspection

### Escopo
Define perfis de rosca, tolerâncias, calibração e inspeção para **casing, tubing, line pipe**.

### Tipos de Rosca Abordados

**Casing:**
- **LTC** (Long Threaded and Coupled): rosca longa + acoplamento separado
- **STC** (Short Threaded and Coupled): rosca curta + acoplamento separado
- **BTC** (Buttress Thread and Coupled): rosca buttress (ombro interno) — alta capacidade axial

**Tubing:**
- **EUE** (External Upset End): extremidade com ressalto externo (upset)
- **NUE** (Non-Upset End): extremidade sem ressalto, rosca no corpo do tubo

**Line pipe:**
- Roscas compatíveis com série API line pipe (geralmente retas, não cônicas)

### Conceitos Críticos

**Geometria da rosca:**
- **Passo (pitch):** distância axial entre um filete e o adjacente
- **TPI (Threads per inch):** número de filetes por polegada (inverso do passo)
- **Conicidade (taper):** variação de diâmetro ao longo do comprimento (ex: 1 em 16)
- **Ângulo do filete:** entre os flancos da rosca (triangular, buttress, etc.)
- **Altura do filete:** distância radial entre crista e raiz
- **Diâmetro de passo:** referência para interferência e ajuste

**Inspeção:**
- Verificação com calibres **go / no-go**
- Critérios de aceitação: desgaste, danos, refileteamento
- Diâmetro, passo, conicidade dentro de tolerância

---

## 3.2 API 5CT — Casing and Tubing

### Escopo
Define **graus de aço, propriedades mecânicas, dimensões, tipos de extremidade** para casing e tubing.

### Graus Típicos de Casing

| Grau | Resistência de Escoamento (min) | Resistência Máxima (min-max) | Aplicação Típica |
|------|-------|-------|---|
| H40  | 40 ksi | 60–80 ksi | Baixa profundidade, poços rascos |
| J55  | 55 ksi | 75–95 ksi | Uso geral, profundidades moderadas |
| K55  | 55 ksi | 75–95 ksi | Similar J55, diferentes requisitos |
| N80  | 80 ksi | 110–130 ksi | Profundidades intermediárias |
| L80  | 80 ksi | 110–130 ksi | Similar N80, diferentes propriedades |
| C90  | 90 ksi | 120–150 ksi | Profundidades maiores, alta pressão |
| T95  | 95 ksi | 125–155 ksi | Muito profundo, alta pressão |
| P110 | 110 ksi | 140–170 ksi | Poços muito profundos, alta pressão |
| Q125 | 125 ksi | 150–180 ksi | Ultra-profundo, extrema pressão |

### Relação API 5B ↔ API 5CT

- **API 5CT** especifica tipos de extremidade (LTC, STC, BTC, EUE, NUE)
- Remete à **API 5B** para geometria e inspeção de roscas
- Para **grau, classe, resistência, colapso, burst → API 5CT**
- Para **perfil de rosca, diâmetro de passo, tolerâncias de geometria → API 5B**

---

## 3.3 API 5L — Line Pipe

### Escopo
Define tubos para **transporte de petróleo, gás e fluidos** em dutos.

### Graus Típicos de Line Pipe

| Grau | Resistência de Escoamento (min) | Aplicação |
|------|-------|---|
| A | 30 ksi | Baixa pressão, aplicações antigas |
| B | 35 ksi | Uso geral, pressões moderadas |
| X42 | 42 ksi | 42 ksi yield, especificação moderna |
| X52 | 52 ksi | Intermediária, resistência incrementada |
| X56 | 56 ksi | Mais resistente que X52 |
| X60 | 60 ksi | Alta resistência, maior throughput |
| X65 | 65 ksi | Dutos de alta pressão |
| X70 | 70 ksi | Muito alta pressão, throughput máximo |
| X80 | 80 ksi | Ultra-alta pressão (raro, especial) |

### Relação com Roscas

- Line pipe pode ser **soldado** (mais comum) ou com **conexões roscadas**
- Se roscado, remete à **API 5B**
- A própria API 5L trata principalmente do **tubo** (não da rosca)

---

## 3.4 API 7-1 — Rotary Drill Stem Elements

### Escopo
Define **propriedades mecânicas, dimensões e tolerâncias** para drill pipe, drill collars, HWDP, kelly, etc.

### Componentes

| Componente | Diâmetro Típico | Uso | Observação |
|---|---|---|---|
| **Drill Pipe** | 2.375" – 5.5" | Transmissão de torque e carga | Rosca conexão ombro (API 7-2) |
| **Drill Collar** | 1.5" – 9.5" | Peso para peso na broca, rigidez | Rosca conexão ombro (API 7-2) |
| **HWDP** (Heavy Weight DP) | 3.5" – 5" | Transição entre pipe e collar | Rosca conexão ombro (API 7-2) |

### Conexão com API 7-2

- **API 7-1:** produto (pipe, collar, propriedades mecânicas, dimensões)
- **API 7-2:** roscas e calibração das conexões com ombro

---

## 3.5 API 7-2 — Threading and Gauging of Rotary Shouldered Connections

### Escopo
Define **geometria, tolerâncias, rosqueamento e calibração** de conexões com ombro para perfuração.

### Tipos de Conexão com Ombro

| Tipo | Sigla | Descrição | Aplicação |
|---|---|---|---|
| **Numeric Connection** | NC26, NC31, NC38, NC50, etc. | Designação numérica, geometria padronizada | Drill pipe, drill collar, HWDP moderno |
| **Regular** | REG | Estilo tradicional, compatibilidade histórica | Componentes mais antigos ou específicos |
| **Internal Flush** | IF | Diâmetro interno mantido, reduces restrição | Aplicações de fluxo crítico |
| **Full Hole** | FH | Passagem interna ampla, máximo fluxo | Poços com MWD, ferramentas de downhole |

### Parâmetros de Conexão com Ombro

- **TPI (Threads per inch):** número de filetes em 1 polegada
- **Taper:** conicidade da rosca (ex: 1 em 16)
- **Diâmetros de pino e caixa:** críticos para interferência
- **Comprimento de engate:** profundidade da rosca na caixa
- **Ombro de contato:** superfície plana que transmite torque e carga
- **Stand-off:** espaço entre ombros quando a conexão está travada

### Compatibilidade

**REGRA CRÍTICA:**
> Compatibilidade entre conexões (ex: NC38 vs 3 1/2 REG) depende de perfil, passo, conicidade, diâmetros, comprimento de engate e requisitos do fabricante. Nunca confirme compatibilidade apenas pelo nome ou diâmetro nominal.

---

## 3.6 API 7G-2 — Inspection Procedures for Drill Stem Elements in Service

### Escopo
Define **critérios de inspeção para componentes de perfuração usados** (em serviço, retirados do poço).

### Distinção Crítica

- **API 7-1 e 7-2:** requisitos para **produtos NOVOS** fabricados
- **API 7G-2:** critérios de inspeção e aceitação para **componentes USADOS** (já passaram por poços)

### Critérios de Inspeção (Exemplos)

- Desgaste de rosca (medição de passo, diâmetros)
- Danos mecânicos (trincas, deformações, galling)
- Corrosão (pitting, sulfide stress cracking)
- Wear de ombro (redução de diâmetro, erosão)

---

## 3.7 API 11B — Sucker Rods and Rod-Related Products

### Escopo
Define **hastes de bombeio mecânico, acoplamentos e componentes associados**.

### Classificação de Hastes

Hastes são classificadas por:
- **Diâmetro nominal:** 5/8", 3/4", 7/8", 1", 1 1/8", 1 1/4", etc.
- **Comprimento:** disponíveis em múltiplas bitolas
- **Classe/Grau:** define capacidade de carga (C, D, A, B, C, D classes)
- **Propriedades mecânicas:** resistência à fadiga crítica para aplicações cíclicas

### Acoplamentos e Roscas

- Hastes são conectadas por **acoplamentos roscados** (torcidos ou filetados)
- Roscas de haste de bombeio seguem padrões API específicos (diferentes de API 5B e 7-2)
- Torque de aperto é crítico para transferência de carga e fadiga

---

# 4. GLOSSÁRIO TÉCNICO INTEGRADO

## Termos de Roscas (Alphabetical)

**Ângulo do filete:** Ângulo total entre os flancos inclinados de uma rosca (ex: 60° para perfil triangular).

**Calibre (Gauge):** Instrumento para verificar conformidade dimensional de roscas. Tipos: anel (para pinos), tampão (para caixas), go/no-go.

**Caixa (Box):** Parte interna fêmea da conexão roscada; recebe o pino.

**Crista/Topo da rosca (Crest):** Ponto mais externo do filete; define diâmetro externo em pinos.

**Conicidade (Taper):** Variação de diâmetro ao longo do comprimento da rosca. Expresso como "1 em X" (ex: 1 em 16 = -1/16" por polegada de comprimento).

**Diâmetro de passo (Pitch diameter):** Diâmetro teórico onde largura do filete = espaço entre filetes; referência para medição com calibre.

**Diâmetro externo (OD):** Maior diâmetro da peça; em roscas de pino, medido nos topos dos filetes.

**Diâmetro interno (ID):** Menor diâmetro da peça; em caixas, medido nos topos internos dos filetes.

**Desmontagem (Break-out):** Aplicação de torque para desmontar conexão roscada.

**Engagement length (Comprimento de engate):** Profundidade de contato entre filetes do pino e caixa; responsável pela transmissão de carga.

**Filete (Thread flank):** Superfície inclinada que forma o "dente" da rosca entre crista e raiz.

**Galling (Gripagem):** Dano superficial por atrito, pressão de contato, lubrificação inadequada; causa transferência de material entre filetes.

**Interferência de rosca:** Ajuste controlado entre filetes do pino e caixa; contribui ao comportamento mecânico e vedação.

**Make-up torque (Torque de aperto):** Torque aplicado durante montagem de conexão; em conexões com ombro, estabelece contato metálico e transmissão de carga.

**Ombro (Shoulder):** Superfície plana presente em pino e caixa de conexões com ombro; contato metálico que transmite torque e carga.

**Passo (Pitch):** Distância axial entre um ponto em um filete e o ponto correspondente no filete adjacente.

**Pino (Pin):** Parte externa macho da conexão roscada; enrosca dentro da caixa.

**Raiz da rosca (Root):** Região mais interna entre dois filetes adjacentes; o "vale" da forma da rosca.

**Relief section (Seção de alívio):** Trecho usinado após rosca com diâmetro reduzido; diminui concentração de tensão.

**Roscas por polegada (TPI):** Número de filetes completos em 1 polegada de comprimento axial; inverso do passo.

**Rosca (Thread):** Superfície helicoidal usinada em extremidade de componente cilíndrico; permite união por torque.

**Stand-off:** Espaço entre ombros quando conexão com ombro está totalmente montada; indica transmissão de carga correta.

**Altura do filete (Thread height):** Distância radial entre crista e raiz; influencia capacidade de carga.

---

## Termos de Conexões (Casing/Tubing)

**BTC** (Buttress Thread and Coupled): Rosca buttress (padrão assimétrico) + acoplamento separado; excelente para transmissão axial.

**EUE** (External Upset End): Extremidade com ressalto externo (upset); rosca usinada em seção engrossada; área resistente aumentada.

**LTC** (Long Threaded and Coupled): Rosca longa + acoplamento separado; comprimento de engate maior.

**NUE** (Non-Upset End): Extremidade sem ressalto; rosca usinada diretamente no corpo do tubo.

**STC** (Short Threaded and Coupled): Rosca curta + acoplamento separado; mais compacta que LTC.

---

## Termos de Conexões com Ombro (Perfuração)

**Conexão com ombro (Shouldered connection):** Roscada com superfície de ombro de contato além da rosca; torque e carga transmitidos pelo ombro + rosca.

**FH** (Full Hole): Conexão com diâmetro interno amplo; máximo fluxo de fluido de perfuração.

**IF** (Internal Flush): Diâmetro interno mantido próximo ao componente; reduz restrição ao fluxo.

**NC** (Numeric Connection): Série designada por números (NC26, NC31, NC38, NC50, etc.); cada número = geometria específica padronizada.

**REG** (Regular): Estilo tradicional de conexão com ombro; compatibilidade histórica com algumas conexões NC (dependente do diâmetro e série).

---

## Termos de Medição e Inspeção

**Calibre go / no-go:** Sistema de calibração com dois limites:
- **Go:** deve atingir posição de referência.
- **No-go:** não deve ultrapassar limite máximo.
- Interpretação depende do tipo de conexão, calibre e procedimento.

**Inspeção de roscas:** Conjunto de procedimentos para avaliar conformidade. Inclui: visual, dimensional, calibração, avaliação de danos, desgaste, deformação.

**Medição de passo:** Procedimento para verificar TPI ou passo; usado com ferramentas específicas, comparadores, réguas de passo ou óptica.

---

## Termos de Normas

**Shall:** Requisito obrigatório para conformidade com a norma.

**Should:** Recomendação desejável, normalmente não obrigatória.

**May:** Opção ou permissão dentro das condições estabelecidas.

**Can:** Possibilidade ou capacidade; não representa requisito obrigatório direto.

---

# 5. ROTEAMENTO DE PERGUNTAS → NORMAS

## Estratégia de Roteamento (Passo a Passo)

1. **Identifique o tipo de componente:**
   - Casing ou tubing de poço
   - Line pipe, oleoduto ou gasoduto
   - Drill pipe, drill collar ou HWDP
   - Haste de bombeio (sucker rod)
   - Cabeça de poço, árvore de natal ou válvulas de wellhead

2. **Identifique o foco principal:**
   - Geometria da rosca, perfil, passo, conicidade
   - Produto, grau de aço, propriedades mecânicas, esforços
   - Compatibilidade entre conexões
   - Torque, montagem ou desmontagem
   - Inspeção em serviço ou aceitação de componentes
   - Quality Management System, QMS, conformidade, documentação

3. **Selecione norma(s) primária e complementar(es)**

4. **Responda com a norma como referência**

---

## Roteamento por Componente

### Casing e Tubing — Roscas e Perfis

**Perguntas típicas:**
- "Que tipo de rosca usa casing de X polegadas?"
- "Qual diferença entre LTC, STC e BTC?"
- "O que significa EUE ou NUE?"
- "Essa rosca atende API para casing?"

**Normas:**
- Primária: **API 5B**
- Complementar: **API 5CT**

---

### Casing e Tubing — Graus, Resistência, Produto

**Perguntas típicas:**
- "Qual grau para casing profundo?"
- "Diferença entre J55, L80 e P110?"
- "Qual resistência ao colapso?"

**Normas:**
- Primária: **API 5CT**
- Complementar: **API 5B** (se houver dúvida sobre rosca)

---

### Casing e Tubing — Compatibilidade

**Perguntas típicas:**
- "EUE é compatível com NUE?"
- "BTC e LTC podem ser montadas juntas?"
- "Conexão premium é equivalente a API BTC?"

**Normas:**
- Primária: **API 5B + API 5CT**
- Complementar: Documentação do fabricante

**REGRA DO AGENTE:**
Nunca declare compatibilidade apenas por semelhança de nome. Remeta à norma e ao fabricante.

---

### Line Pipe — Classificação e Requisitos

**Perguntas típicas:**
- "Qual norma se aplica a oleodutos?"
- "O que significa API 5L X52?"
- "Diferença entre X65 e X70?"

**Normas:**
- Primária: **API 5L**

---

### Coluna de Perfuração — Conexões NC, REG, IF, FH

**Perguntas típicas:**
- "O que é NC38?"
- "Diferença entre NC e REG?"
- "NC38 é compatível com 3 1/2 REG?"
- "Qual norma define roscas de drill pipe?"

**Normas:**
- Primária: **API 7-2**
- Complementar: **API 7-1** (se sobre o componente)

**REGRA DO AGENTE:**
Compatibilidade depende de perfil, passo, conicidade, diâmetros, comprimento de engate. Nunca confirme só pelo nome.

---

### Coluna de Perfuração — Drill Pipe/Collar como Produto

**Perguntas típicas:**
- "Qual norma trata drill collars?"
- "Requisitos de HWDP?"
- "Como especificar componente de perfuração?"

**Normas:**
- Primária: **API 7-1**
- Complementar: **API 7-2** (se sobre conexão)

---

### Coluna de Perfuração — Torque e Make-up

**Perguntas típicas:**
- "Qual torque de NC38?"
- "Como fazer make-up correto?"
- "Qual torque de break-out?"

**Normas:**
- Primária: **API 7-2**
- Complementar: Manual do fabricante, procedimento operacional

**REGRA DO AGENTE:**
Nunca invente valores de torque. Depende de material, composto de rosca, aplicação. Explique o critério e remeta à API 7-2 + manual do fabricante.

---

### Coluna de Perfuração — Inspeção em Serviço

**Perguntas típicas:**
- "Qual norma de inspeção de drill pipe usado?"
- "Como classificar desgaste em drill pipe?"
- "Critérios de inspeção de conexões usadas?"

**Normas:**
- Primária: **API 7G-2**
- Complementar: **API 7-2** (geometria), **API 7-1** (produto novo)

---

### Hastes de Bombeio

**Perguntas típicas:**
- "Qual norma cobre sucker rods?"
- "Como classificar haste de bombeio?"
- "Como especificar acoplamento?"

**Normas:**
- Primária: **API 11B**

---

### Wellhead e Equipamentos de Cabeça de Poço

**Perguntas típicas:**
- "Qual norma regula cabeça de poço?"
- "Qual API para árvore de natal?"
- "Requisitos de pressão para wellhead?"

**Normas:**
- Primária: **API 6A**
- Complementar: Documentação do fabricante

---

### Quality Management System (QMS)

**Perguntas típicas:**
- "Qual norma de QMS para fornecedor de petróleo e gás?"
- "Quais requisitos de documentação?"
- "Como estruturar auditorias internas?"
- "Qual período de retenção de registros?"

**Normas:**
- Primária: **API Specification Q1**
- Complementar: ISO 9001 (alinhamento), requisitos do cliente

---

# 6. TABELAS DE ROTEAMENTO RÁPIDO

## 6.1 Mapa por Palavra-Chave

| Palavra-Chave | Norma Primária | Norma Complementar | Observação |
|---|---|---|---|
| LTC, STC, BTC | API 5B | API 5CT | Tipos de extremidade casing |
| EUE, NUE | API 5B | API 5CT | Tipos de extremidade tubing |
| Casing, tubing (produto) | API 5CT | API 5B | Graus, resistência |
| H40, J55, L80, P110 | API 5CT | API 5B | Graus de aço casing/tubing |
| Line pipe, X52, X65, X70 | API 5L | API 5B | Dutos, graus |
| Drill pipe, drill collar, HWDP | API 7-1 | API 7-2 | Produtos de perfuração |
| NC26, NC31, NC38, NC50 | API 7-2 | API 7-1 | Conexões com ombro |
| REG, IF, FH | API 7-2 | API 7-1 | Estilos de conexão |
| Inspeção drill pipe usado | API 7G-2 | API 7-2 | Serviço, não novo |
| Sucker rod, haste bombeio | API 11B | — | Hastes de bombeio |
| Wellhead, árvore natal | API 6A | Fabricante | Equipamentos cabeça de poço |
| Gauge, gage, calibre casing | API 5B | API 5CT | Medição roscas |
| Gauge conexão NC ou REG | API 7-2 | API 7G-2 | Medição perfuração |
| Make-up torque NC, REG | API 7-2 | Manual fabricante | Torque montagem |
| QMS, Quality Management | API Q1 | ISO 9001 | Requisitos de sistema |
| Documentação, auditoria, registros | API Q1 | ISO 9001 | Procedures QMS |

---

## 6.2 Matriz de Decisão

```
┌─ É rosca ou produto?
│
├─ ROSCA GEOMÉTRICA
│  │
│  ├─ Casing/tubing? → API 5B (primária) + API 5CT (complementar)
│  ├─ Drill pipe/collar/HWDP? → API 7-2 (primária) + API 7-1 (complementar)
│  └─ Haste bombeio? → API 11B
│
├─ PRODUTO (Tubo/Componente)
│  │
│  ├─ Casing/tubing? → API 5CT (primária) + API 5B (se rosca)
│  ├─ Line pipe/duto? → API 5L (primária) + API 5B (se roscado)
│  ├─ Drill pipe/collar/HWDP? → API 7-1 (primária) + API 7-2 (se conexão)
│  ├─ Haste bombeio? → API 11B
│  └─ Wellhead/árvore? → API 6A + Fabricante
│
└─ INSPEÇÃO/QMS
   │
   ├─ Componente novo fabricação? → API 5B/7-1/etc + API Q1 (QMS)
   ├─ Componente usado em serviço? → API 7G-2 (drill stem) ou padrão de serviço
   ├─ Sistema QMS? → API Q1 (primária) + ISO 9001 (complementar)
   └─ Documentação/Auditoria/Registros? → API Q1 (seções 4-6)
```

---

## 6.3 Exemplos de Roteamento

**Exemplo 1:** "NC38 é compatível com 3 1/2 REG?"
→ API 7-2 primária
→ Resposta: "Compatibilidade depende de perfil, passo, conicidade, diâmetros e comprimento de engate. Essas informações estão na tabela de compatibilidade da API 7-2 e no manual do fabricante. Qual é o fabricante dessas conexões?"

**Exemplo 2:** "Qual torque para aperto de NC50?"
→ API 7-2 primária + Manual do fabricante
→ Resposta: "Torque de make-up é especificado na API 7-2 e no manual do fabricante da conexão. Depende de material, condição superficial, composto de rosca e aplicação. Qual é o fabricante?"

**Exemplo 3:** "Qual grau de casing para profundidade de 5.000m?"
→ API 5CT primária
→ Resposta: "A seleção de grau depende de pressão, temperatura, agressividade química e requisitos de cliente. Os graus disponíveis estão na tabela da API 5CT (H40 a Q125). Qual é a pressão esperada no fundo do poço?"

**Exemplo 4:** "Como estruturar QMS?"
→ API Q1 primária
→ Resposta: "API Specification Q1 define requisitos de Quality Management System. Principais seções: 4.1-4.5 (estrutura QMS), 5.1-5.10 (realização de produto), 6.1-6.5 (monitoramento, medição, melhoria). Você quer focar em qual área?"

---

## Avisos de Segurança Técnica

Esta base de conhecimento é um **resumo original** de normas API.

**NÃO substitui:**
- Texto oficial das normas
- Procedimentos de fabricante
- Avaliação de profissional qualificado
- Tabelas oficiais de dimensões, tolerâncias, torques
- Documentação do cliente e requisitos específicos

**Sempre:**
- Consulte a edição mais recente da norma aplicável
- Valide com o fabricante do componente
- Envolva engenharia para decisões críticas de fabricação/inspeção/aceitação

---
