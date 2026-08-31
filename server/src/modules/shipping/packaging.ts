import { DomainValidationError } from '../shared/domain-error';

export interface PackagingTemplateInput {
  id: string;
  code: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  emptyWeightGrams: number;
  maxWeightGrams: number;
  active: boolean;
}

export interface ShippingItemInput {
  quantity: number;
  unitWeightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

function sortedDimensions(lengthCm: number, widthCm: number, heightCm: number) {
  return [lengthCm, widthCm, heightCm].sort((left, right) => left - right);
}

function volume(lengthCm: number, widthCm: number, heightCm: number) {
  return lengthCm * widthCm * heightCm;
}

export function selectSmallestPackaging(
  items: ShippingItemInput[],
  templates: PackagingTemplateInput[],
) {
  if (items.length === 0) {
    throw new DomainValidationError('At least one shipping item is required.');
  }

  for (const item of items) {
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) {
      throw new DomainValidationError('Shipping item quantity must be a positive integer.');
    }
  }

  const contentWeightGrams = items.reduce(
    (total, item) => total + item.unitWeightGrams * item.quantity,
    0,
  );
  const requiredVolumeCm3 = items.reduce(
    (total, item) => total + volume(item.lengthCm, item.widthCm, item.heightCm) * item.quantity,
    0,
  );
  const largestItemDimensions = items.reduce(
    (current, item) => {
      const dimensions = sortedDimensions(item.lengthCm, item.widthCm, item.heightCm);
      return dimensions.map((dimension, index) => Math.max(dimension, current[index] ?? 0));
    },
    [0, 0, 0],
  );

  const compatible = templates
    .filter((template) => template.active)
    .filter((template) => contentWeightGrams + template.emptyWeightGrams <= template.maxWeightGrams)
    .filter((template) => volume(template.lengthCm, template.widthCm, template.heightCm) >= requiredVolumeCm3)
    .filter((template) => {
      const dimensions = sortedDimensions(template.lengthCm, template.widthCm, template.heightCm);
      return dimensions.every((dimension, index) => dimension >= largestItemDimensions[index]);
    })
    .sort(
      (left, right) =>
        volume(left.lengthCm, left.widthCm, left.heightCm) -
        volume(right.lengthCm, right.widthCm, right.heightCm),
    );

  const selected = compatible[0];
  if (!selected) {
    throw new DomainValidationError('No packaging template can contain the requested items.');
  }

  return {
    templateId: selected.id,
    templateCode: selected.code,
    lengthCm: selected.lengthCm,
    widthCm: selected.widthCm,
    heightCm: selected.heightCm,
    weightGrams: contentWeightGrams + selected.emptyWeightGrams,
  };
}
