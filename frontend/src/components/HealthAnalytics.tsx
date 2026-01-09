import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Activity,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  Brain,
  Heart,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Shield,
  RefreshCw,
  Loader2,
  Sparkles,
  Info,
  AlertTriangle,
} from "lucide-react";
import { useHealthData } from "@/hooks/useHealthData";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";

export default function HealthAnalytics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");
  const {
    metrics,
    insights,
    trends,
    isLoading,
    error,
    getHealthScore,
    getLatestMetric,
    refreshData,
  } = useHealthData();

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const generateChartData = () => {
      const data = [];
      const days =
        selectedTimeframe === "week"
          ? 7
          : selectedTimeframe === "month"
            ? 30
            : 365;

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        data.push({
          date: date.toLocaleDateString(),
          heartRate: Math.floor(Math.random() * 20) + 65,
          steps: Math.floor(Math.random() * 3000) + 7000,
          sleep: Math.random() * 2 + 6.5,
          stress: Math.floor(Math.random() * 30) + 20,
        });
      }

      setChartData(data);
    };

    generateChartData();
  }, [selectedTimeframe]);

  const healthMetrics = [
    {
      title: "Overall Health Score",
      value: getHealthScore(),
      target: 90,
      trend: "up",
      change: "+3.2%",
      description: "Based on your recent health data and AI analysis",
    },
    {
      title: "Cardiovascular Health",
      value: 82,
      target: 85,
      trend: trends.find((t) => t.metric.includes("Heart"))?.direction === "up" ? "up" : "down",
      change: trends.find((t) => t.metric.includes("Heart"))?.change || "+2.1%",
      description: "Heart rate, blood pressure, and activity trends",
    },
    {
      title: "Mental Wellness",
      value: 78,
      target: 80,
      trend: "down",
      change: "-1.5%",
      description: "Stress levels, sleep quality, and mood tracking",
    },
    {
      title: "Preventive Care",
      value: 95,
      target: 100,
      trend: "up",
      change: "+5.0%",
      description: "Checkups, screenings, and vaccination status",
    },
  ];

  const enhancedInsights = insights.map((insight) => ({
    ...insight,
    icon:
      insight.type === "positive"
        ? CheckCircle
        : insight.type === "warning"
          ? AlertCircle
          : insight.type === "critical"
            ? AlertTriangle
            : Info,
  }));

  const riskFactors = [
    {
      factor: "Hypertension Risk",
      level: "low",
      probability: 12,
      description: "Based on family history and current lifestyle",
    },
    {
      factor: "Diabetes Risk",
      level: "moderate",
      probability: 25,
      description: "Consider dietary modifications and regular monitoring",
    },
    {
      factor: "Heart Disease Risk",
      level: "low",
      probability: 8,
      description: "Excellent cardiovascular health indicators",
    },
  ];

  const getInsightColor = (type: string) => {
    switch (type) {
      case "positive":
        return "border-l-green-500 bg-green-50";
      case "warning":
        return "border-l-yellow-500 bg-yellow-50";
      case "neutral":
        return "border-l-blue-500 bg-blue-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-info/5">
      <header className="border-b border-border/40 bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Main
              </Button>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-info text-info-foreground">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Health Analytics</h1>
                  <p className="text-sm text-muted-foreground">AI-Powered Insights</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isLoading}
                className="text-xs"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                Refresh
              </Button>
              <Badge variant="secondary" className="text-xs">
                <Brain className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
              <div className="flex items-center space-x-1">
                {["week", "month", "year"].map((period) => (
                  <Button
                    key={period}
                    variant={selectedTimeframe === period ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedTimeframe(period)}
                    className="text-xs"
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              {error}. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading health analytics...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {healthMetrics.map((metric, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {metric.title}
                      </CardTitle>
                      <div
                        className={`flex items-center text-xs ${
                          metric.trend === "up"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {metric.trend === "up" ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {metric.change}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-end space-x-2">
                        <span className="text-2xl font-bold">
                          {metric.value}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /{metric.target}
                        </span>
                      </div>
                      <Progress
                        value={(metric.value / metric.target) * 100}
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        {metric.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger
              value="insights"
              className="flex items-center space-x-2"
            >
              <Zap className="h-4 w-4" />
              <span>Insights</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center space-x-2">
              <LineChart className="h-4 w-4" />
              <span>Trends</span>
            </TabsTrigger>
            <TabsTrigger
              value="predictions"
              className="flex items-center space-x-2"
            >
              <Shield className="h-4 w-4" />
              <span>Risk Analysis</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-primary" />
                  AI-Generated Health Insights
                </CardTitle>
                <CardDescription>
                  Personalized recommendations based on your health data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {enhancedInsights.map((insight, index) => {
                  const IconComponent = insight.icon;
                  return (
                    <Card
                      key={index}
                      className={`border-l-4 ${getInsightColor(insight.type)}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <IconComponent
                              className={`h-5 w-5 ${
                                insight.type === "positive"
                                  ? "text-green-600"
                                  : insight.type === "warning"
                                    ? "text-yellow-600"
                                    : "text-blue-600"
                              }`}
                            />
                            <div>
                              <h3 className="font-semibold">{insight.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {insight.description}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {insight.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Confidence: {insight.confidence}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={
                              insight.importance === "high"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {insight.importance}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm font-medium text-primary">
                          Recommended Action: {insight.action}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2" />
                    Health Trends - {selectedTimeframe}
                  </CardTitle>
                  <CardDescription>
                    Track your health metrics over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="opacity-30"
                          horizontal={true}
                          vertical={true}
                        />
                        <XAxis
                          dataKey="date"
                          className="text-xs"
                          axisLine={true}
                          tickLine={true}
                        />
                        <YAxis
                          className="text-xs"
                          axisLine={true}
                          tickLine={true}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="heartRate"
                          stroke="#ef4444"
                          strokeWidth={2}
                          dot={{ fill: "#ef4444", strokeWidth: 2, r: 3 }}
                          name="Heart Rate (BPM)"
                        />
                        <Line
                          type="monotone"
                          dataKey="steps"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
                          name="Steps"
                        />
                        <Line
                          type="monotone"
                          dataKey="sleep"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
                          name="Sleep (hours)"
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Activity Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        activity: "Steps",
                        value: getLatestMetric("heart_rate")?.value || 8500,
                        target: 10000,
                        unit: "steps",
                      },
                      {
                        activity: "Sleep",
                        value: 7.2,
                        target: 8,
                        unit: "hours",
                      },
                      {
                        activity: "Water",
                        value: 6,
                        target: 8,
                        unit: "glasses",
                      },
                      {
                        activity: "Exercise",
                        value: 4,
                        target: 5,
                        unit: "days/week",
                      },
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{item.activity}</span>
                          <span>
                            {typeof item.value === "number"
                              ? item.value.toFixed(0)
                              : item.value}{" "}
                            / {item.target} {item.unit}
                          </span>
                        </div>
                        <Progress
                          value={(Number(item.value) / item.target) * 100}
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Health Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        category: "Physical Health",
                        score: 85,
                        color: "bg-blue-500",
                      },
                      {
                        category: "Mental Health",
                        score: 78,
                        color: "bg-purple-500",
                      },
                      { category: "Nutrition", score: 82, color: "bg-green-500" },
                      { category: "Prevention", score: 95, color: "bg-cyan-500" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${item.color}`}
                        ></div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm">
                            <span>{item.category}</span>
                            <span className="font-semibold">{item.score}%</span>
                          </div>
                          <Progress value={item.score} className="h-2 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Predictive Risk Analysis
                </CardTitle>
                <CardDescription>
                  AI-powered risk assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {riskFactors.map((risk, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{risk.factor}</h3>
                        <Badge className={getRiskColor(risk.level)}>
                          {risk.level} risk
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Risk Probability</span>
                          <span className="font-semibold">
                            {risk.probability}%
                          </span>
                        </div>
                        <Progress value={risk.probability} className="h-2" />
                        <p className="text-sm text-muted-foreground">
                          {risk.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
