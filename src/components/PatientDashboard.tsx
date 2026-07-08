import { useState, useEffect } from 'react';
import { Shield, MessageSquare, AlertCircle, Activity, Droplets, Moon, FileText, Upload, Plus, HeartPulse, Lock, ArrowRight, X, MapPin, Navigation, User, Settings, LogOut, CreditCard } from 'lucide-react';
import InteractiveBackground from './InteractiveBackground';
import AnimatedLogo from './AnimatedLogo';

import BMaxChat from './BMaxChat';
import { db, storage } from '../lib/firebase';
import { collection, query, where, doc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useWeb3 } from '../hooks/useWeb3';
import { ethers } from 'ethers';

interface DashboardProps {
  user?: any;
  onLogout?: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('firstaid');
  const [isScrolled, setIsScrolled] = useState(false);
  const { account, connectWallet, getContract, isConnecting } = useWeb3();
  const [isRegisteringDID, setIsRegisteringDID] = useState(false);

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
  const [accessRequests, setAccessRequests] = useState<any[]>([]);
  
  useEffect(() => {
    if (!user?.email) return;
    
    // Realtime listener for records
    const recordsQ = query(collection(db, 'records'), where('patientEmail', '==', user.email));
    const unsubRecords = onSnapshot(recordsQ, (snapshot) => {
      const recs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecords(recs);
    });

    // Realtime listener for access requests
    const reqQ = query(collection(db, 'access_requests'), where('patientEmail', '==', user.email));
    const unsubReqs = onSnapshot(reqQ, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAccessRequests(reqs);
    });

    return () => {
      unsubRecords();
      unsubReqs();
    };
  }, [user]);

  const resolveAccessRequest = async (request: any, action: 'approve' | 'deny') => {
    if (!account) {
      alert("Please connect your Web3 wallet first to interact with the blockchain.");
      return;
    }
    
    try {
      // 1. On-chain resolution
      const accessContract = await getContract('AccessRequest');
      let tx;
      if (action === 'approve') {
         // Approve for 30 days (mock)
         const duration = 30 * 24 * 60 * 60;
         tx = await accessContract.approveAccess(request.onChainReqId || 1, duration);
      } else {
         tx = await accessContract.denyAccess(request.onChainReqId || 1);
      }
      await tx.wait();

      // 2. Off-chain state update
      const reqRef = doc(db, 'access_requests', request.id);
      await updateDoc(reqRef, {
        status: action === 'approve' ? 'approved' : 'rejected'
      });
      alert(`Request ${action}d securely on-chain!`);
    } catch (err: any) {
      alert('Error resolving request: ' + (err.message || err));
    }
  };

  const handleAddRecord = () => {
    if (!account) {
      alert("Please connect your Web3 wallet first to interact with the blockchain.");
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && user?.email) {
        setIsUploading(true);
        try {
          // 1. Upload to Firebase Storage
          const storageRef = ref(storage, `records/${user.email}/${Date.now()}_${file.name}`);
          const uploadTask = await uploadBytesResumable(storageRef, file);
          const downloadURL = await getDownloadURL(uploadTask.ref);
          
          // 2. Generate Hash (mock simple hash for demo, or real SHA256 of file)
          const fileHash = ethers.keccak256(ethers.toUtf8Bytes(file.name + Date.now().toString()));

          // 3. Save to Blockchain (HealthRecord.sol)
          const healthRecordContract = await getContract('HealthRecord');
          const tx = await healthRecordContract.addRecord(
             account, // patient address
             fileHash, // IPFS CID or generic hash
             'firebase-storage', // storage location
             ethers.keccak256(ethers.toUtf8Bytes("decryption_key_mock"))
          );
          
          // 4. Save metadata to Firestore
          const newDocRef = doc(collection(db, 'records'));
          const recordData = {
            patientEmail: user.email,
            type: 'other',
            title: file.name,
            description: 'Uploaded via Dashboard',
            date: new Date().toISOString().split("T")[0],
            url: downloadURL,
            blockchainHash: fileHash,
            is_secure: true,
            createdAt: serverTimestamp()
          };
          
          await Promise.all([
             tx.wait(),
             setDoc(newDocRef, recordData)
          ]);
          alert('Record securely added to the blockchain and Firebase!');
        } catch (err: any) {
          alert('Upload failed: ' + (err.message || err));
        } finally {
          setIsUploading(false);
        }
      }
    };
    input.click();
  };

  const registerDID = async () => {
    if (!account) return;
    setIsRegisteringDID(true);
    try {
      const rolesContract = await getContract('HealthChainRoles');
      const did = `did:healthchain:patient:${account}`;
      const mockCommitment = ethers.keccak256(ethers.toUtf8Bytes("mock_biometric"));
      const tx = await rolesContract.registerPatient(did, mockCommitment);
      await tx.wait();
      
      // Update firebase user with wallet address
      await updateDoc(doc(db, 'users', user.id), {
         walletAddress: account,
         did: did
      });
      alert('Successfully registered Decentralized Identity on-chain!');
    } catch(err: any) {
      if (err.message?.includes('already registered') || JSON.stringify(err).includes('already registered')) {
        alert('You are already registered on the blockchain! Syncing your profile...');
        // Sync firebase if they were already registered on-chain
        await updateDoc(doc(db, 'users', user.id), {
           walletAddress: account,
           did: `did:healthchain:patient:${account}`
        }).catch(() => {});
      } else {
        alert("Registration failed: " + (err.message || err));
      }
    } finally {
      setIsRegisteringDID(false);
    }
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
        <div className="flex items-center space-x-6 cursor-pointer hover:opacity-80 transition-opacity" onClick={onLogout}>
          <AnimatedLogo />
          <div className="hidden sm:block h-6 w-[1px] bg-slate-200"></div>
          <p className="hidden sm:block text-[10px] uppercase tracking-widest text-slate-500 font-bold">Log out</p>
        </div>

        {/* Top Navigation Tabs */}
        <div className="hidden lg:flex items-center space-x-2 bg-white/50 backdrop-blur-md p-1.5 rounded-full border border-white shadow-sm">
          {[
            { id: 'firstaid', icon: AlertCircle, label: 'First Aid' },
            { id: 'bmax', icon: MessageSquare, label: 'Ask AI' },
            { id: 'records', icon: FileText, label: 'My Records' },
            { id: 'monitoring', icon: HeartPulse, label: 'My Health' },
            { id: 'access', icon: Shield, label: 'Access Control' },
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
          <div className="flex items-center space-x-2 mr-2 text-xs font-bold tracking-widest text-slate-500 uppercase hidden sm:flex">
            <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></div>
            <span>System Active</span>
          </div>

          {!account ? (
             <button onClick={connectWallet} disabled={isConnecting} className="hidden sm:flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-md hover:bg-indigo-700 transition-colors">
               <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
             </button>
          ) : (
             <div className="hidden sm:flex items-center space-x-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full font-bold text-sm border border-slate-200">
               <span className="w-2 h-2 rounded-full bg-green-500"></span>
               <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
             </div>
          )}

          <a href={`tel:${emergencyNumber}`} className="flex items-center space-x-2 bg-red-600 text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full font-bold text-sm sm:text-base shadow-md hover:bg-red-700 transition-colors cursor-pointer group">
            <AlertCircle className="w-5 h-5 group-hover:animate-ping" />
            <span className="hidden sm:inline">EMERGENCY ({emergencyNumber})</span>
            <span className="sm:hidden">SOS</span>
          </a>
          <div onClick={() => switchTab('profile')} className="flex items-center space-x-3 ml-2 bg-white border border-slate-200 p-1 pr-4 rounded-full shadow-sm hover:border-lime-500 hover:shadow-md transition-all cursor-pointer group">
            <div className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-[#0f172a] group-hover:bg-lime-500 transition-colors flex items-center justify-center text-white font-bold text-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'J'}
            </div>
            <span className="text-[15px] font-bold text-slate-700 hidden sm:block tracking-tight">{user?.name ? user.name.split(' ')[0].toLowerCase() : 'jyg'}</span>
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
            <div className="space-y-6 animate-fade-in flex flex-col h-[650px]">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-lime-500 mb-2 block">Smart Assistant</span>
                <h2 className="text-[clamp(1.875rem,5vw,2.25rem)] font-serif font-black text-slate-900 tracking-tight">Understand Your <span className="italic font-light">Health.</span></h2>
              </div>
              <div className="flex-1 w-full">
                <BMaxChat />
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
                  <div 
                    key={i} 
                    onClick={() => {
                      if (record.url) {
                        window.open(record.url, '_blank');
                      } else {
                        alert('This is a secure demo record. Please upload a real document to view it.');
                      }
                    }}
                    className="grid grid-cols-1 md:grid-cols-4 px-8 py-8 border-b border-slate-100 items-center hover:bg-slate-50 transition-colors cursor-pointer group gap-4 md:gap-0"
                  >
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

          {/* Section 5: Profile (Light/Glassmorphism theme matching app) */}
          {activeTab === 'profile' && (
            // ... profile logic (keeping it the same) ...
            <div className="bg-white/60 backdrop-blur-3xl min-h-[600px] w-full rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 text-slate-900 border border-white shadow-[0_8px_40px_rgb(0,0,0,0.06)] relative overflow-hidden">
              {/* Profile content omitted for brevity, keeping exact same structure */}
              <div className="relative z-10 mb-8">
                <h2 className="text-2xl font-bold tracking-tight mb-1 font-serif">User Dashboard</h2>
                <p className="text-slate-500 text-sm">Manage your account, view analytics, and update your subscription.</p>
              </div>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Profile Card */}
                <div className="bg-white/80 border border-slate-100 shadow-sm rounded-3xl p-8 flex flex-col items-center justify-between min-h-[400px]">
                  <div className="flex flex-col items-center mt-4 w-full">
                    <div className="w-28 h-28 rounded-full bg-[#0ea5e9] flex items-center justify-center text-white text-5xl font-medium mb-6 shadow-[0_8px_30px_rgba(14,165,233,0.3)] ring-4 ring-white">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'J'}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{user?.name || 'Jay Magar'}</h3>
                    <div className="bg-slate-100 px-4 py-1.5 rounded-full text-slate-600 font-medium text-sm border border-slate-200 mb-4">
                      {user?.email || 'jaymagar067@gmail.com'}
                    </div>

                    {account && !user?.did && (
                      <button onClick={registerDID} disabled={isRegisteringDID} className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 py-2 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors mb-4">
                        {isRegisteringDID ? 'Registering on-chain...' : 'Register Web3 DID'}
                      </button>
                    )}
                    
                    {user?.did && (
                      <div className="w-full bg-green-50 text-green-700 border border-green-200 py-2 rounded-xl text-xs font-bold text-center mb-4 truncate px-2">
                        {user.did}
                      </div>
                    )}
                  </div>

                  <div className="w-full space-y-3 mt-8">
                    <button className="w-full flex items-center justify-center space-x-2 bg-white border border-slate-200 hover:border-lime-500 hover:text-lime-600 transition-colors py-3 rounded-xl text-sm font-bold shadow-sm">
                      <Settings className="w-4 h-4" />
                      <span>Account Settings</span>
                    </button>
                    <button onClick={onLogout} className="w-full flex items-center justify-center space-x-2 bg-white border border-slate-200 hover:border-red-500 hover:text-red-600 transition-colors py-3 rounded-xl text-sm font-bold shadow-sm">
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Analytics & Subscription */}
                <div className="lg:col-span-2 space-y-6 flex flex-col">
                  
                  {/* Usage Analytics */}
                  <div className="bg-white/80 border border-slate-100 shadow-sm rounded-3xl p-6 sm:p-8 flex-1">
                    <div className="flex items-center space-x-2 mb-6">
                      <Activity className="w-5 h-5 text-lime-500" />
                      <h3 className="font-bold text-slate-900">Usage Analytics</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:border-lime-500 transition-colors cursor-default">
                        <p className="text-slate-500 text-xs font-bold tracking-wider uppercase mb-2">Health Records</p>
                        <p className="text-4xl font-black text-slate-900 tracking-tight">{records.length}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:border-lime-500 transition-colors cursor-default">
                        <p className="text-slate-500 text-xs font-bold tracking-wider uppercase mb-2">AI Consults</p>
                        <p className="text-4xl font-black text-slate-900 tracking-tight">0</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:border-lime-500 transition-colors cursor-default">
                        <p className="text-slate-500 text-xs font-bold tracking-wider uppercase mb-2">IoT Syncs</p>
                        <p className="text-4xl font-black text-slate-900 tracking-tight">0</p>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Plan */}
                  <div className="bg-white/80 border border-slate-100 shadow-sm rounded-3xl p-6 sm:p-8 shrink-0">
                    <div className="flex items-center space-x-2 mb-6">
                      <CreditCard className="w-5 h-5 text-lime-500" />
                      <h3 className="font-bold text-slate-900">Subscription Plan</h3>
                    </div>
                    
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-lime-500 transition-colors">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-bold text-lg text-slate-900">HealthChain Free</h4>
                          <span className="px-3 py-1 bg-lime-100 text-lime-700 text-xs font-bold uppercase tracking-widest rounded-full">Active</span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Next billing date: N/A</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-slate-900 mb-1"><span className="text-3xl font-black">$0</span><span className="text-slate-500 font-medium">/mo</span></div>
                        <button className="text-lime-600 font-bold text-sm hover:underline">Manage Billing</button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Section 6: Access Control */}
          {activeTab === 'access' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase text-lime-500 mb-2 block">Your Security</span>
                  <h2 className="text-[clamp(1.875rem,5vw,2.25rem)] font-serif font-black text-slate-900 tracking-tight">Access <span className="italic font-light">Control.</span></h2>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
                <p className="text-slate-500 mb-6">Manage which healthcare providers have access to your encrypted medical records.</p>
                {accessRequests.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                    <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No pending access requests.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {accessRequests.map((req: any) => (
                      <div key={req.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-900">Dr. {req.doctorName}</p>
                          <p className="text-sm text-slate-500">Reason: {req.reason}</p>
                          <p className="text-xs text-slate-400 mt-1">Status: {req.status}</p>
                        </div>
                        {req.status === 'pending' && (
                          <div className="mt-4 sm:mt-0 flex space-x-2">
                            <button onClick={() => resolveAccessRequest(req, 'approve')} className="px-4 py-2 bg-lime-500 text-white text-sm font-bold rounded-xl hover:bg-lime-600 transition-colors">Approve</button>
                            <button onClick={() => resolveAccessRequest(req, 'deny')} className="px-4 py-2 border border-red-500 text-red-500 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors">Deny</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
            { id: 'access', icon: Shield, label: 'Access' },
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
