import { phoneNumber } from "../config";
import type { Translations } from "../i18n/pt";

interface Props {
  tourTitle: string;
  translations: {
    whatsappCTA: Translations["tours"]["whatsappCTA"];
    whatsappMessage: Translations["tours"]["whatsappMessage"];
  };
}

export default function WhatsAppCTA(props: Props) {
  const message = props.translations.whatsappMessage.replace(
    "{tour}",
    props.tourTitle,
  );
  const encodedMessage = encodeURIComponent(message);
  const cleanPhoneNumber = phoneNumber.replaceAll(" ", "").replaceAll("+", "");
  const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-outline"
      style={{
        minWidth: 180,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        justifyContent: "center",
      }}
    >
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
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9"></path>
        <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1"></path>
      </svg>
      <span>{props.translations.whatsappCTA}</span>
    </a>
  );
}
