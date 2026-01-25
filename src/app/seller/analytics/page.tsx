'use client';

/**
 * Chatbot Analytics Dashboard
 * 
 * Admin dashboard for viewing chatbot performance metrics.
 * Tracks conversations, queries, product clicks, and errors.
 * 
 * @see .github/AI_CHATBOT_PHASE_6_ANALYTICS.md
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, Download, TrendingUp, MessageCircle, ShoppingCart, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getDailyStats, getWeeklyStats, downloadCSV } from '@/lib/analytics/chatbot-analytics';
import type { DailyStats } from '@/lib/analytics/chatbot-analytics';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'daily' | 'weekly'>('daily');
  const [weeklyStats, setWeeklyStats] = useState<DailyStats[]>([]);

  useEffect(() => {
    loadStats();
  }, [selectedDate, view]);

  const loadStats = async () => {
    setLoading(true);
    try {
      if (view === 'daily') {
        const data = await getDailyStats(selectedDate);
        setStats(data);
      } else {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        const data = await getWeeklyStats(startDate, endDate);
        setWeeklyStats(data);
        // Set current stats to latest day
        if (data.length > 0) {
          setStats(data[data.length - 1]);
        }
      }
    } catch (error) {
      console.error('[Analytics] Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days

    const data = await getWeeklyStats(startDate, endDate);
    downloadCSV(data, `chatbot-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
          <p className="text-muted-foreground">Start using the chatbot to see analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Chatbot Analytics</h1>
          <p className="text-muted-foreground">Track chatbot performance and user engagement</p>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* View Toggle */}
      <Tabs value={view} onValueChange={(v) => setView(v as 'daily' | 'weekly')}>
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversations</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.conversationsStarted}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.uniqueUsers} unique users
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg {stats.avgMessagesPerConversation.toFixed(1)} msgs/conv
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Product Cards</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.productCardsClicked}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.productCardsShown} shown
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.clickThroughRate.toFixed(1)}% CTR
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.conversionsCount}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.conversionRate.toFixed(1)}% rate
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Chatbot to purchase
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgResponseTime.toFixed(2)}s</div>
                <p className="text-xs text-muted-foreground">
                  Avg response time
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.errorCount} errors
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Queries & Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Queries</CardTitle>
                <CardDescription>Most common user searches</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.topQueries.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topQueries.map((q, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {i + 1}.
                          </span>
                          <span className="text-sm">{q.query}</span>
                        </div>
                        <Badge variant="secondary">{q.count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No queries yet
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Most clicked product cards</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.topProducts.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topProducts.map((p, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {i + 1}.
                          </span>
                          <span className="text-sm">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (p.clicks / stats.topProducts[0].clicks) * 100
                                )}%`,
                              }}
                            />
                          </div>
                          <Badge variant="secondary">{p.clicks}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No product clicks yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Messages Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Message Statistics</CardTitle>
              <CardDescription>Conversation engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Messages</p>
                  <p className="text-2xl font-bold">{stats.totalMessages}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg per Conversation</p>
                  <p className="text-2xl font-bold">
                    {stats.avgMessagesPerConversation.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cards Shown</p>
                  <p className="text-2xl font-bold">{stats.productCardsShown}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cards Clicked</p>
                  <p className="text-2xl font-bold">{stats.productCardsClicked}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Overview</CardTitle>
              <CardDescription>Last 7 days performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Conversations</TableHead>
                    <TableHead className="text-right">Messages</TableHead>
                    <TableHead className="text-right">Users</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">Conversions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeklyStats.map((day, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{day.date}</TableCell>
                      <TableCell className="text-right">{day.conversationsStarted}</TableCell>
                      <TableCell className="text-right">{day.totalMessages}</TableCell>
                      <TableCell className="text-right">{day.uniqueUsers}</TableCell>
                      <TableCell className="text-right">
                        {day.clickThroughRate.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right">{day.conversionsCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
