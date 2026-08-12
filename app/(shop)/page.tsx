import { Suspense } from "react";
import { redirect } from "next/navigation";
import LandingPageContainer from "@/app/features/products/components/LandingPageContainer";
import PageContainer from "@/components/layout/PageContainer";
import { getSession } from "@/lib/auth/session";

export default async function ShopHomePage() {
  const session = await getSession();
  if (session?.role === "admin") redirect("/admin");

  return (
    <PageContainer>
      <Suspense>
        <LandingPageContainer />
      </Suspense>
    </PageContainer>
  );
}
