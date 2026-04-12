export const ownerBookingTemplate = `Subject: Novo pedido de reserva no Cambia Paisagem

Olá Nuno👋

@ {{name}} gostaria de reservar um tour {{tour}} no dia {{date}} para {{guests}} pessoas. Podes contactá-los por {{email}}{{phone-line}}. Falam possivelmente {{lang}}.

{{note-line}}

Detalhes:

| Nome              | {{name}}   |
| ----------------- | ---------- |
| Tour              | {{tour}}   |
| Email             | {{email}}  |
| Telemóvel         | {{phone}}  |
| Idioma utilizado  | {{lang}}   |
| Número de pessoas | {{guests}} |
| Data solicitada   | {{date}}   |
| Nota              | {{note}}   |
`;

export const ownerContactTemplate = `Subject: Nova mensagem recebida no Cambia Paisagem!

Olá Nuno 🤠

Recebemos a seguinte mensagem no website:

{{message}}

Informações de contacto:

| Nome             | {{name}}  |
| ---------------- | --------- |
| Email            | {{email}} |
| Telemóvel        | {{phone}} |
| Idioma utilizado | {{lang}}  |
`;

export const ownerTransferTemplate = `Subject: Novo pedido de transfer no Cambia Paisagem!

Olá Nuno 🛸

@ {{name}} gostaria de reservar um transfer de {{pickup}} para {{dropoff}} no dia {{date}}. O pedido é para um grupo de {{people}} pessoas. Podes contactá-los por {{email}}{{phone-line}}. Falam possivelmente {{lang}}.

{{note-line}}

Detalhes:

| Nome              | {{name}}    |
| ----------------- | ----------- |
| Partida           | {{pickup}}  |
| Destino           | {{dropoff}} |
| Email             | {{email}}   |
| Telemóvel         | {{phone}}   |
| Idioma utilizado  | {{lang}}    |
| Número de pessoas | {{people}}  |
| Data solicitada   | {{date}}    |
| Hora solicitada   | {{time}}    |
| Nota              | {{note}}    |
`;

const userAutoReplyTemplateEn = `Subject: We received your request at Cambia Paisagem

Hello {{name}}👋

Thanks a lot for your request to Cambia Paisagem! We will get back to you shortly.
In the meantime, hope you have a nice day!

Nuno
`;

const userAutoReplyTemplatePt = `Subject: Recebemos o seu pedido no Cambia Paisagem

Olá {{name}}👋

Muito obrigado pelo seu pedido ao Cambia Paisagem! Iremos responder-lhe em breve.
Entretanto, esperamos que tenha um bom dia!

Nuno
`;

const userAutoReplyTemplateDe = `Subject: Wir haben Ihre Anfrage bei Cambia Paisagem erhalten

Hallo {{name}}👋

Vielen Dank für Ihre Anfrage bei Cambia Paisagem! Wir werden uns so bald wie möglich bei Ihnen melden.
In der Zwischenzeit wünschen wir Ihnen einen schönen Tag!

Nuno
`;

const autoReplyTemplates: Record<string, string> = {
  en: userAutoReplyTemplateEn,
  pt: userAutoReplyTemplatePt,
  de: userAutoReplyTemplateDe,
};

export function getUserAutoReplyTemplate(lang: string): string {
  return autoReplyTemplates[lang] ?? userAutoReplyTemplateEn;
}
