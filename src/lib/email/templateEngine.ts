function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderMarkdownTable(lines: string[]): string {
  const rows = lines
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"))
    .map((line) =>
      line
        .slice(1, -1)
        .split("|")
        .map((cell) => cell.trim()),
    );

  if (rows.length === 0) return "";

  const hasDivider =
    rows.length > 1 &&
    rows[1].every((cell) => /^:?-{3,}:?$/.test(cell.replaceAll(" ", "")));

  const bodyRows = hasDivider ? [rows[0], ...rows.slice(2)] : rows;

  const renderedRows = bodyRows
    .map(
      (cells) =>
        `<tr>${cells.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
    )
    .join("");

  return `<table border=\"1\" cellpadding=\"8\" cellspacing=\"0\" style=\"border-collapse:collapse;font-family:sans-serif;font-size:14px;\">${renderedRows}</table>`;
}

function markdownToHtml(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const blocks: string[] = [];

  for (let index = 0; index < lines.length; ) {
    const line = lines[index]?.trim() ?? "";

    if (!line) {
      index += 1;
      continue;
    }

    if (line.startsWith("|") && line.endsWith("|")) {
      const tableLines: string[] = [];
      while (index < lines.length) {
        const currentLine = lines[index]?.trim() ?? "";
        if (!currentLine.startsWith("|") || !currentLine.endsWith("|")) {
          break;
        }
        tableLines.push(currentLine);
        index += 1;
      }
      blocks.push(renderMarkdownTable(tableLines));
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length) {
      const currentLine = lines[index]?.trim() ?? "";
      if (
        !currentLine ||
        (currentLine.startsWith("|") && currentLine.endsWith("|"))
      ) {
        break;
      }
      paragraph.push(escapeHtml(currentLine));
      index += 1;
    }

    blocks.push(
      `<p style=\"font-family:sans-serif;font-size:14px;line-height:1.5;\">${paragraph.join("<br />")}</p>`,
    );
  }

  return blocks.join("\n");
}

function coerce(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function populateTemplate(
  template: string,
  values: Record<string, unknown>,
): string {
  return template.replace(/{{\s*([a-zA-Z0-9_-]+)\s*}}/g, (_unused, key) =>
    coerce(values[key]),
  );
}

interface ParsedTemplate {
  subject: string;
  text: string;
  html: string;
}

function formatLanguageLabel(rawLang: string): string {
  const lang = rawLang.trim();
  if (!lang) return "";

  try {
    const displayNames = new Intl.DisplayNames([lang], { type: "language" });
    return displayNames.of(lang) ?? lang;
  } catch {
    return lang;
  }
}

function formatReadableDate(rawDate: string, locale: string): string {
  const input = rawDate.trim();
  if (!input) return "";

  try {
    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
    const formatter = new Intl.DateTimeFormat(locale || "en", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });

    if (dateOnlyMatch) {
      const year = Number(dateOnlyMatch[1]);
      const month = Number(dateOnlyMatch[2]) - 1;
      const day = Number(dateOnlyMatch[3]);
      const date = new Date(Date.UTC(year, month, day));
      return formatter.format(date);
    }

    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) return input;
    return formatter.format(parsed);
  } catch {
    return input;
  }
}

function normalizeValues(
  values: Record<string, unknown>,
): Record<string, unknown> {
  const normalized = { ...values };
  const langCode = coerce(values.lang);

  if (langCode && !("lang-code" in normalized)) {
    normalized["lang-code"] = langCode;
  }

  if (langCode && "lang" in normalized) {
    normalized.lang = formatLanguageLabel(langCode);
  }

  if ("date" in normalized) {
    const rawDate = coerce(values.date);
    normalized.date = rawDate ? formatReadableDate(rawDate, langCode) : "";
  }

  // Auto-derive phone-line from phone
  if (!("phone-line" in normalized)) {
    const phone = coerce(values.phone);
    normalized["phone-line"] = phone ? ` ou ${phone}` : "";
  }

  // Auto-derive note-line from note or notes
  if (!("note-line" in normalized)) {
    const note = coerce(values.note || values.notes);
    normalized["note-line"] = note ? `Deixaram também uma nota: ${note}.` : "";
  }

  return normalized;
}

export function parseTemplate(
  template: string,
  values: Record<string, unknown>,
): ParsedTemplate {
  const normalizedValues = normalizeValues(values);
  const [subjectLine, ...bodyLines] = template.trim().split(/\r?\n/);
  const subjectMatch = /^Subject:\s*(.+)$/i.exec(subjectLine ?? "");

  if (!subjectMatch) {
    throw new Error("Template must start with a Subject: line");
  }

  const subject = populateTemplate(subjectMatch[1], normalizedValues).trim();
  const text = populateTemplate(bodyLines.join("\n").trim(), normalizedValues);
  const html = markdownToHtml(text);

  return { subject, text, html };
}
