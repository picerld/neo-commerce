import { Suspense } from "react";
import StorefrontHeader from "./StorefrontHeader";
import StorefrontFooter from "./StorefrontFooter";
import MobileBottomNav from "./MobileBottomNav";
import ScrollToTopButton from "@/components/shared/ScrollToTopButton";

// Full-bleed main so the landing page's hero/category sections can span
// edge to edge — individual pages wrap their own content in a max-w
// container (see app/(shop)/*/page.tsx).
export default function ShopShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background pb-16 md:pb-0">
      <div className="print:hidden">
        <Suspense fallback={<div className="h-16 border-b-2 border-border/60 bg-primary" />}>
          <StorefrontHeader />
        </Suspense>
      </div>
      <main className="flex-1">{children}</main>
      <div className="print:hidden">
        <StorefrontFooter />
      </div>
      <div className="print:hidden">
        <MobileBottomNav />
      </div>
      <div className="print:hidden">
        <ScrollToTopButton />
      </div>
    </div>
  );
}
