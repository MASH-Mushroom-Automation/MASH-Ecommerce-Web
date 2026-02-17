"use client";

/**
 * ReviewInsights - Seller-specific review analytics and insights.
 *
 * Provides rating trends, per-product distribution, keyword analysis,
 * declining rating alerts, and platform average comparison.
 */

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Hash,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { FirebaseReviewService } from "@/lib/firebase/reviews";
import type { FirestoreReview } from "@/types/reviews";

// =================== Helpers ===================

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "it", "was", "are", "were", "be",
  "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "shall", "can", "this",
  "that", "these", "those", "i", "you", "he", "she", "we", "they",
  "me", "him", "her", "us", "them", "my", "your", "his", "its", "our",
  "their", "what", "which", "who", "when", "where", "why", "how",
  "all", "each", "every", "both", "few", "more", "most", "other",
  "some", "such", "no", "not", "only", "very", "just", "also", "so",
  "if", "then", "than", "too", "about", "up", "out", "get", "got",
  "really", "much", "well", "good", "great", "nice", "like", "very",
]);

const RATING_COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];

function extractKeywords(reviews: FirestoreReview[], topN: number = 15): Array<{ word: string; count: number }> {
  const freq = new Map<string, number>();
  for (const r of reviews) {
    const text = `${r.title} ${r.content}`.toLowerCase();
    const words = text.match(/[a-z]{3,}/g) || [];
    for (const w of words) {
      if (STOP_WORDS.has(w)) continue;
      freq.set(w, (freq.get(w) || 0) + 1);
    }
  }
  return Array.from(freq.entries())
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }));
}

/** Group reviews into weekly buckets for rating trend */
function weeklyRatingTrend(reviews: FirestoreReview[], months: number) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);

  const weekMap = new Map<string, { total: number; count: number }>();
  for (const r of reviews) {
    const d = new Date(r.createdAt);
    if (d < cutoff) continue;
    const weekStart = new Date(d);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const label = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const entry = weekMap.get(label) || { total: 0, count: 0 };
    entry.total += r.rating;
    entry.count++;
    weekMap.set(label, entry);
  }

  return Array.from(weekMap.entries()).map(([week, data]) => ({
    week,
    avgRating: Math.round((data.total / data.count) * 100) / 100,
    count: data.count,
  }));
}

/** Per-product rating distribution */
function perProductRatings(reviews: FirestoreReview[]) {
  const map = new Map<string, { name: string; total: number; count: number }>();
  for (const r of reviews) {
    const entry = map.get(r.targetId) || { name: r.targetName, total: 0, count: 0 };
    entry.total += r.rating;
    entry.count++;
    map.set(r.targetId, entry);
  }
  return Array.from(map.values())
    .map((p) => ({
      name: p.name.length > 25 ? p.name.substring(0, 22) + "..." : p.name,
      fullName: p.name,
      avgRating: Math.round((p.total / p.count) * 100) / 100,
      count: p.count,
    }))
    .sort((a, b) => b.avgRating - a.avgRating);
}

/** Detect products with declining ratings (avg dropped >0.5 in 30 days) */
function findDecliningProducts(reviews: FirestoreReview[]) {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  // Group by product
  const productMap = new Map<string, { name: string; old: number[]; recent: number[] }>();
  for (const r of reviews) {
    const entry = productMap.get(r.targetId) || { name: r.targetName, old: [], recent: [] };
    const ts = new Date(r.createdAt).getTime();
    if (ts >= thirtyDaysAgo) {
      entry.recent.push(r.rating);
    } else {
      entry.old.push(r.rating);
    }
    productMap.set(r.targetId, entry);
  }

  const declining: Array<{ name: string; oldAvg: number; recentAvg: number; drop: number }> = [];
  for (const [, data] of productMap) {
    if (data.old.length < 2 || data.recent.length < 1) continue;
    const oldAvg = data.old.reduce((s, v) => s + v, 0) / data.old.length;
    const recentAvg = data.recent.reduce((s, v) => s + v, 0) / data.recent.length;
    const drop = oldAvg - recentAvg;
    if (drop > 0.5) {
      declining.push({
        name: data.name,
        oldAvg: Math.round(oldAvg * 100) / 100,
        recentAvg: Math.round(recentAvg * 100) / 100,
        drop: Math.round(drop * 100) / 100,
      });
    }
  }

  return declining.sort((a, b) => b.drop - a.drop);
}

