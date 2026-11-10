export {};

type DisplayFilterValue = string | null | undefined;

// Filtros iniciales de una instancia (item.filters.data). Los valores pueden ser
// "", "--" o null para indicar "sin valor seleccionado".
export interface DisplayFilterData {
  parking?: DisplayFilterValue;
  wv?: DisplayFilterValue;
  sort?: string;
  for?: string; // "sale" | "rent" | "sold"
  type?: string; // separado por comas, ej. "1,2,tw"
  show?: DisplayFilterValue;
  min_beds?: DisplayFilterValue;
  max_beds?: DisplayFilterValue;
  min_baths?: DisplayFilterValue;
  max_baths?: DisplayFilterValue;
  min_sqft?: DisplayFilterValue;
  max_sqft?: DisplayFilterValue;
  min_lotsize?: DisplayFilterValue;
  max_lotsize?: DisplayFilterValue;
  min_year?: DisplayFilterValue;
  max_year?: DisplayFilterValue;
  min_price?: DisplayFilterValue;
  max_price?: DisplayFilterValue;
  min_rent_price?: DisplayFilterValue;
  max_rent_price?: DisplayFilterValue;
  board_id?: number | string;
  keyword_main?: string;
  polygon_arr?: Array<[string | number, string | number]> | string;
  features?: string;
  dom_max?: DisplayFilterValue;
  hide_pending?: DisplayFilterValue;
  lookup_previous_sold?: DisplayFilterValue;
}

// item.filters: equivalente al antiguo window.paramsDisplayFilter
export interface DisplayFilterParams {
  status?: boolean;
  data?: DisplayFilterData;
  board?: { hackbox?: unknown; [key: string]: unknown };
  extra?: { [key: string]: unknown };
}

export interface SearchSettings {
  idx_extra_board?: { board_id: string | number; main: boolean }[];
  [key: string]: unknown;
}

/**
 * Cada item de window.filterRenderStat es una instancia independiente que se
 * monta en el div cuyo id es `render`. Reemplaza a window.idx_main_settings y
 * window.paramsDisplayFilter: los settings de sitio (search_settings, adom,
 * limit, ...) y los filtros (`filters.data`) llegan dentro de cada item.
 */
export interface FilterRenderStatItem {
  render: string;
  filters?: DisplayFilterParams;
  search_settings?: SearchSettings;
  adom?: string | number;
  limit?: string | number;
  type_filter?: string;
  lookup_previous_sold?: string;
  lookup_previous_sold_value?: string | number | null;
  [key: string]: unknown;
}

declare global {
  interface Window {
    __flex_g_settings?: {
      app_search_filter_v2?: string;
      [key: string]: unknown;
    };
    filterRenderStat?: FilterRenderStatItem[];
  }
}
