import { useState, useCallback, useEffect } from 'react';
import { supabaseOperations } from '../lib/supabase';

interface HealthMetric {
  id: string;
  type: string;
  value: number;
  timestamp: string;
  unit?: string;
}

interface HealthInsight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'critical' | 'neutral';
  category: string;
  importance: 'low' | 'medium' | 'high';
  confidence: number;
  action: string;
}

interface HealthTrend {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  change: string;
  percentage: number;
}

export function useHealthData() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [trends, setTrends] = useState<HealthTrend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulated health insights
  const generateInsights = useCallback((): HealthInsight[] => {
    return [
      {
        id: '1',
        title: 'Heart Rate Pattern',
        description: 'Your heart rate shows healthy variability during physical activities',
        type: 'positive',
        category: 'Cardiovascular',
        importance: 'high',
        confidence: 94,
        action: 'Continue current exercise routine',
      },
      {
        id: '2',
        title: 'Sleep Quality Alert',
        description: 'Your sleep consistency has improved by 23% this month',
        type: 'positive',
        category: 'Sleep',
        importance: 'medium',
        confidence: 88,
        action: 'Maintain consistent bedtime routine',
      },
      {
        id: '3',
        title: 'Stress Level Warning',
        description: 'Elevated stress levels detected in HRV analysis',
        type: 'warning',
        category: 'Mental Health',
        importance: 'high',
        confidence: 81,
        action: 'Try meditation or relaxation techniques',
      },
      {
        id: '4',
        title: 'Activity Goal Status',
        description: 'You are on track with your weekly activity goals',
        type: 'positive',
        category: 'Activity',
        importance: 'medium',
        confidence: 95,
        action: 'Maintain current pace for optimal health',
      },
    ];
  }, []);

  // Simulated health trends
  const generateTrends = useCallback((): HealthTrend[] => {
    return [
      {
        metric: 'Heart Rate Variability',
        direction: 'up',
        change: '+12.5%',
        percentage: 12.5,
      },
      {
        metric: 'Sleep Duration',
        direction: 'up',
        change: '+45 min',
        percentage: 8.3,
      },
      {
        metric: 'Exercise Minutes',
        direction: 'stable',
        change: 'Consistent',
        percentage: 0,
      },
      {
        metric: 'Stress Index',
        direction: 'down',
        change: '-18%',
        percentage: -18,
      },
    ];
  }, []);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Generate initial insights and trends
        const generatedInsights = generateInsights();
        const generatedTrends = generateTrends();

        setInsights(generatedInsights);
        setTrends(generatedTrends);

        // Simulate loading metrics
        const simulatedMetrics: HealthMetric[] = [
          {
            id: '1',
            type: 'heart_rate',
            value: 72,
            timestamp: new Date().toISOString(),
            unit: 'BPM',
          },
          {
            id: '2',
            type: 'blood_pressure_systolic',
            value: 120,
            timestamp: new Date().toISOString(),
            unit: 'mmHg',
          },
          {
            id: '3',
            type: 'blood_pressure_diastolic',
            value: 80,
            timestamp: new Date().toISOString(),
            unit: 'mmHg',
          },
          {
            id: '4',
            type: 'temperature',
            value: 98.6,
            timestamp: new Date().toISOString(),
            unit: '°F',
          },
          {
            id: '5',
            type: 'oxygen_saturation',
            value: 98,
            timestamp: new Date().toISOString(),
            unit: '%',
          },
        ];

        setMetrics(simulatedMetrics);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load health data';
        setError(errorMessage);
        console.error('Error loading health data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [generateInsights, generateTrends]);

  // Get health score based on metrics
  const getHealthScore = useCallback(() => {
    if (metrics.length === 0) return 85;

    // Calculate a weighted health score (simplified)
    const baseScore = 85;
    const adjustments = metrics.reduce((acc, metric) => {
      if (metric.type === 'heart_rate' && metric.value > 100) {
        return acc - 2;
      }
      if (metric.type === 'heart_rate' && metric.value < 60) {
        return acc - 1;
      }
      return acc;
    }, 0);

    return Math.max(0, Math.min(100, baseScore + adjustments));
  }, [metrics]);

  // Get latest metric by type
  const getLatestMetric = useCallback(
    (type: string) => {
      return metrics.find((m) => m.type === type);
    },
    [metrics]
  );

  // Refresh data
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const generatedInsights = generateInsights();
      const generatedTrends = generateTrends();

      setInsights(generatedInsights);
      setTrends(generatedTrends);

      // Simulate new metrics
      const updatedMetrics: HealthMetric[] = [
        {
          id: '1',
          type: 'heart_rate',
          value: Math.floor(Math.random() * 40) + 60,
          timestamp: new Date().toISOString(),
          unit: 'BPM',
        },
        {
          id: '2',
          type: 'blood_pressure_systolic',
          value: Math.floor(Math.random() * 30) + 110,
          timestamp: new Date().toISOString(),
          unit: 'mmHg',
        },
        {
          id: '3',
          type: 'blood_pressure_diastolic',
          value: Math.floor(Math.random() * 20) + 70,
          timestamp: new Date().toISOString(),
          unit: 'mmHg',
        },
        {
          id: '4',
          type: 'temperature',
          value: Math.random() * 2 + 97.5,
          timestamp: new Date().toISOString(),
          unit: '°F',
        },
        {
          id: '5',
          type: 'oxygen_saturation',
          value: Math.floor(Math.random() * 4) + 96,
          timestamp: new Date().toISOString(),
          unit: '%',
        },
      ];

      setMetrics(updatedMetrics);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh health data';
      setError(errorMessage);
      console.error('Error refreshing health data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [generateInsights, generateTrends]);

  return {
    metrics,
    insights,
    trends,
    isLoading,
    error,
    getHealthScore,
    getLatestMetric,
    refreshData,
    setMetrics,
    setInsights,
  };
}
