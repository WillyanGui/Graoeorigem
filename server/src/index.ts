import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import { Prisma, ProductType } from '@prisma/client';
import { prisma } from './db';
import { serializeProduct } from './serializers';
import { getTenantSlugFromRequest, resolveTenant } from './tenant';
import { loginHandler, requireAuth } from './auth';
import { groupOrderItemsByProducer } from './modules/orders/group-order-items';
import { calculateSellerPayable, sumCents } from './modules/shared/money';
import { createShippingProvider } from './modules/shipping/providers/shipping-provider.factory';
import { createShippingQuotes, shippingQuoteItemsHash } from './modules/shipping/shipping-quote.service';
import { createPaymentProvider } from './modules/payments/providers/payment-provider.factory';
import { createOrderPayment, processAsaasWebhook } from './modules/payments/payment.service';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3333);
const shippingProvider = createShippingProvider();
const paymentProvider = createPaymentProvider();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL ?? 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

const asyncHandler =
  (handler: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'grao-origem-api',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/auth/login', asyncHandler(loginHandler));

app.get('/api/tenant/current', asyncHandler(async (req, res) => {
  const tenant = await resolveTenant(getTenantSlugFromRequest(req));

  res.json({
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    displayName: tenant.displayName,
    segment: tenant.segment,
    status: tenant.status,
    theme: {
      primary: tenant.themeSettings?.primaryColor ?? '#24130E',
      accent: tenant.themeSettings?.accentColor ?? '#C5A059',
      background: tenant.themeSettings?.backgroundColor ?? '#FCFAF7',
      surface: tenant.themeSettings?.surfaceColor ?? '#FAF6F0',
    },
    saasSubscription: tenant.saasSubscription
      ? {
          status: tenant.saasSubscription.status,
          paymentStatus: tenant.saasSubscription.paymentStatus,
          plan: {
            slug: tenant.saasSubscription.plan.slug,
            name: tenant.saasSubscription.plan.name,
            priceCents: tenant.saasSubscription.plan.priceCents,
          },
        }
      : null,
    modules: [
      'storefront',
      'catalog',
      'orders',
      'shipping',
      'payments',
      'subscriptions',
      'producers',
      'content',
      'analytics',
    ],
  });
}));

app.get('/api/modules', (_req, res) => {
  res.json([
    {
      id: 'storefront',
      name: 'Loja publica',
      status: 'existing',
      description: 'Experiencia atual da marca, catalogo, carrinho e checkout.',
    },
    {
      id: 'admin',
      name: 'Painel administrativo',
      status: 'planned',
      description: 'Gestao de produtos, pedidos, clientes, conteudo e configuracoes.',
    },
    {
      id: 'billing',
      name: 'Assinatura SaaS',
      status: 'planned',
      description: 'Planos, trial, cobranca recorrente e limites por tenant.',
    },
    {
      id: 'shipping',
      name: 'Frete e logistica',
      status: 'foundation',
      description: 'Dominio multi-produtor preparado para a integracao com Melhor Envio.',
    },
    {
      id: 'payments',
      name: 'Pagamentos e repasses',
      status: 'foundation',
      description: 'Subpedidos e recebiveis preparados para a integracao com Asaas.',
    },
    {
      id: 'analytics',
      name: 'Relatorios',
      status: 'planned',
      description: 'Receita, conversao, produtos mais vendidos e assinaturas ativas.',
    },
  ]);
});

app.get('/api/catalog/products', asyncHandler(async (req, res) => {
  const tenant = await resolveTenant(getTenantSlugFromRequest(req));
  const type = typeof req.query.type === 'string' ? req.query.type.toUpperCase() : undefined;

  const products = await prisma.product.findMany({
    where: {
      tenantId: tenant.id,
      status: 'ACTIVE',
      ...(type && type in ProductType ? { type: type as ProductType } : {}),
    },
    include: {
      coffeeProfile: true,
      equipmentProfile: true,
      kitProfile: true,
    },
    orderBy: [{ type: 'asc' }, { legacyId: 'asc' }, { createdAt: 'asc' }],
  });

  res.json(products.map(serializeProduct));
}));

app.get('/api/catalog/coffees', asyncHandler(async (req, res) => {
  const tenant = await resolveTenant(getTenantSlugFromRequest(req));
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;

  const products = await prisma.product.findMany({
    where: {
      tenantId: tenant.id,
      type: 'COFFEE',
      status: 'ACTIVE',
      coffeeProfile:
        category === 'especial'
          ? { category: 'SPECIALTY' }
          : category === 'tradicional'
            ? { category: 'TRADITIONAL' }
            : undefined,
    },
    include: {
      coffeeProfile: true,
    },
    orderBy: [{ legacyId: 'asc' }, { createdAt: 'asc' }],
  });

  res.json(products.map(serializeProduct));
}));

app.get('/api/catalog/equipments', asyncHandler(async (req, res) => {
  const tenant = await resolveTenant(getTenantSlugFromRequest(req));

  const products = await prisma.product.findMany({
    where: {
      tenantId: tenant.id,
      type: 'EQUIPMENT',
      status: 'ACTIVE',
    },
    include: {
      equipmentProfile: true,
    },
    orderBy: [{ legacyId: 'asc' }, { createdAt: 'asc' }],
  });

  res.json(products.map(serializeProduct));
}));

app.get('/api/catalog/kits', asyncHandler(async (req, res) => {
  const tenant = await resolveTenant(getTenantSlugFromRequest(req));

  const products = await prisma.product.findMany({
    where: {
      tenantId: tenant.id,
      type: 'KIT',
      status: 'ACTIVE',
    },
    include: {
      kitProfile: true,
    },
    orderBy: [{ legacyId: 'asc' }, { createdAt: 'asc' }],
  });

  res.json(products.map(serializeProduct));
}));

app.get('/api/producers', asyncHandler(async (req, res) => {
  const tenant = await resolveTenant(getTenantSlugFromRequest(req));

  const producers = await prisma.producer.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ legacyId: 'asc' }, { createdAt: 'asc' }],
  });

  res.json(producers);
}));

