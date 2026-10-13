import { FlyerCategory, AppLanguage } from '../types';

export const FLYER_CATEGORIES: {
  id: FlyerCategory;
  labelEn: string;
  labelEs: string;
}[] = [
  { id: 'work_injury', labelEn: 'Work Injury', labelEs: 'Accidente Laboral' },
  { id: 'car_accident', labelEn: 'Car Accident', labelEs: 'Accidente de Auto' },
  { id: 'truck_accident', labelEn: 'Truck Accident', labelEs: 'Accidente de Camión' },
  { id: 'motorcycle_accident', labelEn: 'Motorcycle Accident', labelEs: 'Accidente de Motocicleta' },
  { id: 'slip_fall', labelEn: 'Slip & Fall', labelEs: 'Resbalón y Caída' },
  { id: 'workers_comp', labelEn: "Workers' Comp", labelEs: 'Compensación Laboral' },
  { id: 'medical_malpractice', labelEn: 'Medical Malpractice', labelEs: 'Negligencia Médica' },
  { id: 'product_liability', labelEn: 'Product Liability', labelEs: 'Responsabilidad de Producto' },
  { id: 'dog_bite', labelEn: 'Dog Bite', labelEs: 'Mordedura de Perro' },
  { id: 'wrongful_death', labelEn: 'Wrongful Death', labelEs: 'Muerte por Negligencia' }
];

export function getFlyerCategoryLabel(
  id: FlyerCategory | string,
  lang: AppLanguage = 'en'
): string {
  const found = FLYER_CATEGORIES.find((c) => c.id === id);
  if (!found) return id;
  return lang === 'es' ? found.labelEs : found.labelEn;
}
