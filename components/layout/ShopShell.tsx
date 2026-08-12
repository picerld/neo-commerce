import { Suspense } from "react";
import StorefrontHeader from "./StorefrontHeader";
import StorefrontFooter from "./StorefrontFooter";

// Full-bleed main so the landing page's hero/category sections can span
// edge to edge — individual pages wrap their own content in a max-w
// container (see app/(shop)/*/page.tsx).
export default function ShopShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Suspense fallback={<div className="h-16 border-b-2 border-border/60 bg-primary" />}>
        <StorefrontHeader />
      </Suspense>
      <main className="flex-1">{children}</main>
      <StorefrontFooter />
    </div>
  );
}
