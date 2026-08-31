import { CoffeeCategory, Prisma, Product, ProductType } from '@prisma/client';

type ProductWithProfiles = Product & {
  coffeeProfile?: {
    category: CoffeeCategory;
    aroma: string;
    flavor: string;
    acidity: string;
    body: string;
    notes: string[];
    producerName: string;
    farm: string;
    harvest: string;
    location: string;
    process: string;
    variety: string;
    altitude: string;
    score: Prisma.Decimal | null;
    sommelierComment: string;
    farmImages: string[];
  } | null;
  equipmentProfile?: {
    specs: string[];
    objective: string;
    howToUse: string;
  } | null;
  kitProfile?: {
    itemsIncluded: string[];
    objective: string;
    howToUse: string;
  } | null;
};

export function priceFromCents(cents: number) {
  return cents / 100;
}

export function serializeProduct(product: ProductWithProfiles) {
  const base = {
    id: product.id,
    producerId: product.producerId,
    legacyId: product.legacyId,
    type: product.type,
    status: product.status,
    name: product.name,
    slug: product.slug,
    description: product.description,
    descriptionLong: product.descriptionLong,
    price: priceFromCents(product.priceCents),
    priceCents: product.priceCents,
    image: product.image,
    stockQuantity: product.stockQuantity,
  };

  if (product.type === ProductType.COFFEE && product.coffeeProfile) {
    return {
      ...base,
      category: product.coffeeProfile.category === CoffeeCategory.SPECIALTY ? 'especial' : 'tradicional',
      aroma: product.coffeeProfile.aroma,
      sabor: product.coffeeProfile.flavor,
      acidez: product.coffeeProfile.acidity,
      corpo: product.coffeeProfile.body,
      notasMarcantes: product.coffeeProfile.notes,
      produtor: product.coffeeProfile.producerName,
      fazenda: product.coffeeProfile.farm,
      safra: product.coffeeProfile.harvest,
      localizacao: product.coffeeProfile.location,
      processo: product.coffeeProfile.process,
      variedade: product.coffeeProfile.variety,
      altitude: product.coffeeProfile.altitude,
      pontuacao: product.coffeeProfile.score ? Number(product.coffeeProfile.score) : undefined,
      sommelierComment: product.coffeeProfile.sommelierComment,
      imagesLavoura: product.coffeeProfile.farmImages,
    };
  }

  if (product.type === ProductType.EQUIPMENT && product.equipmentProfile) {
    return {
      ...base,
      specs: product.equipmentProfile.specs,
      objective: product.equipmentProfile.objective,
      howToUse: product.equipmentProfile.howToUse,
    };
  }

  if (product.type === ProductType.KIT && product.kitProfile) {
    return {
      ...base,
      itemsIncluded: product.kitProfile.itemsIncluded,
      objective: product.kitProfile.objective,
      howToUse: product.kitProfile.howToUse,
    };
  }

  return base;
}
