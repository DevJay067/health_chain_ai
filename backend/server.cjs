const express = require('express');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// --- IN-MEMORY DATABASE ---
let healthRecords = [];
let blockchain = [];
let users = [
  // Default Admin User
  { id: 'admin-1', name: 'System Admin', email: 'admin@healthchain.ai', password: 'admin', role: 'admin', status: 'approved' }
];
let accessRequests = []; // Stores doctor -> patient access requests
let requestCounter = 1;

// Genesis block
blockchain.push({
  index: 0,
  timestamp: new Date().toISOString(),
  data: { message: "Genesis Block - Health Records Blockchain" },
  previous_hash: "0",
  hash: crypto.createHash('sha256').update("genesis").digest('hex'),
  nonce: 0
});

const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });

// --- MIDDLEWARE ---
// Dummy middleware to check roles (in a real app, use JWT)
const checkRole = (role) => {
  return (req, res, next) => {
    const userEmail = req.headers['x-user-email'];
    const user = users.find(u => u.email === userEmail);
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (user.role !== role) return res.status(403).json({ success: false, message: `Forbidden: Requires ${role} role` });
    if (user.role === 'doctor' && user.status !== 'approved') return res.status(403).json({ success: false, message: 'Doctor account pending admin approval' });
    req.user = user;
    next();
  };
};

const auth = (req, res, next) => {
  const userEmail = req.headers['x-user-email'];
  const user = users.find(u => u.email === userEmail);
  if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  req.user = user;
  next();
};

// --- AUTHENTICATION ---
app.post('/api/signup', (req, res) => {
  const { name, email, password, role } = req.body; // role: 'patient' or 'doctor'
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }
  
  const assignedRole = role === 'doctor' ? 'doctor' : 'patient';
  const status = assignedRole === 'doctor' ? 'pending' : 'approved'; // Doctors need admin approval

  const newUser = {
    id: crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'),
    name,
    email,
    password, // In-memory demo (should be hashed in prod)
    role: assignedRole,
    status
  };
  
  users.push(newUser);
  res.json({ 
    success: true, 
    message: assignedRole === 'doctor' ? 'Doctor registered. Pending admin approval.' : 'Patient registered successfully.', 
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, status: newUser.status } 
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  res.json({ 
    success: true, 
    message: 'Login successful', 
    user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status }, 
    token: 'mock-jwt-token' 
  });
});

// --- ADMIN ROUTES ---
app.get('/api/admin/doctors', checkRole('admin'), (req, res) => {
  const doctors = users.filter(u => u.role === 'doctor').map(u => ({ id: u.id, name: u.name, email: u.email, status: u.status }));
  res.json({ success: true, doctors });
});

app.post('/api/admin/approve-doctor', checkRole('admin'), (req, res) => {
  const { doctorId, action } = req.body; // action: 'approve' or 'reject'
  const doctor = users.find(u => u.id === doctorId && u.role === 'doctor');
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
  
  doctor.status = action === 'approve' ? 'approved' : 'rejected';
  res.json({ success: true, message: `Doctor ${action}d successfully` });
});

// --- DOCTOR ROUTES ---
app.post('/api/doctor/request-access', checkRole('doctor'), (req, res) => {
  const { patientEmail, reason } = req.body;
  const patient = users.find(u => u.email === patientEmail && u.role === 'patient');
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

  const newReq = {
    id: requestCounter++,
    doctorId: req.user.id,
    doctorName: req.user.name,
    patientId: patient.id,
    reason,
    status: 'pending', // pending, approved, denied
    timestamp: new Date().toISOString()
  };
  accessRequests.push(newReq);
  res.json({ success: true, message: 'Access request sent', request: newReq });
});

app.get('/api/doctor/my-patients', checkRole('doctor'), (req, res) => {
  // Find patients who have approved access to this doctor
  const approvedReqs = accessRequests.filter(r => r.doctorId === req.user.id && r.status === 'approved');
  const patientIds = [...new Set(approvedReqs.map(r => r.patientId))];
  const patients = users.filter(u => patientIds.includes(u.id)).map(u => ({ id: u.id, name: u.name, email: u.email }));
  res.json({ success: true, patients });
});

