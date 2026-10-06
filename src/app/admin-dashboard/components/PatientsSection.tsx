'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Download, Plus, Eye, Edit2, Trash2, X, Check, ChevronUp, ChevronDown, User, Phone, Mail, MapPin, Droplets, Pill, CreditCard, Banknote, Receipt } from 'lucide-react';
import { ADMIN_PATIENTS_CHANGED, PATIENTS_STORAGE_KEY } from '../lib/patientStorage';
import { recordAdminActivity } from '../lib/activityStorage';
import { DOCTORS, DOCTOR_SPECIALTIES } from '../lib/doctorsData';

type PatientStatus =
  | 'Admitted'
  | 'Awaiting Bed'
  | 'Critical'
  | 'Discharged'
  | 'Emergency'
  | 'In Surgery'
  | 'Observation'
  | 'Outpatient'
  | 'Recovery'
  | 'Transferred'
  | 'Under Treatment';
type Gender = 'Male' | 'Female' | 'Other';
type PaymentMethod = 'Card' | 'UPI' | 'Cash';

interface BillLineItem {
  description: string;
  amount: number;
}

interface PatientBill {
  items: BillLineItem[];
  total: number;
  paymentStatus: 'Paid' | 'Unpaid';
  paymentMethod?: PaymentMethod;
  paidAt?: string;
}

interface Patient {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: Gender;
  email: string;
  phone: string;
  address: string;
  city: string;
  bloodGroup: string;
  department: string;
  room: string;
  doctor: string;
  admissionDate: string;
  dischargeDate: string;
  status: PatientStatus;
  medicines: string;
  diagnosis: string;
  emergencyContact: string;
  bill?: PatientBill;
}

