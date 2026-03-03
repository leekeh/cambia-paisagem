import type { CollectionEntry } from "astro:content";
import type { Lang } from "../i18n/index";
import { phoneNumber, emailAddress } from "../config";

const SITE_NAME = "Cambia Paisagem";
const BRAND = { "@type": "Brand", name: SITE_NAME };

// ── Helpers ────────────────────────────────────────────────────────────────

/** Returns an absolute URL string. Falls back to the path itself if no site. */
export function absUrl(path: string, site?: URL): string {
  return site ? new URL(path, site).href : path;
}

// ── Review building blocks ─────────────────────────────────────────────────

export function buildReviewSchemas(
  reviews: CollectionEntry<"reviews">[],
  lang: Lang,
) {
  return reviews.map((r) => ({
    "@type": "Review",
    author: { "@type": "Person", name: r.data.author },
    datePublished: r.data.date,
    name: r.data.summary[lang],
    reviewBody: r.data.content[lang],
    reviewRating: {
      "@type": "Rating",
      ratingValue: r.data.rating,
      bestRating: 5,
      worstRating: 1,
    },
  }));
}

export function buildAggregateRating(
  reviews: CollectionEntry<"reviews">[],
): Record<string, unknown> | null {
  if (reviews.length === 0) return null;
  const avg =
    reviews.reduce((sum, r) => sum + r.data.rating, 0) / reviews.length;
  return {
    "@type": "AggregateRating",
    ratingValue: avg.toFixed(1),
    bestRating: 5,
    worstRating: 1,
    reviewCount: reviews.length,
  };
}

// ── Page-level schemas ─────────────────────────────────────────────────────

interface OrganizationSchemaParams {
  lang: Lang;
  /** All reviews to include (or a subset for the homepage) */
  reviews: CollectionEntry<"reviews">[];
  site?: URL;
}

export function buildOrganizationSchema({
  lang,
  reviews,
  site,
}: OrganizationSchemaParams): Record<string, unknown> {
  const aggregateRating = buildAggregateRating(reviews);
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "TourOperator"],
    name: SITE_NAME,
    url: site?.href ?? "/",
    telephone: phoneNumber,
    email: emailAddress,
    address: {
      "@type": "PostalAddress",
      addressCountry: "PT",
      addressLocality: "Lisbon",
    },
    ...(aggregateRating && { aggregateRating }),
    ...(reviews.length > 0 && { review: buildReviewSchemas(reviews, lang) }),
  };
}

interface ProductSchemaParams {
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  slug: string;
  lang: Lang;
  reviews: CollectionEntry<"reviews">[];
  site?: URL;
}

export function buildProductSchema({
  title,
  description,
  imageUrl,
  price,
  slug,
  lang,
  reviews,
  site,
}: ProductSchemaParams): Record<string, unknown> {
  const url = absUrl(`/${lang}/tours/${slug}`, site);
  const aggregateRating = buildAggregateRating(reviews);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description,
    image: imageUrl,
    url,
    brand: BRAND,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url,
    },
    ...(aggregateRating && { aggregateRating }),
    ...(reviews.length > 0 && { review: buildReviewSchemas(reviews, lang) }),
  };
}

interface ItemListSchemaParams {
  label: string;
  lang: Lang;
  tours: Array<{
    slug: string;
    title: string;
    price: number;
    imageUrl: string;
  }>;
  site?: URL;
}

export function buildItemListSchema({
  label,
  lang,
  tours,
  site,
}: ItemListSchemaParams): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: label,
    url: absUrl(`/${lang}/tours`, site),
    numberOfItems: tours.length,
    itemListElement: tours.map((tour, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: tour.title,
        url: absUrl(`/${lang}/tours/${tour.slug}`, site),
        image: absUrl(tour.imageUrl, site),
        offers: {
          "@type": "Offer",
          price: tour.price,
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };
}
