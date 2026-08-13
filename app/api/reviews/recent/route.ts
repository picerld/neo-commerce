import { prisma } from "@/lib/prisma";
import { apiSuccess, apiErrorFromException } from "@/lib/api-response";
import type { RecentReviewSummary } from "@/app/features/reviews/types/review.type";

const RECENT_LIMIT = 8;

// Platform-wide latest reviews — powers the homepage's social-proof
// section. Only reviews left on comments (non-empty) surface here, since a
// bare star rating with no text reads as noise in a "what buyers are
// saying" feed.
export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { comment: { not: null }, product: { isActive: true } },
      include: { user: { select: { name: true } }, product: { select: { name: true, slug: true, imageUrl: true } } },
      orderBy: { createdAt: "desc" },
      take: RECENT_LIMIT,
    });

    const response: RecentReviewSummary[] = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      reviewerName: r.user.name,
      createdAt: r.createdAt.toISOString(),
      productName: r.product.name,
      productSlug: r.product.slug,
      productImageUrl: r.product.imageUrl,
    }));

    return apiSuccess(response);
  } catch (error) {
    return apiErrorFromException(error);
  }
}
