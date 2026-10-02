# SendFlow — Broadcast

Aplicação SaaS multi-tenant de **Broadcast**. Cada cliente gerencia suas conexões, os contatos de cada conexão e o envio simulado de mensagens, imediatas ou agendadas. Mensagens agendadas passam para "Enviada" no horário definido por uma Cloud Function, sem depender de o app estar aberto.

**Aplicação publicada:** https://send-flow-test.web.app

**Stack:** React 19 + TypeScript + Vite · Material UI + Tailwind CSS · Firebase Authentication, Firestore, Cloud Functions (2ª geração) e Hosting.

## Usando a aplicação publicada

1. Acesse https://send-flow-test.web.app e clique em **Cadastre-se**. A senha precisa ter 8+ caracteres, maiúscula, minúscula, número e caractere especial. Cada conta é um cliente isolado.
2. Em **Conexões**, crie uma conexão e clique em **Abrir**.
3. Na aba **Contatos**, cadastre contatos com nome e telefone, por exemplo `(11) 99999-8888`. O telefone é único dentro da conexão.
4. Na aba **Broadcast**:
   - selecione um ou mais contatos (ou **Selecionar todos**) e escreva a mensagem;
   - escolha **Enviar agora**, que já cria a mensagem como "Enviada", ou **Agendar**, com data e hora futuras;
   - filtre por **Todas / Enviadas / Agendadas** e use **Carregar mais** para ver mensagens antigas;
   - edite mensagens agendadas e exclua qualquer mensagem.
5. Agende uma mensagem para alguns minutos à frente e feche a aba. Ao voltar, ela estará **Enviada**. Com a tela aberta, a mudança aparece em tempo real.
6. Para conferir o isolamento, crie outra conta numa janela anônima: nada da primeira conta aparece.

## Como funciona

```
Navegador (React) ── Auth ──► Firebase Authentication
        │
        └── leituras em tempo real e escritas ──► Security Rules ──► Firestore
                                                                       │ eventos
Cloud Scheduler (a cada minuto) ──► Cloud Functions ◄──────────────────┘
                                         └── Admin SDK ──► Firestore
```

- O front fala direto com o Firestore. Não há API intermediária: as **Security Rules** decidem o que cada usuário pode ler e escrever.
- As **Cloud Functions** fazem o que o cliente não pode fazer: promover mensagens agendadas para "Enviada" e manter a integridade entre coleções (exclusões em cascata).
- Todas as listas usam `onSnapshot`, então a tela reflete as mudanças do banco sem recarregar.

## Requisitos do teste

| Requisito | Como foi atendido |
|---|---|
| Login e cadastro com Firebase Auth | `web/src/features/auth`; cada usuário é um cliente (`tenantId = uid`) |
| CRUD de conexões | `web/src/features/connections` |
| CRUD de contatos por conexão | `web/src/features/contacts` |
| Broadcast: selecionar contatos, escrever, enviar agora, agendar, visualizar, filtrar, editar e excluir | `web/src/features/messages` |
| Agendada vira "Enviada" no backend, com o app fechado | Function `dispatchScheduledMessages`, a cada minuto |
| SaaS multi-tenant e isolamento entre clientes | `tenantId` em todo documento + `firestore.rules` + testes em `web/tests/rules.test.ts` |
| Material UI + Tailwind CSS | MUI para componentes e tema; Tailwind para layout e estilo |
| Paradigma funcional | nenhuma classe; funções puras, hooks e componentes funcionais |
| Tempo real do Firestore | `onSnapshot` em todas as listas (`web/src/lib/firestore.ts`) |
| Vite | `web/` |
| Sem subcoleções | quatro coleções de topo, relacionadas por campo |
| `/functions` e `/web` | estrutura abaixo |
| Firebase Hosting | https://send-flow-test.web.app |

## Estrutura do projeto

```
/web                    Frontend (Vite)
  src/app                 providers, tema e rotas
  src/features            auth · connections · contacts · messages (api.ts → hooks.ts → componentes)
  src/shared              componentes, hooks, notificações e tipos compartilhados
  src/lib                 inicialização do Firebase e helpers do Firestore, datas e cores
  tests/                  testes das Security Rules
/functions              Cloud Functions
  src/messages            dispatchDueMessages (lógica) + scheduler (gatilho a cada minuto)
  src/cascade             gatilhos de exclusão e edição de conexões e contatos
  src/contacts            lógica dos gatilhos de contato
  src/models.ts           tipos e validação dos dados lidos do Firestore
  src/dev                 scheduler local para os emuladores (não vai para o deploy)
firestore.rules · firestore.indexes.json · firebase.json · .firebaserc
```

