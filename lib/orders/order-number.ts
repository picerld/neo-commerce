/** `ORD-YYYYMMDD-XXXXXX` — human-readable and doubles as the Midtrans `order_id`, which must be unique per transaction attempt. */
export function generateOrderNumber() {
  const date = new Date();
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${datePart}-${randomPart}`;
}
