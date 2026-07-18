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

## 2.1 Escopo e Objetivo

**API Specification Q1** (Tenth Edition, September 2023) define requisitos de **Quality Management System (QMS)** para organizações que fornecem produtos e serviços à indústria de petróleo e gás natural.

### Aplicabilidade

Aplica-se a:
- **Fabricantes** de produtos para petróleo e gás
- **Engenharia/Design** de componentes
- **Prestadores de serviços** de realização de produto (soldagem, tratamento térmico, revestimento, usinagem, inspeção, testes)
- **Distribuidores** e prestadores de atividades relacionadas a produtos

### Produto (Definição)

Conforme API Q1 3.1.16:
> "Output de uma organização destinada a ser fornecida a um cliente."

Inclui:
- Hardware e software
- Atividades de realização de produto: soldagem, tratamento térmico, revestimento, usinagem, inspeção, testes, serviços, distribuição, logística

---

## 2.2 Estrutura do QMS (Seções Principais)

### 4. Quality Management System Requirements

#### 4.1 Quality Management System (Geral)
- A organização deve planejar, estabelecer, documentar, implementar e manter um QMS
- Deve medir e melhorar a efetividade do sistema
- Escopo: produtos cobertos, limitações, exclusões

#### 4.2 Management Responsibility
- **Top management:** leadership e commitment
- **Quality Policy:** definida, documentada, comunicada, alinhada com estratégia
- **Quality Objectives:** mensuráveis, comunicáveis, alinhados com policy
- **Planning:** identificação de riscos, oportunidades, sequência de processos
- **Management Representative:** responsável por QMS conformidade e performance

#### 4.3 Organization Capability
- **Resources and Knowledge:** determinar e alocar recursos necessários
- **Personnel Competence:** manter procedimento de competência, treinamento, registros
- **Work Environment:** determinar e manter ambiente de trabalho adequado (buildings, workspace, utilities, process equipment, supporting services)

#### 4.4 Documentation Requirements
- QMS documentation deve incluir:
  - Scope do QMS e justificativa de exclusões
  - Quality policy e objectives
  - Legal/regulatory requirements necessários para conformidade
  - Processes que requerem validação
  - Procedures, documentos e registros necessários

#### 4.5 Control of Records
- Estabelecer e manter procedimento para identificação, collection, legibility, correction, storage, protection, retrieval, retention time, disposition de registros
- **Retention time mínima: 10 anos** (ou conforme legal/cliente)

### 5. Product Realization

#### 5.1 Contract Review
- Determinar requirements especificados pelo cliente
- Review antes de commitment to deliver
- Resolver diferenças com requirements previamente identificados
- Registrar resultados da review

#### 5.2 Planning
- Identificar e planejar processes e documentos necessários para product realization
- Abordar: required resources, product/customer requirements, legal/regulatory requirements, design requirements, contingency planning, verification/validation/monitoring/measurement/inspection/test activities, management of change (MOC), records

#### 5.3 Risk Management
- Manter procedimento documentado para identificar e controlar riscos associados a delivery e qualidade do produto
- Abordar: risk identification/assessment techniques, tools, criteria, mitigation actions, assessment de remaining risk, contingency planning

#### 5.4 Design (quando aplicável)
- Planning: stages, resources, responsibilities, authorities, reviews/verification/validation
- Design Inputs: identificar requirements, incluir customer-specified, external sources (API specs), environmental/operational conditions, consequences de potential product failure
- Design Outputs: documentação, verification contra design inputs, design acceptance criteria, identification of critical characteristics
- Design Review: evaluate suitability, adequacy, effectiveness dos design stage results
- Design Verification: confirmar design outputs satisfazem design inputs
- Design Validation: prove design resulta em produto capaz de satisfazer specified requirements
- Design Changes: review, verify, validate, approve antes da implementação

#### 5.5 Purchasing (Contratos com Fornecedores)
- **Critical products, components, or activities:** supplier evaluation abrange quality system implementation, verification of supplier capability (on-site assessment, remote assessment, inspection/testing)
- **Non-critical purchases:** verificação de supplier quality system conformance ou assessment de product/component
- **Purchasing Information:** especificação de product, component, activity requirements, acceptance criteria, supplier procedures/processes/equipment approval requirements, quality management system requirements
- **Verification of Purchased Products:** critical purchases requerem review de documentation, verification de applicable versions (specs, drawings, etc.), inspection/testing/verification methods, frequency, responsible party

