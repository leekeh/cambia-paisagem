import { lazy, Suspense, useState } from "react";
import type { Translations } from "../i18n/pt";

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
  };

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
          />
        </Suspense>
      )}
    </>
  );
}
