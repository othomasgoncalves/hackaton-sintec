# Dengue Zero NL

Aplicativo web com aparência de app mobile para o combate à dengue em Nova Londrina, PR.
Projeto desenvolvido para o **Hackaton SINTEC 2.0 (Senac)**.

## O problema

Nova Londrina fica no noroeste do Paraná, uma das regiões com maior incidência de dengue no estado.
O ciclo de transmissão se repete todo verão por três motivos práticos:

1. O morador não sabe quando o risco está alto, então a prevenção acontece só depois do surto.
2. Quando alguém vê um foco em terreno vago, não tem um caminho simples para avisar a vigilância, com foto e endereço.
3. Quem começa a sentir sintomas demora para procurar atendimento e muitas vezes não reconhece os sinais de alarme da dengue grave.

## A solução

Um único aplicativo, leve e offline-first, que cobre os três pontos:

- **Mede o risco do dia** com dados reais de clima da cidade, transformando temperatura, chuva e umidade em uma nota de 0 a 100.
- **Transforma o cidadão em agente de endemias**, com denúncia geolocalizada em menos de um minuto e acompanhamento por protocolo.
- **Orienta a decisão de procurar atendimento**, separando sintomas comuns de sinais de alarme.

## Funcionalidades

### Abertura
Tela de boas-vindas com o mascote, exibida apenas no primeiro acesso (controlada por `localStorage`).

### Início
- Card **Risco de hoje** com anel de progresso, nota de 0 a 100, nível (Baixo, Médio, Alto) e orientação específica para o nível.
- Mini cards de temperatura atual, chuva acumulada dos últimos 7 dias e umidade relativa.
- Dados reais da **API Open-Meteo** (pública, sem chave) para as coordenadas de Nova Londrina.
- Skeleton durante o carregamento e fallback com valores de exemplo mais o selo `dados offline` caso a API falhe.
- Grade de atalhos para denúncia, checklist, sintomas e mapa.
- **Dica do dia** sorteada de uma lista de 10 orientações de prevenção.

### Checklist "10 minutos contra a dengue"
- 8 itens de vistoria doméstica, cada um com título e dica prática.
- Barra de progresso animada, contador `X de 8 concluídos` e pontuação (+10 por item).
- Checkbox customizado acessível (input real associado a label) com animação ao marcar.
- Card de parabéns com mascote e confete em CSS ao concluir os 8 itens.
- Botão **Reiniciar semana** e progresso salvo em `localStorage`.

### Denunciar foco
- Captura de foto pela câmera do celular (`capture="environment"`) com prévia e opção de remover.
- Chips de tipo do foco com seleção única: lote vago com lixo, pneus expostos, piscina suja, caixa d'água aberta e outros.
- Mapa **Leaflet** com tiles do OpenStreetMap centrado em Nova Londrina, botão **Usar minha localização** (Geolocation API) e marcação por toque no mapa.
- Validação de tipo e local com mensagens de erro nos próprios campos.
- Ao enviar, gera protocolo sequencial (`NL-0001`), data e status `Aberta`, salva em `localStorage`, mostra toast de sucesso e plota o marcador.
- Mapa dos focos com marcadores coloridos por status e legenda.
- Lista **Minhas denúncias** com protocolo, tipo, data e selo de status. Para fins de demonstração, tocar no selo avança o status (Aberta, Em verificação, Resolvida).
- Três denúncias de exemplo pré-carregadas em pontos diferentes da cidade, uma de cada status.

### Sintomas
- Chips de sintomas comuns e seção destacada de sinais de alarme.
- Resultado dinâmico em três estados: neutro, card azul orientando a procurar o hospital do município, ou card vermelho com `role="alert"`, botão **Ligar 192** (`tel:192`) e **Ver hospital**.
- Card fixo **Onde procurar atendimento** com o Hospital Municipal Santa Rita de Cássia, endereço, botão de ligação direta para (44) 3432-1198 e link de rota. Nova Londrina não conta com UBS de referência para esse atendimento, então toda a orientação da triagem aponta para o hospital municipal.
- Card **Enquanto isso** com cuidados imediatos, incluindo o alerta de não usar AAS nem ibuprofeno.
- Aviso de que a triagem não substitui avaliação médica.

## Acessibilidade

- HTML semântico com `lang="pt-BR"`, `header`, `nav`, `main`, `section` e `article`.
- `aria-label` em todos os botões que só têm ícone, `alt` descritivo nas imagens.
- `role="progressbar"` com `aria-valuenow`, `role="radiogroup"` nos chips de tipo, `aria-pressed` nos chips de sintoma e `aria-live` nos toasts e no resultado da triagem.
- Alvos de toque de no mínimo 44px, foco visível em todos os elementos interativos e contraste mínimo de 4.5:1.
- Toda animação respeita `prefers-reduced-motion`.

## Tecnologias

