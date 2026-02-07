/**
 * Unit Tests for ChatbotMetrics Component
 * 
 * Tests all functionality including:
 * - Data fetching and loading states
 * - Metrics card rendering
 * - Top queries table display
 * - Top products table display
 * - Conversion funnel visualization
 * - Query patterns analysis
 * - Error handling
 * - Time range changes
 */

import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import ChatbotMetrics from "@/components/admin/ChatbotMetrics";
import * as dashboardModule from "@/lib/analytics/chatbot-dashboard";
import { DashboardMetrics, TopQuery, TopProduct, FunnelStep, QueryPattern } from "@/types/analytics";

// Mock the analytics dashboard functions
jest.mock("@/lib/analytics/chatbot-dashboard");

const mockGetDailyStats = dashboardModule.getDailyStats as jest.MockedFunction<typeof dashboardModule.getDailyStats>;
const mockGetTopQueries = dashboardModule.getTopQueries as jest.MockedFunction<typeof dashboardModule.getTopQueries>;
const mockGetTopProducts = dashboardModule.getTopProducts as jest.MockedFunction<typeof dashboardModule.getTopProducts>;
const mockGetConversionFunnel = dashboardModule.getConversionFunnel as jest.MockedFunction<typeof dashboardModule.getConversionFunnel>;
const mockGetQueryPatterns = dashboardModule.getQueryPatterns as jest.MockedFunction<typeof dashboardModule.getQueryPatterns>;

