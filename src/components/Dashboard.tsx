import { useState, useEffect } from 'react';
import { Shield, MessageSquare, AlertCircle, Activity, Droplets, Moon, FileText, Upload, Plus, HeartPulse, Lock, ArrowRight, X, MapPin, Navigation } from 'lucide-react';
import InteractiveBackground from './InteractiveBackground';
import AnimatedLogo from './AnimatedLogo';

interface DashboardProps {
  onBackToHome?: () => void;
}

export default function Dashboard({ onBackToHome }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('firstaid');
  const [isScrolled, setIsScrolled] = useState(false);

  const switchTab = (tabId: string) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsScrolled(false);
  };

  useEffect(() => {
    // Reset scroll position on mount to ensure we start in "box mode"
    window.scrollTo(0, 0);
    
    const handleWindowScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, []);

  const [emergencyNumber, setEmergencyNumber] = useState('112'); // Default international standard

  useEffect(() => {
    // Dynamically fetch user country to set the correct emergency number
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.country_code) {
          const codes: Record<string, string> = {
            US: '911', CA: '911',
            GB: '999', IE: '999',
            AU: '000',
            NZ: '111',
            IN: '112',
            JP: '119',
            CN: '120',
            BR: '192',
            ZA: '10111',
          };
          setEmergencyNumber(codes[data.country_code] || '112');
        }
      })
      .catch(() => console.log('Could not fetch country for emergency number'));
  }, []);

  // Map State for First Aid
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mapMode, setMapMode] = useState<'hospitals' | 'route'>('hospitals');

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const mapUrl = userLocation 
    ? (mapMode === 'route'
        ? `https://maps.google.com/maps?saddr=${userLocation.lat},${userLocation.lng}&daddr=Hospital&output=embed`
        : `https://maps.google.com/maps?q=Hospitals&ll=${userLocation.lat},${userLocation.lng}&z=14&output=embed`)
    : (mapMode === 'route'
        ? `https://maps.google.com/maps?saddr=Current+Location&daddr=Hospital&output=embed`
        : `https://maps.google.com/maps?q=Hospitals+near+me&z=13&output=embed`);

  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  // Vitals State
  const [heartRate, setHeartRate] = useState(72);
  const [bloodOxygen, setBloodOxygen] = useState(98);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Records State
  const [records, setRecords] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    fetch(`${API_URL}/api/records`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.records) {
          setRecords(data.records);
        } else {
          setRecords([
            { title: 'Blood Work Report (Demo)', date: 'Oct 12, 2025', is_secure: true },
            { title: 'MRI Scan (Demo)', date: 'Sep 05, 2025', is_secure: true }
          ]);
        }
      })
      .catch(e => {
        setRecords([
          { title: 'Blood Work Report (Offline)', date: 'Oct 12, 2025', is_secure: true }
        ]);
      });
  }, []);

  const handleAddRecord = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsUploading(true);
        try {
          const formData = new FormData();
          formData.append('file', file);
          const uploadRes = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            body: formData
          });
          const uploadData = await uploadRes.json();
          
          const recordData = {
            type: 'other',
            title: file.name,
            description: 'Uploaded via Dashboard',
            date: new Date().toISOString().split("T")[0],
            metadata: {},
            attachments: [{ name: uploadData.file_name, hash: uploadData.file_hash }]
          };
          
          const res = await fetch(`${API_URL}/api/records`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recordData)
          });
          const result = await res.json();
          if (result.success) {
            setRecords([result.record, ...records]);
            alert(`Record securely added to blockchain! Block #${result.blockchain_proof?.index || 'latest'}`);
          }
        } catch (err) {
          alert('Upload failed: ' + err);
        } finally {
          setIsUploading(false);
        }
      }
    };
    input.click();
  };

  const connectWatch = async () => {
    setIsScanning(true);
    try {
      if ('bluetooth' in navigator) {
        // @ts-ignore
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['heart_rate']
        });
        if (device) {
          setDeviceConnected(true);
          // Simulate live data variation for demo
          setInterval(() => {
            setHeartRate(prev => prev + (Math.floor(Math.random() * 5) - 2));
            setBloodOxygen(prev => Math.min(100, Math.max(90, prev + (Math.floor(Math.random() * 3) - 1))));
          }, 3000);
        }
      } else {
        alert("Bluetooth is not supported on this device.");
      }
    } catch (e) {
      console.log("Bluetooth connection failed", e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleVideoClick = (url: string) => {
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    if (videoId) {
      setSelectedVideoUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&origin=${encodeURIComponent(window.location.origin)}`);
    }
  };

  const handleFindNearestHospital = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          window.open(`https://www.google.com/maps/search/hospitals+near+me/@${latitude},${longitude},15z`, '_blank');
        },
        () => window.open('https://www.google.com/maps/search/hospitals+near+me', '_blank')
      );
    } else {
      window.open('https://www.google.com/maps/search/hospitals+near+me', '_blank');
    }
  };

  const firstAidList = [
    { title: 'How to do CPR', url: 'https://www.youtube.com/watch?v=gDwt7dD3awc' },
    { title: 'Choking (Heimlich Maneuver)', url: 'https://www.youtube.com/watch?v=7CgtIgSyAiU' },
    { title: 'Stop Severe Bleeding', url: 'https://youtu.be/NxO5LvgqZe0' },
    { title: 'Signs of a Stroke', url: 'https://youtu.be/ddHKwkMwNyI' }
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans selection:bg-lime-200 relative flex flex-col">
      <InteractiveBackground />
      
      <div className="relative z-10 flex flex-col h-full">
      {/* Dashboard Top Nav */}
      <nav className="bg-white/30 backdrop-blur-md border-b border-white/20 px-3 sm:px-12 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-6 cursor-pointer hover:opacity-80 transition-opacity" onClick={onBackToHome}>
          <AnimatedLogo />
          <div className="hidden sm:block h-6 w-[1px] bg-slate-200"></div>
          <p className="hidden sm:block text-[10px] uppercase tracking-widest text-slate-500 font-bold">Client OS</p>
        </div>

        {/* Top Navigation Tabs */}
        <div className="hidden lg:flex items-center space-x-2 bg-white/50 backdrop-blur-md p-1.5 rounded-full border border-white shadow-sm">
          {[
            { id: 'firstaid', icon: AlertCircle, label: 'First Aid' },
            { id: 'bmax', icon: MessageSquare, label: 'Ask AI' },
            { id: 'records', icon: FileText, label: 'My Records' },
            { id: 'monitoring', icon: HeartPulse, label: 'My Health' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => switchTab(item.id)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 mr-4 text-xs font-bold tracking-widest text-slate-500 uppercase hidden sm:flex">
            <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></div>
            <span>System Active</span>
          </div>
          <a href={`tel:${emergencyNumber}`} className="flex items-center space-x-2 bg-red-600 text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full font-bold text-sm sm:text-base shadow-md hover:bg-red-700 transition-colors cursor-pointer group">
            <AlertCircle className="w-5 h-5 group-hover:animate-ping" />
            <span className="hidden sm:inline">EMERGENCY ({emergencyNumber})</span>
            <span className="sm:hidden">SOS</span>
          </a>
          <div className="w-10 h-10 ml-2 shrink-0 rounded-full bg-slate-200 border border-slate-300 shadow-sm overflow-hidden cursor-pointer hover:border-lime-500 transition-colors">
            <img src="https://ui-avatars.com/api/?name=User&background=0f172a&color=fff" alt="User" />
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className={`flex-1 flex justify-center transition-all duration-700 ease-in-out ${isScrolled ? 'p-0 pb-0' : 'p-2 sm:p-4 pb-28 pt-4 sm:pt-8'}`}>
        <main 
          className={`w-full bg-white/60 backdrop-blur-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] relative transition-all duration-700 ease-in-out origin-top ${
            isScrolled 
              ? 'max-w-full min-h-screen rounded-none border-none px-4 md:px-12 pt-24 md:pt-32 pb-12' 
              : 'max-w-7xl min-h-[80vh] border border-white rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 md:p-10'
          }`}
        >
          
          {/* Section 1: Clinical Insights (Ask AI) */}
          {activeTab === 'bmax' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-lime-500 mb-2 block">Smart Assistant</span>
                <h2 className="text-[clamp(1.875rem,5vw,2.25rem)] font-serif font-black text-slate-900 tracking-tight">Understand Your <span className="italic font-light">Test Results.</span></h2>
              </div>
              
              <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-4 flex flex-col border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-[550px] overflow-hidden relative">
                <div className="absolute inset-0 w-full h-full p-2">
                  <iframe
                    src="https://www.jotform.com/app/253583637449470"
                    title="B-Max AI Health Form"
                    className="w-full h-full border-0 rounded-[1.5rem]"
                    allow="accelerometer; autoplay; camera; clipboard-write; encrypted-media; gyroscope; microphone; payment"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: First Aid Guide */}
          {activeTab === 'firstaid' && (
            <div className="space-y-6 animate-fade-in relative h-full flex flex-col min-h-[500px]">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-lime-500 mb-2 block">Quick Help</span>
                <h2 className="text-[clamp(1.875rem,5vw,2.25rem)] font-serif font-black text-slate-900 tracking-tight">First Aid <span className="italic font-light">Guides.</span></h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-slate-900 mb-6">What to do in an emergency</h3>
                    <div className="space-y-4">
                      {firstAidList.map((tut, i) => (
                        <div key={tut.title} onClick={() => handleVideoClick(tut.url)} className="flex items-center justify-between p-4 sm:p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 cursor-pointer transition-colors border border-slate-100 group">
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <span className="text-sm font-bold text-lime-500 bg-lime-100 w-8 h-8 rounded-full flex items-center justify-center">{i+1}</span>
                            <span className="font-bold text-slate-700 text-lg">{tut.title}</span>
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-[2rem] flex flex-col overflow-hidden h-full min-h-[350px] relative shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <iframe 
                    src={mapUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    loading="lazy"
                    title="Nearest Hospitals"
                    allowFullScreen
                  />
                  

                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl p-1.5 rounded-full shadow-xl flex items-center border border-white/50 space-x-1">
                    <button
                      onClick={() => setMapMode('hospitals')}
                      className={`flex items-center space-x-2 px-4 py-1.5 md:px-5 md:py-2.5 rounded-full text-[11px] md:text-sm font-bold transition-all duration-300 ${mapMode === 'hospitals' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'}`}
                    >
                      <HeartPulse className={`w-4 h-4 md:w-5 md:h-5 ${mapMode === 'hospitals' ? 'text-red-400' : 'text-red-500'}`} />
                      <span>Hospitals</span>
                    </button>
                    <button
                      onClick={() => setMapMode('route')}
                      className={`flex items-center space-x-2 px-4 py-1.5 md:px-5 md:py-2.5 rounded-full text-[11px] md:text-sm font-bold transition-all duration-300 ${mapMode === 'route' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'}`}
                    >
                      <Navigation className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Guide Me</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Overlay */}
              {selectedVideoUrl && (
                <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-2xl flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-full max-w-4xl relative">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-serif font-bold text-white flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                        <span>Emergency Tutorial</span>
                      </h3>
                      <button onClick={() => setSelectedVideoUrl(null)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors text-white backdrop-blur-md">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-700 shadow-2xl ring-4 ring-black/50">
                      <iframe
                        src={selectedVideoUrl}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        sandbox="allow-scripts allow-same-origin allow-presentation"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 3: My Health */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase text-lime-500 mb-2 block">Your Body</span>
                  <h2 className="text-[clamp(1.875rem,5vw,2.25rem)] font-serif font-black text-slate-900 tracking-tight">My <span className="italic font-light">Health.</span></h2>
                </div>
                <button 
                  onClick={deviceConnected ? undefined : connectWatch}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold border transition-colors w-fit ${
                    deviceConnected 
                      ? "text-slate-900 bg-white border-slate-200" 
                      : "text-white bg-slate-900 hover:bg-slate-800 border-transparent cursor-pointer"
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${deviceConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                  <span>{isScanning ? 'Scanning...' : deviceConnected ? 'Watch Connected' : 'Connect Watch'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className={`backdrop-blur-xl p-6 rounded-3xl border shadow-sm transition-colors ${deviceConnected ? 'bg-red-50/50 border-red-100' : 'bg-white/80 border-slate-100'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-bold uppercase text-slate-500">Heart Rate</span>
                    <HeartPulse className={`w-5 h-5 ${deviceConnected ? 'text-red-500' : 'text-slate-900'}`} />
                  </div>
                  <div className="flex items-baseline space-x-2 mb-4">
                    <span className="text-[clamp(2.5rem,6vw,3.5rem)] font-serif font-black text-slate-900 tracking-tighter">{heartRate}</span>
                    <span className="text-slate-500 font-bold text-base">BPM</span>
                  </div>
                  <p className="text-slate-600 font-medium text-base">Your heart rate is perfectly normal.</p>
                </div>

                <div className={`backdrop-blur-xl p-6 rounded-3xl border shadow-sm transition-colors ${deviceConnected ? 'bg-blue-50/50 border-blue-100' : 'bg-white/80 border-slate-100'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-bold uppercase text-slate-500">Blood Oxygen</span>
                    <Activity className={`w-5 h-5 ${deviceConnected ? 'text-blue-500' : 'text-slate-900'}`} />
                  </div>
                  <div className="flex items-baseline space-x-2 mb-4">
                    <span className="text-[clamp(2.5rem,6vw,3.5rem)] font-serif font-black text-slate-900 tracking-tighter">{bloodOxygen}</span>
                    <span className="text-slate-500 font-bold text-base">%</span>
                  </div>
                  <p className="text-slate-600 font-medium text-base">Your oxygen levels are healthy.</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between text-slate-900 md:col-span-2 lg:col-span-1">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-slate-900 mb-2">Smart Suggestion</h3>
                    <p className="text-slate-600 text-base leading-relaxed">You haven't moved in a while. Would you like to do a quick 5-minute stretch?</p>
                  </div>
                  <button className="mt-8 w-full py-3 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2 text-base">
                    <span>Start Stretch</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Secure Health Records */}
          {activeTab === 'records' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase text-lime-500 mb-2 block">Safe & Private</span>
                  <h2 className="text-[clamp(1.875rem,5vw,2.25rem)] font-serif font-black text-slate-900 tracking-tight">My <span className="italic font-light">Records.</span></h2>
                </div>
                <button onClick={handleAddRecord} className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-4 rounded-full hover:bg-slate-800 transition-colors shadow-lg group">
                  <Plus className="w-5 h-5" />
                  <span className="font-bold text-lg">{isUploading ? 'Uploading...' : 'Add New Record'}</span>
                </button>
              </div>

              <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="hidden md:grid grid-cols-4 bg-white/50 px-8 py-6 border-b border-slate-200/50 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <div className="col-span-2">Document Name</div>
                  <div>Date</div>
                  <div>Security</div>
                </div>
                
                {records.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 font-medium">No records found. Click "Add New Record" to upload one.</div>
                ) : records.map((record, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-4 px-8 py-8 border-b border-slate-100 items-center hover:bg-slate-50 transition-colors cursor-pointer group gap-4 md:gap-0">
                    <div className="col-span-2 flex items-center space-x-6">
                      <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-500 transition-colors shrink-0">
                        <FileText className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block mb-1 text-xl">{record.title}</span>
                        <span className="text-sm text-slate-500">Tap to view document</span>
                      </div>
                    </div>
                    <div className="text-slate-500 font-medium md:pl-0 pl-20 text-lg">{record.date}</div>
                    <div className="md:pl-0 pl-20">
                      {record.is_secure ? (
                        <span className="inline-flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-800 rounded-full text-sm font-bold border border-green-200">
                          <Lock className="w-4 h-4 text-green-600" />
                          <span>Locked & Secure</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-bold border border-slate-200">
                          <span>Standard</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
      
      {/* Mobile Navigation Tabs (visible only on smaller screens) */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm transition-all duration-500">
        <div className="flex justify-between items-center bg-white/90 backdrop-blur-xl border border-white p-2 rounded-3xl shadow-[0_10px_30px_-10px_rgb(0,0,0,0.15)]">
          {[
            { id: 'firstaid', icon: AlertCircle, label: 'First Aid' },
            { id: 'bmax', icon: MessageSquare, label: 'Ask AI' },
            { id: 'records', icon: FileText, label: 'My Records' },
            { id: 'monitoring', icon: HeartPulse, label: 'My Health' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => switchTab(item.id)}
              className={`relative group flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-slate-900 text-white shadow-xl scale-105' 
                  : 'text-slate-500 hover:bg-white hover:text-slate-900'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-[8px] sm:text-[9px] font-bold">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
  );
}