const initialPatients: Patient[] = [
  { id: 'p1', patientId: 'P1001', name: 'Rahul Mehta', age: 34, gender: 'Male', email: 'rahul.mehta@email.com', phone: '+91 98765 43210', address: '12, Shivaji Nagar', city: 'Mumbai', bloodGroup: 'AB−', department: 'Cardiology', room: 'ICU-3', doctor: 'Dr. Priya Sharma', admissionDate: '2026-08-10', dischargeDate: '', status: 'Emergency', medicines: 'Aspirin 75mg, Metoprolol 25mg, Atorvastatin 40mg', diagnosis: 'Acute Myocardial Infarction', emergencyContact: '+91 98765 11111' },
  { id: 'p2', patientId: 'P1002', name: 'Priya Sharma', age: 28, gender: 'Female', email: 'priya.sharma@email.com', phone: '+91 87654 32109', address: '45, MG Road', city: 'Pune', bloodGroup: 'B+', department: 'Gynaecology', room: 'Ward-B2', doctor: 'Dr. Anjali Singh', admissionDate: '2026-08-15', dischargeDate: '', status: 'Admitted', medicines: 'Folic Acid 5mg, Iron Tablets, Calcium 500mg', diagnosis: 'Prenatal Care', emergencyContact: '+91 87654 22222' },
  { id: 'p3', patientId: 'P1003', name: 'Suresh Patel', age: 56, gender: 'Male', email: 'suresh.patel@email.com', phone: '+91 76543 21098', address: '78, Gandhi Road', city: 'Ahmedabad', bloodGroup: 'O+', department: 'Orthopaedics', room: 'Ward-C1', doctor: 'Dr. Vikram Nair', admissionDate: '2026-08-12', dischargeDate: '', status: 'Under Treatment', medicines: 'Diclofenac 50mg, Pantoprazole 40mg, Calcium 1000mg', diagnosis: 'Hip Fracture', emergencyContact: '+91 76543 33333' },
  { id: 'p4', patientId: 'P1004', name: 'Anjali Singh', age: 42, gender: 'Female', email: 'anjali.singh@email.com', phone: '+91 65432 10987', address: '23, Nehru Colony', city: 'Delhi', bloodGroup: 'A+', department: 'Endocrinology', room: 'Ward-D3', doctor: 'Dr. Deepak Rao', admissionDate: '2026-08-08', dischargeDate: '', status: 'Under Treatment', medicines: 'Insulin Glargine 20U, Metformin 500mg, Lisinopril 10mg', diagnosis: 'Type 2 Diabetes with Hypertension', emergencyContact: '+91 65432 44444' },
  { id: 'p5', patientId: 'P1005', name: 'Kiran Desai', age: 19, gender: 'Male', email: 'kiran.desai@email.com', phone: '+91 54321 09876', address: '56, Patel Street', city: 'Surat', bloodGroup: 'B−', department: 'General Medicine', room: 'Ward-A1', doctor: 'Dr. Meena Joshi', admissionDate: '2026-08-20', dischargeDate: '2026-08-23', status: 'Discharged', medicines: 'Azithromycin 500mg, Paracetamol 500mg, ORS', diagnosis: 'Typhoid Fever', emergencyContact: '+91 54321 55555' },
  { id: 'p6', patientId: 'P1006', name: 'Vikram Nair', age: 63, gender: 'Male', email: 'vikram.nair@email.com', phone: '+91 43210 98765', address: '90, Laxmi Nagar', city: 'Nagpur', bloodGroup: 'A−', department: 'Neurology', room: 'ICU-1', doctor: 'Dr. Arun Tiwari', admissionDate: '2026-08-18', dischargeDate: '', status: 'Emergency', medicines: 'Aspirin 300mg, Clopidogrel 75mg, Atorvastatin 80mg, Amlodipine 5mg', diagnosis: 'Ischemic Stroke', emergencyContact: '+91 43210 66666' },
  { id: 'p7', patientId: 'P1007', name: 'Meena Joshi', age: 35, gender: 'Female', email: 'meena.joshi@email.com', phone: '+91 32109 87654', address: '34, Saraswati Road', city: 'Nashik', bloodGroup: 'O−', department: 'Pulmonology', room: 'Ward-E2', doctor: 'Dr. Kavita Kulkarni', admissionDate: '2026-08-19', dischargeDate: '', status: 'Admitted', medicines: 'Salbutamol Inhaler, Budesonide Inhaler, Montelukast 10mg', diagnosis: 'Severe Asthma', emergencyContact: '+91 32109 77777' },
  { id: 'p8', patientId: 'P1008', name: 'Deepak Rao', age: 47, gender: 'Male', email: 'deepak.rao@email.com', phone: '+91 21098 76543', address: '67, Tilak Marg', city: 'Hyderabad', bloodGroup: 'AB+', department: 'Gastroenterology', room: 'Ward-F1', doctor: 'Dr. Suresh Patel', admissionDate: '2026-08-17', dischargeDate: '', status: 'Under Treatment', medicines: 'Omeprazole 40mg, Domperidone 10mg, Ondansetron 4mg', diagnosis: 'Peptic Ulcer Disease', emergencyContact: '+91 21098 88888' },
  { id: 'p9', patientId: 'P1009', name: 'Kavita Kulkarni', age: 52, gender: 'Female', email: 'kavita.kulkarni@email.com', phone: '+91 10987 65432', address: '12, Shastri Nagar', city: 'Kolkata', bloodGroup: 'B+', department: 'Nephrology', room: 'Ward-G2', doctor: 'Dr. Rahul Mehta', admissionDate: '2026-08-14', dischargeDate: '', status: 'Under Treatment', medicines: 'Furosemide 40mg, Amlodipine 10mg, Erythropoietin', diagnosis: 'Chronic Kidney Disease Stage 3', emergencyContact: '+91 10987 99999' },
  { id: 'p10', patientId: 'P1010', name: 'Arun Tiwari', age: 29, gender: 'Male', email: 'arun.tiwari@email.com', phone: '+91 09876 54321', address: '45, Civil Lines', city: 'Lucknow', bloodGroup: 'O+', department: 'Dermatology', room: 'OPD-3', doctor: 'Dr. Priya Sharma', admissionDate: '2026-08-22', dischargeDate: '2026-08-24', status: 'Discharged', medicines: 'Cetirizine 10mg, Betamethasone Cream, Moisturizer', diagnosis: 'Severe Eczema', emergencyContact: '+91 09876 10101' },
  { id: 'p11', patientId: 'P1011', name: 'Sunita Verma', age: 38, gender: 'Female', email: 'sunita.verma@email.com', phone: '+91 98001 23456', address: '89, Rajiv Nagar', city: 'Jaipur', bloodGroup: 'A+', department: 'Oncology', room: 'Ward-H1', doctor: 'Dr. Anjali Singh', admissionDate: '2026-08-05', dischargeDate: '', status: 'Under Treatment', medicines: 'Paclitaxel, Carboplatin, Ondansetron 8mg, Dexamethasone', diagnosis: 'Breast Cancer Stage II', emergencyContact: '+91 98001 11111' },
  { id: 'p12', patientId: 'P1012', name: 'Ravi Kumar', age: 71, gender: 'Male', email: 'ravi.kumar@email.com', phone: '+91 87001 23456', address: '23, Sector 15', city: 'Chandigarh', bloodGroup: 'B+', department: 'Cardiology', room: 'Ward-B1', doctor: 'Dr. Vikram Nair', admissionDate: '2026-08-16', dischargeDate: '', status: 'Admitted', medicines: 'Warfarin 5mg, Digoxin 0.25mg, Furosemide 20mg', diagnosis: 'Atrial Fibrillation with Heart Failure', emergencyContact: '+91 87001 22222' },
  { id: 'p13', patientId: 'P1013', name: 'Nisha Gupta', age: 24, gender: 'Female', email: 'nisha.gupta@email.com', phone: '+91 76001 23456', address: '56, Model Town', city: 'Amritsar', bloodGroup: 'AB−', department: 'Psychiatry', room: 'Ward-I2', doctor: 'Dr. Deepak Rao', admissionDate: '2026-08-21', dischargeDate: '', status: 'Admitted', medicines: 'Sertraline 50mg, Clonazepam 0.5mg, Quetiapine 25mg', diagnosis: 'Major Depressive Disorder', emergencyContact: '+91 76001 33333' },
  { id: 'p14', patientId: 'P1014', name: 'Mohan Das', age: 60, gender: 'Male', email: 'mohan.das@email.com', phone: '+91 65001 23456', address: '78, Park Street', city: 'Chennai', bloodGroup: 'O−', department: 'Urology', room: 'Ward-J1', doctor: 'Dr. Meena Joshi', admissionDate: '2026-08-13', dischargeDate: '', status: 'Under Treatment', medicines: 'Tamsulosin 0.4mg, Finasteride 5mg, Ciprofloxacin 500mg', diagnosis: 'Benign Prostatic Hyperplasia', emergencyContact: '+91 65001 44444' },
  { id: 'p15', patientId: 'P1015', name: 'Pooja Iyer', age: 31, gender: 'Female', email: 'pooja.iyer@email.com', phone: '+91 54001 23456', address: '34, Anna Nagar', city: 'Coimbatore', bloodGroup: 'A−', department: 'Rheumatology', room: 'Ward-K2', doctor: 'Dr. Arun Tiwari', admissionDate: '2026-08-09', dischargeDate: '', status: 'Under Treatment', medicines: 'Methotrexate 15mg, Folic Acid 5mg, Hydroxychloroquine 200mg', diagnosis: 'Rheumatoid Arthritis', emergencyContact: '+91 54001 55555' },
];

