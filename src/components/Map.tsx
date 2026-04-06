import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { ActionIcon } from "@mantine/core";
import MantineProvider from "./MantineProvider";
import classes from "./Map.module.css";
import type { GetImageResult } from "astro";
import L from "leaflet";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocalisedString {
  pt: string;
  en: string;
  de: string;
}

type Locale = keyof LocalisedString;

interface TourStep {
  time: number; // decimal hours, e.g. 10.75 = 10:45
  title: LocalisedString;
  description: LocalisedString;
  image?: GetImageResult | null; // optional image URL
  imgAttribution?: string; // optional image attribution text
  coordinates: {
    lat: number;
    lng: number;
    range?: number; // in meters, optional radius to show around the point
  };
}

interface TourCarouselProps {
  steps: TourStep[];
  locale?: Locale;
  translations: {
    nextStep: string;
    prevStep: string;
    jumpStep: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(decimal: number): string {
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ─── Map sub-component (loaded lazily to avoid SSR issues) ────────────────────

interface MapProps {
  steps: TourStep[];
  activeIndex: number;
  onMarkerClick: (index: number) => void;
}

function createMarker(i: number, active: boolean) {
  return L.divIcon({
    className: "",
    html: `<div style="
              width:32px;height:32px;border-radius:50%;
              background:${active ? "var(--color-text-muted)" : "var(--color-bg)"};
              color:${active ? "var(--color-surface)" : "var(--color-text)"};
              border:1px solid var(--color-border);
              display:flex;align-items:center;justify-content:center;
              font-family:var(--font-sans);font-weight:700;font-size:13px;
              box-shadow:0 2px 8px rgba(0,0,0,0.18);
            ">${i + 1}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

function createRangeCircle(lat: number, lng: number, range: number) {
  return L.circle([lat, lng], {
    radius: range,
    color: "var(--color-text-muted)",
    fillColor: "var(--color-accent)",
    fillOpacity: 0.18,
    weight: 1.5,
    opacity: 0.5,
    interactive: false,
  });
}

function TourMap({ steps, activeIndex, onMarkerClick }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const circleRef = useRef<any>(null); // Leaflet Circle instance
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const map = L.map(containerRef.current!, {
      center: [steps[0].coordinates.lat, steps[0].coordinates.lng],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Draw a polyline connecting all stops
    const latlngs = steps.map(
      (s) => [s.coordinates.lat, s.coordinates.lng] as [number, number],
    );
    L.polyline(latlngs, {
      color: "var(--color-text-muted)",
      weight: 2,
      opacity: 0.5,
      dashArray: "6 6",
    }).addTo(map);

    // Place markers with zIndexOffset so marker 1 is always above marker 2, etc.
    const markers = steps.map((step, i) => {
      // Highest zIndexOffset for first marker, then decreasing
      const baseZ = (steps.length - i) * 10;
      const marker = L.marker([step.coordinates.lat, step.coordinates.lng], {
        icon: createMarker(i, i === 0),
        zIndexOffset: i === 0 ? baseZ + 1000 : baseZ,
      })
        .addTo(map)
        .on("click", () => onMarkerClick(i));
      return marker;
    });

    markersRef.current = markers;
    mapRef.current = map;
    circleRef.current = null;
    setMapReady(true);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = [];
      if (circleRef.current) {
        circleRef.current.remove();
        circleRef.current = null;
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers, fly to active step, and handle range circle
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    // Update marker icons
    markersRef.current.forEach((marker, i) => {
      const baseZ = (steps.length - i) * 10;
      marker.setIcon(createMarker(i, i === activeIndex));
      marker.setZIndexOffset(i === activeIndex ? baseZ + 1000 : baseZ);
    });

    // Remove previous circle if any
    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    // Add range circle for active step if it has a range
    const activeStep = steps[activeIndex];
    const { lat, lng, range } = activeStep.coordinates;
    if (typeof range === "number" && range > 0) {
      circleRef.current = createRangeCircle(lat, lng, range).addTo(
        mapRef.current!,
      );

      // Calculate bounds for the circle with radius = range * 2 (zoom out more)
      const bounds = L.latLng(lat, lng).toBounds(range * 2);
      mapRef.current!.fitBounds(bounds, { animate: true, duration: 0.9 });
    } else {
      mapRef.current!.flyTo([lat, lng], 15, { duration: 0.9 });
    }
  }, [activeIndex, steps, mapReady]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "200px",
        gridArea: "map",
      }}
    />
  );
}

// ─── Main carousel ────────────────────────────────────────────────────────────

export default function TourCarousel({
  steps,
  locale = "en",
  translations,
}: TourCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const go = (next: number) => {
    setActiveIndex(next);
  };

  const prev = () => go((activeIndex - 1 + steps.length) % steps.length);
  const next = () => go((activeIndex + 1) % steps.length);

  const step = steps[activeIndex];

  // Prefetch next step's image to improve perceived performance when navigating
  useEffect(() => {
    const nextIndex = activeIndex + 1;
    if (nextIndex < steps.length) {
      const nextStep = steps[nextIndex];
      if (nextStep.image && nextStep.image.src) {
        const img = new window.Image();
        img.src = nextStep.image.src;
      }
    }
  }, [activeIndex, steps]);

  return (
    <MantineProvider>
      <div
        className={classes.container}
        onKeyDown={(e) => {
          switch (e.key) {
            case "ArrowLeft":
              prev();
              break;
            case "ArrowRight":
              next();
              break;
            case "Home":
              go(0);
              break;
            case "End":
              go(steps.length - 1);
              break;
            default:
              break;
          }
        }}
      >
        {/* ── Left panel: info ── */}
        {/* Image */}
        <div
          style={{
            width: "100%",
            background: step.image ? "transparent" : "#e8ddd0",
            position: "relative",
            overflow: "hidden",
            flexShrink: 0,
            gridArea: "image",
          }}
        >
          {step.image ? (
            // if attribution is provided, show image with reduced opacity and attribution overlay on hover
            step.imgAttribution ? (
              <figure style={{ display: "contents" }}>
                <img
                  src={step.image.src}
                  alt={step.title[locale]}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <figcaption
                  className={classes.imgAttribution}
                  dangerouslySetInnerHTML={{ __html: step.imgAttribution }}
                />
              </figure>
            ) : (
              <img
                src={step.image.src}
                alt={step.title[locale]}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#b5a898",
                fontSize: "14px",
                fontFamily: "sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              <ImageIcon />
            </div>
          )}
        </div>

        {/* Content */}
        <div className={classes.content}>
          {/* Time */}
          <div className={classes.time}>{formatTime(step.time)}</div>

          {/* Title */}
          <h2 className={classes.title}>{step.title[locale]}</h2>

          {/* Description */}
          <p className={classes.description}>{step.description[locale]}</p>
        </div>

        {/* Navigation */}
        <div className={classes.navigation}>
          <ActionIcon
            onClick={prev}
            aria-label={translations.prevStep}
            variant="subtle"
            disabled={activeIndex === 0}
            style={{
              visibility: activeIndex === 0 ? "hidden" : "visible",
            }}
          >
            <ArrowIcon direction="left" />
          </ActionIcon>

          {/* Dots */}
          <div style={{ display: "flex", gap: "6px" }}>
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={translations.jumpStep.replace(
                  "%step%",
                  (i + 1).toString(),
                )}
                className={classes.dot}
                aria-current={i === activeIndex ? "step" : undefined}
              />
            ))}
          </div>

          <ActionIcon
            onClick={next}
            aria-label={translations.nextStep}
            variant="subtle"
            disabled={activeIndex === steps.length - 1}
            style={{
              visibility:
                activeIndex === steps.length - 1 ? "hidden" : "visible",
            }}
          >
            <ArrowIcon direction="right" />
          </ActionIcon>
        </div>
        <TourMap
          steps={steps}
          activeIndex={activeIndex}
          onMarkerClick={(i) => go(i)}
        />
      </div>
    </MantineProvider>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  const rotation = direction === "left" ? "rotate(180deg)" : "none";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: rotation }}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M5 12l14 0" />
      <path d="M15 16l4 -4" />
      <path d="M15 8l4 4" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12" />
      <path d="M4 16l16 0" />
      <path d="M4 12l3 -3c.928 -.893 2.072 -.893 3 0l4 4" />
      <path d="M13 12l2 -2c.928 -.893 2.072 -.893 3 0l2 2" />
      <path d="M14 7l.01 0" />
    </svg>
  );
}
