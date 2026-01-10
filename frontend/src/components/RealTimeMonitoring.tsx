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
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Heart,
  Activity,
  Thermometer,
  Droplets,
  Zap,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Clock,
  Smartphone,
  Watch,
  Bluetooth,
  BarChart3,
  Navigation,
  MapPin,
  Phone,
  Cloud,
  Database,
  RefreshCw,
  Loader2,
  Settings,
  Bell,
  Shield,
  Footprints,
  Flame,
  ExternalLink,
} from "lucide-react";
import BluetoothHealthMonitor from "@/components/BluetoothHealthMonitor";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Chart } from "react-google-charts";

// Emergency hospitals data
const emergencyHospitals = [
  { id: 1, name: "Mount Sinai Emergency", lat: 40.7900, lng: -73.9526, rating: 4.5, phone: "(212) 241-6500", waitTime: "15 min", distance: "2.3 mi" },
  { id: 2, name: "NYU Langone ER", lat: 40.7421, lng: -73.9739, rating: 4.7, phone: "(212) 263-7300", waitTime: "25 min", distance: "1.8 mi" },
  { id: 3, name: "NewYork-Presbyterian ER", lat: 40.7644, lng: -73.9537, rating: 4.6, phone: "(212) 746-5454", waitTime: "20 min", distance: "3.1 mi" },
  { id: 4, name: "Bellevue Hospital ER", lat: 40.7390, lng: -73.9750, rating: 4.3, phone: "(212) 562-4141", waitTime: "35 min", distance: "1.5 mi" },
];

interface VitalSigns {
  heartRate: number;
  bloodPressure: { systolic: number; diastolic: number };
  temperature: number;
  oxygenSaturation: number;
  respiratoryRate: number;
  timestamp: string;
}

interface Device {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected" | "syncing";
  battery: number;
  lastSync: string;
  icon: any;
}

// Firebase-like realtime data simulation
interface FirebaseHealthData {
  userId: string;
  timestamp: number;
  vitals: VitalSigns;
  alerts: any[];
  deviceData: any;
}

// Google Fit real-time data
interface GoogleFitRealtime {
  steps: number;
  heartRate: number;
  calories: number;
  activeMinutes: number;
  lastUpdate: string;
}

