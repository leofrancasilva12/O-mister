# Roteamento de perguntas → normas API prováveis (roscas e tubos)

> Arquivo auxiliar para o agente decidir **quais normas API** são mais relevantes para cada tipo de pergunta sobre roscas, tubos e conexões.

***

## 1. Estratégia geral de roteamento

1. Identificar o **tipo de componente** mencionado na pergunta:
   - Casing ou tubing de poço.
   - Line pipe, oleoduto ou gasoduto.
   - Drill pipe, drill collar ou HWDP.
   - Haste de bombeio (sucker rod).
   - Cabeça de poço, árvore de natal ou válvulas de wellhead.

2. Identificar o **foco principal** da dúvida:
   - Geometria da rosca, perfil, passo, conicidade, calibre ou inspeção.
   - Produto, tubo, grau de aço, propriedades mecânicas ou esforços.
   - Compatibilidade entre conexões.
   - Torque, montagem ou desmontagem.
   - Inspeção em serviço ou aceitação de componentes.

3. Selecionar de uma a três normas prováveis.

4. Consultar primeiro os documentos indexados com essas normas.

5. Ampliar a busca somente quando a norma primária não for suficiente.

***

## 2. Casing e tubing

### 2.1 Roscas, perfis e extremidades

#### Perguntas típicas

- “Que tipo de rosca é usada em casing de X polegadas?”
- “Qual a diferença entre LTC, STC e BTC?”
- “O que significa EUE ou NUE em tubing?”
- “Essa rosca atende ao padrão API para casing ou tubing?”
- “Qual norma define o perfil da rosca BTC?”
- “Qual norma trata da medição de rosca EUE?”

#### Roteamento provável

- **Norma primária:** API 5B
- **Norma complementar:** API 5CT

#### Motivo

A API 5B é a referência principal para geometria, rosqueamento, medição, calibração e inspeção de roscas de casing, tubing e line pipe. A API 5CT fornece o contexto do produto, dos tipos de extremidade e dos requisitos do tubo.

***

### 2.2 Graus de aço, resistência e classificação do tubo

#### Perguntas típicas

- “Qual o grau de aço recomendado para casing?”
- “Qual a diferença entre J55, L80 e P110?”
- “Qual a resistência ao colapso de um casing?”
- “Como classificar um tubing pelo grau?”
- “Qual norma trata de burst, collapse e resistência mecânica?”

#### Roteamento provável

- **Norma primária:** API 5CT
- **Norma complementar:** API 5B, quando houver dúvida sobre a extremidade roscada

#### Motivo

A API 5CT trata dos requisitos do produto, incluindo graus, propriedades mecânicas, dimensões, testes e tipos de extremidade. A API 5B deve ser consultada quando a pergunta também envolver a geometria ou inspeção da rosca.

***

### 2.3 Compatibilidade de conexões de casing e tubing

#### Perguntas típicas

- “EUE é compatível com NUE?”
- “Uma conexão BTC pode ser montada em LTC?”
- “Uma conexão premium é equivalente a uma API BTC?”
- “Esse acoplamento serve para essa extremidade?”

#### Roteamento provável

- **Norma primária:** API 5B
- **Norma complementar:** API 5CT
- **Fonte adicional:** documentação do fabricante, quando houver conexão premium

#### Regra do agente

Não declarar compatibilidade apenas pela semelhança do nome ou do diâmetro nominal. A compatibilidade depende do perfil, passo, conicidade, diâmetros, comprimento de engate e requisitos do fabricante.

***

## 3. Line pipe

### 3.1 Classificação e requisitos do tubo

#### Perguntas típicas

- “Qual norma API se aplica a oleodutos e gasodutos?”
- “O que significa API 5L X52?”
- “Qual a diferença entre X65 e X70?”
- “Como classificar um line pipe?”
- “Qual norma define os requisitos mecânicos de tubos para dutos?”

#### Roteamento provável

- **Norma primária:** API 5L

#### Motivo

A API 5L trata de tubos destinados ao transporte de petróleo, gás e outros fluidos por dutos.

***

### 3.2 Extremidades roscadas em line pipe