#### 5.6 Control of Product Realization
- Determinar e implementar MAC (Manufacturing Acceptance Criteria)
- Identificar e documentar processes críticos
- Implementar quality plan (conforme contract requirement)
- Maintain identification e traceability throughout product realization
- Implement monitoring e measurement activities
- Manage product identification e inspection/test status
- Review and control product realization changes

#### 5.7 Product Release
- Manter procedimento para release de produto ao cliente
- Release não deve proceder até que arranjos planejados tenham sido satisfatoriamente completados
- Organização deve somente liberar produto que conforma aos requirements ou está autorizado sob concessão (conforme section 5.9.3)

#### 5.8 Testing, Measuring, Monitoring, and Detection Equipment (TMMDE)
- Determinar TMMDE necessário e requirements
- TMMDE deve ser calibrado em intervalos especificados
- Deve ter calibration status identifiable, safeguarded de adjustments que invalide results, protected de damage/deterioration, used em condições ambientais adequadas

#### 5.9 Control of Nonconforming Product
- Manter procedimento para handling de produto não-conforme durante realization e após delivery
- Durante realization: identificar, control, prevenir unintended use/delivery, address detected nonconformity, take action to preclude, re-grade para alternative applications, release sob concessão, ou reject/scrap
- Após delivery: identificar, documentar, report, analyze nonconformity, take action apropriada, authorize use/release/acceptance sob concessão per relevant authority e customer

#### 5.10 Management of Change (MOC)
- Manter procedimento documentado para MOC
- Abordar: description de change, need for, available/allocated resources, potential risks, review/approval/implementation, notifications, records

### 6. Quality Management System Monitoring, Measurement, Analysis, and Improvement

#### 6.1 General
- Plan e implement monitoring, measurement, analysis, improvement processes
- Determine applicable methods, techniques, analysis data, extent of use

#### 6.2 Monitoring, Measuring, and Improving

**Customer Satisfaction:**
- Maintain procedimento para monitor customer satisfaction
- Determine frequency/methods e key performance indicators

**Internal Audit:**
- Conduct audits para provide information on whether QMS é implemented, maintained, conforms to requirements
- Plan audits considerando results of previous audits, criticality do process
- **Frequency:** at least every 12 months (all processes must be audited within 12 months, can be spread)
- Audits performed by competent, independent personnel
- Maintain records e ensure management takes corrective actions

**Analysis of Data:**
- Maintain procedimento para identification, collection, analysis de data para demonstrate suitability/effectiveness do QMS
- Data analysis inclui: customer satisfaction, nonconformity/product failures (após delivery/use), process performance, supplier performance, achievement of quality objectives

**Improvement:**
- Continually improve effectiveness de QMS through quality objectives, internal audits, analysis de data, corrective action, management review

#### 6.4 Corrective Action
- Maintain procedimento para address nonconformities (incluindo results de customer complaints)
- Abordar: determine when corrective action is initiated, review nonconformity, determine/implement corrections, identify root cause, implement corrective action to reduce likelihood of recurrence, identify timeframe/responsible persons, verification de effectiveness, evaluate similar potential nonconformities

#### 6.5 Management Review
- **Frequency:** at least every 12 months (not later than end of calendar month as prior year review)
- **Input:** status e effectiveness de actions from previous management reviews, results de internal audits (6.2.2) e audits de external parties, changes que could affect QMS, analysis de customer satisfaction, feedback from interested parties, process performance, risk assessment results, supplier performance, status de corrective actions, achievements of quality objectives, recommendations for improvement
- **Output:** summary assessment de QMS effectiveness, required changes to processes, decisions/actions, required resources, recommendations for improvement
- Management reviews shall be documented

---

## 2.3 Seções Críticas para Segurança Técnica

### Design Acceptance Criteria (DAC) vs. Manufacturing Acceptance Criteria (MAC)

**DAC** (5.4.4):
- Requirements aplicados a características ou combinações de características para conformidade aos design requirements e/ou required design performance

**MAC** (5.6.1):
- Requirements aplicados a características ou combinações de características para conformidade ao DAC (ou product manufacturing requirements) e/ou outras product manufacturing requirements

### Regra de Ouro

> "Design Acceptance Criteria (DAC) can be equal to Manufacturing Acceptance Criteria (MAC)" — mas nunca assuma isso automaticamente. Verifique sempre a especificação do cliente e do produto.

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
