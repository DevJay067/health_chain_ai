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
  Brain,
  Heart,
  Target,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Shield,
  RefreshCw,
  Loader2,
  Info,
  AlertTriangle,
  MapPin,
  Navigation,
  Phone,
  Star,
  Cloud,
  Watch,
  Footprints,
  Moon,
  Flame,
  ExternalLink,
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
} from "recharts";
import { Chart } from "react-google-charts";

// Sample healthcare providers data
const healthcareProviders = [
  { id: 1, name: "Mount Sinai Hospital", lat: 40.7900, lng: -73.9526, type: "hospital", rating: 4.5, phone: "(212) 241-6500", specialties: ["Cardiology", "Neurology", "Oncology"] },
  { id: 2, name: "NYU Langone Health", lat: 40.7421, lng: -73.9739, type: "hospital", rating: 4.7, phone: "(212) 263-7300", specialties: ["Orthopedics", "Cardiology", "Pediatrics"] },
  { id: 3, name: "NewYork-Presbyterian", lat: 40.7644, lng: -73.9537, type: "hospital", rating: 4.6, phone: "(212) 746-5454", specialties: ["Cancer Care", "Heart Care", "Neurology"] },
  { id: 4, name: "Urgent Care Plus", lat: 40.7282, lng: -73.9942, type: "urgent_care", rating: 4.2, phone: "(212) 555-0123", specialties: ["Walk-in Care", "X-Ray", "Lab Tests"] },
  { id: 5, name: "CityMD Urgent Care", lat: 40.7505, lng: -73.9934, type: "urgent_care", rating: 4.3, phone: "(212) 555-0456", specialties: ["Urgent Care", "COVID Testing", "Vaccinations"] },
];

// Google Fit data simulation
interface GoogleFitData {
  steps: number;
  calories: number;
  distance: number;
  activeMinutes: number;
  heartPoints: number;
  sleepHours: number;
  lastSync: string;
  connected: boolean;
}