#### Perguntas típicas

- “Qual norma trata da rosca de um line pipe?”
- “Esse duto possui extremidade roscada. Qual norma consultar?”
- “Como inspecionar uma rosca API de line pipe?”

#### Roteamento provável

- **Norma primária:** API 5B, quando o foco for a rosca
- **Norma complementar:** API 5L, quando o foco for o produto

***

## 4. Coluna de perfuração

### 4.1 Conexões NC, REG, IF e FH

#### Perguntas típicas

- “O que é NC38?”
- “Qual a diferença entre NC e REG?”
- “O que significa IF ou FH?”
- “NC38 é compatível com 3 1/2 REG?”
- “Qual norma define as roscas de drill pipe?”
- “Qual norma possui as dimensões de uma conexão NC50?”

#### Roteamento provável

- **Norma primária:** API 7-2
- **Norma complementar:** API 7-1, quando a pergunta também envolver o componente

#### Motivo

A API 7-2 é a referência principal para rosqueamento, geometria, calibração e conexões de perfuração com ombro.

***

### 4.2 Drill pipe, drill collar e HWDP como produtos

#### Perguntas típicas

- “Qual norma trata de drill collars?”
- “Quais requisitos se aplicam a HWDP?”
- “Como especificar um componente da coluna de perfuração?”
- “Quais testes de fabricação se aplicam a drill stem elements?”
- “Qual norma trata de dimensões e propriedades do drill collar?”

#### Roteamento provável

- **Norma primária:** API 7-1
- **Norma complementar:** API 7-2, quando houver dúvida sobre a conexão

***

### 4.3 Torque, make-up e break-out

#### Perguntas típicas

- “Qual o torque de aperto de uma NC38?”
- “Como fazer make-up de conexão com ombro?”
- “Qual o torque de break-out?”
- “Como evitar dano durante a montagem?”
- “Qual composto de rosca usar?”

#### Roteamento provável

- **Norma primária:** API 7-2
- **Fontes complementares:** manual do fabricante, procedimento do operador, ficha técnica do composto e prática interna aprovada

#### Regra do agente

Não inventar valores de torque. Os valores podem depender da conexão, material, diâmetros, condição superficial, composto de rosca, aplicação e recomendação do fabricante.

***

### 4.4 Inspeção em serviço da coluna de perfuração

#### Perguntas típicas

- “Qual norma trata da inspeção de drill pipe usado?”
- “Como classificar desgaste em drill pipe?”
- “Quais critérios de inspeção se aplicam a conexões usadas?”
- “Qual documento trata da inspeção de drill stem em serviço?”

#### Roteamento provável

- **Norma ou documento primário provável:** API 7G-2
- **Complementar:** API 7-2, quando o foco for a geometria e calibração da conexão
- **Complementar:** API 7-1, quando o foco for o produto novo ou requisitos de fabricação

#### Observação

O agente deve distinguir entre requisitos de fabricação de produto novo e critérios de inspeção de componentes usados em serviço.

***

## 5. Hastes de bombeio

### 5.1 Produto, roscas e acoplamentos

#### Perguntas típicas

- “Qual norma API cobre sucker rods?”
- “Como são classificadas as hastes de bombeio?”
- “Qual norma trata das roscas de hastes?”
- “Como especificar um acoplamento de sucker rod?”
- “Quais requisitos mecânicos se aplicam às hastes?”

#### Roteamento provável

- **Norma primária:** API 11B

***

## 6. Wellhead, árvore de natal e válvulas

### 6.1 Equipamentos de cabeça de poço

#### Perguntas típicas

- “Qual norma regula cabeças de poço?”
- “Qual API se aplica a árvore de natal?”
- “Essa válvula de wellhead precisa atender a qual norma?”
- “Qual norma define requisitos de pressão para equipamentos de cabeça de poço?”

#### Roteamento provável

- **Norma primária:** API 6A

***

### 6.2 Extremidades roscadas em equipamentos de wellhead

#### Perguntas típicas

