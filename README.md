# legaltech

Nastavenie univerzálneho odosielania formulárov cez **Resend** na Netlify.

## Čo je v projekte

- Netlify Function `send-form` (`netlify/functions/send-form.js`) ktorá prijme dáta formulára a odošle email cez Resend API.
- Frontend skript `public/form-handler.js`, ktorý automaticky zachytí submit pre každý `<form>` na stránke a odošle ho na `/api/forms`.
- Redirect v `netlify.toml`, ktorý mapuje `/api/forms` na Netlify Function.

## Netlify konfigurácia

V Netlify projekte nastav environment variables:

- `RESEND_API_KEY` = tvoj Resend API kľúč (napr. `re_...`)
- `FORMS_RECIPIENT_EMAIL` = email, kam sa majú formuláre doručovať
- `FORMS_SENDER_EMAIL` = overený sender v Resend (voliteľné, fallback je `onboarding@resend.dev`)

## Použitie na webe

Do layoutu (alebo každej stránky) pridaj skript:

```html
<script src="/form-handler.js" defer></script>
```

> Ak tvoj build publikuje statické súbory inam (napr. root `/` alebo `/assets`), uprav cestu podľa projektu.

Každý formulár potom odošle JSON payload na endpoint `/api/forms`.

## Poznámky

- API kľúč nikdy nedávaj do frontend kódu.
- Pri doménovom odosielateľovi si najprv over doménu v Resend.