const statusConfig: Record<PatientStatus, { className: string; color: string }> = {
  'Admitted': { className: 'bg-info/10 text-info border border-info/20', color: 'text-info' },
  'Awaiting Bed': { className: 'bg-warning/10 text-warning border border-warning/20', color: 'text-warning' },
  'Critical': { className: 'bg-danger/10 text-danger border border-danger/20', color: 'text-danger' },
  'In Surgery': { className: 'bg-primary/10 text-primary border border-primary/20', color: 'text-primary' },
  'Observation': { className: 'bg-accent/10 text-accent border border-accent/20', color: 'text-accent' },
  'Outpatient': { className: 'bg-secondary text-secondary-foreground border border-border', color: 'text-secondary-foreground' },
  'Recovery': { className: 'bg-success/10 text-success border border-success/20', color: 'text-success' },
  'Under Treatment': { className: 'bg-warning/10 text-warning border border-warning/20', color: 'text-warning' },
  'Emergency': { className: 'bg-danger/10 text-danger border border-danger/20', color: 'text-danger' },
  'Discharged': { className: 'bg-success/10 text-success border border-success/20', color: 'text-success' },
  'Transferred': { className: 'bg-muted text-muted-foreground border border-border', color: 'text-muted-foreground' },
};

const sampleRooms = Array.from({ length: 9 }, (_, index) => `Room-${101 + index}`);
const roomOccupyingStatuses = new Set<PatientStatus>([
  'Admitted',
  'Critical',
  'Emergency',
  'In Surgery',
  'Observation',
  'Recovery',
  'Under Treatment',
]);

function assignAvailableRoom(patient: Patient, patients: Patient[]): Patient | null {
  if (patient.status !== 'Admitted') return patient;

  const occupiedRooms = new Set(
    patients
      .filter(existing => existing.id !== patient.id && roomOccupyingStatuses.has(existing.status))
      .map(existing => existing.room.trim())
      .filter(Boolean),
  );
  const currentRoom = patient.room.trim();

  if (currentRoom && (!sampleRooms.includes(currentRoom) || !occupiedRooms.has(currentRoom))) {
    return patient;
  }

  const availableRoom = sampleRooms.find(room => !occupiedRooms.has(room));
  return availableRoom ? { ...patient, room: availableRoom } : null;
}