- “Qual padrão de rosca é usado nesse componente de wellhead?”
- “A API 6A define a geometria dessa rosca?”
- “Essa extremidade segue API 5B ou um perfil próprio?”

#### Roteamento provável

- **Norma primária:** API 6A
- **Norma complementar:** API 5B, quando houver remissão para roscas de casing, tubing ou line pipe
- **Fonte adicional:** desenho e documentação do fabricante

#### Regra do agente

Não assumir que toda rosca presente em um equipamento API 6A é automaticamente uma rosca API 5B. Verificar a especificação do componente e a remissão normativa aplicável.

***

## 7. Perguntas genéricas sobre roscas API

### 7.1 “Qual norma trata de roscas API?”

#### Roteamento provável

- **API 5B:** casing, tubing e line pipe
- **API 7-2:** conexões de perfuração com ombro
- **API 11B:** hastes de bombeio
- **API 6A:** equipamentos de wellhead e árvore de natal, quando aplicável ao produto

#### Resposta esperada do agente

O agente deve pedir ou inferir o tipo de componente antes de apontar uma única norma como resposta definitiva.

***

### 7.2 Perguntas que misturam tubo e rosca

#### Perguntas típicas

- “Qual norma se aplica a um casing 9 5/8 BTC?”
- “Qual norma cobre tubing EUE?”
- “Qual API devo usar para um drill collar NC50?”
- “Qual norma vale para line pipe roscado?”

#### Roteamento provável

- Casing ou tubing:
  - **Produto:** API 5CT
  - **Rosca:** API 5B

- Drill collar ou outro drill stem element:
  - **Produto:** API 7-1
  - **Rosca:** API 7-2

- Line pipe:
  - **Produto:** API 5L
  - **Rosca:** API 5B, quando aplicável

***

## 8. Inspeção e calibração de roscas

### 8.1 Casing, tubing e line pipe

#### Perguntas típicas

- “Como calibrar uma rosca de casing?”
- “Qual calibre usar em EUE?”
- “Como verificar uma rosca BTC?”
- “Quais critérios de aceitação se aplicam à rosca de tubing?”
- “Qual norma trata de gages para API 5B?”

#### Roteamento provável

- **Norma primária:** API 5B
- **Norma complementar:** API 5CT, quando a condição do produto também for relevante

***

### 8.2 Conexões de perfuração com ombro

#### Perguntas típicas

- “Como calibrar uma conexão NC38?”
- “Qual gauge usar em uma caixa NC50?”
- “Como verificar stand-off?”
- “Qual norma trata da inspeção dimensional de conexões com ombro?”

#### Roteamento provável

- **Norma primária:** API 7-2
- **Complementar:** API 7G-2, quando a inspeção for em serviço

***

### 8.3 Hastes de bombeio

#### Perguntas típicas

- “Como inspecionar a rosca de uma sucker rod?”
- “Qual norma define o acoplamento da haste?”
- “Quais critérios se aplicam à conexão da haste?”

#### Roteamento provável

- **Norma primária:** API 11B

***

## 9. Graus de aço e classificação de produtos

### 9.1 Casing e tubing

#### Termos detectados

- H40
- J55
- K55
- N80
- L80
- C90
- T95
- P110
- Q125

#### Roteamento provável

- **Norma primária:** API 5CT

***

### 9.2 Line pipe

#### Termos detectados

- A
- B
- X42
- X52
- X56
- X60
- X65
- X70
- X80

#### Roteamento provável

- **Norma primária:** API 5L

***

### 9.3 Drill stem elements

#### Termos detectados

- Drill pipe
- Drill collar
- HWDP
- Tool joint
- Rotary drill stem element

#### Roteamento provável

- **Produto:** API 7-1
- **Conexão:** API 7-2
- **Inspeção em serviço:** API 7G-2

***

## 10. Mapa rápido por palavra-chave

