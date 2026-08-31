# Grao & Origem SaaS Roadmap

## Direcao do produto

Transformar a loja atual em uma plataforma SaaS white-label para marcas de cafe, torrefacoes, produtores e cafeterias venderem online com catalogo, conteudo, assinatura e gestao operacional.

O tenant inicial continua sendo a Grao & Origem. A identidade visual atual deve ser preservada como tema padrao: tons de cafe, creme, dourado organico e verde agricola.

Todas as novas telas devem ser mobile-first. O fluxo principal precisa funcionar bem primeiro em celulares: navegacao, catalogo, carrinho, checkout, login e painel administrativo. A experiencia desktop deve expandir a densidade e a visibilidade dos dados, sem depender de recursos que nao existam no mobile.

## Arquitetura inicial

- Frontend: React + Vite + Tailwind, mantendo a experiencia visual existente.
- API: Node.js + Express como monolito modular.
- Banco: PostgreSQL.
- Orquestracao local: Docker Compose centralizando `web`, `api` e `db`.
- ORM: Prisma 6 para schema, migrations, seed e acesso ao banco.

## Modulos do MVP

1. Loja publica dinamica
   - Home
   - Cafes tradicionais
   - Cafes especiais
   - Kits
   - Equipamentos
   - Clube de assinatura
   - Blog
   - Cafeicultores
   - Carrinho e checkout

2. Painel administrativo
   - Dashboard
   - Produtos
   - Pedidos
   - Clientes
   - Assinaturas
   - Conteudo
   - Configuracoes da loja

3. Multi-tenant
   - Tenant por marca
   - Tema por tenant
   - Catalogo separado por tenant
   - Pedidos e clientes isolados por tenant
   - API resolvendo tenant por `?tenant=slug` ou header `x-tenant-slug`

4. Comercial SaaS
   - Planos
   - Trial
   - Limites por plano
   - Status de cobranca
   - Pagamento do SaaS inicialmente pendente/manual

5. Operacao
   - Status dos pedidos
   - Estoque basico
   - Frete configuravel
   - Cupons
   - Metodo de pagamento de pedidos fica pendente ate escolher Mercado Pago, Pagar.me ou outro provedor

## Entidades principais

- Tenant
- User
- Customer
- Product
- CoffeeProfile
- EquipmentProfile
- Kit
- Producer
- BlogPost
- Cart
- Order
- OrderItem
- Payment
- Subscription
- SaaSPlan
- Coupon
- ThemeSettings

## Fases

### Fase 1: Fundacao

- Centralizar execucao com Docker.
- Criar API base com healthcheck.
- Documentar modulos e entidades.
- Preparar variaveis de ambiente.

### Fase 2: Dados dinamicos

- Criar schema do banco.
- Migrar dados estaticos de `src/data` para seed.
- Conectar storefront aos endpoints reais.

### Fase 3: Painel

- Criar layout administrativo usando a identidade visual atual.
- CRUD de catalogo.
- Listagem e detalhe de pedidos.
- Cadastro de produtores e posts.

### Fase 4: SaaS real

- Login e permissoes.
- Multi-tenant por subdominio/domino.
- Planos e billing.
- Pagamentos de pedidos.
- Assinaturas recorrentes.

## Decisoes iniciais

- Comecar com monolito modular, nao microservices.
- Manter Docker Compose como ponto unico de execucao local.
- Preservar o frontend atual enquanto a fonte de dados e migrada aos poucos.
- Construir novas interfaces mobile-first, mantendo controles confortaveis para toque e evitando tabelas largas como experiencia primaria.
- Usar Prisma 6 com PostgreSQL.
- Modelar pagamentos agora, mas manter provider/status como pendentes ate a integracao ser definida.
- Fazer multi-tenant desde a primeira migration para evitar retrabalho de isolamento depois.
- Adiar complexidade de filas, cache distribuido e microservices ate haver necessidade real.
