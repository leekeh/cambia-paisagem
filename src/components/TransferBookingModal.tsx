import { lazy, Suspense, useState } from "react";
import type { Translations } from "../i18n/pt";

interface Props {
  lang: string;
  translations: {
    transfer: Translations["transfer"];
  };
}

const TransferBookingModalInner = lazy(
  () => import("./TransferBookingModalInner.tsx"),
);

export default function TransferBookingModal(props: Props) {
  const [loadInner, setLoadInner] = useState(false);
  const [openSignal, setOpenSignal] = useState(0);
  const [innerReady, setInnerReady] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

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
      >
        {isOpening && <span className="btn-spinner" aria-hidden="true" />}
        <span>{props.translations.transfer.cta}</span>
      </button>

      {loadInner && (
        <Suspense fallback={null}>
          <TransferBookingModalInner
            {...props}
            openSignal={openSignal}
            onReady={handleInnerReady}
          />
        </Suspense>
      )}
    </>
  );
}
