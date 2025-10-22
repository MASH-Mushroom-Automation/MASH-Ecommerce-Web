// Custom hooks for main page data fetching
import { useState, useEffect, useCallback } from "react";
import { MainApi } from "@/lib/api/main";
import { Grower, HomePageData, ApiResponse } from "@/types/api";

// Home page hooks
export function useHomePageData() {
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomeData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await MainApi.getHomePageData();
      setHomeData(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch home page data"
      );
      setHomeData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  return {
    homeData,
    loading,
    error,
    refetch: fetchHomeData,
  };
}

// Growers hooks
export function useGrowers() {
  const [growers, setGrowers] = useState<Grower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrowers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await MainApi.getGrowers();
      setGrowers(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch growers");
      setGrowers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrowers();
  }, [fetchGrowers]);

  return {
    growers,
    loading,
    error,
    refetch: fetchGrowers,
  };
}

export function useGrower(id: number) {
  const [grower, setGrower] = useState<Grower | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrower = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await MainApi.getGrowerById(id);
      setGrower(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch grower");
      setGrower(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGrower();
  }, [fetchGrower]);

  return {
    grower,
    loading,
    error,
    refetch: fetchGrower,
  };
}

// About page hooks
export function useAboutContent() {
  const [content, setContent] = useState<{
    title: string;
    content: string;
    team: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAboutContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await MainApi.getAboutContent();
      setContent(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch about content"
      );
      setContent(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAboutContent();
  }, [fetchAboutContent]);

  return {
    content,
    loading,
    error,
    refetch: fetchAboutContent,
  };
}

// FAQ hooks
export function useFAQContent() {
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFAQContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await MainApi.getFAQContent();
      setFaqs(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch FAQ content"
      );
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFAQContent();
  }, [fetchFAQContent]);

  return {
    faqs,
    loading,
    error,
    refetch: fetchFAQContent,
  };
}
