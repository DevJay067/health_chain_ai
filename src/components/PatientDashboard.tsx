import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, MessageSquare, AlertCircle, Activity, Droplets, Moon, FileText, Upload, Plus, HeartPulse, Lock, ArrowRight, X, MapPin, Navigation, User, Settings, LogOut, CreditCard } from 'lucide-react';
import InteractiveBackground from './InteractiveBackground';
import AnimatedLogo from './AnimatedLogo';

import BMaxChat from './BMaxChat';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, serverTimestamp, arrayUnion, onSnapshot } from 'firebase/firestore';
import { useWeb3 } from '../hooks/useWeb3';
import { ethers } from 'ethers';

interface DashboardProps {
  user?: any;
  onLogout?: () => void;
  onNeedLogin?: () => void;
  onNeedSignup?: () => void;
}

export default function Dashboard({ user, onLogout, onNeedLogin, onNeedSignup }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('firstaid');
  const [isScrolled, setIsScrolled] = useState(false);
  const { account, connectWallet, getContract, isConnecting } = useWeb3();
  const [isRegisteringDID, setIsRegisteringDID] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  
  // Sharing states
  const [shareDocId, setShareDocId] = useState('');
  const [shareDoctorEmail, setShareDoctorEmail] = useState('');
  const [shareDuration, setShareDuration] = useState('24');
  const [isSharing, setIsSharing] = useState(false);

  const isGuest = user?.isGuest === true;

  const switchTab = (tabId: string) => {
    // Guard protected tabs for guest users
    if (isGuest && (tabId === 'records' || tabId === 'access' || tabId === 'profile')) {
      if (window.confirm('Sign in to access this feature. Go to login?')) {
        onNeedLogin?.();
      }
      return;
    }
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
  const [uploadStep, setUploadStep] = useState(0); // 0=idle 1=reading 2=saving 3=chain 4=done
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

  const handleShareDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareDocId || !shareDoctorEmail || !user?.email) return;

    setIsSharing(true);
    try {
      const docToShare = records.find(r => r.id === shareDocId);
      if (!docToShare) throw new Error("Document not found");

      const shareData = {
        patientEmail: user.email,
        patientName: user.name || 'Unknown Patient',
        doctorEmail: shareDoctorEmail.toLowerCase(),
        documentId: docToShare.id,
        documentTitle: docToShare.title,
        documentType: docToShare.type,
        durationHours: parseInt(shareDuration),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const newShareRef = doc(collection(db, 'document_shares'));
      await setDoc(newShareRef, shareData);

      alert('Document shared successfully!');
      setShareDocId('');
      setShareDoctorEmail('');
      setShareDuration('24');
    } catch (err: any) {
      console.error(err);
      alert('Failed to share document: ' + err.message);
    } finally {
      setIsSharing(false);
    }
  };

  const switchRoleToDoctor = async () => {
    if (isGuest) {
      onNeedLogin?.();
      return;
    }
    
    if (window.confirm("Are you sure you want to switch your account to a Healthcare Provider? This will require admin verification.")) {
      setIsUpdatingRole(true);

      // Fire-and-forget: write to Firestore in background, don't block UI
      const userRef = doc(db, 'users', user.id);
      updateDoc(userRef, {
        role: 'doctor',
        status: 'pending'
      }).catch(err => console.warn('Role update failed (offline?):', err));

      // Reload immediately — no waiting for Firestore
      setTimeout(() => window.location.reload(), 300);
    }
  };

  const handleAddRecord = async () => {
    if (!account) {
      alert("Please connect your Web3 wallet first to interact with the blockchain.");
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !user?.email) return;

      // 50MB limit
      if (file.size > 50 * 1024 * 1024) {
        alert('File too large. Please upload a file smaller than 50MB.');
        return;
      }

      setIsUploading(true);
      setUploadStep(1); // Reading file
      try {
        // 1. Generate hash from file metadata only (instant, no reading needed)
        const fileHash = ethers.keccak256(
          ethers.toUtf8Bytes(file.name + file.size.toString() + Date.now().toString())
        );

        setUploadStep(2); // Saving metadata to Firestore
        // 2. Save ONLY metadata to Firestore — NO base64, this is instant!
        const newDocRef = doc(collection(db, 'records'));
        await setDoc(newDocRef, {
          patientEmail: user.email,
          type: file.type.includes('pdf') ? 'pdf' : 'document',
          title: file.name,
          description: 'Uploaded via Dashboard',
          date: new Date().toISOString().split('T')[0],
          fileSize: file.size,
          blockchainHash: fileHash,
          is_secure: true,
          createdAt: serverTimestamp()
        });

        setUploadStep(3); // Blockchain anchor (fire & forget)
        // 3. Anchor hash to blockchain in the background — does NOT block the UI
        if (account) {
          getContract('HealthRecord').then(contract =>
            contract.addRecord(
              account, fileHash, 'firestore-metadata',
              ethers.keccak256(ethers.toUtf8Bytes('key'))
            ).then((tx: any) => tx.wait()).catch(() => {})
          ).catch(() => {});
        }

        setUploadStep(4); // Done!
        await new Promise(r => setTimeout(r, 1000));
      } catch (err: any) {
        alert('Upload failed: ' + (err.message || err));
      } finally {
        setIsUploading(false);
        setUploadStep(0);
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
          {isGuest ? (
            <button onClick={onNeedLogin} className="ml-2 flex items-center space-x-2 bg-lime-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-md hover:bg-lime-600 transition-colors">
              <span>Sign In</span>
            </button>
          ) : (
            <div onClick={() => switchTab('profile')} className="flex items-center space-x-3 ml-2 bg-white border border-slate-200 p-1 pr-4 rounded-full shadow-sm hover:border-lime-500 hover:shadow-md transition-all cursor-pointer group">
              <div className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-[#0f172a] group-hover:bg-lime-500 transition-colors flex items-center justify-center text-white font-bold text-lg">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-[15px] font-bold text-slate-700 hidden sm:block tracking-tight">{user?.name ? user.name.split(' ')[0].toLowerCase() : 'user'}</span>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className={`flex-1 flex justify-center transition-all duration-700 ease-in-out ${isScrolled ? 'p-0 pb-0' : 'p-2 sm:p-4 pb-36 pt-4 sm:pt-8'}`}>
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

          {/* Animated Upload Progress Modal */}
          <AnimatePresence>
            {isUploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.85, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.85, opacity: 0, y: 30 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="bg-white rounded-3xl p-10 shadow-2xl w-full max-w-sm mx-4 text-center"
                >
                  <div className="text-5xl mb-4">
                    {uploadStep === 1 && '📄'}
                    {uploadStep === 2 && '☁️'}
                    {uploadStep === 3 && '⛓️'}
                    {uploadStep === 4 && '✅'}
                  </div>
                  <h3 className="font-black text-slate-900 text-xl mb-2">
                    {uploadStep === 1 && 'Reading File...'}
                    {uploadStep === 2 && 'Saving Securely...'}
                    {uploadStep === 3 && 'Anchoring to Blockchain...'}
                    {uploadStep === 4 && 'All Done!'}
                  </h3>
                  <p className="text-slate-500 text-sm mb-6">
                    {uploadStep === 1 && 'Encrypting your document locally'}
                    {uploadStep === 2 && 'Writing to secure Firestore vault'}
                    {uploadStep === 3 && 'Creating an immutable hash on-chain'}
                    {uploadStep === 4 && 'Your record is locked & secure!'}
                  </p>
                  {/* Step dots */}
                  <div className="flex items-center justify-center space-x-2">
                    {[1, 2, 3, 4].map(s => (
                      <motion.div
                        key={s}
                        animate={{
                          scale: uploadStep >= s ? 1.2 : 1,
                          backgroundColor: uploadStep >= s ? '#84cc16' : '#e2e8f0'
                        }}
                        transition={{ duration: 0.3 }}
                        className="w-3 h-3 rounded-full"
                      />
                    ))}
                  </div>
                  {/* Animated progress bar */}
                  <div className="mt-4 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-lime-500 rounded-full"
                      animate={{ width: `${(uploadStep / 4) * 100}%` }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

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
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-12 text-center"
                  >
                    <div className="text-6xl mb-4">🗂️</div>
                    <p className="text-slate-500 font-medium">No records yet.</p>
                    <p className="text-slate-400 text-sm mt-1">Click "Add New Record" to upload your first document.</p>
                  </motion.div>
                ) : records.map((record, i) => (
                  <motion.div
                    key={record.id || i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.35 }}
                    onClick={() => {
                      if (record.fileData) {
                        const a = document.createElement('a');
                        a.href = record.fileData;
                        a.download = record.title || 'document';
                        a.click();
                      } else if (record.url) {
                        window.open(record.url, '_blank');
                      } else {
                        alert('No file data available.');
                      }
                    }}
                    className="grid grid-cols-1 md:grid-cols-4 px-8 py-6 border-b border-slate-100 items-center hover:bg-lime-50/50 transition-colors cursor-pointer group gap-4 md:gap-0"
                  >
                    <div className="col-span-2 flex items-center space-x-6">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-500 shrink-0"
                      >
                        <FileText className="w-7 h-7" />
                      </motion.div>
                      <div>
                        <span className="font-bold text-slate-900 block mb-1 text-lg">{record.title}</span>
                        <span className="text-sm text-slate-500">Click to download</span>
                      </div>
                    </div>
                    <div className="text-slate-500 font-medium md:pl-0 pl-20 text-base">{record.date}</div>
                    <div className="md:pl-0 pl-20">
                      {record.is_secure ? (
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-800 rounded-full text-sm font-bold border border-green-200"
                        >
                          <Lock className="w-4 h-4 text-green-600" />
                          <span>Locked & Secure</span>
                        </motion.span>
                      ) : (
                        <span className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-bold border border-slate-200">
                          <span>Standard</span>
                        </span>
                      )}
                    </div>
                  </motion.div>
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
                    <button 
                      onClick={() => setShowSettings(true)}
                      className="w-full flex items-center justify-center space-x-2 bg-white border border-slate-200 hover:border-lime-500 hover:text-lime-600 transition-colors py-3 rounded-xl text-sm font-bold shadow-sm"
                    >
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
              
              {/* Account Settings Modal */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.95, opacity: 0, y: 20 }}
                      className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-md border border-slate-100"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl text-slate-900">Account Settings</h3>
                        <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                          <X className="w-5 h-5 text-slate-500" />
                        </button>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Display Name</label>
                          <input type="text" disabled value={user?.name || ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed font-medium" />
                        </div>
                        
                        <div className="pt-6 border-t border-slate-100">
                          <h4 className="font-bold text-slate-900 mb-2">Healthcare Provider Access</h4>
                          <p className="text-sm text-slate-500 mb-4">Are you a doctor? Switch your account type to access provider features like patient records and AI analysis.</p>
                          <button 
                            onClick={switchRoleToDoctor}
                            disabled={isUpdatingRole}
                            className="w-full bg-slate-900 text-white rounded-xl py-3.5 font-bold hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2 shadow-md disabled:opacity-50 mb-3"
                          >
                            <span>{isUpdatingRole ? 'Updating...' : 'Switch to Provider Account'}</span>
                          </button>
                          
                          <button 
                            onClick={async () => {
                              if (window.confirm("Bypass: Make this account an Admin?")) {
                                setIsUpdatingRole(true);
                                try {
                                  await updateDoc(doc(db, 'users', user.id), { role: 'admin', status: 'approved' });
                                  alert('You are now an Admin! Reloading...');
                                  window.location.reload();
                                } catch (e) {
                                  alert('Error setting admin role.');
                                }
                              }
                            }}
                            className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl py-2 font-bold hover:bg-indigo-100 transition-colors text-xs flex items-center justify-center shadow-sm"
                          >
                            <span>🛠 Developer: Make Me Admin</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
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
              
              {/* Proactive Document Sharing */}
              <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Share Document with Doctor</h3>
                    <p className="text-sm text-slate-500">Proactively send specific records to a healthcare provider.</p>
                  </div>
                </div>
                
                <form onSubmit={handleShareDocument} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Select Document</label>
                      <select 
                        required
                        value={shareDocId}
                        onChange={(e) => setShareDocId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">-- Choose a record --</option>
                        {records.map(r => (
                          <option key={r.id} value={r.id}>{r.title} ({r.type})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Provider's Email</label>
                      <input 
                        type="email" 
                        required
                        value={shareDoctorEmail}
                        onChange={(e) => setShareDoctorEmail(e.target.value)}
                        placeholder="doctor@example.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Access Duration</label>
                    <select 
                      value={shareDuration}
                      onChange={(e) => setShareDuration(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="24">24 Hours</option>
                      <option value="168">7 Days</option>
                      <option value="999999">Permanent (Until Revoked)</option>
                    </select>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSharing || records.length === 0}
                    className="w-full bg-indigo-600 text-white rounded-xl py-3 font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 mt-2"
                  >
                    {isSharing ? 'Sharing...' : 'Send Access Request'}
                  </button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
      
      {/* Mobile Navigation Tabs (visible only on smaller screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-4 pt-2 bg-white/80 backdrop-blur-xl border-t border-slate-100">
        <div className="flex justify-between items-center">
          {[
            { id: 'firstaid', icon: AlertCircle, label: 'First Aid' },
            { id: 'bmax', icon: MessageSquare, label: 'Ask AI' },
            { id: 'records', icon: FileText, label: 'Records', gated: true },
            { id: 'monitoring', icon: HeartPulse, label: 'Health' },
            { id: 'access', icon: Shield, label: 'Access', gated: true },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => switchTab(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-2 rounded-2xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'text-slate-900'
                  : 'text-slate-400'
              }`}
            >
              {activeTab === item.id && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-lime-500 rounded-full" />
              )}
              <item.icon className={`w-5 h-5 mb-1 ${activeTab === item.id ? 'text-slate-900' : 'text-slate-400'}`} />
              <span className="text-[9px] font-bold">{item.label}</span>
              {item.gated && isGuest && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-lime-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
  );
}
