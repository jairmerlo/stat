# Configuración global: `local-config.js`

La app de estadísticas (Search Statistics) lee su configuración de dos variables globales en `window`: `__flex_g_settings` y `filterRenderStat`. En producción las imprime PHP/WordPress en la página; en local las define el archivo `public/local-config.js`.

- `public/local-config.js` está en `.gitignore`: cada desarrollador crea el suyo y nunca se sube al repo.
- Solo sirve para desarrollo local; replica lo que el plugin renderiza en producción.
- Debe cargarse **antes** de `/src/main.tsx`, porque la app lee las globales al arrancar.

Tipos de referencia: [`src/global.d.ts`](../src/global.d.ts).

## Formato del archivo

`local-config.js` es JavaScript plano (no un módulo, no JSON): solo asigna dos propiedades a `window`. No usa `import`, `export` ni `const` globales.

```js
window.__flex_g_settings = { /* settings globales */ };

window.filterRenderStat = [ /* una entrada por cada estadística a pintar */ ];
```

Para usarlo en local hay que descomentar el script en `index.html`, antes del script de la app:

```html
<!-- Local Development Configuration - Only for testing -->
<script src="/local-config.js"></script>
```

Orden de arranque:

1. `local-config.js` define `window.__flex_g_settings` y `window.filterRenderStat`.
2. El script inline de `index.html` crea un `<div id="{item.render}">` por cada item (en producción esos divs los imprime PHP).
3. `src/main.tsx` monta una instancia de React independiente en cada div cuyo `render` exista en el DOM.

Reglas de formato:

- Ambas variables son opcionales: sin `filterRenderStat` (o si no es un array) no se monta nada.
- Los items sin `render` se ignoran en silencio.
- Los valores pueden ir como string o número; la app los convierte a string al armar la petición.

## Objeto `__flex_g_settings`

`window.__flex_g_settings` es un objeto con settings globales del sitio, compartidos por todas las instancias. Hoy la app solo lee `app_search_filter_v2`; acepta otras claves sin romper.

| Propiedad | Tipo | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `app_search_filter_v2` | string (URL, sin `/` final) | No | Base de la API de búsqueda. La app hace `POST {app_search_filter_v2}/displayfilter/search`. |
| *(otras claves)* | cualquiera | No | Se permiten (`[key: string]: unknown`) pero la app no las usa. |

Si falta `app_search_filter_v2`, la URL se resuelve en este orden:

1. `window.__flex_g_settings.app_search_filter_v2`
2. Variable de entorno `VITE_APP_API_IDXBOOST_SEARCH`
3. `https://api-idx-search.idxboost.dev` (valor por defecto)

```js
window.__flex_g_settings = {
  app_search_filter_v2: "https://api-idx-search.idxboost.dev",
};
```

## Objeto `filterRenderStat`

`window.filterRenderStat` es un **array**; cada item es una instancia independiente de la estadística, montada en el div cuyo `id` es `item.render`. Reemplaza a los antiguos `window.idx_main_settings` y `window.paramsDisplayFilter`: los settings del sitio y los filtros llegan dentro de cada item.

### Propiedades del item

| Propiedad | Tipo | Obligatoria | Uso en la app |
| --- | --- | --- | --- |
| `render` | string | **Sí** | `id` del div donde se monta. Único por item. Ej.: `"root-search-stat-17073126"`. |
| `filters` | objeto | Recomendada | Filtros de la búsqueda (antes `paramsDisplayFilter`). Ver tabla siguiente. |
| `adom` | string \| number | No | Días del periodo ("last N days"). Vacío, `"default"` o ≤ 0 → 30. |
| `search_settings` | objeto | No | Se usa `search_settings.idx_extra_board` para el board principal. |
| `id` | number | No | Id del filtro guardado; informativo. |
| `limit`, `type_filter`, `lookup_previous_sold`, `lookup_previous_sold_value` | string \| number | No | Tipadas, hoy no las lee la app. |
| *(otras: `type`, `paths`, `agent_info`, `rk`…)* | cualquiera | No | Se aceptan tal como las envía PHP; la app las ignora. |

### `item.filters`

| Propiedad | Tipo | Descripción |
| --- | --- | --- |
| `status` | boolean | Estado del filtro. |
| `data` | objeto | Valores iniciales de la búsqueda (tabla siguiente). |
| `board` | objeto | Info del board (`hackbox`, `board_code`, `more_info_board`…); no la usa la app. |
| `extra` | objeto | Datos extra (force registration…); no los usa la app. |

### `item.filters.data`

Vacío (`""`), `"--"` o `null` significa "sin valor": la app lo descarta y aplica el valor por defecto.