describe("ChatbotMetrics Component", () => {
  // Sample test data
  const mockMetrics: DashboardMetrics = {
    totalConversations: 150,
    totalMessages: 450,
    totalProductCardsShown: 200,
    totalProductClicks: 80,
    totalConversions: 25,
    averageMessagesPerConversation: 3.0,
    clickThroughRate: 0.4,
    conversionRate: 0.167,
    revenueAttributed: 12500,
  };

  const mockTopQueries: TopQuery[] = [
    {
      query: "fresh oyster mushrooms",
      count: 45,
      averageResults: 3.2,
      clickThroughRate: 0.6,
      conversions: 12,
    },
    {
      query: "dried shiitake",
      count: 32,
      averageResults: 2.8,
      clickThroughRate: 0.5,
      conversions: 8,
    },
  ];

  const mockTopProducts: TopProduct[] = [
    {
      productId: "prod-123",
      productName: "Fresh Oyster Mushrooms 500g",
      impressions: 80,
      clicks: 40,
      conversions: 15,
      clickThroughRate: 0.5,
      conversionRate: 0.1875,
    },
    {
      productId: "prod-456",
      productName: "Dried Shiitake 100g",
      impressions: 60,
      clicks: 25,
      conversions: 8,
      clickThroughRate: 0.417,
      conversionRate: 0.133,
    },
  ];

  const mockFunnel: FunnelStep[] = [
    { step: "Conversations Started", count: 150, percentage: 100, dropoffRate: 20 },
    { step: "Product Cards Shown", count: 120, percentage: 80, dropoffRate: 33.33 },
    { step: "Product Clicks", count: 80, percentage: 53.33, dropoffRate: 68.75 },
    { step: "Purchases", count: 25, percentage: 16.67 },
  ];

  const mockPatterns: QueryPattern[] = [
    {
      pattern: "fresh",
      examples: ["fresh mushrooms", "fresh oyster", "show fresh products"],
      count: 50,
      averageResults: 4.2,
      successRate: 0.9,
    },
    {
      pattern: "dried",
      examples: ["dried shiitake", "dried mushrooms"],
      count: 35,
      averageResults: 3.5,
      successRate: 0.85,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockGetDailyStats.mockResolvedValue(mockMetrics);
    mockGetTopQueries.mockResolvedValue(mockTopQueries);
    mockGetTopProducts.mockResolvedValue(mockTopProducts);
    mockGetConversionFunnel.mockResolvedValue(mockFunnel);
    mockGetQueryPatterns.mockResolvedValue(mockPatterns);
  });

  describe("Loading State", () => {
    it("should display loading spinner initially", () => {
      render(<ChatbotMetrics timeRange="week" />);
      
      expect(screen.getByText(/loading analytics/i)).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument(); // Loader2 icon
    });

    it("should call all analytics functions with correct parameters", async () => {
      render(<ChatbotMetrics timeRange="month" />);

      await waitFor(() => {
        expect(mockGetDailyStats).toHaveBeenCalledWith("month", undefined, undefined);
        expect(mockGetTopQueries).toHaveBeenCalledWith("month", 10, undefined, undefined);
        expect(mockGetTopProducts).toHaveBeenCalledWith("month", 10, undefined, undefined);
        expect(mockGetConversionFunnel).toHaveBeenCalledWith("month", undefined, undefined);
        expect(mockGetQueryPatterns).toHaveBeenCalledWith("month", undefined, undefined);
      });
    });

    it("should pass custom dates when provided", async () => {
      const startDate = new Date("2026-01-01");
      const endDate = new Date("2026-01-31");

      render(
        <ChatbotMetrics
          timeRange="custom"
          customStartDate={startDate}
          customEndDate={endDate}
        />
      );

      await waitFor(() => {
        expect(mockGetDailyStats).toHaveBeenCalledWith("custom", startDate, endDate);
        expect(mockGetTopQueries).toHaveBeenCalledWith("custom", 10, startDate, endDate);
      });
    });
  });

  describe("Metrics Display", () => {
    it("should render key metric cards with correct values", async () => {
      render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        expect(screen.getByText("Total Conversations")).toBeInTheDocument();
        expect(screen.getByText("150")).toBeInTheDocument();
        
        expect(screen.getByText("Product Cards Shown")).toBeInTheDocument();
        expect(screen.getByText("200")).toBeInTheDocument();
        
        expect(screen.getByText("Click-Through Rate")).toBeInTheDocument();
        expect(screen.getByText("40.0%")).toBeInTheDocument();
        
        expect(screen.getByText("Conversion Rate")).toBeInTheDocument();
        expect(screen.getByText("16.7%")).toBeInTheDocument();
      });
    });

    it("should render secondary metrics", async () => {
      render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        expect(screen.getByText("Average Messages/Conversation")).toBeInTheDocument();
        expect(screen.getByText("3.0")).toBeInTheDocument();
        
        expect(screen.getByText("Total Product Clicks")).toBeInTheDocument();
        expect(screen.getByText("80")).toBeInTheDocument();
        
        expect(screen.getByText("Revenue Attributed")).toBeInTheDocument();
        expect(screen.getByText("₱12,500")).toBeInTheDocument();
      });
    });

    it("should display trending indicators for good performance", async () => {
      render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        const ctrCard = screen.getByText("Click-Through Rate").closest("div");
        const conversionCard = screen.getByText("Conversion Rate").closest("div");
        
        // CTR > 0.1 should show uptrend
        expect(within(ctrCard!).getByText("40.0%")).toBeInTheDocument();
        
        // Conversion > 0.05 should show uptrend
        expect(within(conversionCard!).getByText("16.7%")).toBeInTheDocument();
      });
    });
  });

  describe("Top Queries Table", () => {
    it("should render top queries table with all columns", async () => {
      render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        expect(screen.getByText("Top Queries")).toBeInTheDocument();
        
        // Check table headers
        expect(screen.getByText("Query")).toBeInTheDocument();
        expect(screen.getByText("Count")).toBeInTheDocument();
        expect(screen.getByText("Avg Results")).toBeInTheDocument();
        expect(screen.getByText("CTR")).toBeInTheDocument();
        expect(screen.getByText("Conversions")).toBeInTheDocument();
      });
    });

    it("should display query data rows correctly", async () => {
      render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        expect(screen.getByText("fresh oyster mushrooms")).toBeInTheDocument();
        expect(screen.getByText("45")).toBeInTheDocument();
        expect(screen.getByText("3.2")).toBeInTheDocument();
        expect(screen.getByText("60.0%")).toBeInTheDocument();
        expect(screen.getByText("12")).toBeInTheDocument();
        
        expect(screen.getByText("dried shiitake")).toBeInTheDocument();
        expect(screen.getByText("32")).toBeInTheDocument();
      });
    });

    it("should show empty state when no queries exist", async () => {
      mockGetTopQueries.mockResolvedValue([]);
      
      render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        expect(screen.getByText("No queries recorded")).toBeInTheDocument();
      });
    });
  });

  describe("Top Products Table", () => {
    it("should render top products table with all columns", async () => {
      render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        expect(screen.getByText("Top Products")).toBeInTheDocument();
        
        // Check table headers
        expect(screen.getByText("Product")).toBeInTheDocument();
        expect(screen.getByText("Impressions")).toBeInTheDocument();
        expect(screen.getByText("Clicks")).toBeInTheDocument();
        // CTR appears in both tables, use getAllByText
        expect(screen.getAllByText("CTR").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Conversions").length).toBeGreaterThan(0);
        expect(screen.getByText("Conv. Rate")).toBeInTheDocument();
      });
    });

    it("should display product data rows correctly", async () => {
      render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        expect(screen.getByText("Fresh Oyster Mushrooms 500g")).toBeInTheDocument();
        expect(screen.getByText("80")).toBeInTheDocument();
        expect(screen.getByText("40")).toBeInTheDocument();
        expect(screen.getByText("50.0%")).toBeInTheDocument();
        expect(screen.getByText("15")).toBeInTheDocument();
        expect(screen.getByText("18.8%")).toBeInTheDocument();
      });
    });

    it("should show empty state when no products exist", async () => {
      mockGetTopProducts.mockResolvedValue([]);
      
      render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        expect(screen.getByText("No product interactions recorded")).toBeInTheDocument();
      });
    });
  });

  describe("Conversion Funnel", () => {
    it("should render funnel visualization with all steps", async () => {
      render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        expect(screen.getByText("Conversion Funnel")).toBeInTheDocument();
        expect(screen.getByText("Conversations Started")).toBeInTheDocument();
        expect(screen.getByText("Product Cards Shown")).toBeInTheDocument();
        expect(screen.getByText("Product Clicks")).toBeInTheDocument();
        expect(screen.getByText("Purchases")).toBeInTheDocument();
      });
    });

    it("should display funnel step counts and percentages", async () => {
      render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        // Check for step counts (using getAllByText since percentages may appear multiple times)
        expect(screen.getByText(/150 \(100.0%\)/)).toBeInTheDocument();
        expect(screen.getByText(/120 \(80.0%\)/)).toBeInTheDocument();
        expect(screen.getByText(/80 \(53.3%\)/)).toBeInTheDocument();
        expect(screen.getByText(/25 \(16.7%\)/)).toBeInTheDocument();
      });
    });

    it("should show dropoff rates between steps", async () => {
      render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        expect(screen.getByText(/20.0% dropoff/)).toBeInTheDocument();
        expect(screen.getByText(/33.3% dropoff/)).toBeInTheDocument();
        expect(screen.getByText(/68.8% dropoff/)).toBeInTheDocument();
      });
    });

    it("should show empty state when no funnel data exists", async () => {
      mockGetConversionFunnel.mockResolvedValue([]);
      
      render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        expect(screen.getByText("No funnel data available")).toBeInTheDocument();
      });
    });
  });

  describe("Query Patterns", () => {
    it("should render query patterns grid", async () => {
      render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        expect(screen.getByText("Query Patterns")).toBeInTheDocument();
        expect(screen.getByText("fresh")).toBeInTheDocument();
        expect(screen.getByText("dried")).toBeInTheDocument();
      });
    });

    it("should display pattern statistics", async () => {
      render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        // Fresh pattern
        expect(screen.getByText("50 queries")).toBeInTheDocument();
        expect(screen.getByText("90.0%")).toBeInTheDocument();
        
        // Dried pattern
        expect(screen.getByText("35 queries")).toBeInTheDocument();
        expect(screen.getByText("85.0%")).toBeInTheDocument();
      });
    });

    it("should show example queries for each pattern", async () => {
      render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        expect(screen.getByText(/fresh mushrooms/)).toBeInTheDocument();
        expect(screen.getByText(/dried shiitake/)).toBeInTheDocument();
      });
    });

    it("should color success rates appropriately", async () => {
      render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        // Success rate > 70% should be green (text-green-600)
        const freshSuccessRate = screen.getByText("90.0%");
        expect(freshSuccessRate).toHaveClass("text-green-600");
      });
    });

    it("should show empty state when no patterns exist", async () => {
      mockGetQueryPatterns.mockResolvedValue([]);
      
      render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        expect(screen.getByText("No query patterns detected")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error message when data fetching fails", async () => {
      const errorMessage = "Firebase connection failed";
      mockGetDailyStats.mockRejectedValue(new Error(errorMessage));
      
      render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        expect(screen.getByText("Error Loading Analytics")).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it("should provide retry button on error", async () => {
      mockGetDailyStats.mockRejectedValueOnce(new Error("Network error"));
      
      render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        const retryButton = screen.getByText("Retry");
        expect(retryButton).toBeInTheDocument();
      });
    });

    it("should retry data fetch when retry button clicked", async () => {
      mockGetDailyStats.mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce(mockMetrics);
      
      const { rerender } = render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        expect(screen.getByText("Retry")).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByText("Retry");
      retryButton.click();

      // Force rerender to trigger useEffect
      rerender(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        expect(screen.getByText("Total Conversations")).toBeInTheDocument();
      });
    });
  });

  describe("Time Range Changes", () => {
    it("should reload data when time range changes", async () => {
      const { rerender } = render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        expect(mockGetDailyStats).toHaveBeenCalledWith("week", undefined, undefined);
      });

      // Change time range
      rerender(<ChatbotMetrics timeRange="month" />);

      await waitFor(() => {
        expect(mockGetDailyStats).toHaveBeenCalledWith("month", undefined, undefined);
      });
    });

    it("should reload data when custom dates change", async () => {
      const startDate1 = new Date("2026-01-01");
      const endDate1 = new Date("2026-01-31");

      const { rerender } = render(
        <ChatbotMetrics
          timeRange="custom"
          customStartDate={startDate1}
          customEndDate={endDate1}
        />
      );

      await waitFor(() => {
        expect(mockGetDailyStats).toHaveBeenCalledWith("custom", startDate1, endDate1);
      });

      // Change custom dates
      const startDate2 = new Date("2026-02-01");
      const endDate2 = new Date("2026-02-28");

      rerender(
        <ChatbotMetrics
          timeRange="custom"
          customStartDate={startDate2}
          customEndDate={endDate2}
        />
      );

      await waitFor(() => {
        expect(mockGetDailyStats).toHaveBeenCalledWith("custom", startDate2, endDate2);
      });
    });
  });

  describe("Data Callback", () => {
    it("should call onDataLoad callback when data is loaded", async () => {
      const onDataLoad = jest.fn();
      
      render(<ChatbotMetrics timeRange="week" onDataLoad={onDataLoad} />);

      await waitFor(() => {
        expect(onDataLoad).toHaveBeenCalledWith({
          metrics: mockMetrics,
          topQueries: mockTopQueries,
          topProducts: mockTopProducts,
          funnel: mockFunnel,
          patterns: mockPatterns,
        });
      });
    });

    it("should not call onDataLoad on error", async () => {
      const onDataLoad = jest.fn();
      mockGetDailyStats.mockRejectedValue(new Error("Fetch failed"));
      
      render(<ChatbotMetrics timeRange="week" onDataLoad={onDataLoad} />);

      await waitFor(() => {
        expect(screen.getByText("Error Loading Analytics")).toBeInTheDocument();
      });

      expect(onDataLoad).not.toHaveBeenCalled();
    });
  });

  describe("Empty State", () => {
    it("should show no data message when metrics are null", async () => {
      mockGetDailyStats.mockResolvedValue({
        totalConversations: 0,
        totalMessages: 0,
        totalProductCardsShown: 0,
        totalProductClicks: 0,
        totalConversions: 0,
        averageMessagesPerConversation: 0,
        clickThroughRate: 0,
        conversionRate: 0,
        revenueAttributed: 0,
      });
      
      render(<ChatbotMetrics timeRange="week" />);

      await waitFor(() => {
        // Should still render metrics, just with zero values
        expect(screen.getByText("Total Conversations")).toBeInTheDocument();
        expect(screen.getByText("0")).toBeInTheDocument();
      });
    });
  });
});
