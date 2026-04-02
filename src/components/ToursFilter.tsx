import { useState, useMemo } from "react";
import { Select, Slider, Text } from "@mantine/core";
import MantineProvider from "./MantineProvider";
import styles from "./ToursFilter.module.css";
import type { Lang } from "../i18n";
import { durationFormat, formatDurationRange } from "../util";

interface Tour {
  slug: string;
  title: string;
  price: number;
  duration: number | number[];
  imageUrl: string;
  href: string;
  viewMoreLabel: string;
  fromLabel: string;
}

interface Props {
  lang: Lang;
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

// Helper function to get minimum duration from a tour (handles both number and array)
function getMinDuration(duration: number | number[]): number {
  return Array.isArray(duration) ? Math.min(...duration) : duration;
}

// Helper function to get maximum duration from a tour (handles both number and array)
function getMaxDuration(duration: number | number[]): number {
  return Array.isArray(duration) ? Math.max(...duration) : duration;
}

export default function ToursFilter(props: Props) {
  return (
    <MantineProvider>
      <ToursFilterInner {...props} />
    </MantineProvider>
  );
}

function ToursFilterInner({ tours, translations: tr, lang }: Props) {
  // Get min and max durations considering both single values and arrays
  const allDurations = tours.flatMap((t) =>
    Array.isArray(t.duration) ? t.duration : [t.duration],
  );
  const minDuration = Math.min(...allDurations);
  const maxDuration = Math.max(...allDurations);
  const [sort, setSort] = useState<string | null>("duration-asc");
  const [minDur, setMinDur] = useState(minDuration);
  const [maxDur, setMaxDur] = useState(maxDuration);

  const filtered = useMemo(() => {
    let list = tours.filter((t) => {
      // Check if tour's duration (or any duration in array) falls within filter range
      const tourMin = getMinDuration(t.duration);
      const tourMax = getMaxDuration(t.duration);
      // Tour matches if any of its durations overlap with the filter range
      return tourMin <= maxDur && tourMax >= minDur;
    });

    if (sort === "price-asc")
      list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc")
      list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "duration-asc")
      list = [...list].sort(
        (a, b) => getMinDuration(a.duration) - getMinDuration(b.duration),
      );
    if (sort === "duration-desc")
      list = [...list].sort(
        (a, b) => getMaxDuration(b.duration) - getMaxDuration(a.duration),
      );
    return list;
  }, [tours, sort, minDur, maxDur]);

  return (
    <>
      <div className={styles.toursControls}>
        <div className={styles.toursControlsGroup} style={{ minWidth: 180 }}>
          <label className={styles.toursControlsLabel} id="sort-label">
            {tr.sortLabel}
          </label>
          <Select
            aria-labelledby="sort-label"
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
            {tr.filterDurationMin}: {durationFormat(minDur, lang)} –{" "}
            {tr.filterDurationMax}: {durationFormat(maxDur, lang)}
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
                thumbLabel={tr.filterDurationMin}
                value={minDur}
                onChange={(v) => {
                  setMinDur(v);
                  if (v > maxDur) setMaxDur(v);
                }}
                min={minDuration}
                max={maxDuration}
                step={1}
                marks={[
                  {
                    value: minDuration,
                    label: durationFormat(minDuration, lang),
                  },
                  {
                    value: maxDuration,
                    label: durationFormat(maxDuration, lang),
                  },
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
                thumbLabel={tr.filterDurationMax}
                value={maxDur}
                onChange={(v) => {
                  setMaxDur(v);
                  if (v < minDur) setMinDur(v);
                }}
                min={minDuration}
                max={maxDuration}
                step={1}
                marks={[
                  {
                    value: minDuration,
                    label: durationFormat(minDuration, lang),
                  },
                  {
                    value: maxDuration,
                    label: durationFormat(maxDuration, lang),
                  },
                ]}
                style={{ paddingBottom: "1.2rem" }}
              />
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Text>{tr.noResults}</Text>
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
                <h2 className={styles.tourCardTitle}>
                  <a href={tour.href}>{tour.title}</a>
                </h2>
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
                    {formatDurationRange(tour.duration, lang)}
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
