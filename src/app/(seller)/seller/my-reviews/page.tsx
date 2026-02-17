"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Star,
  Loader2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Calendar,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useSellerReviews } from "@/hooks/useSellerReviews";
import { SellerResponseModal } from "@/components/seller/SellerResponseModal";
import ReviewInsights from "@/components/seller/ReviewInsights";
import type { FirestoreReview } from "@/types/reviews";

export const dynamic = "force-dynamic";

const RATING_COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${
            s <= rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export default function SellerMyReviewsPage() {
  const {
    reviews,
    stats,
    products,
    loading,
    error,
    selectedProductId,
    setSelectedProductId,
    ratingFilter,
    setRatingFilter,
    page,
    setPage,
    totalPages,
    paginatedReviews,
    recentCount,
  } = useSellerReviews();

  const [selectedReview, setSelectedReview] = useState<FirestoreReview | null>(null);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"reviews" | "insights">("reviews");

  // Rating distribution chart data
  const ratingDistribution = [1, 2, 3, 4, 5].map((r) => ({
    rating: `${r} Star`,
    count: stats.ratingDistribution[r as keyof typeof stats.ratingDistribution] || 0,
  }));

  const handleReviewClick = (review: FirestoreReview) => {
    setSelectedReview(review);
    setResponseModalOpen(true);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Error loading reviews</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Reviews</h1>
          <p className="text-muted-foreground mt-1">
            Reviews and ratings for your products
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b pb-0">
        <Button
          variant={activeTab === "reviews" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("reviews")}
          className="rounded-b-none"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Reviews
        </Button>
        <Button
          variant={activeTab === "insights" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("insights")}
          className="rounded-b-none"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Insights
        </Button>
      </div>

      {/* Insights Tab */}
      {activeTab === "insights" ? (
        loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ReviewInsights
            reviews={reviews}
            sellerAvgRating={stats.averageRating}
          />
        )
      ) : (
      <>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">out of 5</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent (7d)</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentCount}</div>
            <p className="text-xs text-muted-foreground">last 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">with reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution Chart */}
      {stats.totalReviews > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDistribution} layout="vertical">
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="rating" type="category" width={60} />
                  <Tooltip
                    formatter={(value: number) => [`${value} reviews`, "Count"]}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {ratingDistribution.map((_, idx) => (
                      <Cell key={idx} fill={RATING_COLORS[idx]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              value={selectedProductId || "all"}
              onValueChange={(v) => setSelectedProductId(v === "all" ? null : v)}
            >
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {products.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={ratingFilter?.toString() || "all"}
              onValueChange={(v) => setRatingFilter(v === "all" ? null : parseInt(v))}
            >
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : paginatedReviews.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No reviews found</h3>
            <p className="text-muted-foreground">
              {selectedProductId || ratingFilter
                ? "Try adjusting your filters"
                : "Your products don't have any reviews yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {paginatedReviews.map((review) => (
            <Card
              key={review.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleReviewClick(review)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-sm">
                        {review.userName}
                      </span>
                      <RatingStars rating={review.rating} />
                      {review.verifiedPurchase && (
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      )}
                    </div>
                    {review.title && (
                      <p className="font-medium text-foreground text-sm">{review.title}</p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {review.content}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{review.targetName}</span>
                      <span>&middot;</span>
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      {review.sellerResponse && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <MessageSquare className="h-3 w-3" />
                          Responded
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages} ({reviews.length} reviews)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      </>
      )}

      {/* Seller Response Modal */}
      {selectedReview && (
        <SellerResponseModal
          open={responseModalOpen}
          onClose={() => {
            setResponseModalOpen(false);
            setSelectedReview(null);
          }}
          review={selectedReview}
        />
      )}
    </div>
  );
}
