import { Suspense } from "react";
import SearchResultsContainer from "@/app/features/products/components/SearchResultsContainer";
import PageContainer from "@/components/layout/PageContainer";

export default function SearchPage() {
  return (
    <PageContainer>
      <Suspense>
        <SearchResultsContainer />
      </Suspense>
    </PageContainer>
  );
}