Cada feature segue a mesma receita: `api.ts` com funções de acesso ao Firestore (sem React), `hooks.ts` ligando a API ao React e as telas. O código de uma funcionalidade fica todo na pasta dela.

## Modelagem de dados

São quatro coleções de topo, sem subcoleções. Todo documento carrega o `tenantId`, o `uid` do cliente dono.

| Coleção | Campos |
|---|---|
| `connections` | `tenantId`, `name`, `createdAt`, `updatedAt` |
| `contacts` | `tenantId`, `connectionId`, `name`, `phone` (E.164, ex.: `+5511999998888`), `createdAt`, `updatedAt` |
| `messages` | `tenantId`, `connectionId`, `contactIds[]`, `recipients[]` (`{id, name, phone}`), `body`, `status` (`scheduled` \| `sent`), `scheduledAt`, `sentAt`, `createdAt`, `updatedAt` |
| `contactPhones` | id = `{connectionId}_{phone}` · `tenantId`, `contactId` |

- **`tenantId` em todo documento,** inclusive em contatos e mensagens, que já têm `connectionId`. Assim cada regra de acesso olha só o próprio documento, e toda consulta filtra direto por cliente.
- **Relações por campo:** `connectionId` e `contactIds` ligam os documentos. Cada consulta tem um índice composto em `firestore.indexes.json`.
- **Retrato dos destinatários (`recipients`):** a mensagem guarda nome e telefone de cada destinatário no momento do envio. O registro de uma mensagem enviada continua mostrando para quem ela foi, mesmo que o contato seja editado ou excluído depois. `contactIds` existe para as consultas (`array-contains`).
- **Telefone único por conexão (`contactPhones`):** o Firestore não tem `UNIQUE`. O id do documento-trava é a própria chave única, e o app grava o contato e a trava no mesmo batch atômico. Criar uma trava que já existe falha, e o batch inteiro falha junto.
- **Datas do servidor:** `createdAt`, `updatedAt` e `sentAt` usam `serverTimestamp()`, exigido pelas rules.

## Isolamento entre clientes

A garantia está nas **Security Rules** (`firestore.rules`), não no frontend:

- **Acesso:** ler, criar, editar e excluir só é permitido quando `tenantId == request.auth.uid`. Toda consulta do front filtra por `tenantId`, porque as rules não funcionam como filtro: uma consulta sem esse `where` é negada inteira.
- **Vínculo com a conexão:** contatos e mensagens só podem ser criados em uma conexão do mesmo cliente (`get()` na conexão).
- **Imutabilidade:** `tenantId` e `connectionId` não podem ser alterados, e cada update só aceita os campos editáveis (`diff().affectedKeys().hasOnly(...)`).
- **Schema:** conjunto exato de campos, tipos, tamanhos, formato do telefone e datas do servidor.
- **Status:** o cliente não consegue mudar `scheduled` para `sent`; só a Cloud Function faz isso.
- **Telefone único:** todo contato precisa ser dono da trava do seu telefone (`existsAfter`/`getAfter`).

Os testes em `web/tests/rules.test.ts` provam esses cenários com dois clientes no emulador.

## Mensagens e agendamento

- **Enviar agora** cria a mensagem já como `sent`, com `sentAt` do servidor. O envio é simulado.
- **Agendar** cria a mensagem como `scheduled`, com `scheduledAt` no futuro, validado no front e nas rules.
- **`dispatchScheduledMessages`** roda a cada minuto no Cloud Scheduler. Busca `status == 'scheduled' && scheduledAt <= agora` e marca como `sent`. As escritas usam precondição `lastUpdateTime`, então uma edição feita no mesmo instante não é sobrescrita, e o processo é idempotente.
- **"Enviando…":** entre o horário agendado e a próxima execução do scheduler (até 1 minuto), a tela mostra a mensagem como "Enviando…" em vez de "Agendada".
- **Filtro e paginação:** o filtro por status vai para a consulta, e a lista carrega 10 por vez com "Carregar mais" (`limit(pageSize + 1)`: o item extra indica se há próxima página). Os contadores usam agregação no servidor (`getCountFromServer`).
- **Exclusões em cascata:**
  - `onConnectionDeleted` apaga os contatos e as mensagens da conexão;
  - `onContactDeleted` libera a trava do telefone e tira o contato das mensagens **agendadas**; agendadas sem destinatários são apagadas, e as **enviadas** não mudam (o card mostra o contato como "excluído");
  - `onContactUpdated` atualiza nome e telefone nas mensagens agendadas; as enviadas mantêm o retrato original.