| Camada | Escolha |
| --- | --- |
| Estrutura | HTML5 semântico |
| Estilo | CSS puro, sem framework, organizado em `base.css`, `componentes.css` e `telas.css` |
| Comportamento | JavaScript puro (ES5), um módulo por tela no padrão IIFE |
| Mapa | Leaflet 1.9.4 via CDN unpkg com tiles do OpenStreetMap |
| Dados de clima | API pública Open-Meteo, sem chave de acesso |
| Central de denúncias | Firebase Realtime Database pela API REST, com `fetch` puro e sem SDK |
| Persistência | `localStorage` para checklist, flag da tela de abertura e cache offline das denúncias |
| Instalação | `manifest.json` com `theme_color` e ícone, para instalar na tela inicial |
| Tipografia | Google Fonts: Baloo 2 e Plus Jakarta Sans |

Nenhum build, nenhum `node_modules`, nenhuma dependência além do Leaflet.

## Estrutura do projeto

```
.
├── index.html
├── manifest.json
├── README.md
├── estilos/
│   ├── base.css
│   ├── componentes.css
│   └── telas.css
├── scripts/
│   ├── app.js
│   ├── clima.js
│   ├── checklist.js
│   ├── denuncia.js
│   └── sintomas.js
└── imagens/
    ├── mascote.png
    └── logo-senac-sintec.png
```

## Como rodar

**Opção 1, abrir direto:** dê dois cliques em `index.html`. Tudo funciona, incluindo mapa e clima.

**Opção 2, Live Server (recomendada):** no VS Code, instale a extensão *Live Server*, clique com o botão direito em `index.html` e escolha **Open with Live Server**. É a forma recomendada porque serve o projeto por HTTP, o que permite o carregamento do `manifest.json` e o uso da geolocalização do navegador.

Para ver o app como celular no desktop, abra o DevTools (`F12`) e ative o modo dispositivo (`Ctrl + Shift + M`). No navegador em tela cheia, o app já aparece centralizado em uma moldura de 390px.

Para rever a tela de abertura, limpe o `localStorage` do site no DevTools, em Application, Local Storage.

## Central de denúncias compartilhada

As denúncias não ficam presas ao aparelho de quem registrou. O módulo [scripts/nuvem.js](scripts/nuvem.js) conversa com um Firebase Realtime Database pela API REST, usando apenas `fetch`, sem SDK e sem build. Qualquer cidadão que abrir o app vê os focos registrados por todos os outros.

- Leitura a cada 5 segundos, e só enquanto a tela de denúncia está aberta, para não gastar bateria e dados.
- `GET /denuncias.json` para listar, `POST /denuncias.json` para registrar e `PATCH /denuncias/{id}.json` para mudar o status.
- **Degradação graciosa em três camadas:** toda requisição tem limite de 8 segundos; se a nuvem não responder no envio, a denúncia é salva no aparelho e o usuário é avisado; se falhar na leitura, o mapa mantém o que já havia carregado. O app nunca trava por causa da rede.
- As 3 denúncias de exemplo são locais e nunca sobem para a nuvem, para que cada novo visitante não duplique a base.

## Como funciona o cálculo do risco

A nota de 0 a 100 soma três fatores, cada um com peso próprio:

| Fator | Peso | Lógica |
| --- | --- | --- |
| Temperatura atual | até 40 pontos | pontuação máxima entre 25°C e 32°C, faixa ideal de desenvolvimento do *Aedes aegypti*; cai abaixo de 25°C e acima de 32°C |
| Chuva acumulada em 7 dias | até 35 pontos | proporcional ao volume, saturando em 60mm |
| Umidade relativa | até 25 pontos | só pontua acima de 60%, crescendo até 100% |

Classificação final: **Baixo** abaixo de 40, **Médio** de 40 a 69, **Alto** a partir de 70.

## Uso de IA no desenvolvimento

A inteligência artificial foi usada como par de programação ao longo de todo o projeto, com o Claude Code dentro do VS Code:

- **Definição do produto:** a partir dos critérios de avaliação do hackaton, a IA ajudou a priorizar as funcionalidades que mais entregam utilidade real, descartando ideias genéricas.
- **Modelo de risco climático:** a IA apoiou a pesquisa sobre as faixas de temperatura e umidade favoráveis ao *Aedes aegypti* e a traduzir isso em uma fórmula simples de pontuação, auditável no arquivo `clima.js`.
- **Geração e revisão de código:** HTML, CSS e JavaScript foram escritos com apoio da IA, sempre com revisão humana de arquitetura, nomes de arquivos e variáveis em português e padrão de código sem dependências.
- **Acessibilidade:** a IA foi usada para revisar atributos ARIA, ordem de foco, tamanho de alvos de toque e contraste das cores do tema.
- **Conteúdo:** os textos de orientação, as 10 dicas de prevenção e as mensagens de triagem foram redigidos com apoio da IA e revisados para manter linguagem simples e alinhada às orientações do Ministério da Saúde.

A decisão de arquitetura, a identidade visual e a validação de cada tela foram conduzidas pela equipe. A IA acelerou a execução, não substituiu a autoria.

## Observações da demonstração

- As denúncias são compartilhadas entre todos os aparelhos pela central na nuvem. O `localStorage` passa a ser a camada offline.
- A foto da denúncia é exibida em prévia, mas não é persistida, para não estourar o limite do `localStorage`.
- Tocar no selo de status avança o status manualmente. É um recurso de demonstração, não uma funcionalidade do cidadão.