| Clave | Tipo | Por defecto | Notas |
| --- | --- | --- | --- |
| `for` | string | `"sale"` | `"sale"`, `"rent"` o `"sold"`. |
| `type` | string | `""` | Separado por comas: `2` homes, `1` condos, `tw` townhouse, `mf` multifamily, `valand` vacant land. Ej.: `"1,2,tw"`. |
| `board_id` | number \| string | board principal | Si falta, se usa el `board_id` con `main: true` de `idx_extra_board`, o `"1"`. |
| `polygon_arr` | array de `[lat, lng]` o string JSON | `[]` | Orden **lat, lng**. Se descartan los pares no numéricos. |
| `sort` | string | `"list_date-desc"` | |
| `min_price` / `max_price` | string | `""` / `"--"` | Venta. |
| `min_rent_price` / `max_rent_price` | string | `""` / `""` | Renta. |
| `min_beds` / `max_beds` | string | `""` / `"--"` | |
| `min_baths` / `max_baths` | string | `""` / `"--"` | |
| `min_sqft` / `max_sqft` | string | `""` / `"--"` | |
| `min_lotsize` / `max_lotsize` | string | `""` / `"--"` | |
| `min_year` / `max_year` | string | `"--"` / `"--"` | |
| `parking`, `wv` | string | `"--"` | Parking y waterfront view. |
| `keyword_main` | string | `""` | |
| `features` | string | `""` | Separado por comas. |
| `hide_pending` | string | `""` | |
| `lookup_previous_sold` | string | `""` | |
| `show` | string | `"stat"` | |
| `dom_max` | string | — | Tipado, no se envía a la API. |

### `item.search_settings.idx_extra_board`

Array de boards del sitio. La app solo mira `board_id` y `main`; el que tiene `main: true` es el board por defecto.

```js
search_settings: {
  idx_extra_board: [
    { board_id: 1, main: true },
    { board_id: "33", main: false },
  ],
},
```

### Varias estadísticas en la misma página

Cada item del array monta su propia instancia con su propia petición. Solo hace falta que cada `render` sea distinto:

```js
window.filterRenderStat = [
  { render: "root-search-stat-1", adom: "30", filters: { data: { for: "sale", type: "2" } } },
  { render: "root-search-stat-2", adom: "90", filters: { data: { for: "rent", type: "1" } } },
];
```

## Ejemplo completo mínimo

```js
// public/local-config.js — solo desarrollo local, no se sube al repo
window.__flex_g_settings = {
  app_search_filter_v2: "https://api-idx-search.idxboost.dev",
};

window.filterRenderStat = [
  {
    id: 17073126,
    render: "root-search-stat-17073126",
    adom: "60",
    filters: {
      status: true,
      data: {
        for: "sale",
        type: "2",
        board_id: 1,
        sort: "list_date-desc",
        min_price: "",
        max_price: "--",
        polygon_arr: [
          ["25.83132", "-80.13346"],
          ["25.84152", "-80.13706"],
          ["25.84631", "-80.12865"],
          ["25.83132", "-80.13346"],
        ],
      },
    },
    search_settings: {
      idx_extra_board: [{ board_id: 1, main: true }],
    },
    // Campos que PHP también envía (la app los ignora). Valores reales ocultos:
    rk: "***",
    agent_info: {
      contact_email_address: "***",
      google_maps_api_key: "***",
      google_captcha_public_key: "***",
      google_client_id: "***",
    },
  },
];
```

## Errores comunes

| Síntoma | Causa | Solución |
| --- | --- | --- |
| No se pinta nada | El `<script src="/local-config.js">` sigue comentado en `index.html`, o va después de `main.tsx`. | Descomentarlo y dejarlo antes del script de la app. |
| No se pinta nada | `filterRenderStat` es un objeto, no un array, o el item no tiene `render`. | Usar `[ { render: "...", ... } ]`. |
| Solo aparece una de varias estadísticas | Dos items con el mismo `render`. | Un `render` distinto por item. |
| El componente desaparece tras cargar | La API devolvió error (la app oculta el bloque). | Revisar `app_search_filter_v2` y la petición `displayfilter/search` en la pestaña Network. |
| El polígono no filtra | Coordenadas en orden `[lng, lat]` o no numéricas. | Usar `[lat, lng]`. |
| Subtítulo dice "last 30 days" | `adom` vacío, `"default"` o no numérico. | Pasar un número de días, ej. `"60"`. |

> Los datos sensibles (API keys de Google, `rk`, emails de contacto) aparecen como `***`. Para usar el ejemplo en local, reemplázalos por los valores de tu entorno.
