"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Flag,
  Star,
  Search,
  Loader2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useReviewModeration } from "@/hooks/useReviewModeration";
import { ReviewModerationModal } from "@/components/admin/reviews/ReviewModerationModal";
import type { FirestoreReview, ReviewStatus, ReviewTargetType } from "@/types/reviews";

// Status tab configuration
const STATUS_TABS: Array<{
  key: ReviewStatus | "all";
  label: string;
  icon: React.ElementType;
  color: string;
}> = [
  { key: "all", label: "All Reviews", icon: MessageSquare, color: "text-foreground" },
  { key: "pending", label: "Pending", icon: Clock, color: "text-yellow-600" },
  { key: "approved", label: "Approved", icon: CheckCircle, color: "text-green-600" },
  { key: "flagged", label: "Flagged", icon: Flag, color: "text-orange-600" },
  { key: "rejected", label: "Rejected", icon: XCircle, color: "text-red-600" },
];

// Status badge styles
const STATUS_BADGE_CONFIG: Record<ReviewStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  flagged: { label: "Flagged", variant: "destructive" },
  rejected: { label: "Rejected", variant: "outline" },
};

/** Render filled and empty stars for a rating */
function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export default function SellerReviewsPage() {
  const {
    reviews,
    stats,
    loading,
    error,
    filters,
    setFilters,
    page,
    setPage,
    totalPages,
    paginatedReviews,
    moderateReview,
    addAdminResponse,
    deleteReviewAsAdmin,
    clearFlags,
    refetch,
  } = useReviewModeration(20);

  const [activeTab, setActiveTab] = useState<ReviewStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState<ReviewTargetType | "all">("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [selectedReview, setSelectedReview] = useState<FirestoreReview | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Count reviews by status for tab badges
  const statusCounts = useMemo(() => {
    if (!stats) return { all: 0, pending: 0, approved: 0, flagged: 0, rejected: 0 };
    return {
      all: stats.totalReviews,
      pending: stats.pendingCount,
      approved: stats.approvedCount,
      flagged: stats.flaggedCount,
      rejected: stats.rejectedCount,
    };
  }, [stats]);

  // Apply combined filters when tab, search, target type, or rating changes
  const handleTabChange = (tab: ReviewStatus | "all") => {
    setActiveTab(tab);
    setFilters({
      ...filters,
      status: tab === "all" ? undefined : tab,
      keyword: searchQuery || undefined,
      targetType: targetTypeFilter === "all" ? undefined : targetTypeFilter,
      ratingMin: ratingFilter === "all" ? undefined : parseInt(ratingFilter),
      ratingMax: ratingFilter === "all" ? undefined : parseInt(ratingFilter),
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setFilters({
      ...filters,
      keyword: value || undefined,
    });
  };

  const handleTargetTypeChange = (value: string) => {
    const targetType = value as ReviewTargetType | "all";
    setTargetTypeFilter(targetType);
    setFilters({
      ...filters,
      targetType: targetType === "all" ? undefined : targetType,
    });
  };

  const handleRatingChange = (value: string) => {
    setRatingFilter(value);
    setFilters({
      ...filters,
      ratingMin: value === "all" ? undefined : parseInt(value),
      ratingMax: value === "all" ? undefined : parseInt(value),
    });
  };

  const handleReviewClick = (review: FirestoreReview) => {
    setSelectedReview(review);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedReview(null);
  };

  // Error state
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
              <Button variant="outline" size="sm" onClick={refetch} className="ml-auto">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reviews</h1>
          <p className="text-muted-foreground mt-1">
            Moderate and manage customer reviews
            {stats && (
              <span className="ml-2">
                &middot; {stats.totalReviews} total &middot; {stats.averageRating.toFixed(1)} avg rating
              </span>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReviews ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.pendingCount ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.approvedCount ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
            <Flag className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.flaggedCount ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageRating.toFixed(1) ?? "0.0"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {STATUS_TABS.map((tab) => {
          const TabIcon = tab.icon;
          const count = statusCounts[tab.key as keyof typeof statusCounts] || 0;
          const isActive = activeTab === tab.key;
          return (
            <Button
              key={tab.key}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => handleTabChange(tab.key)}
              className="gap-2"
            >
              <TabIcon className={`h-4 w-4 ${isActive ? "" : tab.color}`} />
              {tab.label}
              <Badge variant={isActive ? "secondary" : "outline"} className="ml-1 text-xs">
                {count}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 z-10 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews by content, title, reviewer, or target..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={targetTypeFilter} onValueChange={handleTargetTypeChange}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Target Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="grower">Grower</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ratingFilter} onValueChange={handleRatingChange}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Rating" />
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
              {searchQuery || activeTab !== "all"
                ? "Try adjusting your search or filters"
                : "Reviews will appear here once customers submit them"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {paginatedReviews.map((review) => {
            const statusBadge = STATUS_BADGE_CONFIG[review.status];
            return (
              <Card
                key={review.id}
                className="hover:shadow-md transition-shadow cursor-pointer border"
                onClick={() => handleReviewClick(review)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Main content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground">{review.userName}</span>
                          <RatingStars rating={review.rating} />
                          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                          {review.flagCount > 0 && (
                            <Badge variant="destructive" className="gap-1">
                              <Flag className="h-3 w-3" />
                              {review.flagCount}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Review title and content */}
                      {review.title && (
                        <p className="font-medium text-foreground text-sm">{review.title}</p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {review.content}
                      </p>

                      {/* Target info */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {review.targetType === "product" ? "Product" : "Grower"}
                        </Badge>
                        <span>{review.targetName}</span>
                        {review.images && review.images.length > 0 && (
                          <span className="text-muted-foreground">
                            &middot; {review.images.length} image{review.images.length > 1 ? "s" : ""}
                          </span>
                        )}
                        {review.sellerResponse && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <MessageSquare className="h-3 w-3" />
                            Seller responded
                          </Badge>
                        )}
                        {review.adminResponse && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            Admin responded
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex sm:flex-col gap-2 items-center justify-end">
                      <ChevronRight className="h-5 w-5 text-muted-foreground hidden sm:block" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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

      {/* Moderation Modal */}
      {selectedReview && (
        <ReviewModerationModal
          open={modalOpen}
          onClose={handleModalClose}
          review={selectedReview}
          onModerate={moderateReview}
          onAddAdminResponse={addAdminResponse}
          onDelete={deleteReviewAsAdmin}
          onClearFlags={clearFlags}
        />
      )}
    </div>
  );
}
