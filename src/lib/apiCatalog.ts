import { useEffect, useState } from 'react';
import { coffeesData } from '../data/coffees';
import { equipmentsData } from '../data/equipments';
import { kitsData, Kit } from '../data/kits';
import { Cafe, Equipamento } from '../types';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';
const tenantSlug = 'grao-origem';

function normalizeCoffee(product: any, index: number): Cafe {
  return {
    id: product.legacyId ?? index + 1,
    productId: product.id,
    name: product.name,
    category: product.category ?? 'tradicional',
    description: product.description,
    descriptionLong: product.descriptionLong,
    priceBase: product.price ?? product.priceBase ?? 0,
    aroma: product.aroma ?? '',
    sabor: product.sabor ?? '',
    acidez: product.acidez ?? '',
    corpo: product.corpo ?? '',
    notasMarcantes: product.notasMarcantes ?? [],
    produtor: product.produtor ?? '',
    fazenda: product.fazenda ?? '',
    safra: product.safra ?? '',
    localizacao: product.localizacao ?? '',
    processo: product.processo ?? '',
    variedade: product.variedade ?? '',
    sommelierComment: product.sommelierComment ?? '',
    pontuacao: product.pontuacao,
    image: product.image,
    imagesLavoura: product.imagesLavoura ?? [],
    altitude: product.altitude ?? '',
  };
}

function normalizeEquipment(product: any, index: number): Equipamento {
  return {
    id: product.legacyId ?? index + 1,
    productId: product.id,
    name: product.name,
    description: product.description,
    descriptionLong: product.descriptionLong,
    price: product.price ?? 0,
    image: product.image,
    specs: product.specs ?? [],
    objective: product.objective ?? '',
    howToUse: product.howToUse ?? '',
  };
}

function normalizeKit(product: any, index: number): Kit {
  return {
    id: product.legacyId ?? index + 101,
    productId: product.id,
    name: product.name,
    description: product.description,
    descriptionLong: product.descriptionLong,
    price: product.price ?? 0,
    image: product.image,
    itemsIncluded: product.itemsIncluded ?? [],
    objective: product.objective ?? '',
    howToUse: product.howToUse ?? '',
  };
}

function useApiData<T>(endpoint: string, fallback: T, normalize: (data: any[]) => T) {
  const [data, setData] = useState<T>(fallback);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const response = await fetch(`${apiUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}tenant=${tenantSlug}`);
        if (!response.ok) return;
        const payload = await response.json();
        if (isMounted && Array.isArray(payload)) {
          setData(normalize(payload));
        }
      } catch {
        // Keep static fallback when API is unavailable.
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [endpoint]);

  return data;
}

export function useCoffeesData() {
  return useApiData('/api/catalog/coffees', coffeesData, (payload) => payload.map(normalizeCoffee));
}

export function useEquipmentsData() {
  return useApiData('/api/catalog/equipments', equipmentsData, (payload) => payload.map(normalizeEquipment));
}

export function useKitsData() {
  return useApiData('/api/catalog/kits', kitsData, (payload) => payload.map(normalizeKit));
}
