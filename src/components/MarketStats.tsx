import { useEffect, useState } from "react";
import { getDisplayFilterList, type PropertyItem } from "../api/displayFilter";
import { getDisplayFilterFilters } from "../helpers/displayFilter";
import "./MarketStats.css";

const DAYS = 30;

function median(values: number[]): number | null {
  const sorted = values.filter((v) => v > 0).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

const formatPrice = (v: number | null) =>
  v === null ? "—" : `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

interface Stats {
  medianNew: number | null;
  medianActive: number | null;
  countNew: number;
  countActive: number;
}

function computeStats(items: PropertyItem[], total: number): Stats {
  const since = Date.now() / 1000 - DAYS * 86400;
  const isNew = (p: PropertyItem) => Number(p.list_date) >= since;
  const price = (p: PropertyItem) => Number(p.price_sold || p.price);
  const newItems = items.filter(isNew);
  return {
    medianNew: median(newItems.map(price)),
    medianActive: median(items.map(price)),
    countNew: newItems.length,
    countActive: total,
  };
}

function StatBlock({
  title,
  newValue,
  activeValue,
}: {
  title: string;
  newValue: string;
  activeValue: string;
}) {
  return (
    <div className="ms-block">
      <h2 className="ms-title">{title}</h2>
      <p className="ms-subtitle">last {DAYS} days</p>
      <div className="ms-values">
        <div className="ms-value ms-value--new">
          <span className="ms-number">{newValue}</span>
          <span className="ms-label">New</span>
        </div>
        <div className="ms-value ms-value--active">
          <span className="ms-number">{activeValue}</span>
          <span className="ms-label">Active</span>
        </div>
      </div>
    </div>
  );
}

export default function MarketStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getDisplayFilterList(getDisplayFilterFilters(), controller.signal)
      .then((res) => setStats(computeStats(res.items ?? [], res._count ?? res.items?.length ?? 0)))
      .catch((e) => {
        if (e.name !== "AbortError") setError(true);
      });
    return () => controller.abort();
  }, []);

  if (error) return null;

  return (
    <section className={`ms${stats ? "" : " ms--loading"}`}>
      <StatBlock
        title="Median Price"
        newValue={stats ? formatPrice(stats.medianNew) : "—"}
        activeValue={stats ? formatPrice(stats.medianActive) : "—"}
      />
      <StatBlock
        title="Inventory"
        newValue={stats ? String(stats.countNew) : "—"}
        activeValue={stats ? String(stats.countActive) : "—"}
      />
    </section>
  );
}
