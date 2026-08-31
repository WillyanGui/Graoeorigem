import { DomainValidationError } from '../shared/domain-error';

const weekdayByName: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    weekday: weekdayByName[values.weekday],
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
}

function cutoffMinutes(cutoffTime: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(cutoffTime);
  if (!match) {
    throw new DomainValidationError('cutoffTime must use HH:MM format.');
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    throw new DomainValidationError('cutoffTime is invalid.');
  }

  return hours * 60 + minutes;
}

export function calculateOperationalDays(input: {
  preparationDays: number;
  postingDays: number[];
  cutoffTime: string;
  now?: Date;
  timeZone?: string;
}) {
  if (!Number.isSafeInteger(input.preparationDays) || input.preparationDays < 0) {
    throw new DomainValidationError('preparationDays must be a non-negative integer.');
  }

  const postingDays = [...new Set(input.postingDays)].filter((day) => Number.isInteger(day) && day >= 1 && day <= 7);
  if (postingDays.length === 0) {
    throw new DomainValidationError('At least one valid posting day is required.');
  }

  const now = input.now ?? new Date();
  const timeZone = input.timeZone ?? 'America/Sao_Paulo';
  const readyAt = new Date(now.getTime() + input.preparationDays * 24 * 60 * 60 * 1000);
  const cutoff = cutoffMinutes(input.cutoffTime);

  for (let delay = 0; delay <= 7; delay += 1) {
    const candidate = new Date(readyAt.getTime() + delay * 24 * 60 * 60 * 1000);
    const local = zonedParts(candidate, timeZone);
    const beforeCutoff = delay > 0 || local.minutes <= cutoff;

    if (postingDays.includes(local.weekday) && beforeCutoff) {
      return input.preparationDays + delay;
    }
  }

  throw new DomainValidationError('Unable to calculate the next posting day.');
}

export function calculateTotalPromiseDays(input: {
  carrierDeliveryDays: number;
  preparationDays: number;
  postingDays: number[];
  cutoffTime: string;
  marginDays?: number;
  now?: Date;
  timeZone?: string;
}) {
  if (!Number.isSafeInteger(input.carrierDeliveryDays) || input.carrierDeliveryDays < 0) {
    throw new DomainValidationError('carrierDeliveryDays must be a non-negative integer.');
  }

  const marginDays = input.marginDays ?? 0;
  if (!Number.isSafeInteger(marginDays) || marginDays < 0) {
    throw new DomainValidationError('marginDays must be a non-negative integer.');
  }

  return input.carrierDeliveryDays + marginDays + calculateOperationalDays(input);
}
