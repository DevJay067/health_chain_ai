import { useState } from "react";
import { Heart, ArrowLeft, AlertTriangle, Phone, Timer, Zap, Cross, Activity, Thermometer, Users, FileText, Youtube, ExternalLink, Play, Clock, CheckCircle, Search } from "lucide-react";

interface EmergencyContact {
  name: string;
  number: string;
  type: "emergency" | "medical" | "mental";
}

interface FirstAidCondition {
  id: number;
  title: string;
  severity: "critical" | "urgent" | "moderate";
  icon: React.ElementType;
  symptoms: string[];
  steps: string[];
  timeframe: string;
  category: string;
  youtubeUrl: string;
}

export default function FirstAid() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCondition, setSelectedCondition] = useState<FirstAidCondition | null>(null);
  const [activeTab, setActiveTab] = useState<"conditions" | "quick-guide">("conditions");

  const openYouTubeTutorial = (youtubeUrl: string) => {
    try {
      const newWindow = window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        const link = document.createElement('a');
        link.href = youtubeUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error opening YouTube tutorial:', error);
      alert(`Please manually open this YouTube tutorial: ${youtubeUrl}`);
    }
  };

  const emergencyContacts: EmergencyContact[] = [
    { name: "Emergency Services", number: "112", type: "emergency" },
    { name: "Medical Emergency", number: "108", type: "medical" },
    { name: "Mental Health Crisis", number: "9152987821", type: "mental" }
  ];

  const firstAidConditions: FirstAidCondition[] = [
    {
      id: 1,
      title: "Heart Attack",
      severity: "critical",
      icon: Heart,
      symptoms: ["Chest pain", "Shortness of breath", "Nausea", "Sweating"],
      steps: [
        "Call 112 immediately",
        "Help the person sit or lie down comfortably",
        "Loosen tight clothing around neck and chest",
        "If prescribed, help them take nitroglycerin",
        "If unconscious and not breathing, begin CPR",
        "Stay with the person until help arrives"
      ],
      timeframe: "Call 112 immediately",
      category: "cardiovascular",
      youtubeUrl: "https://www.youtube.com/watch?v=gDwt7dD3awc"
    },
    {
      id: 2,
      title: "Choking",
      severity: "critical",
      icon: Activity,
      symptoms: ["Cannot speak or breathe", "Clutching throat", "Blue lips/face"],
      steps: [
        "Encourage coughing if person can still breathe",
        "Stand behind the person",
        "Place arms around their waist",
        "Make a fist and place thumb side against upper abdomen",
        "Grab fist with other hand and thrust upward",
        "Repeat until object is expelled or person becomes unconscious"
      ],
      timeframe: "Act immediately",
      category: "respiratory",
      youtubeUrl: "https://www.youtube.com/watch?v=7CgtIgSyAiU"
    },
    {
      id: 3,
      title: "Severe Bleeding",
      severity: "urgent",
      icon: Cross,
      symptoms: ["Heavy bleeding", "Blood soaking through bandages", "Signs of shock"],
      steps: [
        "Call 112 if bleeding is severe",
        "Put on gloves or use barrier",
        "Apply direct pressure to wound",
        "Raise injured area above heart if possible",
        "Don't remove embedded objects",
        "Apply additional bandages if blood soaks through"
      ],
      timeframe: "Control bleeding within 5 minutes",
      category: "trauma",
      youtubeUrl: "https://youtu.be/NxO5LvgqZe0?si=qcvrXv9yMUGBQT8V"
    },
    {
      id: 4,
      title: "Burns",
      severity: "moderate",
      icon: Thermometer,
      symptoms: ["Red, painful skin", "Blisters", "Swelling"],
      steps: [
        "Remove from heat source safely",
        "Cool burn with cool (not cold) water for 10-20 minutes",
        "Remove jewelry/tight items before swelling",
        "Don't break blisters",
        "Cover with sterile gauze loosely",
        "Take over-the-counter pain medication if needed"
      ],
      timeframe: "Cool immediately for 10-20 minutes",
      category: "thermal",
      youtubeUrl: "https://youtu.be/JwlSXhSg69A?si=QjY53nokXvwoM0eE"
    },
    {
      id: 5,
      title: "Allergic Reaction",
      severity: "urgent",
      icon: Zap,
      symptoms: ["Difficulty breathing", "Swelling", "Hives", "Rapid pulse"],
      steps: [
        "Call 112 for severe reactions",
        "Help person use epinephrine auto-injector if available",
        "Have person lie flat if conscious",
        "Remove or avoid allergen if known",
        "Loosen tight clothing",
        "Monitor breathing and pulse"
      ],
      timeframe: "Use epinephrine immediately if available",
      category: "allergic",
      youtubeUrl: "https://youtu.be/llZFx8n-WCQ?si=h17--7e-h_GD25ys"
    },
    {
      id: 6,
      title: "Fainting",
      severity: "moderate",
      icon: Users,
      symptoms: ["Dizziness", "Weakness", "Nausea", "Loss of consciousness"],
      steps: [
        "Help person sit or lie down",
        "Raise legs 8-12 inches if lying down",
        "Loosen tight clothing",
        "Check for breathing and pulse",
        "If unconscious for more than 1 minute, call 112",
        "Stay with person until they recover"
      ],
      timeframe: "Position immediately",
      category: "neurological",
      youtubeUrl: "https://youtu.be/ddHKwkMwNyI?si=FYstj-qR4tcKUVsF"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'urgent': return 'bg-orange-500 text-white';
      case 'moderate': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const filteredConditions = firstAidConditions.filter(condition =>
    condition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    condition.symptoms.some(symptom => 
      symptom.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.location.href = '/'}
                className="px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-gray-700 font-medium">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Main</span>
                <span className="sm:hidden">Back</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-600 text-white">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Emergency First Aid</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Quick Response Guide</p>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full flex items-center gap-1 animate-pulse">
                <AlertTriangle className="h-3 w-3" />
                <span className="hidden sm:inline">Emergency Ready</span>
                <span className="sm:hidden">Ready</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Emergency Alert */}
        <div className="mb-8 p-4 bg-red-100 border border-red-300 rounded-lg">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 text-sm">Emergency Disclaimer:</p>
              <p className="text-sm text-red-800 mt-1">
                This guide provides basic first aid information. In any serious emergency, call 112 immediately. 
                This information does not replace professional medical training.
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Phone className="h-6 w-6 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Emergency Contacts</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <div>
                  <p className="font-semibold text-sm text-gray-700">{contact.name}</p>
                  <p className="text-2xl font-bold text-red-600">{contact.number}</p>
                </div>
                <button className="ml-2 h-10 w-10 flex items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
                  <Phone className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-6">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("conditions")}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "conditions"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Conditions
            </button>
            <button
              onClick={() => setActiveTab("quick-guide")}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "quick-guide"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Quick Guide
            </button>
          </div>

          {activeTab === "conditions" && (
            <div className="space-y-6">
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conditions or symptoms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Conditions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredConditions.map((condition) => {
                  const IconComponent = condition.icon;
                  return (
                    <div key={condition.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl text-white ${
                          condition.severity === 'critical' ? 'bg-red-600' :
                          condition.severity === 'urgent' ? 'bg-orange-500' :
                          'bg-blue-500'
                        }`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getSeverityColor(condition.severity)}`}>
                          {condition.severity}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors mb-4">
                        {condition.title}
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-2">Key Symptoms:</p>
                          <div className="flex flex-wrap gap-2">
                            {condition.symptoms.slice(0, 2).map((symptom, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                                {symptom}
                              </span>
                            ))}
                            {condition.symptoms.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                                +{condition.symptoms.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Timer className="h-3 w-3 mr-1.5" />
                          {condition.timeframe}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                          <button
                            onClick={() => setSelectedCondition(condition)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            Read Steps
                          </button>
                          <button
                            onClick={() => openYouTubeTutorial(condition.youtubeUrl)}
                            className="flex-1 px-3 py-2 bg-red-600 rounded-lg text-xs font-medium text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                          >
                            <Youtube className="h-3 w-3" />
                            <span className="hidden sm:inline">Tutorial</span>
                            <span className="sm:hidden">Video</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "quick-guide" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Universal Emergency Steps</h2>
              <p className="text-gray-600 mb-8">Follow these steps in any emergency situation</p>
              <div className="space-y-4">
                {[
                  { step: 1, title: "Assess the Situation", description: "Ensure the scene is safe for you and the victim" },
                  { step: 2, title: "Check Responsiveness", description: "Tap shoulders and shout 'Are you okay?'" },
                  { step: 3, title: "Call for Help", description: "Call 112 or ask someone else to do it" },
                  { step: 4, title: "Check ABCs", description: "Airway, Breathing, Circulation" },
                  { step: 5, title: "Provide Care", description: "Give appropriate first aid based on condition" },
                  { step: 6, title: "Monitor", description: "Stay with victim until professional help arrives" }
                ].map((item) => (
                  <div key={item.step} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white font-bold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Condition Details */}
        {selectedCondition && (
          <div className="mt-8 bg-white rounded-2xl border-2 border-red-600 p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <selectedCondition.icon className="h-6 w-6 text-red-600" />
                {selectedCondition.title} - Detailed Steps
              </h2>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full flex items-center gap-1 self-start sm:self-center">
                <Play className="h-3 w-3" />
                Tutorial Available
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Symptoms to Look For:</h3>
                <ul className="space-y-2">
                  {selectedCondition.symptoms.map((symptom, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      {symptom}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-4">First Aid Steps:</h3>
                <ol className="space-y-3">
                  {selectedCondition.steps.map((step, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-700">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold mr-3 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-300 rounded-lg mb-6">
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-blue-900 text-sm">Time Critical:</p>
                  <p className="text-sm text-blue-800">{selectedCondition.timeframe}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setSelectedCondition(null)}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close Details
              </button>
              <button
                onClick={() => openYouTubeTutorial(selectedCondition.youtubeUrl)}
                className="px-6 py-3 bg-red-600 rounded-lg font-medium text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Youtube className="h-4 w-4" />
                Watch YouTube Tutorial
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
