import { lazy, Suspense, useRef, useState } from "react";
import type { Translations } from "../i18n/pt";
import type { BookingToolHandle } from "./BookingModalInner";
import { useWebMcpTool } from "../hooks/useWebMcpTool";

interface Props {
  tourTitle: string;
  tourSlug: string;
  lang: string;
  translations: {
    booking: Translations["booking"];
    tours: { book: Translations["tours"]["book"] };
  };
}

const BookingModalInner = lazy(() => import("./BookingModalInner.tsx"));

export default function BookingModal(props: Props) {
  const [loadInner, setLoadInner] = useState(false);
  const [openSignal, setOpenSignal] = useState(0);
  const [innerReady, setInnerReady] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const innerRef = useRef<BookingToolHandle>(null);
  const isReadyRef = useRef(false);
  const readyWaiters = useRef<Array<() => void>>([]);

  const preload = () => {
    void import("./BookingModalInner.tsx");
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

  useWebMcpTool({
    name: "book_tour",
    description: `Book the "${props.tourTitle}" tour shown on this page, for a chosen date and number of guests. Opens the booking form, fills it in, and submits the booking request by email.`,
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
        date: {
          type: "string",
          format: "date",
          description: "Preferred tour date, as an ISO 8601 date (YYYY-MM-DD).",
        },
        guests: {
          type: "number",
          minimum: 1,
          maximum: 20,
          description: "Number of guests, defaults to 1.",
        },
        notes: {
          type: "string",
          description: "Any special requests or notes for the guide.",
        },
      },
      required: ["name", "email"],
    },
    annotations: { consequentialHint: true },
    execute: async (input) => {
      openModal();
      await waitUntilReady();
      if (!innerRef.current) {
        throw new Error("The booking form failed to load.");
      }

      const result = await innerRef.current.fillAndSubmit({
        name: input.name ? String(input.name) : undefined,
        email: input.email ? String(input.email) : undefined,
        phone: input.phone ? String(input.phone) : undefined,
        date: input.date ? String(input.date) : undefined,
        guests: typeof input.guests === "number" ? input.guests : undefined,
        notes: input.notes ? String(input.notes) : undefined,
      });

      return result.ok
        ? `Booking request for "${props.tourTitle}" was submitted successfully.`
        : `Booking request failed: ${result.error}`;
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
        style={{ minWidth: 180 }}
      >
        {isOpening && <span className="btn-spinner" aria-hidden="true" />}
        <span>{props.translations.tours.book}</span>
      </button>

      {loadInner && (
        <Suspense fallback={null}>
          <BookingModalInner
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
