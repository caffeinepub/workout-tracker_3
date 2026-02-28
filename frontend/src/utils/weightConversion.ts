import { WeightUnit } from '../backend';

export function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}

export function kgToLbs(kg: number): number {
  return kg * 2.20462;
}

export function convertWeight(value: number, fromUnit: WeightUnit, toUnit: WeightUnit): number {
  if (fromUnit === toUnit) return value;
  if (fromUnit === WeightUnit.lbs && toUnit === WeightUnit.kg) return lbsToKg(value);
  if (fromUnit === WeightUnit.kg && toUnit === WeightUnit.lbs) return kgToLbs(value);
  return value;
}

export function formatWeight(value: number): string {
  return value % 1 === 0 ? value.toString() : value.toFixed(1);
}

export function displayWeight(storedLbs: number, unit: WeightUnit): string {
  const converted = convertWeight(storedLbs, WeightUnit.lbs, unit);
  return `${formatWeight(converted)} ${unit}`;
}
