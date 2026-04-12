import type { UseFormReturnType } from "@mantine/form";

export type FormStatus = "idle" | "loading" | "success" | "error";

type SetStatus = (status: FormStatus) => void;

interface ApiOkResponse {
  ok: true;
}

interface ApiErrorResponse {
  error: string;
}

/**
 * Payload type definitions for each API endpoint.
 * This ensures type safety: calling the API with a mismatched payload will cause a TypeScript error.
 */
interface ContactFormPayload {
  name: string;
  email: string;
  phone: string;
  tour: string;
  message: string;
  lang: string;
}

interface TourBookingPayload {
  name: string;
  email: string;
  phone: string;
  date: string | null;
  guests: number;
  notes: string;
  tour: string;
  tourSlug: string;
  lang: string;
}

interface TransferPayload {
  name: string;
  email: string;
  phone: string;
  type: string;
  pickup: string;
  dropoff: string;
  date: string | null;
  time: string;
  people: number;
  note: string;
  lang: string;
}

/**
 * Maps each API endpoint to its payload type.
 * If a route is added without updating this map, TypeScript will complain at the call site.
 */
type ApiEndpointMap = {
  "/api/contact-form": ContactFormPayload;
  "/api/tour-booking": TourBookingPayload;
  "/api/transfer": TransferPayload;
};

class ApiClientError extends Error {
  status: number;
  responseBody: string;

  constructor(status: number, responseBody: string) {
    super(`Request failed with status ${status}`);
    this.status = status;
    this.responseBody = responseBody;
  }
}

/**
 * Type-safe POST wrapper for API calls.
 * TEndpoint is constrained to known API endpoints.
 * Passing a mismatched endpoint/payload combination will cause a TypeScript error.
 */
async function postJson<TEndpoint extends keyof ApiEndpointMap>(
  url: TEndpoint,
  payload: ApiEndpointMap[TEndpoint],
): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const responseBody = await res.text();
    throw new ApiClientError(res.status, responseBody);
  }

  // Validate success payload shape lightly for easier debugging.
  const data = (await res.json()) as Partial<ApiOkResponse>;
  if (!data?.ok) {
    throw new Error("Invalid API response: expected { ok: true }");
  }
}

/**
 * Parse API error response to extract a user-friendly message.
 */
function parseApiError(error: unknown): string {
  if (error instanceof ApiClientError) {
    try {
      const json = JSON.parse(error.responseBody) as Partial<ApiErrorResponse>;
      if (json.error && typeof json.error === "string") {
        return json.error;
      }
    } catch {
      // Ignore parse errors, fall through to generic message
    }
    return `Server error (${error.status})`;
  }
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

interface SubmitFormOptions<TValues, TEndpoint extends keyof ApiEndpointMap> {
  form: UseFormReturnType<TValues>;
  values: TValues;
  setStatus: SetStatus;
  toPayload: (values: TValues) => ApiEndpointMap[TEndpoint];
  endpoint: TEndpoint;
  logLabel: string;
}

/**
 * Submit a form with automatic status management, error logging, and type safety.
 * The endpoint must match the payload type, or TypeScript will error.
 */
export async function submitFormWithStatus<
  TValues,
  TEndpoint extends keyof ApiEndpointMap,
>(options: SubmitFormOptions<TValues, TEndpoint>): Promise<void> {
  const { form, values, setStatus, toPayload, endpoint, logLabel } = options;

  setStatus("loading");

  try {
    const payload = toPayload(values);
    await postJson(endpoint, payload);
    setStatus("success");
    // Don't reset here—let the caller decide when to reset after showing success message
  } catch (error) {
    const userMessage = parseApiError(error);
    console.error(`${logLabel} submit failed:`, error);
    setStatus("error");
    // Store error message in form state if needed (optional—for now just console.error)
    (form as any)._lastError = userMessage;
  }
}

export function toContactFormPayload(
  values: Pick<
    ContactFormPayload,
    "name" | "email" | "phone" | "tour" | "message"
  >,
  lang: string,
): ContactFormPayload {
  return {
    ...values,
    lang,
  };
}

export function toTourBookingPayload(
  values: {
    name: string;
    email: string;
    phone: string;
    date: Date | string | null;
    guests: number;
    notes: string;
  },
  meta: { tour: string; tourSlug: string; lang: string },
): TourBookingPayload {
  const serializedDate =
    values.date instanceof Date
      ? values.date.toISOString()
      : typeof values.date === "string"
        ? values.date
        : null;

  return {
    name: values.name,
    email: values.email,
    phone: values.phone,
    date: serializedDate,
    guests: values.guests,
    notes: values.notes,
    tour: meta.tour,
    tourSlug: meta.tourSlug,
    lang: meta.lang,
  };
}

export function toTransferPayload(
  values: {
    name: string;
    email: string;
    phone: string;
    type: string;
    pickup: string;
    dropoff: string;
    date: Date | string | null;
    time: string;
    people: number;
    note: string;
  },
  lang: string,
): TransferPayload {
  const serializedDate =
    values.date instanceof Date
      ? values.date.toISOString()
      : typeof values.date === "string"
        ? values.date
        : null;

  return {
    name: values.name,
    email: values.email,
    phone: values.phone,
    type: values.type,
    pickup: values.pickup,
    dropoff: values.dropoff,
    date: serializedDate,
    time: values.time,
    people: values.people,
    note: values.note,
    lang,
  };
}

/**
 * Shared validators for use in forms.
 * These match the server-side validation logic for consistency.
 */
export { validateEmail, validatePhone } from "./validators";