export default function HealthAnalytics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");
  const {
    insights,
    trends,
    isLoading,
    error,
    getHealthScore,
    refreshData,
  } = useHealthData();

  const [chartData, setChartData] = useState<any[]>([]);
  const [googleFitData, setGoogleFitData] = useState<GoogleFitData>({
    steps: 8547,
    calories: 2150,
    distance: 6.2,
    activeMinutes: 45,
    heartPoints: 32,
    sleepHours: 7.2,
    lastSync: new Date().toISOString(),
    connected: true,
  });
  const [isSyncingFit, setIsSyncingFit] = useState(false);

  // Simulate Google Fit sync
  const syncGoogleFit = async () => {
    setIsSyncingFit(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGoogleFitData({
      steps: Math.floor(Math.random() * 5000) + 6000,
      calories: Math.floor(Math.random() * 500) + 1800,
      distance: Math.random() * 4 + 4,
      activeMinutes: Math.floor(Math.random() * 30) + 30,
      heartPoints: Math.floor(Math.random() * 20) + 20,
      sleepHours: Math.random() * 2 + 6,
      lastSync: new Date().toISOString(),
      connected: true,
    });
    setIsSyncingFit(false);
  };

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

  // Google Charts data for pie chart
  const googlePieData = [
    ["Category", "Score"],
    ["Physical Health", 85],
    ["Mental Health", 78],
    ["Nutrition", 82],
    ["Sleep Quality", 75],
    ["Activity Level", 92],
  ];

  // Google Charts data for area chart
  const googleAreaData = [
    ["Day", "Steps", "Calories", "Heart Points"],
    ["Mon", 8500, 2100, 28],
    ["Tue", 9200, 2300, 35],
    ["Wed", 7800, 1950, 22],
    ["Thu", 10500, 2600, 42],
    ["Fri", 8900, 2200, 30],
    ["Sat", 12000, 2800, 48],
    ["Sun", 6500, 1800, 18],
  ];

  // Google Charts data for gauge
  const googleGaugeData = [
    ["Label", "Value"],
    ["Health Score", getHealthScore()],
  ];

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

  const handleBackToHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('navigate'));
  };

  const openDirections = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const openGoogleMapsSearch = () => {
    window.open('https://www.google.com/maps/search/hospitals+near+me/', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-info/5">
      <header className="border-b border-border/40 bg-card/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleBackToHome}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Health Analytics</h1>
                  <p className="text-sm text-muted-foreground">Powered by Google Cloud & Gemini AI</p>
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
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                <Cloud className="h-3 w-3 mr-1" />
                Google Cloud
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

        {/* Google Fit Integration Card */}
        <Card className="mb-8 border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg">
                  <Watch className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Google Fit Integration
                    <Badge className="bg-green-500 text-white">Connected</Badge>
                  </CardTitle>
                  <CardDescription>Synced data from your Google Fit account</CardDescription>
                </div>
              </div>
              <Button
                onClick={syncGoogleFit}
                disabled={isSyncingFit}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSyncingFit ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sync Now
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Footprints className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold text-gray-800">{googleFitData.steps.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Steps</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold text-gray-800">{googleFitData.calories}</div>
                <div className="text-sm text-gray-500">Calories</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Navigation className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold text-gray-800">{googleFitData.distance.toFixed(1)} km</div>
                <div className="text-sm text-gray-500">Distance</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Activity className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold text-gray-800">{googleFitData.activeMinutes}</div>
                <div className="text-sm text-gray-500">Active Min</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <div className="text-2xl font-bold text-gray-800">{googleFitData.heartPoints}</div>
                <div className="text-sm text-gray-500">Heart Points</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Moon className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
                <div className="text-2xl font-bold text-gray-800">{googleFitData.sleepHours.toFixed(1)}h</div>
                <div className="text-sm text-gray-500">Sleep</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500 text-center">
              Last synced: {new Date(googleFitData.lastSync).toLocaleString()}
            </div>
          </CardContent>
        </Card>

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
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Insights</span>
            </TabsTrigger>
            <TabsTrigger value="google-charts" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Google Charts</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center space-x-2">
              <LineChart className="h-4 w-4" />
              <span>Trends</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Risk</span>
            </TabsTrigger>
            <TabsTrigger value="providers" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Providers</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-primary" />
                  AI-Generated Health Insights
                  <Badge className="ml-2 bg-purple-100 text-purple-700">Gemini AI</Badge>
                </CardTitle>
                <CardDescription>
                  Personalized recommendations powered by Google Gemini AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {enhancedInsights.map((insight, index) => {
                  const IconComponent = insight.icon;
                  return (
                    <Card key={index} className={`border-l-4 ${getInsightColor(insight.type)}`}>
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
                              <p className="text-sm text-muted-foreground">{insight.description}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs">{insight.category}</Badge>
                                <span className="text-xs text-muted-foreground">Confidence: {insight.confidence}%</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant={insight.importance === "high" ? "destructive" : "secondary"}>
                            {insight.importance}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm font-medium text-primary">Recommended Action: {insight.action}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Google Charts Tab */}
          <TabsContent value="google-charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-blue-600" />
                    Health Categories Distribution
                    <Badge className="ml-2 bg-yellow-100 text-yellow-700">Google Charts</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Chart
                    chartType="PieChart"
                    data={googlePieData}
                    options={{
                      pieHole: 0.4,
                      colors: ['#3b82f6', '#8b5cf6', '#10b981', '#6366f1', '#f59e0b'],
                      legend: { position: 'bottom' },
                      chartArea: { width: '90%', height: '70%' },
                    }}
                    width="100%"
                    height="300px"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-green-600" />
                    Overall Health Score Gauge
                    <Badge className="ml-2 bg-yellow-100 text-yellow-700">Google Charts</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Chart
                    chartType="Gauge"
                    data={googleGaugeData}
                    options={{
                      redFrom: 0,
                      redTo: 40,
                      yellowFrom: 40,
                      yellowTo: 70,
                      greenFrom: 70,
                      greenTo: 100,
                      minorTicks: 5,
                    }}
                    width="100%"
                    height="300px"
                  />
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                    Weekly Activity Overview
                    <Badge className="ml-2 bg-yellow-100 text-yellow-700">Google Charts</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Chart
                    chartType="AreaChart"
                    data={googleAreaData}
                    options={{
                      hAxis: { title: "Day" },
                      vAxis: { title: "Value" },
                      colors: ['#3b82f6', '#f59e0b', '#ef4444'],
                      areaOpacity: 0.3,
                      legend: { position: 'bottom' },
                      chartArea: { width: '85%', height: '65%' },
                    }}
                    width="100%"
                    height="350px"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Health Trends - {selectedTimeframe}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} name="Heart Rate" />
                      <Line type="monotone" dataKey="steps" stroke="#3b82f6" strokeWidth={2} name="Steps" />
                      <Line type="monotone" dataKey="sleep" stroke="#10b981" strokeWidth={2} name="Sleep (hours)" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Predictive Risk Analysis
                  <Badge className="ml-2 bg-purple-100 text-purple-700">Gemini AI</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {riskFactors.map((risk, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{risk.factor}</h3>
                        <Badge className={getRiskColor(risk.level)}>{risk.level} risk</Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Risk Probability</span>
                          <span className="font-semibold">{risk.probability}%</span>
                        </div>
                        <Progress value={risk.probability} className="h-2" />
                        <p className="text-sm text-muted-foreground">{risk.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Healthcare Providers */}
          <TabsContent value="providers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-red-600" />
                  Nearby Healthcare Providers
                  <Badge className="ml-2 bg-red-100 text-red-700">Google Maps</Badge>
                </CardTitle>
                <CardDescription>Find hospitals and urgent care centers near you</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Google Maps Button */}
                <div className="mb-6">
                  <Button onClick={openGoogleMapsSearch} className="w-full bg-blue-600 hover:bg-blue-700">
                    <MapPin className="h-5 w-5 mr-2" />
                    Open Google Maps to Find Hospitals Near You
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {/* Provider List */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Top Healthcare Providers</h3>
                  {healthcareProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${provider.type === 'hospital' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                          <MapPin className={`h-5 w-5 ${provider.type === 'hospital' ? 'text-red-600' : 'text-yellow-600'}`} />
                        </div>
                        <div>
                          <h4 className="font-medium">{provider.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            <span>{provider.rating}</span>
                            <span>•</span>
                            <span>{provider.type === 'hospital' ? 'Hospital' : 'Urgent Care'}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {provider.specialties.slice(0, 2).map((spec, idx) => (
                              <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.open(`tel:${provider.phone}`)}>
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={() => openDirections(provider.lat, provider.lng)}>
                          <Navigation className="h-4 w-4 mr-1" />
                          Directions
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
