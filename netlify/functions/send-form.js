const RESEND_API_URL = "https://api.resend.com/emails";

const defaultHeaders = {
  "Content-Type": "application/json"
};

function sanitize(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function toHtmlList(data) {
  const rows = Object.entries(data)
    .map(([key, value]) => `<li><strong>${key}:</strong> ${String(value)}</li>`)
    .join("");

  return `<h2>Nové odoslanie formulára</h2><ul>${rows}</ul>`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: defaultHeaders,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.FORMS_RECIPIENT_EMAIL;
  const sender = process.env.FORMS_SENDER_EMAIL || "onboarding@resend.dev";

  if (!apiKey || !recipient) {
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({
        error: "Missing RESEND_API_KEY or FORMS_RECIPIENT_EMAIL"
      })
    };
  }

  let payload;

  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers: defaultHeaders,
      body: JSON.stringify({ error: "Invalid JSON payload" })
    };
  }

  const fields = payload.fields && typeof payload.fields === "object" ? payload.fields : {};
  const formName = sanitize(payload.formName) || "Neznámy formulár";

  const normalizedFields = Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [sanitize(key), sanitize(value)])
  );

  const resendPayload = {
    from: sender,
    to: [recipient],
    subject: `Formulár: ${formName}`,
    html: toHtmlList({
      "Názov formulára": formName,
      ...normalizedFields
    })
  };

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        ...defaultHeaders,
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(resendPayload)
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        statusCode: 502,
        headers: defaultHeaders,
        body: JSON.stringify({
          error: "Resend API error",
          details: result
        })
      };
    }

    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify({ success: true, id: result.id })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({
        error: "Failed to send email",
        details: error.message
      })
    };
  }
};
