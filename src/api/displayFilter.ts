import {
  SalesTypes,
  getMainBoardId,
  getDisplayFilterPolygon,
} from "../helpers/displayFilter";

const API_IDXBOOST_SEARCH =
  window.__flex_g_settings?.app_search_filter_v2 ||
  import.meta.env.VITE_APP_API_IDXBOOST_SEARCH ||
  "https://api-idx-search.idxboost.dev";

export type DisplayFilterMetricValue = number | null;

export interface DisplayFilterResponse {
  median_price: {
    new: DisplayFilterMetricValue;
    active?: DisplayFilterMetricValue;
  };
  inventory: {
    new: DisplayFilterMetricValue;
    active?: DisplayFilterMetricValue;
  };
}

// Port de getDisplayFilterList (idx-search-react-2024/src/app/api/displayFilter.ts).
export function buildDisplayFilterBody(filters: { [x: string]: unknown }) {
  const pdf = window.paramsDisplayFilter?.data ?? {};
  const value = (key: string, fallback: string) =>
    String(filters[key] ?? pdf[key as keyof typeof pdf] ?? fallback);

  const body: { [key: string]: unknown } = {
    parking: value("parking", "--"),
    wv: value("wv", "--"),
    sort: value("sort", "list_date-desc"),
    show: value("show", "stat"),
    min_beds: value("min_beds", ""),
    min_price: value("min_price", ""),
    max_price: value("max_price", "--"),
    min_rent_price: value("min_rent_price", ""),
    max_rent_price: value("max_rent_price", ""),
    max_beds: value("max_beds", "--"),
    min_baths: value("min_baths", ""),
    max_baths: value("max_baths", "--"),
    min_sqft: value("min_sqft", ""),
    max_sqft: value("max_sqft", "--"),
    min_lotsize: value("min_lotsize", ""),
    max_lotsize: value("max_lotsize", "--"),
    min_year: value("min_year", "--"),
    max_year: value("max_year", "--"),
    for: value("for", SalesTypes.SALE),
    type: value("type", ""),
    board_id: String(filters.board_id ?? pdf.board_id ?? getMainBoardId()),
    keyword_main: value("keyword_main", ""),
    polygon_arr: getDisplayFilterPolygon(),
    features: value("features", ""),
    hide_pending: value("hide_pending", ""),
    lookup_previous_sold: value("lookup_previous_sold", ""),
  };

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
