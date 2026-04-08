import type { Lang } from "./i18n";

export function durationFormat(
  hours?: number,
  lang?: Lang,
  style: "short" | "long" = "short",
) {
  if (!hours || !lang) return `${hours}h`;
  if ("DurationFormat" in Intl && typeof Intl.DurationFormat === "function") {
    try {
      const hoursRounded = Math.floor(hours);
      // 3 hr or 3.5 hr. if there is a fractional part,
      return new Intl.DurationFormat(lang, {
        style: style,
      })
        .format({ hours: hoursRounded })
        .replace(`${hoursRounded}`, `${hours}`);
    } catch (e) {
      console.warn(
        "Error using Intl.DurationFormat, falling back to manual format",
        e,
      );
    }
  }
  return `${hours}h`;
}

export function formatDurationRange(
  duration: number | number[],
  lang: Lang,
): string {
  if (Array.isArray(duration)) {
    const min = Math.min(...duration);
    const max = Math.max(...duration);
    return min === max
      ? durationFormat(min, lang)
      : `${min}–${durationFormat(max, lang)}`;
  }
  return durationFormat(duration, lang);
}