app.get('/api/blog/posts', asyncHandler(async (req, res) => {
  const tenant = await resolveTenant(getTenantSlugFromRequest(req));

  const posts = await prisma.blogPost.findMany({
    where: {
      tenantId: tenant.id,
      published: true,
    },
    orderBy: [{ legacyId: 'asc' }, { createdAt: 'desc' }],
  });

  res.json(posts);
}));

app.post('/api/shipping/quotes', asyncHandler(async (req, res) => {
  const tenant = await resolveTenant(getTenantSlugFromRequest(req));
  const result = await createShippingQuotes(prisma, shippingProvider, tenant.id, {
    destinationPostalCode: String(req.body.destinationPostalCode ?? ''),
    items: Array.isArray(req.body.items) ? req.body.items : [],
  });

  res.status(201).json(result);
}));

app.get('/api/admin/overview', requireAuth, asyncHandler(async (req, res) => {
  const resolvedTenant = await resolveTenant(getTenantSlugFromRequest(req));
  const tenant = await prisma.tenant.findUnique({
    where: { id: resolvedTenant.id },
    include: { themeSettings: true },
  });

  if (!tenant) {
    res.status(404).json({ error: 'Tenant not found.' });
    return;
  }

  const [products, customers, orders, subscriptions] = await Promise.all([
    prisma.product.count({ where: { tenantId: tenant.id } }),
    prisma.customer.count({ where: { tenantId: tenant.id } }),
    prisma.order.count({ where: { tenantId: tenant.id } }),
    prisma.customerSubscription.count({ where: { tenantId: tenant.id } }),
  ]);

  res.json({
    tenant: {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.displayName,
      segment: tenant.segment,
      status: tenant.status,
      themeSettings: tenant.themeSettings,
    },
    metrics: {
      products,
      customers,
      orders,
      subscriptions,
    },
    paymentProvider: {
      status: 'pending',
      provider: 'PENDING',
      message: 'Metodo de pagamento ainda nao configurado.',
    },
  });
}));

app.get('/api/admin/products', requireAuth, asyncHandler(async (req, res) => {
  const tenant = await resolveTenant(getTenantSlugFromRequest(req));

  const products = await prisma.product.findMany({
    where: {
      tenantId: tenant.id,
    },
    include: {
      coffeeProfile: true,
      equipmentProfile: true,
      kitProfile: true,
    },
    orderBy: [{ updatedAt: 'desc' }],
  });

  res.json(products.map(serializeProduct));
}));

