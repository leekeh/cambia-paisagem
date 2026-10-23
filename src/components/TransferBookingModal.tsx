import { lazy, Suspense, useRef, useState } from "react";
import type { Translations } from "../i18n/pt";
import type { TransferToolHandle } from "./TransferBookingModalInner";
import { useWebMcpTool } from "../hooks/useWebMcpTool";

interface Props {
  lang: string;
  ctaLabel?: string;
  transferType?: string;
  modalTitle?: string;
  pickupPlaceholder?: string;
  dropoffPlaceholder?: string;
  translations: {
    transfer: Translations["transfer"];
  };
}

const TransferBookingModalInner = lazy(
  () => import("./TransferBookingModalInner.tsx"),
);

/**
 * Builds a unique, spec-compliant tool name from a transfer type, e.g.
 * "private-taxi" -> "request_private_taxi_transfer" and
 * "airport-cruise-transfer" -> "request_airport_cruise_transfer" (no "_transfer_transfer").
 */
function toTransferToolName(transferType: string): string {
  const segment = transferType.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return segment.endsWith("transfer")
    ? `request_${segment}`
    : `request_${segment}_transfer`;
}

export default function TransferBookingModal(props: Props) {
  const [loadInner, setLoadInner] = useState(false);
  const [openSignal, setOpenSignal] = useState(0);
  const [innerReady, setInnerReady] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const innerRef = useRef<TransferToolHandle>(null);
  const isReadyRef = useRef(false);
  const readyWaiters = useRef<Array<() => void>>([]);

  const preload = () => {
    void import("./TransferBookingModalInner.tsx");
  };

  const openModal = () => {
    setLoadInner(true);
    if (!innerReady) {
      setIsOpening(true);
    }
    setOpenSignal((value) => value + 1);
  };

  const handleInnerReady = () => {
    setInnerReady(true);
    setIsOpening(false);
    isReadyRef.current = true;
    readyWaiters.current.forEach((resolve) => resolve());
    readyWaiters.current = [];
  };

  const waitUntilReady = () => {
    if (isReadyRef.current) return Promise.resolve();
    return new Promise<void>((resolve) => readyWaiters.current.push(resolve));
  };

  const transferType = props.transferType ?? "transfer";
  const transferLabel = props.modalTitle ?? props.ctaLabel ?? "transfer";

  useWebMcpTool({
    name: toTransferToolName(transferType),
    description: `Request a "${transferLabel}" on this page, for a chosen pickup/dropoff location, date and time. Opens the booking form, fills it in, and submits the request by email.`,
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Full name of the lead traveler.",
        },
        email: {
          type: "string",
          description: "Email address to receive the booking confirmation.",
        },
        phone: { type: "string", description: "Contact phone number." },
        pickup: { type: "string", description: "Pickup location." },
        dropoff: { type: "string", description: "Dropoff location." },
        date: {
          type: "string",
          format: "date",
          description: "Preferred date, as an ISO 8601 date (YYYY-MM-DD).",
        },
        time: {
          type: "string",
          description: "Preferred pickup time, 24h format as HH:MM.",
        },
        people: {
          type: "number",
          minimum: 1,
          maximum: 20,
          description: "Number of people, defaults to 1.",
        },
        note: {
          type: "string",
          description: "Any special requests or notes.",
        },
      },
      required: ["name", "email", "pickup", "dropoff"],
    },
    annotations: { consequentialHint: true },
    execute: async (input) => {
      openModal();
      await waitUntilReady();
      if (!innerRef.current) {
        throw new Error("The transfer booking form failed to load.");
      }

      const result = await innerRef.current.fillAndSubmit({
        name: input.name ? String(input.name) : undefined,
        email: input.email ? String(input.email) : undefined,
        phone: input.phone ? String(input.phone) : undefined,
        pickup: input.pickup ? String(input.pickup) : undefined,
        dropoff: input.dropoff ? String(input.dropoff) : undefined,
        date: input.date ? String(input.date) : undefined,
        time: input.time ? String(input.time) : undefined,
        people: typeof input.people === "number" ? input.people : undefined,
        note: input.note ? String(input.note) : undefined,
      });

      return result.ok
        ? `Transfer request ("${transferLabel}") was submitted successfully.`
        : `Transfer request failed: ${result.error}`;
    },
  });

  return (
    <>
      <button
        type="button"
        className="btn btn-outline"
        onClick={openModal}
        onMouseEnter={preload}
        onFocus={preload}
        aria-busy={isOpening}
        disabled={isOpening}
      >
        {isOpening && <span className="btn-spinner" aria-hidden="true" />}
        <span>{props.ctaLabel ?? props.translations.transfer.cta}</span>
      </button>

      {loadInner && (
        <Suspense fallback={null}>
          <TransferBookingModalInner
            {...props}
            openSignal={openSignal}
            onReady={handleInnerReady}
            ref={innerRef}
          />
        </Suspense>
      )}
    </>
  );
}
