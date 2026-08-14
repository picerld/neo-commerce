import crypto from "node:crypto";

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

const SNAP_BASE_URL = isProduction ? "https://app.midtrans.com/snap/v1" : "https://app.sandbox.midtrans.com/snap/v1";
const CORE_API_BASE_URL = isProduction ? "https://api.midtrans.com/v2" : "https://api.sandbox.midtrans.com/v2";

function serverKey() {
  const key = process.env.MIDTRANS_SERVER_KEY;
  if (!key) throw new Error("MIDTRANS_SERVER_KEY is not set");
  return key;
}

function authHeader() {
  return `Basic ${Buffer.from(`${serverKey()}:`).toString("base64")}`;
}

export type SnapItemDetail = {
  id: string;
  price: number;
  quantity: number;
  name: string;
};

export type CreateSnapTransactionParams = {
  orderNumber: string;
  grossAmount: number;
  customer: { name: string; email: string; phone: string };
  items: SnapItemDetail[];
};

export type SnapTransaction = {
  token: string;
  redirectUrl: string;
};

/** Creates a Midtrans Snap transaction — see https://docs.midtrans.com/reference/create-transaction */
export async function createSnapTransaction(params: CreateSnapTransactionParams): Promise<SnapTransaction> {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  const res = await fetch(`${SNAP_BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: params.orderNumber,
        gross_amount: params.grossAmount,
      },
      customer_details: {
        first_name: params.customer.name,
        email: params.customer.email,
        phone: params.customer.phone,
      },
      item_details: params.items.map((item) => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        name: item.name.slice(0, 50),
      })),
      credit_card: { secure: true },
      callbacks: { finish: `${appUrl}/orders/${params.orderNumber}` },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Midtrans create transaction failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as { token: string; redirect_url: string };
  return { token: json.token, redirectUrl: json.redirect_url };
}

/** Fetches a transaction's current status directly from Midtrans — see
 * https://docs.midtrans.com/reference/get-transaction-status. Same response
 * shape as the notification webhook payload, so it can be run through
 * `mapTransactionStatus` the same way. Used as a manual fallback for
 * environments where Midtrans can't reach our notification webhook (e.g.
 * local dev on localhost) — a real "check status" action, not just a dev
 * convenience. */
export async function getTransactionStatus(midtransOrderId: string): Promise<MidtransNotificationPayload> {
  const res = await fetch(`${CORE_API_BASE_URL}/${encodeURIComponent(midtransOrderId)}/status`, {
    headers: { Accept: "application/json", Authorization: authHeader() },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Midtrans get status failed (${res.status}): ${body}`);
  }

  return (await res.json()) as MidtransNotificationPayload;
}

export type MidtransNotificationPayload = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  transaction_id: string;
  payment_type: string;
  fraud_status?: string;
  va_numbers?: { bank: string; va_number: string }[];
  settlement_time?: string;
  expiry_time?: string;
  [key: string]: unknown;
};

/** Verifies the notification signature per https://docs.midtrans.com/docs/https-notification-webhooks — sha512(order_id+status_code+gross_amount+ServerKey). */
export function verifyNotificationSignature(payload: MidtransNotificationPayload): boolean {
  const expected = crypto
    .createHash("sha512")
    .update(`${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey()}`)
    .digest("hex");
  return expected === payload.signature_key;
}

export type MidtransPaymentStatus = "pending" | "settlement" | "capture" | "deny" | "cancel" | "expire" | "refund" | "partial_refund";

/** Maps Midtrans `transaction_status` (+ `fraud_status` for credit card capture) to our PaymentStatus enum. */
export function mapTransactionStatus(payload: MidtransNotificationPayload): MidtransPaymentStatus {
  const { transaction_status, fraud_status } = payload;
  if (transaction_status === "capture") {
    return fraud_status === "accept" ? "capture" : "deny";
  }
  return transaction_status as MidtransPaymentStatus;
}