app.post('/api/admin/products', requireAuth, asyncHandler(async (req, res) => {
  const tenant = await resolveTenant(getTenantSlugFromRequest(req));
  const name = String(req.body.name ?? '').trim();
  const type = String(req.body.type ?? 'COFFEE').toUpperCase();

  if (!name) {
    res.status(400).json({ error: 'Nome do produto e obrigatorio.' });
    return;
  }

  if (!(type in ProductType)) {
    res.status(400).json({ error: 'Tipo de produto invalido.' });
    return;
  }

  const baseSlug = slugify(name);
  const slug = `${baseSlug}-${Date.now()}`;
  const priceCents = Math.max(0, Math.round(Number(req.body.price ?? 0) * 100));

  const product = await prisma.product.create({
    data: {
      tenantId: tenant.id,
      type: type as ProductType,
      status: req.body.status === 'DRAFT' || req.body.status === 'ARCHIVED' ? req.body.status : 'ACTIVE',
      name,
      slug,
      description: String(req.body.description ?? ''),
      descriptionLong: String(req.body.descriptionLong ?? req.body.description ?? ''),
      priceCents,
      image: String(req.body.image ?? 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600'),
      stockQuantity: Math.max(0, Number(req.body.stockQuantity ?? 0)),
      ...(type === 'COFFEE'
        ? {
            coffeeProfile: {
              create: {
                tenantId: tenant.id,
                category: req.body.category === 'especial' ? 'SPECIALTY' : 'TRADITIONAL',
                aroma: String(req.body.aroma ?? 'Aroma a definir'),
                flavor: String(req.body.sabor ?? 'Sabor a definir'),
                acidity: String(req.body.acidez ?? 'Acidez a definir'),
                body: String(req.body.corpo ?? 'Corpo a definir'),
                notes: Array.isArray(req.body.notasMarcantes) ? req.body.notasMarcantes : [],
                producerName: String(req.body.produtor ?? 'Produtor a definir'),
                farm: String(req.body.fazenda ?? 'Fazenda a definir'),
                harvest: String(req.body.safra ?? 'Safra a definir'),
                location: String(req.body.localizacao ?? 'Localizacao a definir'),
                process: String(req.body.processo ?? 'Processo a definir'),
                variety: String(req.body.variedade ?? 'Variedade a definir'),
                altitude: String(req.body.altitude ?? 'Altitude a definir'),
                sommelierComment: String(req.body.sommelierComment ?? 'Comentario a definir'),
                farmImages: Array.isArray(req.body.imagesLavoura) ? req.body.imagesLavoura : [],
              },
            },
          }
        : {}),
      ...(type === 'EQUIPMENT'
        ? {
            equipmentProfile: {
              create: {
                tenantId: tenant.id,
                specs: Array.isArray(req.body.specs) ? req.body.specs : [],
                objective: String(req.body.objective ?? 'Objetivo a definir'),
                howToUse: String(req.body.howToUse ?? 'Modo de uso a definir'),
              },
            },
          }
        : {}),
      ...(type === 'KIT'
        ? {
            kitProfile: {
              create: {
                tenantId: tenant.id,
                itemsIncluded: Array.isArray(req.body.itemsIncluded) ? req.body.itemsIncluded : [],
                objective: String(req.body.objective ?? 'Objetivo a definir'),
                howToUse: String(req.body.howToUse ?? 'Modo de uso a definir'),
              },
            },
          }
        : {}),
    },
    include: {
      coffeeProfile: true,
      equipmentProfile: true,
      kitProfile: true,
    },
  });

  res.status(201).json(serializeProduct(product));
}));

app.patch('/api/admin/products/:id', requireAuth, asyncHandler(async (req, res) => {
  const tenant = await resolveTenant(getTenantSlugFromRequest(req));
  const product = await prisma.product.findFirst({
    where: {
      id: req.params.id,
      tenantId: tenant.id,
    },
  });

  if (!product) {
    res.status(404).json({ error: 'Produto nao encontrado.' });
    return;
  }

  const updated = await prisma.product.update({
    where: {
      id: product.id,
    },
    data: {
      ...(typeof req.body.name === 'string' && req.body.name.trim() ? { name: req.body.name.trim() } : {}),
      ...(typeof req.body.description === 'string' ? { description: req.body.description } : {}),
      ...(typeof req.body.descriptionLong === 'string' ? { descriptionLong: req.body.descriptionLong } : {}),
      ...(typeof req.body.image === 'string' ? { image: req.body.image } : {}),
      ...(typeof req.body.price === 'number' ? { priceCents: Math.max(0, Math.round(req.body.price * 100)) } : {}),
      ...(typeof req.body.stockQuantity === 'number' ? { stockQuantity: Math.max(0, req.body.stockQuantity) } : {}),
      ...(req.body.status === 'ACTIVE' || req.body.status === 'DRAFT' || req.body.status === 'ARCHIVED'
        ? { status: req.body.status }
        : {}),
      ...(product.type === 'COFFEE'
        ? {
            coffeeProfile: {
              update: {
                ...(req.body.category === 'especial' || req.body.category === 'SPECIALTY'
                  ? { category: 'SPECIALTY' }
                  : req.body.category === 'tradicional' || req.body.category === 'TRADITIONAL'
                    ? { category: 'TRADITIONAL' }
                    : {}),
                ...(typeof req.body.aroma === 'string' ? { aroma: req.body.aroma } : {}),
                ...(typeof req.body.sabor === 'string' ? { flavor: req.body.sabor } : {}),
                ...(typeof req.body.acidez === 'string' ? { acidity: req.body.acidez } : {}),
                ...(typeof req.body.corpo === 'string' ? { body: req.body.corpo } : {}),
                ...(Array.isArray(req.body.notasMarcantes) ? { notes: req.body.notasMarcantes } : {}),
                ...(typeof req.body.produtor === 'string' ? { producerName: req.body.produtor } : {}),
                ...(typeof req.body.fazenda === 'string' ? { farm: req.body.fazenda } : {}),
                ...(typeof req.body.safra === 'string' ? { harvest: req.body.safra } : {}),
                ...(typeof req.body.localizacao === 'string' ? { location: req.body.localizacao } : {}),
                ...(typeof req.body.processo === 'string' ? { process: req.body.processo } : {}),
                ...(typeof req.body.variedade === 'string' ? { variety: req.body.variedade } : {}),
                ...(typeof req.body.altitude === 'string' ? { altitude: req.body.altitude } : {}),
                ...(typeof req.body.pontuacao === 'number' ? { score: req.body.pontuacao } : {}),
                ...(typeof req.body.sommelierComment === 'string' ? { sommelierComment: req.body.sommelierComment } : {}),
              },
            },
          }
        : {}),
      ...(product.type === 'EQUIPMENT'
        ? {
            equipmentProfile: {
              update: {
                ...(Array.isArray(req.body.specs) ? { specs: req.body.specs } : {}),
                ...(typeof req.body.objective === 'string' ? { objective: req.body.objective } : {}),
                ...(typeof req.body.howToUse === 'string' ? { howToUse: req.body.howToUse } : {}),
              },
            },
          }
        : {}),
      ...(product.type === 'KIT'
        ? {
            kitProfile: {
              update: {
                ...(Array.isArray(req.body.itemsIncluded) ? { itemsIncluded: req.body.itemsIncluded } : {}),
                ...(typeof req.body.objective === 'string' ? { objective: req.body.objective } : {}),
                ...(typeof req.body.howToUse === 'string' ? { howToUse: req.body.howToUse } : {}),
              },
            },
          }
        : {}),
    },
    include: {
      coffeeProfile: true,
      equipmentProfile: true,
      kitProfile: true,
    },
  });

  res.json(serializeProduct(updated));
}));

app.get('/api/admin/orders', requireAuth, asyncHandler(async (req, res) => {
  const tenant = await resolveTenant(getTenantSlugFromRequest(req));

  const orders = await prisma.order.findMany({
    where: {
      tenantId: tenant.id,
    },
    include: {
      customer: true,
      items: true,
      payments: true,
      sellerOrders: {
        include: {
          producer: true,
          items: true,
          shipments: true,
          sellerPayable: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });

  res.json(orders);
}));

app.patch('/api/admin/orders/:id', requireAuth, asyncHandler(async (req, res) => {
  const tenant = await resolveTenant(getTenantSlugFromRequest(req));
  const allowedStatuses = [
    'PAYMENT_PENDING',
    'PAID',
    'FULFILLMENT_PENDING',
    'SHIPPED',
    'DELIVERED',
    'CANCELED',
  ];

  if (!allowedStatuses.includes(req.body.status)) {
    res.status(400).json({ error: 'Status de pedido invalido.' });
    return;
  }

  const existingOrder = await prisma.order.findFirst({
    where: {
      id: req.params.id,
      tenantId: tenant.id,
    },
  });

  if (!existingOrder) {
    res.status(404).json({ error: 'Pedido nao encontrado.' });
    return;
  }

  const updatedOrder = await prisma.order.update({
    where: { id: existingOrder.id },
    data: {
      status: req.body.status,
    },
    include: {
      customer: true,
      items: true,
      payments: true,
    },
  });

  res.json(updatedOrder);
}));

app.get('/api/admin/customers', requireAuth, asyncHandler(async (req, res) => {
  const tenant = await resolveTenant(getTenantSlugFromRequest(req));

  const customers = await prisma.customer.findMany({
    where: {
      tenantId: tenant.id,
    },
    include: {
      orders: {
        select: {
          id: true,
          totalCents: true,
          createdAt: true,
          status: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  res.json(customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    document: customer.document,
    createdAt: customer.createdAt,
    orderCount: customer.orders.length,
    totalSpentCents: customer.orders.reduce((sum, order) => sum + order.totalCents, 0),
    lastOrderAt: customer.orders[0]?.createdAt ?? null,
    lastOrderStatus: customer.orders[0]?.status ?? null,
  })));
}));

app.patch('/api/admin/tenant/settings', requireAuth, asyncHandler(async (req, res) => {
  const tenant = await resolveTenant(getTenantSlugFromRequest(req));

  const updatedTenant = await prisma.tenant.update({
    where: {
      id: tenant.id,
    },
    data: {
      ...(typeof req.body.displayName === 'string' && req.body.displayName.trim()
        ? { displayName: req.body.displayName.trim(), name: req.body.displayName.trim() }
        : {}),
      ...(typeof req.body.segment === 'string' ? { segment: req.body.segment } : {}),
      ...(req.body.status === 'TRIAL' || req.body.status === 'ACTIVE' || req.body.status === 'SUSPENDED'
        ? { status: req.body.status }
        : {}),
      themeSettings: {
        upsert: {
          create: {
            primaryColor: String(req.body.primaryColor ?? '#24130E'),
            accentColor: String(req.body.accentColor ?? '#C5A059'),
            backgroundColor: String(req.body.backgroundColor ?? '#FCFAF7'),
            surfaceColor: String(req.body.surfaceColor ?? '#FAF6F0'),
            logoUrl: req.body.logoUrl ? String(req.body.logoUrl) : null,
          },
          update: {
            ...(typeof req.body.primaryColor === 'string' ? { primaryColor: req.body.primaryColor } : {}),
            ...(typeof req.body.accentColor === 'string' ? { accentColor: req.body.accentColor } : {}),
            ...(typeof req.body.backgroundColor === 'string' ? { backgroundColor: req.body.backgroundColor } : {}),
            ...(typeof req.body.surfaceColor === 'string' ? { surfaceColor: req.body.surfaceColor } : {}),
            ...(typeof req.body.logoUrl === 'string' ? { logoUrl: req.body.logoUrl || null } : {}),
          },
        },
      },
    },
    include: {
      themeSettings: true,
    },
  });

  res.json(updatedTenant);
}));

app.post('/api/orders', asyncHandler(async (req, res) => {
  const tenant = await resolveTenant(getTenantSlugFromRequest(req));
  const items = Array.isArray(req.body.items) ? req.body.items : [];

  const productIds = items
    .map((item) => item.productId)
    .filter((productId): productId is string => typeof productId === 'string' && productId.length > 0);
  const products = await prisma.product.findMany({
    where: {
      tenantId: tenant.id,
      id: { in: productIds },
      status: 'ACTIVE',
    },
  });

  const productById = new Map(products.map((product) => [product.id, product]));
  const sellerGroups = groupOrderItemsByProducer(items, productById);
  const subtotalCents = sumCents(sellerGroups.map((group) => group.subtotalCents));
  const shippingAddress = req.body.shippingAddress && typeof req.body.shippingAddress === 'object'
    ? req.body.shippingAddress as Record<string, unknown>
    : {};
  const destinationPostalCode = String(shippingAddress.postalCode ?? shippingAddress.cep ?? '').replace(/\D/g, '');
  const quoteSelections = Array.isArray(req.body.shippingQuoteSelections) ? req.body.shippingQuoteSelections : [];
  const selectedQuoteIds = quoteSelections
    .map((selection) => selection?.quoteId)
    .filter((quoteId): quoteId is string => typeof quoteId === 'string' && quoteId.length > 0);

  if (destinationPostalCode.length !== 8 || selectedQuoteIds.length !== sellerGroups.length) {
    throw Object.assign(new Error('A valid shipping quote is required for every producer.'), { statusCode: 400 });
  }

  const selectedQuotes = await prisma.shippingQuote.findMany({
    where: {
      id: { in: selectedQuoteIds },
      tenantId: tenant.id,
      expiresAt: { gt: new Date() },
      sellerOrderId: null,
    },
  });
  const selectedQuoteByProducer = new Map(selectedQuotes.map((quote) => [quote.producerId, quote]));

  for (const group of sellerGroups) {
    const selectedQuote = selectedQuoteByProducer.get(group.producerId);
    const expectedItemsHash = shippingQuoteItemsHash(destinationPostalCode, group.producerId, group.items);
    if (
      !selectedQuote ||
      selectedQuote.destinationPostalCode !== destinationPostalCode ||
      selectedQuote.itemsHash !== expectedItemsHash
    ) {
      throw Object.assign(new Error(`Shipping quote is invalid or expired for producer: ${group.producerId}`), { statusCode: 400 });
    }
  }

  const shippingCents = sumCents(selectedQuotes.map((quote) => quote.priceCents));
  // Coupons will be validated and calculated on the server in a later cut.
  const discountCents = 0;
  const totalCents = Math.max(0, subtotalCents + shippingCents - discountCents);
  const customerInput = req.body.customer && typeof req.body.customer === 'object' ? req.body.customer : null;
  const customerName = customerInput?.name ? String(customerInput.name).trim() : '';
  const customerEmail = customerInput?.email ? String(customerInput.email).trim() : '';
  const customerPhone = customerInput?.phone ? String(customerInput.phone).trim() : '';
  const customerDocument = customerInput?.document ? String(customerInput.document).trim() : '';
  let customerId: string | undefined;

  if (customerName || customerEmail || customerPhone) {
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        tenantId: tenant.id,
        OR: [
          ...(customerEmail ? [{ email: customerEmail }] : []),
          ...(customerPhone ? [{ phone: customerPhone }] : []),
        ],
      },
    });

    const customer = existingCustomer
      ? await prisma.customer.update({
          where: { id: existingCustomer.id },
          data: {
            name: customerName || existingCustomer.name,
            email: customerEmail || existingCustomer.email,
            phone: customerPhone || existingCustomer.phone,
            document: customerDocument || existingCustomer.document,
          },
        })
      : await prisma.customer.create({
          data: {
            tenantId: tenant.id,
            name: customerName || 'Cliente sem nome',
            email: customerEmail || null,
            phone: customerPhone || null,
            document: customerDocument || null,
          },
        });

    customerId = customer.id;
  }

  const orderCode = `GO-${Date.now()}`;
  const commissionBasisPoints = Number(process.env.PLATFORM_COMMISSION_BPS ?? 0);

  const order = await prisma.$transaction(async (transaction) => {
    const createdOrder = await transaction.order.create({
      data: {
        tenantId: tenant.id,
        customerId,
        code: orderCode,
        status: 'PAYMENT_PENDING',
        subtotalCents,
        shippingCents,
        discountCents,
        totalCents,
        notes: req.body.notes,
        shippingAddress: req.body.shippingAddress,
      },
    });

    await transaction.payment.create({
      data: {
        tenantId: tenant.id,
        orderId: createdOrder.id,
        provider: 'PENDING',
        status: 'PENDING',
        amountCents: totalCents,
        metadata: {
          reason: 'Integracao Asaas ainda nao ativada.',
        },
      },
    });

    for (const [groupIndex, group] of sellerGroups.entries()) {
      const sellerOrder = await transaction.sellerOrder.create({
        data: {
          tenantId: tenant.id,
          orderId: createdOrder.id,
          producerId: group.producerId,
          code: `${orderCode}-${String(groupIndex + 1).padStart(2, '0')}`,
          subtotalCents: group.subtotalCents,
          shippingCents: selectedQuoteByProducer.get(group.producerId)!.priceCents,
          totalCents: group.subtotalCents + selectedQuoteByProducer.get(group.producerId)!.priceCents,
        },
      });

      const selectedQuote = selectedQuoteByProducer.get(group.producerId)!;
      await transaction.shippingQuote.update({
        where: { id: selectedQuote.id },
        data: { sellerOrderId: sellerOrder.id },
      });
      await transaction.shipment.create({
        data: {
          tenantId: tenant.id,
          sellerOrderId: sellerOrder.id,
          quoteId: selectedQuote.id,
          quotedCostCents: selectedQuote.priceCents,
          status: 'QUOTED',
        },
      });

      await transaction.orderItem.createMany({
        data: group.items.map((item) => ({
          orderId: createdOrder.id,
          sellerOrderId: sellerOrder.id,
          productId: item.productId,
          name: item.name,
          productType: item.productType as ProductType,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          totalCents: item.totalCents,
          metadata: item.metadata as Prisma.InputJsonValue | undefined,
        })),
      });

      const payable = calculateSellerPayable({
        productSubtotalCents: group.subtotalCents,
        commissionBasisPoints,
      });

      await transaction.sellerPayable.create({
        data: {
          tenantId: tenant.id,
          sellerOrderId: sellerOrder.id,
          producerId: group.producerId,
          ...payable,
        },
      });
    }

    return transaction.order.findUniqueOrThrow({
      where: { id: createdOrder.id },
      include: {
        customer: true,
        items: true,
        payments: true,
        sellerOrders: {
          include: {
            producer: true,
            items: true,
            sellerPayable: true,
            shipments: true,
          },
        },
      },
    });
  });

  res.status(201).json(order);
}));

app.post('/api/orders/:orderId/payment', asyncHandler(async (req, res) => {
  const tenant = await resolveTenant(getTenantSlugFromRequest(req));
  const billingType = String(req.body.billingType ?? '').toUpperCase();
  if (billingType !== 'PIX' && billingType !== 'CREDIT_CARD') {
    res.status(400).json({ error: 'Forma de pagamento invalida. Use PIX ou CREDIT_CARD.' });
    return;
  }
  const orderCode = String(req.body.orderCode ?? '').trim();
  if (!orderCode) {
    res.status(400).json({ error: 'Codigo do pedido obrigatorio.' });
    return;
  }

  const payment = await createOrderPayment(
    prisma,
    paymentProvider,
    tenant.id,
    req.params.orderId,
    orderCode,
    billingType,
  );
  res.status(201).json(payment);
}));

app.post('/api/webhooks/asaas', asyncHandler(async (req, res) => {
  const result = await processAsaasWebhook(prisma, paymentProvider, req.headers, req.body);
  // Asaas currently treats HTTP 200 as the successful acknowledgement for webhooks.
  res.status(200).json(result);
}));

app.get('/api/admin/seller-orders', requireAuth, asyncHandler(async (req, res) => {
  const tenant = await resolveTenant(getTenantSlugFromRequest(req));

  const sellerOrders = await prisma.sellerOrder.findMany({
    where: { tenantId: tenant.id },
    include: {
      order: {
        include: { customer: true },
      },
      producer: true,
      items: true,
      shipments: true,
      sellerPayable: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  res.json(sellerOrders);
}));

app.use((error: Error & { statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = error.statusCode ?? 500;
  res.status(statusCode).json({
    error: error.message,
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Grao & Origem API listening on port ${port}`);
});
