export interface ServiceCategoryOption {
  label: string;
  value: string;
}

export const SERVICE_CATEGORY_OPTIONS: ServiceCategoryOption[] = [
  { label: 'Legales', value: 'Legales' },
  { label: 'Compras', value: 'COMPRAS' },
  { label: 'Documentos', value: 'DOCUMENTOS' },
  { label: 'Delivery', value: 'DELIVERY' },
  { label: 'Otros', value: 'OTROS' }
];

export function normalizeServiceCategory(category?: string | null): string {
  const normalized = (category || '').trim().toUpperCase();

  switch (normalized) {
    case 'LEGALES':
      return 'Legales';
    case 'COMPRAS':
      return 'COMPRAS';
    case 'DOCUMENTOS':
      return 'DOCUMENTOS';
    case 'DELIVERY':
      return 'DELIVERY';
    case 'OTROS':
      return 'OTROS';
    default:
      return '';
  }
}
