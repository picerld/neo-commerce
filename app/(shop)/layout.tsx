import ShopShell from "@/components/layout/ShopShell";

// No auth gate here — this group covers both public pages (landing,
// product detail) and pages that need a session (cart/checkout/orders,
// gated individually via requirePageRole so guests only get bounced to
// /login when they actually try to buy something).
export default function ShopGroupLayout({ children }: { children: React.ReactNode }) {
  return <ShopShell>{children}</ShopShell>;
}
