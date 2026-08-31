import { PrismaClient, ProductType } from '@prisma/client';
import { blogData } from '../src/data/blog';
import { cafeicultoresData } from '../src/data/cafeicultores';
import { coffeesData } from '../src/data/coffees';
import { equipmentsData } from '../src/data/equipments';
import { kitsData } from '../src/data/kits';
import { hashPassword } from '../server/src/security';

const prisma = new PrismaClient();

const toCents = (value: number) => Math.round(value * 100);

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

async function main() {
  const starterPlan = await prisma.saaSPlan.upsert({
    where: { slug: 'starter' },
    update: {},
    create: {
      slug: 'starter',
      name: 'Starter',
      description: 'Plano inicial para validar uma loja de cafe online.',
      priceCents: 9900,
      productLimit: 50,
      orderLimit: 300,
      userLimit: 2,
      features: ['Loja publica', 'Catalogo', 'Pedidos', 'Clientes', 'Tema basico'],
    },
  });

  await prisma.saaSPlan.upsert({
    where: { slug: 'growth' },
    update: {},
    create: {
      slug: 'growth',
      name: 'Growth',
      description: 'Plano para marcas com assinaturas, conteudo e operacao recorrente.',
      priceCents: 19900,
      productLimit: 250,
      orderLimit: 2000,
      userLimit: 6,
      features: ['Assinaturas', 'Cupons', 'Blog', 'Relatorios', 'Multiusuario'],
    },
  });

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'grao-origem' },
    update: {
      name: 'Grao & Origem',
      displayName: 'Grao & Origem',
      segment: 'cafes-especiais',
    },
    create: {
      slug: 'grao-origem',
      name: 'Grao & Origem',
      displayName: 'Grao & Origem',
      segment: 'cafes-especiais',
      themeSettings: {
        create: {
          primaryColor: '#24130E',
          accentColor: '#C5A059',
          backgroundColor: '#FCFAF7',
          surfaceColor: '#FAF6F0',
        },
      },
      users: {
        create: {
          name: 'Administrador',
          username: 'grãoecafe',
          email: 'admin@grao-origem.local',
          role: 'OWNER',
          passwordHash: hashPassword('123', 'grao-origem-admin-seed'),
        },
      },
      saasSubscription: {
        create: {
          planId: starterPlan.id,
          status: 'PAYMENT_PENDING',
          paymentStatus: 'PENDING',
        },
      },
    },
  });

  await prisma.user.upsert({
    where: {
      tenantId_username: {
        tenantId: tenant.id,
        username: 'grãoecafe',
      },
    },
    update: {
      name: 'Administrador',
      email: 'admin@grao-origem.local',
      role: 'OWNER',
      passwordHash: hashPassword('123', 'grao-origem-admin-seed'),
    },
    create: {
      tenantId: tenant.id,
      name: 'Administrador',
      username: 'grãoecafe',
      email: 'admin@grao-origem.local',
      role: 'OWNER',
      passwordHash: hashPassword('123', 'grao-origem-admin-seed'),
    },
  });

  const producerSeeds = new Map(
    cafeicultoresData.map((producer) => [producer.name, producer] as const),
  );

  for (const coffee of coffeesData) {
    if (!producerSeeds.has(coffee.produtor)) {
      producerSeeds.set(coffee.produtor, {
        id: 100 + coffee.id,
        name: coffee.produtor,
        location: coffee.localizacao,
        farm: coffee.fazenda,
        specialty: `Cafe ${coffee.category} - ${coffee.variedade}`,
        history: 'Perfil inicial criado a partir do catalogo. Dados operacionais devem ser validados antes da producao.',
        image: coffee.image,
      });
    }
  }

  producerSeeds.set('Operacao Grao & Origem', {
    id: 999,
    name: 'Operacao Grao & Origem',
    location: 'Caratinga, MG',
    farm: 'Ponto de apoio operacional',
    specialty: 'Kits e equipamentos',
    history: 'Perfil interno usado no sandbox para itens operados diretamente pela plataforma.',
    image: equipmentsData[0]?.image ?? coffeesData[0].image,
  });

  const producerByName = new Map<string, { id: string }>();

  for (const producer of producerSeeds.values()) {
    const record = await prisma.producer.upsert({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: producer.name,
        },
      },
      update: {
        location: producer.location,
        farm: producer.farm,
        specialty: producer.specialty,
        history: producer.history,
        image: producer.image,
      },
      create: {
        tenantId: tenant.id,
        legacyId: producer.id,
        name: producer.name,
        location: producer.location,
        farm: producer.farm,
        specialty: producer.specialty,
        history: producer.history,
        image: producer.image,
      },
    });

    producerByName.set(record.name, record);

    await prisma.producerLogisticsProfile.upsert({
      where: { producerId: record.id },
      update: {},
      create: {
        tenantId: tenant.id,
        producerId: record.id,
        postalCode: '35300000',
        state: 'MG',
        city: 'Caratinga',
        district: 'Centro',
        street: 'Endereco de sandbox a validar',
        number: 'S/N',
        postingDays: [2, 5],
        cutoffTime: '12:00',
        preparationDays: 2,
        acceptedServiceIds: [],
        printCapability: false,
        defaultDropoffPoint: {
          label: 'Ponto de apoio de sandbox',
          city: 'Caratinga',
          state: 'MG',
        },
      },
    });
  }

  const packagingSeeds = [
    { code: 'CX-P', name: 'Caixa pequena (sandbox)', lengthCm: 20, widthCm: 15, heightCm: 10, emptyWeightGrams: 180, maxWeightGrams: 1000 },
    { code: 'CX-M', name: 'Caixa media (sandbox)', lengthCm: 30, widthCm: 22, heightCm: 15, emptyWeightGrams: 280, maxWeightGrams: 3000 },
    { code: 'CX-G', name: 'Caixa grande (sandbox)', lengthCm: 40, widthCm: 30, heightCm: 20, emptyWeightGrams: 450, maxWeightGrams: 8000 },
  ];
  const packagingByCode = new Map<string, { id: string }>();

  for (const packaging of packagingSeeds) {
    const record = await prisma.packagingTemplate.upsert({
      where: {
        tenantId_code: {
          tenantId: tenant.id,
          code: packaging.code,
        },
      },
      update: packaging,
      create: {
        tenantId: tenant.id,
        material: 'Papelao ondulado',
        ...packaging,
      },
    });
    packagingByCode.set(record.code, record);
  }

  for (const coffee of coffeesData) {
    const slug = slugify(coffee.name);
    const producer = producerByName.get(coffee.produtor);

    if (!producer) {
      throw new Error(`Producer not seeded: ${coffee.produtor}`);
    }

    const product = await prisma.product.upsert({
      where: {
        tenantId_slug: {
          tenantId: tenant.id,
          slug,
        },
      },
      update: {
        producerId: producer.id,
        name: coffee.name,
        description: coffee.description,
        descriptionLong: coffee.descriptionLong,
        priceCents: toCents(coffee.priceBase),
        image: coffee.image,
        coffeeProfile: {
          update: {
            category: coffee.category === 'especial' ? 'SPECIALTY' : 'TRADITIONAL',
            aroma: coffee.aroma,
            flavor: coffee.sabor,
            acidity: coffee.acidez,
            body: coffee.corpo,
            notes: coffee.notasMarcantes,
            producerName: coffee.produtor,
            farm: coffee.fazenda,
            harvest: coffee.safra,
            location: coffee.localizacao,
            process: coffee.processo,
            variety: coffee.variedade,
            altitude: coffee.altitude,
            score: coffee.pontuacao,
            sommelierComment: coffee.sommelierComment,
            farmImages: coffee.imagesLavoura,
          },
        },
      },
      create: {
        tenantId: tenant.id,
        producerId: producer.id,
        legacyId: coffee.id,
        type: ProductType.COFFEE,
        name: coffee.name,
        slug,
        description: coffee.description,
        descriptionLong: coffee.descriptionLong,
        priceCents: toCents(coffee.priceBase),
        image: coffee.image,
        stockQuantity: 100,
        coffeeProfile: {
          create: {
            tenantId: tenant.id,
            category: coffee.category === 'especial' ? 'SPECIALTY' : 'TRADITIONAL',
            aroma: coffee.aroma,
            flavor: coffee.sabor,
            acidity: coffee.acidez,
            body: coffee.corpo,
            notes: coffee.notasMarcantes,
            producerName: coffee.produtor,
            farm: coffee.fazenda,
            harvest: coffee.safra,
            location: coffee.localizacao,
            process: coffee.processo,
            variety: coffee.variedade,
            altitude: coffee.altitude,
            score: coffee.pontuacao,
            sommelierComment: coffee.sommelierComment,
            farmImages: coffee.imagesLavoura,
          },
        },
      },
    });

    await prisma.productShippingProfile.upsert({
      where: { productId: product.id },
      update: {
        defaultPackagingTemplateId: packagingByCode.get('CX-P')?.id,
        unitWeightGrams: 300,
        lengthCm: 16,
        widthCm: 11,
        heightCm: 7,
      },
      create: {
        tenantId: tenant.id,
        productId: product.id,
        defaultPackagingTemplateId: packagingByCode.get('CX-P')?.id,
        unitWeightGrams: 300,
        lengthCm: 16,
        widthCm: 11,
        heightCm: 7,
      },
    });
  }

  for (const equipment of equipmentsData) {
    const slug = slugify(equipment.name);
    const producer = producerByName.get('Operacao Grao & Origem');

    if (!producer) {
      throw new Error('Sandbox operations producer was not seeded.');
    }

    const product = await prisma.product.upsert({
      where: {
        tenantId_slug: {
          tenantId: tenant.id,
          slug,
        },
      },
      update: {
        producerId: producer.id,
        name: equipment.name,
        description: equipment.description,
        descriptionLong: equipment.descriptionLong,
        priceCents: toCents(equipment.price),
        image: equipment.image,
        equipmentProfile: {
          update: {
            specs: equipment.specs,
            objective: equipment.objective,
            howToUse: equipment.howToUse,
          },
        },
      },
      create: {
        tenantId: tenant.id,
        producerId: producer.id,
        legacyId: equipment.id,
        type: ProductType.EQUIPMENT,
        name: equipment.name,
        slug,
        description: equipment.description,
        descriptionLong: equipment.descriptionLong,
        priceCents: toCents(equipment.price),
        image: equipment.image,
        stockQuantity: 30,
        equipmentProfile: {
          create: {
            tenantId: tenant.id,
            specs: equipment.specs,
            objective: equipment.objective,
            howToUse: equipment.howToUse,
          },
        },
      },
    });

    await prisma.productShippingProfile.upsert({
      where: { productId: product.id },
      update: {
        defaultPackagingTemplateId: packagingByCode.get('CX-M')?.id,
        unitWeightGrams: 1000,
        lengthCm: 25,
        widthCm: 18,
        heightCm: 14,
      },
      create: {
        tenantId: tenant.id,
        productId: product.id,
        defaultPackagingTemplateId: packagingByCode.get('CX-M')?.id,
        unitWeightGrams: 1000,
        lengthCm: 25,
        widthCm: 18,
        heightCm: 14,
      },
    });
  }

  for (const kit of kitsData) {
    const slug = slugify(kit.name);
    const producer = producerByName.get('Operacao Grao & Origem');

    if (!producer) {
      throw new Error('Sandbox operations producer was not seeded.');
    }

    const product = await prisma.product.upsert({
      where: {
        tenantId_slug: {
          tenantId: tenant.id,
          slug,
        },
      },
      update: {
        producerId: producer.id,
        name: kit.name,
        description: kit.description,
        descriptionLong: kit.descriptionLong,
        priceCents: toCents(kit.price),
        image: kit.image,
        kitProfile: {
          update: {
            itemsIncluded: kit.itemsIncluded,
            objective: kit.objective,
            howToUse: kit.howToUse,
          },
        },
      },
      create: {
        tenantId: tenant.id,
        producerId: producer.id,
        legacyId: kit.id,
        type: ProductType.KIT,
        name: kit.name,
        slug,
        description: kit.description,
        descriptionLong: kit.descriptionLong,
        priceCents: toCents(kit.price),
        image: kit.image,
        stockQuantity: 20,
        kitProfile: {
          create: {
            tenantId: tenant.id,
            itemsIncluded: kit.itemsIncluded,
            objective: kit.objective,
            howToUse: kit.howToUse,
          },
        },
      },
    });

    await prisma.productShippingProfile.upsert({
      where: { productId: product.id },
      update: {
        defaultPackagingTemplateId: packagingByCode.get('CX-G')?.id,
        unitWeightGrams: 2500,
        lengthCm: 35,
        widthCm: 25,
        heightCm: 18,
      },
      create: {
        tenantId: tenant.id,
        productId: product.id,
        defaultPackagingTemplateId: packagingByCode.get('CX-G')?.id,
        unitWeightGrams: 2500,
        lengthCm: 35,
        widthCm: 25,
        heightCm: 18,
      },
    });
  }

  for (const post of blogData) {
    const slug = slugify(post.title);

    await prisma.blogPost.upsert({
      where: {
        tenantId_slug: {
          tenantId: tenant.id,
          slug,
        },
      },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        dateLabel: post.date,
        readTime: post.readTime,
        category: post.category,
        image: post.image,
      },
      create: {
        tenantId: tenant.id,
        legacyId: post.id,
        title: post.title,
        slug,
        excerpt: post.excerpt,
        content: post.content,
        dateLabel: post.date,
        readTime: post.readTime,
        category: post.category,
        image: post.image,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