## Decisões técnicas

- **Firestore direto do cliente + Security Rules,** em vez de uma API própria. É o modelo recomendado do Firebase: tempo real nativo, menos infraestrutura e segurança garantida no servidor. Functions só onde o cliente não pode agir.
- **Firebase Auth nativo (e-mail/senha).** O Firebase faz o hash da senha (scrypt), garante e-mail único e integra com as rules via `request.auth.uid`. A senha forte é validada no front (Zod, com checklist ao vivo) e imposta pela **Password Policy** do Firebase Auth em modo *Enforce*, que não pode ser burlada pela API.
- **Validação em camadas:** o front valida para dar retorno rápido ao usuário; as rules e o Auth garantem. Toda regra importante existe no servidor.
- **Só mensagens agendadas são editáveis.** Uma mensagem enviada é um registro do que foi disparado; alterá-la depois falsearia o histórico. Enviadas podem ser excluídas.
- **Scheduler a cada minuto.** Simples, barato e suficiente para o caso. A precisão é de até 1 minuto, e a tela comunica isso com o estado "Enviando…".
- **Paradigma funcional e organização por feature.** Funções puras separadas das que acessam o banco, estado imutável e hooks reutilizáveis (`useSubscription` centraliza o tempo real).
- **Material UI + Tailwind CSS via camadas CSS (`@layer`).** O MUI fica na camada `mui`, antes dos utilitários do Tailwind, e as cores vêm de variáveis CSS únicas usadas pelos dois. Tema Everforest claro e escuro.
- **TypeScript estrito,** sem `any`. Nas Functions, os dados lidos do Firestore são validados em `models.ts` antes de serem usados.
- **Região `southamerica-east1`** para Firestore e Functions, perto dos usuários e exigida pelos gatilhos do Firestore, que rodam na região do banco. As Functions têm teto de 10 instâncias para controlar custo.

## Limitações conhecidas

- **Cliente = conta de usuário.** Para clientes com vários usuários, o modelo evolui sem migrar dados: uma coleção `tenants`, o `tenantId` no token por *custom claim* e as rules comparando com `request.auth.token.tenantId`. Só o helper `isOwner` muda.
- **Destinatários validados parcialmente nas rules.** As rules não têm laços, então não conferem cada `contactId`. O impacto fica restrito ao próprio cliente. Para fechar totalmente, uma Function montaria o retrato no servidor.
- **Status único por mensagem.** Num envio real, cada destinatário teria seu próprio status (enviado, entregue, falhou) em uma coleção `deliveries`.
- **Consistência eventual da cascata.** Por alguns segundos após excluir uma conexão, os contatos dela ainda existem, mas continuam isolados pelo `tenantId`.

## Rodando localmente

Pré-requisitos: **Node 22+** e **Java 21+** (usado pelo emulador do Firestore). Não é preciso ter credenciais nem projeto no Firebase: tudo roda nos emuladores, com o projeto fictício `demo-sendflow`.

```bash
npm run install:all     # instala as dependências da raiz, do web e das functions
npm run emulators       # emuladores + scheduler local (painel em http://127.0.0.1:4000)
npm run dev             # em outro terminal: frontend em http://localhost:5173
```

Abra **http://localhost:5173**. A porta 5000 é o emulador de Hosting, que serve o último build de `web/dist`.

O emulador não dispara funções `onSchedule`. Por isso o `npm run emulators` mantém rodando junto o `functions/src/dev/localScheduler.ts`, que executa a mesma lógica de produção (`dispatchDueMessages`) a cada minuto. Ctrl+C encerra tudo.

### Testes

```bash
npm --prefix web test               # unitários (regras de senha e telefone)
npm --prefix web run test:rules     # Security Rules (isolamento entre clientes)
npm --prefix functions test         # scheduler, retrato dos destinatários e trava do telefone
```

Os testes de rules e de Functions sobem o emulador do Firestore sozinhos (`firebase emulators:exec`).

## Deploy contínuo (GitHub Actions)

O workflow `.github/workflows/deploy.yml` publica o projeto automaticamente:

- **Pull request para a `main`:** roda lint, testes unitários, build, testes das Security Rules e testes das Functions (com o emulador do Firestore).
- **Push na `main`:** roda as mesmas verificações e, se todas passarem, executa `firebase deploy` (rules, índices, Functions e Hosting).