app.get('/api/doctor/patient-records/:patientId', checkRole('doctor'), (req, res) => {
  const { patientId } = req.params;
  // Verify access
  const hasAccess = accessRequests.some(r => r.doctorId === req.user.id && r.patientId === patientId && r.status === 'approved');
  if (!hasAccess) return res.status(403).json({ success: false, message: 'No active access for this patient' });

  const patientRecords = healthRecords.filter(r => r.patientId === patientId);
  res.json({ success: true, records: patientRecords });
});

// --- PATIENT ROUTES ---
app.get('/api/patient/access-requests', checkRole('patient'), (req, res) => {
  const requests = accessRequests.filter(r => r.patientId === req.user.id);
  res.json({ success: true, requests });
});

app.post('/api/patient/resolve-request', checkRole('patient'), (req, res) => {
  const { requestId, action } = req.body; // 'approve' or 'deny'
  const request = accessRequests.find(r => r.id === requestId && r.patientId === req.user.id);
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
  
  request.status = action === 'approve' ? 'approved' : 'denied';
  res.json({ success: true, message: `Request ${action}d successfully` });
});

app.get('/api/patient/records', checkRole('patient'), (req, res) => {
  const records = healthRecords.filter(r => r.patientId === req.user.id);
  res.json({ success: true, records });
});

// --- GENERAL ROUTES ---
app.get('/', (req, res) => res.json({ message: "Health Records RBAC API", status: "active" }));
app.get('/api/health', (req, res) => res.json({ status: "healthy", timestamp: new Date().toISOString() }));

app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ detail: "No file uploaded" });
    const contents = fs.readFileSync(req.file.path);
    const encoded = contents.toString('base64');
    const file_hash = crypto.createHash('sha256').update(contents).digest('hex');
    fs.unlinkSync(req.file.path);
    res.json({ success: true, file_name: req.file.originalname, file_hash, file_data: encoded });
  } catch (err) {
    res.status(500).json({ detail: "Upload failed: " + err.message });
  }
});

app.post('/api/records', auth, (req, res) => {
  // Allow patient to upload their own, or doctor to upload to a patient they have access to
  try {
    const record = req.body;
    record.created_at = new Date().toISOString();
    
    // Determine patient ID
    if (req.user.role === 'patient') {
      record.patientId = req.user.id;
    } else if (req.user.role === 'doctor') {
      const hasAccess = accessRequests.some(r => r.doctorId === req.user.id && r.patientId === record.patientId && r.status === 'approved');
      if (!hasAccess) return res.status(403).json({ success: false, message: 'No active access for this patient' });
    } else {
      return res.status(403).json({ success: false, message: 'Invalid role for record creation' });
    }

    const data_string = JSON.stringify(record);
    const data_hash = crypto.createHash('sha256').update(data_string).digest('hex');
    const latest_block = blockchain[blockchain.length - 1];
    const new_index = latest_block.index + 1;
    const timestamp = new Date().toISOString();
    
    const blockchain_data = {
      record_type: "health_record",
      record_id: crypto.randomBytes(12).toString('hex'),
      data_hash: data_hash,
      timestamp: record.created_at,
      author: req.user.id
    };
    
    let nonce = 0, new_hash = "";
    while (true) {
      new_hash = crypto.createHash('sha256').update(JSON.stringify({ index: new_index, timestamp, data: blockchain_data, previous_hash: latest_block.hash, nonce })).digest('hex');
      if (new_hash.startsWith("00")) break;
      nonce++;
      if (nonce > 10000) break;
    }
    
    blockchain.push({ index: new_index, timestamp, data: blockchain_data, previous_hash: latest_block.hash, hash: new_hash, nonce });
    
    record.blockchain_hash = new_hash;
    record.id = blockchain_data.record_id;
    healthRecords.push(record);
    
    res.json({ success: true, message: "Record saved", record });
  } catch (err) {
    res.status(500).json({ detail: "Failed to create record: " + err.message });
  }
});

app.listen(8001, () => {
  console.log('RBAC Node.js Backend listening on port 8001');
});
