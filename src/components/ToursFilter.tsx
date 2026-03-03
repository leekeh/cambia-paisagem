"use client";
import { useState, useMemo } from "react";
import {
  MantineProvider,
  createTheme,
  Select,
  Slider,
  Text,
} from "@mantine/core";
import "@mantine/core/styles.css";
import styles from "./ToursFilter.module.css";

const theme = createTheme({
  primaryColor: "dark",
  fontFamily: "Inter, system-ui, sans-serif",
});

interface Tour {
  slug: string;
  title: string;
  price: number;
  duration: number;
  imageUrl: string;
  href: string;
  viewMoreLabel: string;
  fromLabel: string;
  hoursLabel: string;
}

interface Props {
  tours: Tour[];
  translations: {
    sortLabel: string;
    sortPrice: string;
    sortDuration: string;
    filterDurationMax: string;
    filterDurationMin: string;
    noResults: string;
  };
}

function ToursFilterInner({ tours, translations: tr }: Props) {
  const minDuration = Math.min(...tours.map((t) => t.duration));
  const maxDuration = Math.max(...tours.map((t) => t.duration));
  const [sort, setSort] = useState<string | null>("duration-asc");
  const [minDur, setMinDur] = useState(minDuration);
  const [maxDur, setMaxDur] = useState(maxDuration);

  const filtered = useMemo(() => {
    let list = tours.filter(
      (t) => t.duration >= minDur && t.duration <= maxDur,
    );
    if (sort === "price-asc")
      list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc")
      list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "duration-asc")
      list = [...list].sort((a, b) => a.duration - b.duration);
    if (sort === "duration-desc")
      list = [...list].sort((a, b) => b.duration - a.duration);
    return list;
  }, [tours, sort, minDur, maxDur]);

  return (
    <>
      <div className={styles.toursControls}>
        <div className={styles.toursControlsGroup} style={{ minWidth: 180 }}>
          <label className={styles.toursControlsLabel}>{tr.sortLabel}</label>
          <Select
            value={sort}
            onChange={setSort}
            radius="md"
            data={[
              { value: "price-asc", label: `${tr.sortPrice} ↑` },
              { value: "price-desc", label: `${tr.sortPrice} ↓` },
              { value: "duration-asc", label: `${tr.sortDuration} ↑` },
              { value: "duration-desc", label: `${tr.sortDuration} ↓` },
            ]}
          />
        </div>

        <div className={styles.toursControlsGroup} style={{ minWidth: 220 }}>
          <label className={styles.toursControlsLabel}>
            {tr.filterDurationMin}: {minDur}h – {tr.filterDurationMax}: {maxDur}
            h
          </label>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.4rem",
                }}
              >
                {tr.filterDurationMin}
              </div>
              <Slider
                value={minDur}
                onChange={(v) => {
                  setMinDur(v);
                  if (v > maxDur) setMaxDur(v);
                }}
                min={minDuration}
                max={maxDuration}
                step={1}
                marks={[
                  { value: minDuration, label: `${minDuration}h` },
                  { value: maxDuration, label: `${maxDuration}h` },
                ]}
                style={{ paddingBottom: "1.2rem" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.4rem",
                }}
              >
                {tr.filterDurationMax}
              </div>
              <Slider
                value={maxDur}
                onChange={(v) => {
                  setMaxDur(v);
                  if (v < minDur) setMinDur(v);
                }}
                min={minDuration}
                max={maxDuration}
                step={1}
                marks={[
                  { value: minDuration, label: `${minDuration}h` },
                  { value: maxDuration, label: `${maxDuration}h` },
                ]}
                style={{ paddingBottom: "1.2rem" }}
              />
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Text c="dimmed">{tr.noResults}</Text>
      ) : (
        <div className={styles.toursGrid}>
          {filtered.map((tour) => (
            <article className={styles.tourCard} key={tour.slug}>
              <a href={tour.href}>
                <img
                  src={tour.imageUrl}
                  alt={tour.title}
                  className={styles.tourCardImg}
                />
              </a>
              <div className={styles.tourCardBody}>
                <h3 className={styles.tourCardTitle}>
                  <a href={tour.href}>{tour.title}</a>
                </h3>
                <div className={styles.tourCardMeta}>
                  <span className={styles.tourCardMetaItem}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    {tour.duration} {tour.hoursLabel}
                  </span>
                  <span className={styles.tourCardPrice}>
                    {tour.fromLabel} <strong>€{tour.price}</strong>
                  </span>
                </div>
                <div className={styles.tourCardFooter}>
                  <a href={tour.href} className="btn btn-outline">
                    {tour.viewMoreLabel}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

export default function ToursFilter(props: Props) {
  return (
    <MantineProvider theme={theme}>
      <ToursFilterInner {...props} />
    </MantineProvider>
  );
}
