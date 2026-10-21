import { useEffect, useState } from "react";
import {
  getDisplayFilterList,
  type DisplayFilterMetricValue,
  type DisplayFilterResponse,
} from "../api/displayFilter";
import { getDisplayFilterFilters } from "../helpers/displayFilter";
import "./MarketStats.css";

const DEFAULT_DAYS = 30;

const getDays = () => {
  const days = Number(window.idx_main_settings?.adom);
  console.log(days);

  return Number.isFinite(days) && days > 0 ? days : DEFAULT_DAYS;
};

const formatPrice = (value: DisplayFilterMetricValue | undefined) =>
  value == null ? "—" : `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const formatCount = (value: DisplayFilterMetricValue | undefined) =>
  value == null ? "—" : value.toLocaleString("en-US");

function StatBlock({
  title,
  days,
  newValue,
  activeValue,
}: {
  title: string;
  days: number;
  newValue: string;
  activeValue: string;
}) {
  return (
    <div className="ms-block">
      <h2 className="ms-title">{title}</h2>
      <p className="ms-subtitle">last {days} days</p>
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
  const [stats, setStats] = useState<DisplayFilterResponse | null>(null);
  const [error, setError] = useState(false);
  const days = getDays();

  useEffect(() => {
    const controller = new AbortController();
    getDisplayFilterList(getDisplayFilterFilters(), controller.signal)
      .then(setStats)
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
        days={days}
        newValue={stats ? formatPrice(stats.median_price.new) : "—"}
        activeValue={stats ? formatPrice(stats.median_price.active) : "—"}
      />
      <StatBlock
        title="Inventory"
        days={days}
        newValue={stats ? formatCount(stats.inventory.new) : "—"}
        activeValue={stats ? formatCount(stats.inventory.active) : "—"}
      />
    </section>
  );
}
