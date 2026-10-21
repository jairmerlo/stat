export {};

type DisplayFilterValue = string | null | undefined;

declare global {
  interface Window {
    __flex_g_settings?: {
      app_search_filter_v2?: string;
      [key: string]: unknown;
    };
    idx_main_settings?: {
      type_filter?: string;
      lookup_previous_sold?: string;
      lookup_previous_sold_value?: string | number | null;
      limit?: string | number;
      adom?: string | number;
      search_settings?: {
        idx_extra_board?: { board_id: string | number; main: boolean }[];
      };
      [key: string]: unknown;
    };
    paramsDisplayFilter?: {
      board?: { hackbox?: string | null };
      status?: boolean;
      data?: {
        // Values may be "", "--", or null to mean "no value selected".
        parking?: DisplayFilterValue;
        wv?: DisplayFilterValue;
        sort?: string;
        for?: string; // "sale" | "rent" | "sold"
        type?: string; // comma-separated e.g. "1,2,tw"
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
      };
    };
  }
}
