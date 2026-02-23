"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo, useCallback } from "react";
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
  Star,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  BarChart3,
  Download,
  Loader2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { useReviewModeration } from "@/hooks/useReviewModeration";
import type { FirestoreReview } from "@/types/reviews";

// =================== Helpers ===================

/** Group reviews by ISO week, returns sorted array of { week, count, avgRating } */
function groupByWeek(reviews: FirestoreReview[], months: number) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);

  const weekMap = new Map<string, { count: number; totalRating: number }>();
  for (const r of reviews) {
    const d = new Date(r.createdAt);
    if (d < cutoff) continue;
    // Get ISO week label as "YYYY-Www"
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const weekNum = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
    const label = `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
    const entry = weekMap.get(label) || { count: 0, totalRating: 0 };
    entry.count++;
    entry.totalRating += r.rating;
    weekMap.set(label, entry);
  }

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, data]) => ({
      week,
      count: data.count,
      avgRating: Math.round((data.totalRating / data.count) * 100) / 100,
    }));
}

/** Compute per-product stats from reviews */
function computeProductStats(reviews: FirestoreReview[]) {
  const map = new Map<string, { name: string; count: number; totalRating: number }>();
  for (const r of reviews) {
    const entry = map.get(r.targetId) || { name: r.targetName, count: 0, totalRating: 0 };
    entry.count++;
    entry.totalRating += r.rating;
    map.set(r.targetId, entry);
  }
  return Array.from(map.values()).map((p) => ({
    ...p,
    avgRating: Math.round((p.totalRating / p.count) * 100) / 100,
  }));
}

/** Generate CSV string from reviews */
function generateCSV(reviews: FirestoreReview[]): string {
  const headers = [
    "ID", "Target Type", "Target ID", "Target Name", "User", "Email",
    "Rating", "Title", "Content", "Verified Purchase", "Status",
    "Helpful Count", "Flag Count", "Created At",
  ];
  const rows = reviews.map((r) => [
    r.id,
    r.targetType,
    r.targetId,
    `"${r.targetName.replace(/"/g, '""')}"`,
    `"${r.userName.replace(/"/g, '""')}"`,
    r.userEmail,
    r.rating,
    `"${r.title.replace(/"/g, '""')}"`,
    `"${r.content.replace(/"/g, '""')}"`,
    r.verifiedPurchase ? "Yes" : "No",
    r.status,
    r.helpfulCount,
    r.flagCount,
    r.createdAt,
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

/** Download string as file */
function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Rating bar chart colors
const RATING_COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];

// =================== Page Component ===================

export default function ReviewAnalyticsPage() {
  const { reviews: allReviews, stats, loading } = useReviewModeration(10000);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>("all");

  // Filter reviews by date range and target type
  const filteredReviews = useMemo(() => {
    let result = allReviews;
    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter((r) => new Date(r.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((r) => new Date(r.createdAt) <= to);
    }
    if (targetTypeFilter !== "all") {
      result = result.filter((r) => r.targetType === targetTypeFilter);
    }
    return result;
  }, [allReviews, dateFrom, dateTo, targetTypeFilter]);

  // Summary card metrics
  const summaryMetrics = useMemo(() => {
    const total = filteredReviews.length;
    if (total === 0) return { total: 0, avgRating: 0, verifiedPct: 0, responseRate: 0 };

    const sumRating = filteredReviews.reduce((s, r) => s + r.rating, 0);
    const verifiedCount = filteredReviews.filter((r) => r.verifiedPurchase).length;
    const respondedCount = filteredReviews.filter(
      (r) => r.adminResponse || r.sellerResponse,
    ).length;

    return {
      total,
      avgRating: Math.round((sumRating / total) * 100) / 100,
      verifiedPct: Math.round((verifiedCount / total) * 100),
      responseRate: Math.round((respondedCount / total) * 100),
    };
  }, [filteredReviews]);

  // Rating distribution chart data
  const ratingDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    for (const r of filteredReviews) {
      if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++;
    }
    return dist.map((count, i) => ({
      stars: `${i + 1} Star${i === 0 ? "" : "s"}`,
      count,
    }));
  }, [filteredReviews]);

  // Weekly volume and trend data
  const weeklyData = useMemo(() => groupByWeek(filteredReviews, 6), [filteredReviews]);

  // Product-level stats
  const productStats = useMemo(() => computeProductStats(filteredReviews), [filteredReviews]);
  const topRated = useMemo(
    () => [...productStats].filter((p) => p.count >= 2).sort((a, b) => b.avgRating - a.avgRating).slice(0, 5),
    [productStats],
  );
  const lowestRated = useMemo(
    () => [...productStats].filter((p) => p.count >= 2).sort((a, b) => a.avgRating - b.avgRating).slice(0, 5),
    [productStats],
  );
  const mostReviewed = useMemo(
    () => [...productStats].sort((a, b) => b.count - a.count).slice(0, 5),
    [productStats],
  );

  // CSV export handler
  const handleExportCSV = useCallback(() => {
    const csv = generateCSV(filteredReviews);
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadCSV(csv, `review-analytics-${timestamp}.csv`);
  }, [filteredReviews]);

  // =================== Loading State ===================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">Loading review analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Review Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Insights and trends across all customer reviews
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" disabled={filteredReviews.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="date-from">From</label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="date-to">To</label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Type</label>
              <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="product">Products</SelectItem>
                  <SelectItem value="grower">Growers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(dateFrom || dateTo || targetTypeFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setTargetTypeFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{summaryMetrics.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{summaryMetrics.avgRating}</p>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(summaryMetrics.avgRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verified Purchase %</p>
                <p className="text-2xl font-bold">{summaryMetrics.verifiedPct}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">{summaryMetrics.responseRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredReviews.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="stars" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {ratingDistribution.map((_, i) => (
                      <Cell key={i} fill={RATING_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                No review data for selected filters
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Volume Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Review Volume (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Reviews" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                No weekly data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Average Rating Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="w-4 h-4" />
            Average Rating Trend (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgRating" stroke="#eab308" name="Avg Rating" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              No trend data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Rated Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowUp className="w-4 h-4 text-green-600" />
              Top Rated Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topRated.length > 0 ? (
              <div className="space-y-3">
                {topRated.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[160px]" title={p.name}>
                      {p.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {p.count} reviews
                      </Badge>
                      <span className="font-semibold text-green-600 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {p.avgRating}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Need at least 2 reviews per product</p>
            )}
          </CardContent>
        </Card>

        {/* Lowest Rated Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowDown className="w-4 h-4 text-red-600" />
              Lowest Rated Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowestRated.length > 0 ? (
              <div className="space-y-3">
                {lowestRated.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[160px]" title={p.name}>
                      {p.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {p.count} reviews
                      </Badge>
                      <span className="font-semibold text-red-600 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {p.avgRating}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Need at least 2 reviews per product</p>
            )}
          </CardContent>
        </Card>

        {/* Most Reviewed Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Most Reviewed Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mostReviewed.length > 0 ? (
              <div className="space-y-3">
                {mostReviewed.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[160px]" title={p.name}>
                      {p.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-bold">
                        {p.count}
                      </Badge>
                      <span className="font-semibold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {p.avgRating}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No product reviews yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Moderation Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Moderation Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.totalReviews}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.approvedCount}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.flaggedCount}</p>
                <p className="text-xs text-muted-foreground">Flagged</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.rejectedCount}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
