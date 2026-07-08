import { Users, FileText, Activity, Shield, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { useWeb3 } from '../hooks/useWeb3';

interface DoctorDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function DoctorDashboard({ user, onLogout }: DoctorDashboardProps) {
  const [activeTab, setActiveTab] = useState('patients');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { account, connectWallet, getContract, isConnecting } = useWeb3();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientRecords, setPatientRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, [user]);

  const fetchPatients = async () => {
    try {
      const q = query(
        collection(db, 'access_requests'), 
        where('doctorEmail', '==', user.email),
        where('status', '==', 'approved')
      );
      const snapshot = await getDocs(q);
      const approvedPatients = snapshot.docs.map(doc => ({
         id: doc.id,
         name: doc.data().patientEmail, // Display email as name for simplicity, or fetch full user profile
         email: doc.data().patientEmail
      }));
      setPatients(approvedPatients as any);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      alert("Please connect your Web3 wallet first.");
      return;
    }

    const targetEmail = (e.target as any).patientEmail.value;
    const targetWallet = (e.target as any).patientWallet.value; // Assuming we add a wallet input for demo
    
    if (!targetWallet) {
        alert("Patient wallet address is required for on-chain request");
        return;
    }

    try {
      // 1. On-chain request
      const accessContract = await getContract('AccessRequest');
      const tx = await accessContract.requestAccess(targetWallet, 'Consultation');
      await tx.wait(); // Wait for confirmation
      // NOTE: For a real app, we'd capture the event to get the reqId.
      // We'll mock reqId 1 for the demo integration.
      const mockReqId = 1; 

      // 2. Off-chain (Firebase) request tracking
      await addDoc(collection(db, 'access_requests'), {
        onChainReqId: mockReqId,
        doctorEmail: user.email,
        doctorName: user.name,
        doctorWallet: account,
        patientEmail: targetEmail,
        patientWallet: targetWallet,
        reason: 'Consultation',
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert('Access request sent on-chain and off-chain!');
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      alert('Error sending request: ' + (err.message || err));
    }
  };

  const viewRecords = async (patientEmail: string) => {
    setLoadingRecords(true);
    setSelectedPatient(patientEmail);
    try {
      const q = query(collection(db, 'records'), where('patientEmail', '==', patientEmail));
      const snapshot = await getDocs(q);
      const recs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPatientRecords(recs);
    } catch (err) {
      alert('Failed to load records');
    } finally {
      setLoadingRecords(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-lime-200">
      <nav className="fixed top-0 w-full z-50 px-4 py-4 lg:px-8 flex justify-between items-center bg-white/80 backdrop-blur-xl border-b border-white shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-lime-400" />
          </div>
          <span className="text-xl font-bold font-serif text-slate-900 tracking-tight">HealthChain<span className="text-lime-500">.</span><span className="text-sm text-slate-500 font-sans ml-2">Doctor Portal</span></span>
        </div>
        
        <div className="flex items-center space-x-4">
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
          <button onClick={onLogout} className="text-slate-500 hover:text-red-500 font-bold text-sm flex items-center transition-colors">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>
      </nav>

      <div className="pt-24 px-4 sm:px-8 max-w-6xl mx-auto pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome, Dr. {user.name}</h1>
          <p className="text-slate-500">Manage your patients and request access to health records.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold mb-4 flex items-center"><Users className="w-5 h-5 mr-2 text-lime-500"/> My Patients (Approved Access)</h2>
              {loading ? (
                <p>Loading...</p>
              ) : patients.length === 0 ? (
                <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                  No patients found. Request access to see records.
                </div>
              ) : (
                <div className="space-y-4">
                  {patients.map((p: any) => (
                    <div key={p.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-sm text-slate-500">{p.email}</p>
                      </div>
                      <button onClick={() => viewRecords(p.email)} className="text-lime-600 font-bold text-sm hover:underline">View Records</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold mb-4">Request Record Access</h2>
              <form onSubmit={handleRequestAccess} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Patient Email</label>
                  <input name="patientEmail" type="email" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-lime-500" placeholder="patient@example.com" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Patient Wallet (0x...)</label>
                  <input name="patientWallet" type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-lime-500" placeholder="0x123..." />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white rounded-xl py-3 font-bold hover:bg-slate-800 transition-colors">
                  Send Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Records Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Patient Records</h2>
                <p className="text-sm text-slate-500">{selectedPatient}</p>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <XCircle className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
              {loadingRecords ? (
                <div className="text-center text-slate-500 py-8 font-medium">Loading secure records...</div>
              ) : patientRecords.length === 0 ? (
                <div className="text-center text-slate-400 py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                  No records found for this patient.
                </div>
              ) : (
                <div className="space-y-4">
                  {patientRecords.map((record, i) => (
                    <div 
                      key={i} 
                      onClick={() => record.url && window.open(record.url, '_blank')}
                      className="flex items-center space-x-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-lime-300 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{record.title}</p>
                        <p className="text-xs text-slate-500 truncate">{record.date} • {record.is_secure ? 'Encrypted' : 'Standard'}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">View</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
