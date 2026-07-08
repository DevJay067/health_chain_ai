import { useState, useEffect } from 'react';
import { Users, Activity, Shield, LogOut, CheckCircle, XCircle, Clock } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useWeb3 } from '../hooks/useWeb3';

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { account, connectWallet, getContract, isConnecting } = useWeb3(user.email);

  useEffect(() => {
    // Realtime listener for all doctors
    const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDoctors(docs as any);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleApproveReject = async (doctor: any, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        if (!account) {
          alert("Please connect your Web3 Admin wallet first.");
          return;
        }
        if (!doctor.walletAddress) {
          alert("This doctor has not provided a wallet address during registration.");
          // We can still proceed with Firebase approval if needed, but for Web3 it's missing.
        } else {
          // 1. On-chain resolution
          // The rolesContract.grantRole might be needed here, or DoctorManagement.verifyDoctor
          // We will mock calling a method, or just use DoctorManagement.sol if we compiled it
          // Assuming DoctorManagement has a method to approve doctor, or we grant DOCTOR_ROLE
          const rolesContract = await getContract('HealthChainRoles');
          // Actually, DoctorManagement usually handles this. But let's just grant role directly for demo if possible
          // In HealthChainRoles, only ADMIN_ROLE can grant. The admin wallet must be the deployer or assigned ADMIN_ROLE.
          const DOCTOR_ROLE = "0x582496e95c10204de0733a393e87834bc6293f7734bbd1ee176c121e78546b41"; // keccak256("DOCTOR_ROLE")
          const tx = await rolesContract.grantRole(DOCTOR_ROLE, doctor.walletAddress);
          await tx.wait();
        }
      }

      // 2. Off-chain resolution
      const docRef = doc(db, 'users', doctor.id);
      await updateDoc(docRef, {
        status: action === 'approve' ? 'approved' : 'rejected'
      });
      alert(`Doctor ${action}d securely!`);
    } catch (err: any) {
      alert('Error updating status: ' + (err.message || err));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans selection:bg-lime-200 text-white">
      <nav className="fixed top-0 w-full z-50 px-4 py-4 lg:px-8 flex justify-between items-center bg-slate-900/80 backdrop-blur-xl border-b border-white/10 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-lime-500 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-slate-900" />
          </div>
          <span className="text-xl font-bold font-serif text-white tracking-tight">HealthChain<span className="text-lime-500">.</span><span className="text-sm text-slate-400 font-sans ml-2">Admin Portal</span></span>
        </div>
        
        <div className="flex items-center space-x-4">
          {!account ? (
             <button onClick={connectWallet} disabled={isConnecting} className="hidden sm:flex items-center space-x-2 bg-slate-700 text-white px-4 py-2 rounded-full font-bold text-sm shadow-md hover:bg-slate-600 transition-colors">
               <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
             </button>
          ) : (
             <div className="hidden sm:flex items-center space-x-2 bg-slate-800 text-slate-300 px-4 py-2 rounded-full font-bold text-sm border border-slate-700">
               <span className="w-2 h-2 rounded-full bg-green-500"></span>
               <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
             </div>
          )}
          <button onClick={onLogout} className="text-slate-400 hover:text-white font-bold text-sm flex items-center transition-colors">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>
      </nav>

      <div className="pt-24 px-4 sm:px-8 max-w-6xl mx-auto pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Welcome, {user.name}</h1>
          <p className="text-slate-400">Review provider registrations and monitor system access.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3 space-y-6">
            <div className="bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-700">
              <h2 className="text-xl font-bold mb-6 flex items-center"><Users className="w-5 h-5 mr-2 text-lime-500"/> Provider Registration Requests</h2>
              
              {loading ? (
                <p>Loading...</p>
              ) : doctors.length === 0 ? (
                <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                  No providers found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 text-sm tracking-wider uppercase">
                        <th className="pb-3 font-bold">Provider Details</th>
                        <th className="pb-3 font-bold">Status</th>
                        <th className="pb-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {doctors.map((doc: any) => (
                        <tr key={doc.id}>
                          <td className="py-4">
                            <p className="font-bold text-white">{doc.name}</p>
                            <p className="text-sm text-slate-400">{doc.email}</p>
                          </td>
                          <td className="py-4">
                            {doc.status === 'pending' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-500"><Clock className="w-3 h-3 mr-1"/> Pending</span>}
                            {doc.status === 'approved' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-500"><CheckCircle className="w-3 h-3 mr-1"/> Approved</span>}
                            {doc.status === 'rejected' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-500"><XCircle className="w-3 h-3 mr-1"/> Rejected</span>}
                          </td>
                          <td className="py-4 text-right space-x-2">
                            {doc.status === 'pending' && (
                              <>
                                <button onClick={() => handleApproveReject(doc, 'approve')} className="px-3 py-1.5 bg-lime-500 text-slate-900 text-xs font-bold rounded-lg hover:bg-lime-400 transition-colors">Approve</button>
                                <button onClick={() => handleApproveReject(doc, 'reject')} className="px-3 py-1.5 bg-transparent border border-red-500 text-red-500 text-xs font-bold rounded-lg hover:bg-red-500/10 transition-colors">Reject</button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
