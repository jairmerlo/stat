import {
  SalesTypes,
  INVERSE_VALUE_MAP_PROPERTY_TYPES,
  hasDisplayFilterValue,
  getMainBoardId,
  getExtraBoardIds,
  getDisplayFilterPolygon,
} from "../helpers/displayFilter";

const API_IDXBOOST_SEARCH =
  window.__flex_g_settings?.app_search_filter_v2 ||
  import.meta.env.VITE_APP_API_IDXBOOST_SEARCH ||
  "https://api-idx-search.idxboost.com";

export interface PropertyItem {
  price: number;
  price_sold?: number;
  list_date: number; // unix seconds
  date_close?: number; // unix seconds
  status_name?: string;
  [key: string]: unknown;
}

export interface DisplayFilterResponse {
  items: PropertyItem[];
  _count?: number;
  from: number;
  size: number;
  index: string;
}

// Port de getDisplayFilterList (idx-search-react-2024/src/app/api/displayFilter.ts).
export function buildDisplayFilterBody(filters: { [x: string]: unknown }) {
  const limitResults = !!window.paramsDisplayFilter?.board?.hackbox;
  const pdf = window.paramsDisplayFilter?.data ?? {},
    isSale = filters.for === SalesTypes.SALE;

  const body: { [key: string]: unknown } = {
    limit: limitResults ? "23" : window.idx_main_settings?.limit,
    show: String(filters.show ?? "all"),
    sort: String(filters.sort ?? "price-desc"),
    for: String(filters.for ?? SalesTypes.SALE),
    type: String(filters.type ?? "")
      .split(",")
      .filter(Boolean)
      .map((slug) => String(INVERSE_VALUE_MAP_PROPERTY_TYPES[slug] ?? slug))
      .join(","),
    features: filters.features ? String(filters.features).split(",") : null,
    ...(isSale
      ? {
          min_price: String(filters.min_price ?? ""),
          max_price: String(filters.max_price ?? ""),
        }
      : {
          min_rent_price: String(filters.min_price ?? ""),
          max_rent_price: String(filters.max_price ?? ""),
        }),
    min_beds: String(filters.min_beds ?? ""),
    max_beds: String(filters.max_beds ?? ""),
    min_baths: String(filters.min_baths ?? ""),
    max_baths: String(filters.max_baths ?? ""),
    min_sqft: String(filters.min_sqft ?? ""),
    max_sqft: String(filters.max_sqft ?? ""),
    min_lotsize: String(filters.min_lotsize ?? ""),
    max_lotsize: String(filters.max_lotsize ?? ""),
    min_year: String(filters.min_year ?? ""),
    max_year: String(filters.max_year ?? ""),
    parking: String(filters.parking ?? ""),
    wv: String(filters.wv ?? ""),
    keyword_main: String(filters.keyword_main ?? ""),
    polygon_arr: getDisplayFilterPolygon(),
    board_id: Number(getMainBoardId()),
    extra_board_id: getExtraBoardIds().join(",") || "",
    pagination: (Number(filters.page || 1) - 1).toString(),
  };

  // dom_max / hide_pending: solo se mandan si vienen en displayFilter.
  const domMax = filters.dom_max ?? pdf.dom_max;
  if (hasDisplayFilterValue(domMax)) {
    body.dom_max = domMax;
  }
  const hidePending = filters.hide_pending ?? pdf.hide_pending;
  if (hasDisplayFilterValue(hidePending)) {
    body.hide_pending = hidePending;
  }

  // Display filter tipo "sold": rango de vendidos desde idx_main_settings.
  // type invalido -> "week"; value no numerico (ej. "default") -> "1".
  const settings = window.idx_main_settings;
  if (settings?.type_filter === "sold") {
    const type = ["day", "week", "month", "year"].includes(String(settings.lookup_previous_sold))
      ? String(settings.lookup_previous_sold)
      : "week";
    const rawValue = settings.lookup_previous_sold_value;
    const value =
      rawValue !== "" && rawValue !== null && rawValue !== undefined && !isNaN(Number(rawValue))
        ? String(Number(rawValue))
        : "1";
    body.lookup_previous_sold = type;
    body.lookup_previous_sold_value = value;
  }

  return body;
}

export async function getDisplayFilterList(
  filters: { [x: string]: unknown },
  signal?: AbortSignal
): Promise<DisplayFilterResponse> {
  const res = await fetch(`${API_IDXBOOST_SEARCH}/displayfilter/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildDisplayFilterBody(filters)),
    signal,
  });
  if (!res.ok) throw new Error(`displayfilter/search ${res.status}`);
  return res.json();
}
