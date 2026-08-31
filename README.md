# Grao & Origem SaaS

Plataforma SaaS white-label para marcas de cafe, torrefacoes, produtores e cafeterias venderem online com catalogo, conteudo, assinaturas e gestao operacional.

O storefront atual da Grao & Origem permanece como tenant inicial e referencia visual.

## Requisitos

- Docker Desktop
- Node.js, apenas se for executar fora do Docker

## Rodar com Docker

```bash
docker compose up --build
```

Servicos:

- Web: http://127.0.0.1:3000
- API: http://127.0.0.1:3333
- Healthcheck: http://127.0.0.1:3333/health
- Postgres: localhost:5433

## Banco e Prisma

O projeto usa Prisma 6 com PostgreSQL.

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

No Docker, a API usa:

```bash
DATABASE_URL="postgresql://grao_origem:grao_origem@db:5432/grao_origem"
```

Localmente, use:

```bash
DATABASE_URL="postgresql://grao_origem:grao_origem@localhost:5433/grao_origem"
```

## Rodar sem Docker

```bash
npm install
npm run dev:web
npm run dev:api
```

Em caminhos Windows com `&` no nome da pasta, `npm run` pode falhar pelo wrapper do `cmd`. Nesse caso, prefira Docker ou execute o binario diretamente.

## Produto

O plano de evolucao esta em [docs/saas-roadmap.md](docs/saas-roadmap.md).

O plano tecnico para frete com Melhor Envio e pagamentos/repasses com Asaas em sandbox esta em [docs/integracoes-frete-pagamentos-sandbox.md](docs/integracoes-frete-pagamentos-sandbox.md).

## Admin

O painel administrativo fica acessivel pelo botao `Admin` no menu da loja.

Credenciais iniciais do tenant `grao-origem`:

```txt
Usuario: grãoecafe
Senha: 123
```

Quando a API estiver ativa, o login usa `/api/auth/login` e salva um token local. Se a API estiver desligada, a tela usa um fallback local apenas para desenvolvimento.

Recursos atuais do admin:

- Dashboard com metricas do tenant.
- Produtos com criacao e edicao basica.
- Pedidos com listagem protegida.
- Configuracoes iniciais de loja/SaaS.

Endpoints protegidos atuais:

- `POST /api/auth/login`
- `GET /api/admin/overview`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PATCH /api/admin/products/:id`
- `GET /api/admin/orders`
- `GET /api/admin/seller-orders`

Endpoints públicos do checkout:

- `POST /api/shipping/quotes` — persiste opções de frete por produtor.
- `POST /api/orders` — cria pedido, subpedidos e envios usando somente cotações válidas.
- `POST /api/orders/:orderId/payment` — cria ou reutiliza cobrança Pix/cartão vinculada ao código do pedido.
- `POST /api/webhooks/asaas` — recebe eventos autenticados e idempotentes do Asaas.

O provedor de frete padrão é `mock`, determinístico e sem chamadas externas. Para homologar a cotação no Melhor Envio Sandbox, configure as credenciais no backend e altere `SHIPPING_PROVIDER` para `melhor_envio`.

O provedor de pagamento padrão também é `mock`. Ele gera Pix não pagável e permite homologar o webhook sem movimentação financeira. Para usar o Asaas Sandbox, configure `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN` e altere `PAYMENT_PROVIDER` para `asaas`. O cartão usa a página hospedada retornada em `invoiceUrl`; a loja não coleta número ou CVV.

Premissas principais:

- Mobile-first em todas as novas telas.
- Identidade visual atual preservada.
- Docker Compose como ponto central de desenvolvimento.
- Monolito modular no inicio, com API Node.js e PostgreSQL.
- Multi-tenant desde o schema inicial, usando `tenantId` e `tenant.slug`.
- Pedidos nascem em `PAYMENT_PENDING` e somente um webhook financeiro válido pode liberar os subpedidos.