function createDischargeBill(patient: Patient): PatientBill {
  const admittedAt = new Date(`${patient.admissionDate}T00:00:00`);
  const today = new Date();
  const daysAdmitted = Number.isNaN(admittedAt.getTime())
    ? 1
    : Math.max(1, Math.ceil((today.getTime() - admittedAt.getTime()) / 86_400_000));
  const dailyRoomRate = patient.room.toLowerCase().includes('icu') ? 5000 : 2500;
  const items = [
    { description: `Room charges (${daysAdmitted} day${daysAdmitted === 1 ? '' : 's'})`, amount: dailyRoomRate * daysAdmitted },
    { description: `Nursing care (${daysAdmitted} day${daysAdmitted === 1 ? '' : 's'})`, amount: 800 * daysAdmitted },
    { description: 'Doctor consultation', amount: 1500 },
    { description: 'Diagnostics and laboratory', amount: 2000 },
    { description: 'Medicines and supplies', amount: 1200 },
  ];

  return {
    items,
    total: items.reduce((total, item) => total + item.amount, 0),
    paymentStatus: 'Unpaid',
  };
}

function DischargeBillingDialog({
  patient,
  bill,
  alreadyDischarged,
  onPay,
  onDischargeUnpaid,
  onCancel,
}: {
  patient: Patient;
  bill: PatientBill;
  alreadyDischarged: boolean;
  onPay: (method: PaymentMethod) => void;
  onDischargeUnpaid: () => void;
  onCancel: () => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <div className="fixed inset-0 bg-foreground/60 z-[60] flex items-center justify-center p-4" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="discharge-billing-title"
        className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 id="discharge-billing-title" className="text-lg font-bold text-foreground">Discharge bill</h2>
            <p className="text-sm text-muted-foreground">{patient.name} · {patient.patientId}</p>
          </div>
          <button type="button" onClick={onCancel} className="btn-icon text-muted-foreground hover:text-foreground" aria-label="Close discharge bill">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 bg-muted/50 px-4 py-3 text-sm font-semibold">
              <Receipt size={16} /> Expenses and bills
            </div>
            <div className="divide-y divide-border px-4">
              {bill.items.map(item => (
                <div key={item.description} className="flex justify-between gap-4 py-3 text-sm">
                  <span className="text-muted-foreground">{item.description}</span>
                  <span className="font-medium tabular-nums whitespace-nowrap">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t border-border bg-muted/30 px-4 py-3 font-bold">
              <span>Total due</span>
              <span className="tabular-nums">{formatCurrency(bill.total)}</span>
            </div>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Payment method</legend>
            <div className="grid grid-cols-3 gap-2">
              {([
                { method: 'Card', label: 'Card', Icon: CreditCard },
                { method: 'UPI', label: 'UPI', Icon: Receipt },
                { method: 'Cash', label: 'Cash', Icon: Banknote },
              ] as const).map(({ method, label, Icon }) => (
                <button
                  key={method}
                  type="button"
                  aria-pressed={paymentMethod === method}
                  onClick={() => setPaymentMethod(method)}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium ${paymentMethod === method ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-muted'}`}
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
          </fieldset>

          <p className="rounded-lg bg-warning/10 p-3 text-xs text-muted-foreground">
            Sample estimate for demonstration only. Payments are recorded in this app; no real charge is processed and no card details are collected.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
              {alreadyDischarged ? 'Close bill' : 'Cancel discharge'}
            </button>
            {!alreadyDischarged && (
              <button type="button" onClick={onDischargeUnpaid} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
                Discharge — pay later
              </button>
            )}
            <button type="button" onClick={() => onPay(paymentMethod)} className="btn-primary px-4 py-2 text-sm">
              {alreadyDischarged ? 'Pay outstanding balance' : 'Pay all & discharge'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PatientModalProps {
  patient: Patient | null;
  onClose: () => void;
  onSave: (p: Patient) => void;
  mode: 'view' | 'edit' | 'add';
}

function PatientModal({ patient, onClose, onSave, mode }: PatientModalProps) {
  const [form, setForm] = useState<Patient>(patient || {
    id: `p${Date.now()}`, patientId: `P${1016 + Math.floor(Math.random() * 100)}`,
    name: '', age: 0, gender: 'Male', email: '', phone: '', address: '', city: '',
    bloodGroup: 'O+', department: '', room: '', doctor: '', admissionDate: new Date().toISOString().split('T')[0],
    dischargeDate: '', status: 'Admitted', medicines: '', diagnosis: '', emergencyContact: '',
  });

  const isReadOnly = mode === 'view';

  const handleChange = (field: keyof Patient, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const bloodGroups = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'];
  const departments = ['Cardiology', 'Neurology', 'Orthopaedics', 'Gynaecology', 'Oncology', 'Pulmonology', 'Gastroenterology', 'Nephrology', 'Endocrinology', 'Dermatology', 'Psychiatry', 'Urology', 'Rheumatology', 'General Medicine'];

  return (
    <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {mode === 'add' ? 'Add New Patient' : mode === 'edit' ? 'Edit Patient' : 'Patient Details'}
            </h2>
            {patient && <p className="text-sm text-muted-foreground">{patient.patientId}</p>}
          </div>
          <button onClick={onClose} className="btn-icon text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <User size={14} /> Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Full Name *</label>
                <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} readOnly={isReadOnly} required
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Patient ID</label>
                <input type="text" value={form.patientId} readOnly
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm opacity-60" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Age *</label>
                <input type="number" value={form.age} onChange={e => handleChange('age', parseInt(e.target.value))} readOnly={isReadOnly} required min={0} max={150}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Gender *</label>
                <select value={form.gender} onChange={e => handleChange('gender', e.target.value)} disabled={isReadOnly}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Mail size={12} /> Email</label>
                <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} readOnly={isReadOnly}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Phone size={12} /> Phone</label>
                <input type="text" value={form.phone} onChange={e => handleChange('phone', e.target.value)} readOnly={isReadOnly}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><MapPin size={12} /> Address</label>
                <input type="text" value={form.address} onChange={e => handleChange('address', e.target.value)} readOnly={isReadOnly}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">City</label>
                <input type="text" value={form.city} onChange={e => handleChange('city', e.target.value)} readOnly={isReadOnly}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Droplets size={12} /> Blood Group *</label>
                <select value={form.bloodGroup} onChange={e => handleChange('bloodGroup', e.target.value)} disabled={isReadOnly}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {bloodGroups.map(bg => <option key={bg}>{bg}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Emergency Contact</label>
                <input type="text" value={form.emergencyContact} onChange={e => handleChange('emergencyContact', e.target.value)} readOnly={isReadOnly}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
          </div>

          {/* Medical Info */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Pill size={14} /> Medical Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Department *</label>
                <select value={form.department} onChange={e => handleChange('department', e.target.value)} disabled={isReadOnly}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {[...new Set([...departments, ...DOCTOR_SPECIALTIES])].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Room / Ward</label>
                <input type="text" value={form.room} onChange={e => handleChange('room', e.target.value)} readOnly={isReadOnly}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Doctor</label>
                <input type="text" list="patient-doctor-directory" value={form.doctor} onChange={e => handleChange('doctor', e.target.value)} readOnly={isReadOnly}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <datalist id="patient-doctor-directory">
                  {DOCTORS.map(doctor => <option key={doctor.id} value={doctor.name} label={doctor.specialty} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Status *</label>
                <select value={form.status} onChange={e => handleChange('status', e.target.value)} disabled={isReadOnly}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {(Object.keys(statusConfig) as PatientStatus[]).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Admission Date</label>
                <input type="date" value={form.admissionDate} onChange={e => handleChange('admissionDate', e.target.value)} readOnly={isReadOnly}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Discharge Date</label>
                <input type="date" value={form.dischargeDate} onChange={e => handleChange('dischargeDate', e.target.value)} readOnly={isReadOnly}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Diagnosis</label>
                <input type="text" value={form.diagnosis} onChange={e => handleChange('diagnosis', e.target.value)} readOnly={isReadOnly}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Medicines / Prescriptions</label>
                <textarea value={form.medicines} onChange={e => handleChange('medicines', e.target.value)} readOnly={isReadOnly} rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
              <button type="submit" className="btn-primary px-6 py-2 text-sm">
                {mode === 'add' ? 'Add Patient' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function PatientsSection() {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [patientsLoaded, setPatientsLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | PatientStatus>('All');
  const [modal, setModal] = useState<{ mode: 'view' | 'edit' | 'add'; patient: Patient | null } | null>(null);
  const [pendingDischarge, setPendingDischarge] = useState<{ patient: Patient; bill: PatientBill } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'danger' } | null>(null);
  const [sortField, setSortField] = useState<keyof Patient>('patientId');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    try {
      const storedPatients = window.localStorage.getItem(PATIENTS_STORAGE_KEY);
      if (storedPatients) {
        const parsedPatients: unknown = JSON.parse(storedPatients);
        if (Array.isArray(parsedPatients)) setPatients(parsedPatients as Patient[]);
      }
    } catch {
      // Keep the in-memory patient list if browser storage is unavailable.
    } finally {
      setPatientsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!patientsLoaded) return;
    try {
      window.localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
      window.dispatchEvent(new Event(ADMIN_PATIENTS_CHANGED));
    } catch {
      // Patient updates continue to work for this page if browser storage is unavailable.
    }
  }, [patients, patientsLoaded]);

  const showToast = (msg: string, type: 'success' | 'danger' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openDischargeBilling = (patient: Patient) => {
    setPendingDischarge({
      patient,
      bill: patient.bill ?? createDischargeBill(patient),
    });
    setModal(null);
  };

  const completeDischarge = (paymentMethod?: PaymentMethod) => {
    if (!pendingDischarge) return;

    const { patient, bill } = pendingDischarge;
    const isPaid = Boolean(paymentMethod);
    const dischargedPatient: Patient = {
      ...patient,
      status: 'Discharged',
      dischargeDate: patient.dischargeDate || new Date().toISOString().split('T')[0],
      bill: {
        ...bill,
        paymentStatus: isPaid ? 'Paid' : 'Unpaid',
        ...(paymentMethod ? { paymentMethod, paidAt: new Date().toISOString() } : {}),
      },
    };

    setPatients(prev => prev.map(existing => existing.id === patient.id ? dischargedPatient : existing));
    recordAdminActivity({
      category: 'patient',
      tone: isPaid ? 'success' : 'warning',
      message: `Patient ${patient.name} discharged with a ${isPaid ? 'paid' : 'unpaid'} bill of ₹${bill.total.toLocaleString('en-IN')}${paymentMethod ? ` via ${paymentMethod}` : ''}.`,
    });
    setPendingDischarge(null);
    showToast(isPaid ? `Payment recorded via ${paymentMethod}; patient discharged` : 'Patient discharged with payment pending');
  };

  const departments = ['All', ...Array.from(new Set(patients.map(p => p.department))).sort()];

  const filtered = useMemo(() => {
    let list = patients.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.patientId.toLowerCase().includes(q) || p.department.toLowerCase().includes(q) || p.doctor.toLowerCase().includes(q) || p.bloodGroup.toLowerCase().includes(q);
      const matchDept = deptFilter === 'All' || p.department === deptFilter;
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchSearch && matchDept && matchStatus;
    });
    list = [...list].sort((a, b) => {
      const av = String(a[sortField]);
      const bv = String(b[sortField]);
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [patients, search, deptFilter, statusFilter, sortField, sortDir]);

  const handleSort = (field: keyof Patient) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleSave = (p: Patient) => {
    const previousPatient = patients.find(patient => patient.id === p.id);
    if (previousPatient && previousPatient.status !== 'Discharged' && p.status === 'Discharged') {
      openDischargeBilling(p);
      return;
    }

    const patientWithRoom = assignAvailableRoom(p, patients);
    if (!patientWithRoom) {
      showToast('No vacant rooms are available. The patient cannot be admitted.', 'danger');
      return;
    }

    const action = modal?.mode === 'add' ? 'added' : 'updated';
    recordAdminActivity({
      category: 'patient',
      tone: patientWithRoom.status === 'Emergency' ? 'danger' : 'success',
      message: `Patient ${action}: ${patientWithRoom.name} (${patientWithRoom.status})${patientWithRoom.doctor ? `, assigned to ${patientWithRoom.doctor}` : ''}.`,
    });
    if (patientWithRoom.doctor && patientWithRoom.doctor !== previousPatient?.doctor) {
      recordAdminActivity({
        category: 'doctor',
        tone: 'info',
        message: `${patientWithRoom.doctor} assigned to patient ${patientWithRoom.name}; doctor availability reflects active patient assignments.`,
      });
    }
    if (modal?.mode === 'add') {
      setPatients(prev => [patientWithRoom, ...prev]);
      showToast(`Patient added successfully${patientWithRoom.room !== p.room ? ` — assigned ${patientWithRoom.room}` : ''}`);
    } else {
      setPatients(prev => prev.map(x => x.id === patientWithRoom.id ? patientWithRoom : x));
      showToast(`Patient updated successfully${patientWithRoom.room !== p.room ? ` — assigned ${patientWithRoom.room}` : ''}`);
    }
    setModal(null);
  };

  const handleDelete = (id: string) => {
    const deletedPatient = patients.find(patient => patient.id === id);
    setPatients(prev => prev.filter(p => p.id !== id));
    if (deletedPatient) {
      recordAdminActivity({
        category: 'patient',
        tone: 'warning',
        message: `Patient record deleted: ${deletedPatient.name}${deletedPatient.doctor ? `, assigned doctor was ${deletedPatient.doctor}` : ''}.`,
      });
    }
    setDeleteConfirm(null);
    showToast('Patient record deleted', 'danger');
  };

  const handleStatusChange = (id: string, status: PatientStatus) => {
    const changedPatient = patients.find(patient => patient.id === id);
    if (changedPatient && status === 'Discharged' && changedPatient.status !== 'Discharged') {
      openDischargeBilling(changedPatient);
      return;
    }

    const updatedPatient = changedPatient && assignAvailableRoom({ ...changedPatient, status }, patients);
    if (changedPatient && !updatedPatient) {
      showToast('No vacant rooms are available. The patient cannot be admitted.', 'danger');
      return;
    }

    setPatients(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = updatedPatient ?? { ...p, status };
      if (status === 'Discharged' && !p.dischargeDate) {
        updated.dischargeDate = new Date().toISOString().split('T')[0];
      }
      return updated;
    }));
    if (changedPatient) {
      recordAdminActivity({
        category: 'patient',
        tone: status === 'Emergency' ? 'danger' : status === 'Discharged' || status === 'Transferred' ? 'warning' : 'info',
        message: `Patient status changed: ${changedPatient.name} is now ${status}${changedPatient.doctor ? ` under ${changedPatient.doctor}` : ''}.`,
      });
      if (changedPatient.doctor) {
        recordAdminActivity({
          category: 'doctor',
          tone: 'info',
          message: `${changedPatient.doctor}'s active patient assignment changed for ${changedPatient.name} (${status}).`,
        });
      }
    }
    showToast(`Status updated to ${status}${updatedPatient && updatedPatient.room !== changedPatient?.room ? ` — assigned ${updatedPatient.room}` : ''}`);
  };

  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const exportData = patients.map(p => ({
        'Patient ID': p.patientId,
        'Full Name': p.name,
        'Age': p.age,
        'Gender': p.gender,
        'Email': p.email,
        'Phone': p.phone,
        'Address': p.address,
        'City': p.city,
        'Blood Group': p.bloodGroup,
        'Department': p.department,
        'Room / Ward': p.room,
        'Doctor': p.doctor,
        'Diagnosis': p.diagnosis,
        'Medicines / Prescriptions': p.medicines,
        'Status': p.status,
        'Admission Date': p.admissionDate,
        'Discharge Date': p.dischargeDate || 'N/A',
        'Bill Total (₹)': p.bill?.total ?? '',
        'Payment Status': p.bill?.paymentStatus ?? 'N/A',
        'Payment Method': p.bill?.paymentMethod ?? 'N/A',
        'Emergency Contact': p.emergencyContact,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      ws['!cols'] = [
        { wch: 10 }, { wch: 22 }, { wch: 6 }, { wch: 8 }, { wch: 28 }, { wch: 18 },
        { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 22 },
        { wch: 35 }, { wch: 45 }, { wch: 16 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 15 }, { wch: 15 }, { wch: 18 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Patients');

      // Summary sheet
      const summary = [
        { 'Metric': 'Total Patients', 'Value': patients.length },
        { 'Metric': 'Admitted', 'Value': patients.filter(p => p.status === 'Admitted').length },
        { 'Metric': 'Under Treatment', 'Value': patients.filter(p => p.status === 'Under Treatment').length },
        { 'Metric': 'Emergency', 'Value': patients.filter(p => p.status === 'Emergency').length },
        { 'Metric': 'Discharged', 'Value': patients.filter(p => p.status === 'Discharged').length },
        { 'Metric': 'Transferred', 'Value': patients.filter(p => p.status === 'Transferred').length },
        { 'Metric': 'Export Date', 'Value': new Date().toLocaleDateString('en-IN') },
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summary);
      wsSummary['!cols'] = [{ wch: 20 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      XLSX.writeFile(wb, `MediConnect_Patients_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast(`Exported ${patients.length} patient records to Excel`);
    } catch {
      showToast('Export failed. Please try again.', 'danger');
    }
  };

  const SortIcon = ({ field }: { field: keyof Patient }) => {
    if (sortField !== field) return <ChevronUp size={12} className="text-muted-foreground/40" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-primary" /> : <ChevronDown size={12} className="text-primary" />;
  };

  const stats = {
    total: patients.length,
    admitted: patients.filter(p => p.status === 'Admitted').length,
    emergency: patients.filter(p => p.status === 'Emergency').length,
    discharged: patients.filter(p => p.status === 'Discharged').length,
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium fade-in ${toast.type === 'success' ? 'bg-success' : 'bg-danger'}`}>
          {toast.type === 'success' ? <Check size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{patients.length} total records · {stats.admitted} admitted · {stats.emergency} emergency</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors">
            <Download size={16} className="text-success" />
            Export Excel
          </button>
          <button onClick={() => setModal({ mode: 'add', patient: null })} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus size={16} />
            Add Patient
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients', value: stats.total, color: 'text-primary', bg: 'bg-secondary' },
          { label: 'Admitted', value: stats.admitted, color: 'text-info', bg: 'bg-info/10' },
          { label: 'Emergency', value: stats.emergency, color: 'text-danger', bg: 'bg-danger/10' },
          { label: 'Discharged Today', value: stats.discharged, color: 'text-success', bg: 'bg-success/10' },
        ].map(s => (
          <div key={s.label} className="card-base p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-3xl font-extrabold tabular-nums ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card-base p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, ID, department, doctor, blood group..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="select-field text-sm w-48">
          {departments.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'All' | PatientStatus)} className="select-field text-sm w-44">
          <option value="All">All Status</option>
          {(Object.keys(statusConfig) as PatientStatus[]).map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {[
                  { label: 'Patient ID', field: 'patientId' as keyof Patient },
                  { label: 'Name', field: 'name' as keyof Patient },
                  { label: 'Age/Gender', field: 'age' as keyof Patient },
                  { label: 'Blood Group', field: 'bloodGroup' as keyof Patient },
                  { label: 'Department', field: 'department' as keyof Patient },
                  { label: 'Room No.', field: 'room' as keyof Patient },
                  { label: 'Doctor', field: 'doctor' as keyof Patient },
                  { label: 'Diagnosis', field: 'diagnosis' as keyof Patient },
                  { label: 'Status', field: 'status' as keyof Patient },
                  { label: 'Admission', field: 'admissionDate' as keyof Patient },
                ].map(col => (
                  <th key={col.field} className="table-header-cell cursor-pointer select-none" onClick={() => handleSort(col.field)}>
                    <div className="flex items-center gap-1">
                      {col.label}
                      <SortIcon field={col.field} />
                    </div>
                  </th>
                ))}
                <th className="table-header-cell">Bill / Payment</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="table-cell text-center text-muted-foreground py-16">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="text-muted-foreground/30" />
                      <p className="font-medium">No patients found</p>
                      <p className="text-xs">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(p => {
                  const sCfg = statusConfig[p.status];
                  return (
                    <tr key={p.id} className="table-row-hover group">
                      <td className="table-cell font-mono text-xs font-semibold text-primary">{p.patientId}</td>
                      <td className="table-cell">
                        <div>
                          <p className="font-semibold text-foreground whitespace-nowrap">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.email}</p>
                        </div>
                      </td>
                      <td className="table-cell whitespace-nowrap">
                        <span className="font-medium">{p.age}</span>
                        <span className="text-muted-foreground text-xs ml-1">/ {p.gender[0]}</span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge-base text-xs font-bold ${p.bloodGroup.includes('−') ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-info/10 text-info border border-info/20'}`}>
                          {p.bloodGroup}
                        </span>
                      </td>
                      <td className="table-cell text-sm whitespace-nowrap">{p.department}</td>
                      <td className="table-cell text-sm font-medium whitespace-nowrap">{p.room || '—'}</td>
                      <td className="table-cell text-sm text-muted-foreground whitespace-nowrap">{p.doctor}</td>
                      <td className="table-cell text-sm text-muted-foreground max-w-[160px] truncate" title={p.diagnosis}>{p.diagnosis}</td>
                      <td className="table-cell">
                        <select
                          value={p.status}
                          onChange={e => handleStatusChange(p.id, e.target.value as PatientStatus)}
                          className={`text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer appearance-none ${sCfg.className} bg-transparent`}
                        >
                          {(Object.keys(statusConfig) as PatientStatus[]).map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="table-cell text-xs text-muted-foreground whitespace-nowrap">{p.admissionDate}</td>
                      <td className="table-cell">
                        {p.bill?.paymentStatus === 'Paid' ? (
                          <span className="badge-base whitespace-nowrap bg-success/10 text-success border border-success/20">
                            Paid · ₹{p.bill.total.toLocaleString('en-IN')}
                          </span>
                        ) : p.bill?.paymentStatus === 'Unpaid' ? (
                          <button
                            type="button"
                            onClick={() => openDischargeBilling(p)}
                            className="badge-base whitespace-nowrap bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20"
                            title="Open unpaid bill"
                          >
                            Pay ₹{p.bill.total.toLocaleString('en-IN')}
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not billed</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setModal({ mode: 'view', patient: p })} className="btn-icon text-muted-foreground hover:text-primary" title="View">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => setModal({ mode: 'edit', patient: p })} className="btn-icon text-muted-foreground hover:text-warning" title="Edit">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => setDeleteConfirm(p.id)} className="btn-icon text-muted-foreground hover:text-danger" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {patients.length} patients
          </p>
          <button onClick={exportToExcel} className="flex items-center gap-1.5 text-xs text-success font-medium hover:underline">
            <Download size={13} /> Export all to Excel
          </button>
        </div>
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-foreground mb-2">Delete Patient Record?</h3>
            <p className="text-sm text-muted-foreground mb-6">This action cannot be undone. The patient record will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 rounded-lg bg-danger text-white text-sm font-medium hover:bg-danger/90 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Patient modal */}
      {modal && (
        <PatientModal
          patient={modal.patient}
          mode={modal.mode}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {pendingDischarge && (
        <DischargeBillingDialog
          patient={pendingDischarge.patient}
          bill={pendingDischarge.bill}
          alreadyDischarged={pendingDischarge.patient.status === 'Discharged'}
          onCancel={() => setPendingDischarge(null)}
          onDischargeUnpaid={() => completeDischarge()}
          onPay={method => completeDischarge(method)}
        />
      )}
    </div>
  );
}