export default function RealTimeMonitoring() {
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    heartRate: 72,
    bloodPressure: { systolic: 120, diastolic: 80 },
    temperature: 98.6,
    oxygenSaturation: 98,
    respiratoryRate: 16,
    timestamp: new Date().toISOString(),
  });

  const [vitalsHistory, setVitalsHistory] = useState<any[]>([]);
  const [showBluetoothDialog, setShowBluetoothDialog] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cloudIoTStatus, setCloudIoTStatus] = useState<'connected' | 'syncing' | 'disconnected'>('connected');
  
  // Google Fit realtime state
  const [googleFitRealtime, setGoogleFitRealtime] = useState<GoogleFitRealtime>({
    steps: 4523,
    heartRate: 72,
    calories: 1250,
    activeMinutes: 28,
    lastUpdate: new Date().toISOString(),
  });

  // Firebase realtime data state
  const [firebaseData, setFirebaseData] = useState<FirebaseHealthData>({
    userId: "user_123",
    timestamp: Date.now(),
    vitals: vitalSigns,
    alerts: [],
    deviceData: {},
  });

  const [connectedDevices] = useState<Device[]>([
    {
      id: "google_pixel_watch",
      name: "Google Pixel Watch 2",
      type: "smartwatch",
      status: "connected",
      battery: 85,
      lastSync: "Just now",
      icon: Watch,
    },
    {
      id: "fitbit_sense",
      name: "Fitbit Sense 2",
      type: "fitness_tracker",
      status: "connected",
      battery: 72,
      lastSync: "1 minute ago",
      icon: Activity,
    },
    {
      id: "google_nest_hub",
      name: "Google Nest Hub (Health)",
      type: "smartwatch",
      status: "syncing",
      battery: 100,
      lastSync: "Syncing...",
      icon: Smartphone,
    },
    {
      id: "withings_bp",
      name: "Withings BPM Connect",
      type: "blood_pressure",
      status: "connected",
      battery: 45,
      lastSync: "5 minutes ago",
      icon: Heart,
    },
  ]);

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "warning",
      message: "Heart rate elevated above normal range (>100 BPM)",
      timestamp: "2 minutes ago",
      severity: "medium",
      source: "Google Fit",
    },
    {
      id: 2,
      type: "info",
      message: "Firebase Realtime Database sync completed",
      timestamp: "5 minutes ago",
      severity: "low",
      source: "Firebase",
    },
    {
      id: 3,
      type: "success",
      message: "Google Cloud IoT connection established",
      timestamp: "10 minutes ago",
      severity: "low",
      source: "Google Cloud",
    },
  ]);

  // Simulate real-time data updates (Firebase-style)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newVitals: VitalSigns = {
        heartRate: Math.floor(Math.random() * 20) + 65,
        bloodPressure: {
          systolic: Math.floor(Math.random() * 20) + 110,
          diastolic: Math.floor(Math.random() * 15) + 70,
        },
        temperature: Math.random() * 2 + 97.5,
        oxygenSaturation: Math.floor(Math.random() * 3) + 97,
        respiratoryRate: Math.floor(Math.random() * 6) + 14,
        timestamp: now.toISOString(),
      };

      setVitalSigns(newVitals);

      // Update Firebase-style data
      setFirebaseData({
        userId: "user_123",
        timestamp: Date.now(),
        vitals: newVitals,
        alerts: alerts,
        deviceData: { devices: connectedDevices.length },
      });

      // Update Google Fit realtime
      setGoogleFitRealtime(prev => ({
        steps: prev.steps + Math.floor(Math.random() * 50),
        heartRate: newVitals.heartRate,
        calories: prev.calories + Math.floor(Math.random() * 5),
        activeMinutes: prev.activeMinutes + (Math.random() > 0.8 ? 1 : 0),
        lastUpdate: now.toISOString(),
      }));

      setVitalsHistory((prev) => {
        const newHistory = [
          ...prev,
          {
            time: now.toLocaleTimeString(),
            heartRate: newVitals.heartRate,
            temperature: newVitals.temperature,
            oxygenSat: newVitals.oxygenSaturation,
            systolic: newVitals.bloodPressure.systolic,
          },
        ].slice(-20);
        return newHistory;
      });

      // Simulate Cloud IoT status changes
      if (Math.random() > 0.95) {
        setCloudIoTStatus('syncing');
        setTimeout(() => setCloudIoTStatus('connected'), 2000);
      }

      if (newVitals.heartRate > 100 && Math.random() > 0.8) {
        setAlerts((prev) => [
          {
            id: Date.now(),
            type: "warning",
            message: `Heart rate spike detected: ${newVitals.heartRate} BPM`,
            timestamp: "Just now",
            severity: "high",
            source: "Google Fit",
          },
          ...prev.slice(0, 4),
        ]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [alerts, connectedDevices.length]);

  // Google Charts data for real-time gauge
  const heartRateGaugeData = [
    ["Label", "Value"],
    ["BPM", vitalSigns.heartRate],
  ];

  const oxygenGaugeData = [
    ["Label", "Value"],
    ["SpO2", vitalSigns.oxygenSaturation],
  ];

  // Google Charts timeline data
  const timelineData = [
    ["Time", "Heart Rate", "Oxygen", "Systolic BP"],
    ...vitalsHistory.slice(-10).map(v => [v.time, v.heartRate, v.oxygenSat, v.systolic])
  ];

  const getVitalStatus = (type: string, value: number) => {
    switch (type) {
      case "heartRate":
        if (value < 60) return { status: "low", color: "text-blue-600" };
        if (value > 100) return { status: "high", color: "text-red-600" };
        return { status: "normal", color: "text-green-600" };
      case "bloodPressure":
        if (value > 140) return { status: "high", color: "text-red-600" };
        if (value < 90) return { status: "low", color: "text-blue-600" };
        return { status: "normal", color: "text-green-600" };
      case "temperature":
        if (value > 100.4) return { status: "fever", color: "text-red-600" };
        if (value < 97) return { status: "low", color: "text-blue-600" };
        return { status: "normal", color: "text-green-600" };
      case "oxygenSat":
        if (value < 95) return { status: "low", color: "text-red-600" };
        return { status: "normal", color: "text-green-600" };
      default:
        return { status: "normal", color: "text-green-600" };
    }
  };

  const heartRateStatus = getVitalStatus("heartRate", vitalSigns.heartRate);
  const bpStatus = getVitalStatus("bloodPressure", vitalSigns.bloodPressure.systolic);
  const tempStatus = getVitalStatus("temperature", vitalSigns.temperature);
  const oxygenStatus = getVitalStatus("oxygenSat", vitalSigns.oxygenSaturation);

  const handleConnectBluetooth = () => {
    setShowBluetoothDialog(true);
  };

  const handleScanBluetooth = async () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      alert('Bluetooth devices found! In a real app, this would show available devices.');
    }, 2000);
  };

  const handleBackToHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('navigate'));
  };

  const openDirections = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const openGoogleMapsEmergency = () => {
    window.open('https://www.google.com/maps/search/emergency+room+near+me/', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50 page-transition">
      <header className="border-b border-border/40 glass backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 fade-in">
              <Button variant="ghost" size="sm" className="btn-smooth" onClick={handleBackToHome}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/25 transform-smooth hover:scale-110">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Real-time Health Monitoring</h1>
                  <p className="text-sm text-slate-600 font-medium">Powered by Google Cloud IoT & Firebase</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 fade-in fade-in-delay-1">
              <Button 
                onClick={handleConnectBluetooth}
                variant="outline"
                size="sm"
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Bluetooth className="w-4 h-4 mr-2" />
                Connect Device
              </Button>
              <Badge className={`${cloudIoTStatus === 'connected' ? 'bg-green-100 text-green-700' : cloudIoTStatus === 'syncing' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                <Cloud className="w-3 h-3 mr-1" />
                {cloudIoTStatus === 'connected' ? 'Cloud IoT' : cloudIoTStatus === 'syncing' ? 'Syncing...' : 'Disconnected'}
              </Badge>
              <Badge className="bg-orange-100 text-orange-700">
                <Database className="w-3 h-3 mr-1" />
                Firebase
              </Badge>
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                Live
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Google Cloud & Firebase Status Bar */}
        <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500 text-white">
                    <Cloud className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Google Cloud IoT Core</p>
                    <p className="text-xs text-gray-500">Device telemetry streaming</p>
                  </div>
                  <Badge className="bg-green-500 text-white ml-2">Active</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-orange-500 text-white">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Firebase Realtime DB</p>
                    <p className="text-xs text-gray-500">Live data sync enabled</p>
                  </div>
                  <Badge className="bg-green-500 text-white ml-2">Connected</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-500 text-white">
                    <Watch className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Google Fit API</p>
                    <p className="text-xs text-gray-500">Real-time health sync</p>
                  </div>
                  <Badge className="bg-green-500 text-white ml-2">Streaming</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Last sync</p>
                <p className="font-mono text-sm">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Google Fit Real-time Stats */}
        <Card className="mb-6 border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Watch className="h-5 w-5 text-green-600" />
              Google Fit Real-time Data
              <Badge className="bg-green-500 text-white animate-pulse">LIVE</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-green-100">
                <Footprints className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold text-gray-800">{googleFitRealtime.steps.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Steps Today</div>
                <Progress value={(googleFitRealtime.steps / 10000) * 100} className="h-1 mt-2" />
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-green-100">
                <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <div className="text-2xl font-bold text-gray-800">{googleFitRealtime.heartRate}</div>
                <div className="text-sm text-gray-500">Current BPM</div>
                <div className="text-xs text-green-600 mt-1">● Live from Pixel Watch</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-green-100">
                <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold text-gray-800">{googleFitRealtime.calories}</div>
                <div className="text-sm text-gray-500">Calories Burned</div>
                <Progress value={(googleFitRealtime.calories / 2500) * 100} className="h-1 mt-2" />
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-green-100">
                <Activity className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold text-gray-800">{googleFitRealtime.activeMinutes}</div>
                <div className="text-sm text-gray-500">Active Minutes</div>
                <Progress value={(googleFitRealtime.activeMinutes / 60) * 100} className="h-1 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {alerts.length > 0 && (
          <div className="mb-8 space-y-3 fade-in">
            {alerts.slice(0, 3).map((alert) => (
              <Alert
                key={alert.id}
                className={`border-l-4 ${
                  alert.severity === "high"
                    ? "border-red-500 bg-red-50"
                    : alert.severity === "medium"
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-blue-500 bg-blue-50"
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  {alert.message}
                  <span className="text-sm text-muted-foreground ml-2">• {alert.timestamp}</span>
                  <Badge variant="outline" className="ml-2 text-xs">{alert.source}</Badge>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover shadow-colored border-border/50 fade-in">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className={`w-5 h-5 ${heartRateStatus.color}`} />
                  <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                </div>
                <Badge variant={heartRateStatus.status === "normal" ? "default" : "destructive"}>
                  {heartRateStatus.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 text-slate-800">
                {vitalSigns.heartRate}
                <span className="text-lg text-muted-foreground ml-1">BPM</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                Normal range: 60-100 BPM
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover shadow-colored border-border/50 fade-in fade-in-delay-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className={`w-5 h-5 ${bpStatus.color}`} />
                  <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
                </div>
                <Badge variant={bpStatus.status === "normal" ? "default" : "destructive"}>
                  {bpStatus.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 text-slate-800">
                {vitalSigns.bloodPressure.systolic}
                <span className="text-xl text-muted-foreground">/{vitalSigns.bloodPressure.diastolic}</span>
                <span className="text-lg text-muted-foreground ml-1">mmHg</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                Target: &lt;120/80 mmHg
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover shadow-colored border-border/50 fade-in fade-in-delay-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Thermometer className={`w-5 h-5 ${tempStatus.color}`} />
                  <CardTitle className="text-sm font-medium">Temperature</CardTitle>
                </div>
                <Badge variant={tempStatus.status === "normal" ? "default" : "destructive"}>
                  {tempStatus.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 text-slate-800">
                {vitalSigns.temperature.toFixed(1)}
                <span className="text-lg text-muted-foreground ml-1">°F</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                Normal: 97-99°F
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover shadow-colored border-border/50 fade-in fade-in-delay-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Droplets className={`w-5 h-5 ${oxygenStatus.color}`} />
                  <CardTitle className="text-sm font-medium">Oxygen Saturation</CardTitle>
                </div>
                <Badge variant={oxygenStatus.status === "normal" ? "default" : "destructive"}>
                  {oxygenStatus.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 text-slate-800">
                {vitalSigns.oxygenSaturation}
                <span className="text-lg text-muted-foreground ml-1">%</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                Normal: &gt;95%
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="google-charts" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Google Charts</span>
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Emergency</span>
            </TabsTrigger>
            <TabsTrigger value="bluetooth" className="flex items-center space-x-2">
              <Bluetooth className="h-4 w-4" />
              <span>Devices</span>
            </TabsTrigger>
            <TabsTrigger value="firebase" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Firebase</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="shadow-colored border-border/50 fade-in fade-in-delay-4">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                      Live Vital Signs Trends
                      <Badge className="ml-2 bg-blue-100 text-blue-700">Google Cloud</Badge>
                    </CardTitle>
                    <CardDescription>Real-time data streamed via Google Cloud IoT Core</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={vitalsHistory}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="time" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip />
                          <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} name="Heart Rate" />
                          <Line type="monotone" dataKey="oxygenSat" stroke="#3b82f6" strokeWidth={2} name="Oxygen %" />
                          <Line type="monotone" dataKey="systolic" stroke="#10b981" strokeWidth={2} name="Systolic BP" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="shadow-colored border-border/50 fade-in fade-in-delay-5">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Smartphone className="w-5 h-5 mr-2 text-green-600" />
                      Connected Devices
                    </CardTitle>
                    <CardDescription>Google ecosystem devices</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {connectedDevices.map((device) => {
                      const IconComponent = device.icon;
                      return (
                        <div key={device.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              device.status === "connected" ? "bg-green-100 text-green-600" :
                              device.status === "syncing" ? "bg-yellow-100 text-yellow-600" :
                              "bg-red-100 text-red-600"
                            }`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{device.name}</p>
                              <p className="text-xs text-muted-foreground">{device.lastSync}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-xs text-muted-foreground">{device.battery}%</div>
                            <Progress value={device.battery} className="w-12 h-2" />
                            {device.status === "connected" ? (
                              <Wifi className="w-4 h-4 text-green-600" />
                            ) : device.status === "syncing" ? (
                              <Zap className="w-4 h-4 text-yellow-600 animate-pulse" />
                            ) : (
                              <WifiOff className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Google Charts Tab */}
          <TabsContent value="google-charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-red-600" />
                    Heart Rate Monitor
                    <Badge className="ml-2 bg-yellow-100 text-yellow-700">Google Charts</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Chart
                    chartType="Gauge"
                    data={heartRateGaugeData}
                    options={{
                      redFrom: 100,
                      redTo: 150,
                      yellowFrom: 85,
                      yellowTo: 100,
                      greenFrom: 60,
                      greenTo: 85,
                      minorTicks: 5,
                      min: 40,
                      max: 150,
                    }}
                    width="100%"
                    height="280px"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Droplets className="h-5 w-5 mr-2 text-blue-600" />
                    Oxygen Saturation
                    <Badge className="ml-2 bg-yellow-100 text-yellow-700">Google Charts</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Chart
                    chartType="Gauge"
                    data={oxygenGaugeData}
                    options={{
                      redFrom: 85,
                      redTo: 92,
                      yellowFrom: 92,
                      yellowTo: 95,
                      greenFrom: 95,
                      greenTo: 100,
                      minorTicks: 5,
                      min: 85,
                      max: 100,
                    }}
                    width="100%"
                    height="280px"
                  />
                </CardContent>
              </Card>

              {vitalsHistory.length > 2 && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-purple-600" />
                      Vital Signs Timeline
                      <Badge className="ml-2 bg-yellow-100 text-yellow-700">Google Charts</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Chart
                      chartType="LineChart"
                      data={timelineData}
                      options={{
                        curveType: "function",
                        legend: { position: "bottom" },
                        colors: ['#ef4444', '#3b82f6', '#10b981'],
                        chartArea: { width: '85%', height: '65%' },
                      }}
                      width="100%"
                      height="350px"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Emergency Tab */}
          <TabsContent value="emergency" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-red-600" />
                  Emergency Rooms Near You
                  <Badge className="ml-2 bg-red-100 text-red-700">Google Maps</Badge>
                </CardTitle>
                <CardDescription>Find the nearest emergency care with real-time wait times</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Google Maps Button */}
                <div className="mb-6">
                  <Button onClick={openGoogleMapsEmergency} className="w-full bg-red-600 hover:bg-red-700">
                    <MapPin className="h-5 w-5 mr-2" />
                    Find Emergency Rooms on Google Maps
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {/* Emergency List */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Emergency Rooms
                  </h3>
                  {emergencyHospitals.map((hospital) => (
                    <div
                      key={hospital.id}
                      className="flex items-center justify-between p-4 border-2 border-red-100 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-red-100">
                          <Heart className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{hospital.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {hospital.waitTime}
                            </Badge>
                            <span>{hospital.distance}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => window.open(`tel:${hospital.phone}`)}>
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => openDirections(hospital.lat, hospital.lng)}>
                          <Navigation className="h-4 w-4 mr-1" />
                          Go
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bluetooth">
            <BluetoothHealthMonitor />
          </TabsContent>

          {/* Firebase Tab */}
          <TabsContent value="firebase" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-2 border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2 text-orange-600" />
                    Firebase Realtime Database
                    <Badge className="ml-2 bg-orange-100 text-orange-700">Live Sync</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-auto max-h-96">
                    <pre>{JSON.stringify(firebaseData, null, 2)}</pre>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-sm text-gray-600">Connected to Firebase</span>
                    </div>
                    <Badge variant="outline">Path: /users/user_123/health</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Cloud className="h-5 w-5 mr-2 text-blue-600" />
                    Google Cloud Healthcare API
                    <Badge className="ml-2 bg-blue-100 text-blue-700">FHIR R4</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert className="border-blue-200 bg-blue-50">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <AlertDescription>
                        <strong>HIPAA Compliant</strong> - Your data is encrypted and stored securely
                      </AlertDescription>
                    </Alert>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Data Format</p>
                        <p className="font-semibold">FHIR R4</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Region</p>
                        <p className="font-semibold">us-central1</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Sync to Cloud
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-green-600" />
                    Google Cloud Pub/Sub Alerts
                    <Badge className="ml-2 bg-green-100 text-green-700">Event Streaming</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                        alert.severity === 'high' ? 'border-red-500 bg-red-50' :
                        alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`h-4 w-4 ${
                              alert.severity === 'high' ? 'text-red-600' :
                              alert.severity === 'medium' ? 'text-yellow-600' :
                              'text-blue-600'
                            }`} />
                            <span className="font-medium">{alert.message}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{alert.source}</Badge>
                            <span className="text-xs text-gray-500">{alert.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bluetooth Connection Dialog */}
      {showBluetoothDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowBluetoothDialog(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-full bg-blue-100">
                <Bluetooth className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold">Connect Bluetooth Device</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Scan for nearby Bluetooth health devices and connect them to your monitoring dashboard.
            </p>
            <div className="space-y-4">
              <Button 
                onClick={handleScanBluetooth}
                disabled={isScanning}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Bluetooth className="w-4 h-4 mr-2" />
                    Scan for Devices
                  </>
                )}
              </Button>
              <Button 
                onClick={() => setShowBluetoothDialog(false)}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