| Palavra-chave detectada | Norma primária provável | Norma complementar |
|---|---|---|
| LTC, STC, BTC | API 5B | API 5CT |
| EUE, NUE | API 5B | API 5CT |
| Casing, tubing | API 5CT | API 5B |
| J55, L80, P110 | API 5CT | API 5B |
| Line pipe, X52, X65, X70 | API 5L | API 5B |
| NC26, NC31, NC38, NC50 | API 7-2 | API 7-1 |
| REG, IF, FH | API 7-2 | API 7-1 |
| Drill pipe, drill collar, HWDP | API 7-1 | API 7-2 |
| Inspeção de drill pipe usado | API 7G-2 | API 7-2 |
| Sucker rod, haste de bombeio | API 11B | — |
| Wellhead, árvore de natal | API 6A | documentação do fabricante |
| Gauge, gage, calibre de casing | API 5B | API 5CT |
| Gauge de conexão NC ou REG | API 7-2 | API 7G-2 |
| Make-up torque NC, REG, IF ou FH | API 7-2 | manual do fabricante |

***

## 11. Regras de prioridade para o RAG

### 11.1 Metadados recomendados

Os documentos e chunks podem ser indexados com metadados como:

```yaml
standard: "API 5B"
category: "threading"
component: "casing-tubing"
document_type: "summary"
language: "pt-BR"
```

Outros valores úteis:

```yaml
category:
  - threading
  - gauging
  - inspection
  - product
  - mechanical-properties
  - compatibility
  - torque
  - terminology

component:
  - casing
  - tubing
  - line-pipe
  - drill-pipe
  - drill-collar
  - hwdp
  - sucker-rod
  - wellhead
```

***

### 11.2 Ordem de busca sugerida

1. Detectar componente e intenção.
2. Selecionar a norma primária.
3. Filtrar chunks por `standard`.
4. Priorizar chunks com a mesma `category`.
5. Consultar a norma complementar quando necessário.
6. Consultar documentação de fabricante para conexões proprietárias, premium ou valores de torque.
7. Não ampliar para todas as normas sem necessidade.

***

## 12. Estrutura de saída recomendada para o roteador

O roteador interno pode gerar uma estrutura semelhante a:

```json
{
  "componente": "drill-pipe",
  "intencao": "geometria-e-compatibilidade-de-rosca",
  "normas_primarias": ["API 7-2"],
  "normas_complementares": ["API 7-1"],
  "termos_detectados": ["NC38", "3 1/2 REG"],
  "nivel_de_confianca": "alto",
  "alertas": [
    "Verificar tabelas oficiais de compatibilidade",
    "Não afirmar compatibilidade apenas pelo diâmetro nominal"
  ]
}
```

Outro exemplo:

```json
{
  "componente": "casing",
  "intencao": "grau-e-resistencia",
  "normas_primarias": ["API 5CT"],
  "normas_complementares": ["API 5B"],
  "termos_detectados": ["P110", "BTC"],
  "nivel_de_confianca": "alto",
  "alertas": [
    "Valores exatos dependem do diâmetro, peso, espessura e edição da norma"
  ]
}
```

***

## 13. Regras de segurança técnica

O agente não deve:

- Inventar dimensões ou tolerâncias.
- Informar torque sem fonte verificável.
- Confirmar compatibilidade apenas pelo nome da conexão.
- Misturar requisitos de produto novo com critérios de inspeção em serviço.
- Tratar conexão premium como equivalente automática a uma conexão API.
- Usar uma edição desconhecida da norma como base para decisão crítica.

O agente deve:

- Indicar a norma primária e as complementares.
- Explicar o motivo do roteamento.
- Informar quando a resposta depende de tabelas oficiais.
- Solicitar ou identificar diâmetro, conexão, componente, grau e edição da norma quando esses dados forem essenciais.
- Recomendar validação por profissional qualificado em decisões de fabricação, inspeção, aceitação ou rejeição.

***

## 14. Resposta padrão quando o roteamento for incerto

Quando não for possível identificar a norma com segurança, o agente pode responder:

> “A norma aplicável depende do tipo de componente e do foco da análise. Para casing ou tubing, normalmente são consultadas API 5B e API 5CT. Para conexões de perfuração com ombro, a referência principal costuma ser API 7-2, complementada pela API 7-1. Informe o componente, a designação da conexão e o tipo de inspeção para refinar o direcionamento.”

***
