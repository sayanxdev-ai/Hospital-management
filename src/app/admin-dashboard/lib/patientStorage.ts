export interface PatientCareRecord {
  name?: string;
  doctor: string;
  status: string;
  department?: string;
  diagnosis?: string;
}

export const PATIENTS_STORAGE_KEY = 'mediconnect-patients';
export const ADMIN_PATIENTS_CHANGED = 'mediconnect-patients-changed';

const initialPatientCareRecords: PatientCareRecord[] = [
  { name: 'Rahul Mehta', doctor: 'Dr. Priya Sharma', status: 'Emergency', department: 'Cardiology', diagnosis: 'Acute Myocardial Infarction' },
  { name: 'Priya Sharma', doctor: 'Dr. Anjali Singh', status: 'Admitted', department: 'Gynaecology', diagnosis: 'Prenatal Care' },
  { name: 'Suresh Patel', doctor: 'Dr. Vikram Nair', status: 'Under Treatment', department: 'Orthopaedics', diagnosis: 'Hip Fracture' },
  { name: 'Anjali Singh', doctor: 'Dr. Deepak Rao', status: 'Under Treatment', department: 'Endocrinology', diagnosis: 'Type 2 Diabetes with Hypertension' },
  { name: 'Kiran Desai', doctor: 'Dr. Meena Joshi', status: 'Discharged', department: 'General Medicine', diagnosis: 'Typhoid Fever' },
  { name: 'Vikram Nair', doctor: 'Dr. Arun Tiwari', status: 'Emergency', department: 'Neurology', diagnosis: 'Ischemic Stroke' },
  { name: 'Meena Joshi', doctor: 'Dr. Kavita Kulkarni', status: 'Admitted', department: 'Pulmonology', diagnosis: 'Severe Asthma' },
  { name: 'Deepak Rao', doctor: 'Dr. Suresh Patel', status: 'Under Treatment', department: 'Gastroenterology', diagnosis: 'Peptic Ulcer Disease' },
  { name: 'Kavita Kulkarni', doctor: 'Dr. Rahul Mehta', status: 'Under Treatment', department: 'Nephrology', diagnosis: 'Chronic Kidney Disease Stage 3' },
  { name: 'Arun Tiwari', doctor: 'Dr. Priya Sharma', status: 'Discharged', department: 'Dermatology', diagnosis: 'Severe Eczema' },
  { name: 'Sunita Verma', doctor: 'Dr. Anjali Singh', status: 'Under Treatment', department: 'Oncology', diagnosis: 'Breast Cancer Stage II' },
  { name: 'Ravi Kumar', doctor: 'Dr. Vikram Nair', status: 'Admitted', department: 'Cardiology', diagnosis: 'Atrial Fibrillation with Heart Failure' },
  { name: 'Nisha Gupta', doctor: 'Dr. Deepak Rao', status: 'Admitted', department: 'Psychiatry', diagnosis: 'Major Depressive Disorder' },
  { name: 'Mohan Das', doctor: 'Dr. Meena Joshi', status: 'Under Treatment', department: 'Urology', diagnosis: 'Benign Prostatic Hyperplasia' },
  { name: 'Pooja Iyer', doctor: 'Dr. Arun Tiwari', status: 'Under Treatment', department: 'Rheumatology', diagnosis: 'Rheumatoid Arthritis' },
];

export function getPatientCareRecords(): PatientCareRecord[] {
  try {
    const stored = window.localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (stored === null) return initialPatientCareRecords;

    const patients: unknown = JSON.parse(stored);
    if (!Array.isArray(patients)) return [];

    return patients.filter((patient): patient is PatientCareRecord =>
      typeof patient === 'object' && patient !== null &&
      'doctor' in patient && typeof patient.doctor === 'string' &&
      'status' in patient && typeof patient.status === 'string'
    );
  } catch {
    return initialPatientCareRecords;
  }
}