// =================== Component ===================

interface ReviewInsightsProps {
  reviews: FirestoreReview[];
  sellerAvgRating: number;
}

export default function ReviewInsights({ reviews, sellerAvgRating }: ReviewInsightsProps) {
  const [platformAvg, setPlatformAvg] = useState<number | null>(null);

  // Fetch platform-wide average
  useEffect(() => {
    let cancelled = false;
    async function fetchPlatformAvg() {
      try {
        const { reviews: allReviews } = await FirebaseReviewService.getAllReviews();
        if (cancelled) return;
        if (allReviews.length === 0) {
          setPlatformAvg(null);
          return;
        }
        const sum = allReviews.reduce((s, r) => s + r.rating, 0);
        setPlatformAvg(Math.round((sum / allReviews.length) * 100) / 100);
      } catch {
        // silently fail
      }
    }
    fetchPlatformAvg();
    return () => { cancelled = true; };
  }, []);

  // Rating trend (last 3 months, weekly)
  const trendData = useMemo(() => weeklyRatingTrend(reviews, 3), [reviews]);

  // Per-product rating distribution
  const productRatings = useMemo(() => perProductRatings(reviews), [reviews]);

  // Top keywords
  const keywords = useMemo(() => extractKeywords(reviews, 15), [reviews]);

  // Declining products alert
  const declining = useMemo(() => findDecliningProducts(reviews), [reviews]);

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          <p>No review data available for insights yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Declining Ratings Alert */}
      {declining.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
              Products with Declining Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {declining.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="truncate max-w-[200px]" title={p.name}>
                    {p.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{p.oldAvg}</span>
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="font-semibold text-red-600">{p.recentAvg}</span>
                    <Badge variant="destructive" className="text-xs">
                      -{p.drop}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Your Rating vs Platform Average
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Your Average</p>
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-3xl font-bold">{sellerAvgRating.toFixed(1)}</span>
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-xs text-muted-foreground">{reviews.length} reviews</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Platform Average</p>
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-3xl font-bold">
                  {platformAvg !== null ? platformAvg.toFixed(1) : "--"}
                </span>
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-xs text-muted-foreground">all products</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Difference</p>
              {platformAvg !== null ? (
                <>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className={`text-3xl font-bold ${
                      sellerAvgRating >= platformAvg ? "text-green-600" : "text-red-600"
                    }`}>
                      {sellerAvgRating >= platformAvg ? "+" : ""}
                      {(sellerAvgRating - platformAvg).toFixed(2)}
                    </span>
                    {sellerAvgRating >= platformAvg ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {sellerAvgRating >= platformAvg ? "above" : "below"} average
                  </p>
                </>
              ) : (
                <span className="text-2xl font-bold text-muted-foreground">--</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Trend (3 months) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="w-4 h-4" />
              Rating Trend (Last 3 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="avgRating"
                    stroke="#eab308"
                    name="Avg Rating"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">
                Not enough data for trend analysis
              </div>
            )}
          </CardContent>
        </Card>

        {/* Per-Product Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Rating by Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            {productRatings.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(240, productRatings.length * 40)}>
                <BarChart data={productRatings} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={140}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value: number, _: string, props: { payload?: { fullName?: string; count?: number } }) => [
                      `${value} avg (${props.payload?.count || 0} reviews)`,
                      props.payload?.fullName || "Rating",
                    ]}
                  />
                  <Bar dataKey="avgRating" radius={[0, 4, 4, 0]}>
                    {productRatings.map((p, i) => (
                      <Cell
                        key={i}
                        fill={p.avgRating >= 4 ? "#22c55e" : p.avgRating >= 3 ? "#eab308" : "#ef4444"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">
                No product data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Top Keywords from Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          {keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw, i) => (
                <Badge
                  key={kw.word}
                  variant={i < 5 ? "default" : "secondary"}
                  className="text-sm"
                >
                  {kw.word}
                  <span className="ml-1 opacity-70">({kw.count})</span>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Need more reviews for keyword analysis (at least 2 mentions required)
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
