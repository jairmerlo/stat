export const SalesTypes = {
  SALE: "sale",
  RENT: "rent",
  SOLD: "sold",
} as const;

export const VALUE_MAP_PROPERTY_TYPES: { [key: string | number]: string } = {
  2: "homes",
  1: "condos",
  tw: "townhouse",
  mf: "multifamily",
  valand: "vacantland",
};

export const INVERSE_VALUE_MAP_PROPERTY_TYPES: { [key: string]: string | number } =
  Object.keys(VALUE_MAP_PROPERTY_TYPES).reduce((acc, key) => {
    acc[VALUE_MAP_PROPERTY_TYPES[key]] = isNaN(Number(key)) ? key : Number(key);
    return acc;
  }, {} as { [key: string]: string | number });

export function hasDisplayFilterValue(v: unknown): v is string {
  return typeof v === "string" && v !== "" && v !== "--";
}

function getBoards() {
  return window.idx_main_settings?.search_settings?.idx_extra_board || [];
}

export function getMainBoardId(): string {
  const main = getBoards().find((b) => b.main);
  return main ? `${main.board_id}` : "1";
}

export function getExtraBoardIds(): string[] {
  return getBoards()
    .filter((b) => !b.main)
    .map((b) => `${b.board_id}`);
}

// Filtros "planos" a partir de paramsDisplayFilter.data: los valores vacíos
// o "--" se descartan igual que en idx-search-react-2024.
export function getDisplayFilterFilters(): { [key: string]: unknown } {
  const pdf = window.paramsDisplayFilter?.data ?? {};
  const filters: { [key: string]: unknown } = {};
  const isSale = (pdf.for ?? SalesTypes.SALE) === SalesTypes.SALE;

  for (const [key, value] of Object.entries(pdf)) {
    if (key === "polygon_arr" || key === "board_id") continue;
    if (hasDisplayFilterValue(value)) filters[key] = value;
  }
  if (!isSale) {
    if (hasDisplayFilterValue(pdf.min_rent_price)) filters.min_price = pdf.min_rent_price;
    if (hasDisplayFilterValue(pdf.max_rent_price)) filters.max_price = pdf.max_rent_price;
  }
  return filters;
}

// Backend espera [lat, lng] (mismo orden que persiste el WP saved-search).
export function getDisplayFilterPolygon(): [number, number][] {
  let raw = window.paramsDisplayFilter?.data?.polygon_arr;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  return raw
    .map(([lat, lng]) => [Number(lat), Number(lng)] as [number, number])
    .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));
}
