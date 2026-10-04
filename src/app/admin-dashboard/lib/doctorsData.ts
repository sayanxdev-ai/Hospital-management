export type DoctorAvailability = 'Free now' | 'Available today' | 'Busy / on call';
export type DoctorGender = 'Female' | 'Male';

export interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  city: string;
  availability: DoctorAvailability;
  nextSlot: string;
  experience: number;
  age: number;
  gender: DoctorGender;
  qualifications: string;
  languages: string[];
  biography: string;
  achievements: string[];
}

const coreDoctors: DoctorProfile[] = [
  { id: 'd1', name: 'Dr. Priya Sharma', specialty: 'Cardiology', hospital: 'City Hospital', city: 'Mumbai', availability: 'Free now', nextSlot: 'Walk-ins welcome', experience: 14, age: 45, gender: 'Female', qualifications: 'MBBS, MD (Cardiology)', languages: ['English', 'Hindi', 'Marathi'], biography: 'Cardiology consultant profile in the MediConnect sample directory.', achievements: ['Sample profile: verified awards and achievements not provided.'] },
  { id: 'd2', name: 'Dr. Anjali Singh', specialty: 'Gynaecology', hospital: 'Lifeline Clinic', city: 'Pune', availability: 'Available today', nextSlot: 'Today, 2:30 PM', experience: 11, age: 40, gender: 'Female', qualifications: 'MBBS, MS (Obstetrics & Gynaecology)', languages: ['English', 'Hindi'], biography: 'Gynaecology consultant profile in the MediConnect sample directory.', achievements: ['Sample profile: verified awards and achievements not provided.'] },
  { id: 'd3', name: 'Dr. Vikram Nair', specialty: 'Orthopaedics', hospital: 'Apollo Medical', city: 'Ahmedabad', availability: 'Busy / on call', nextSlot: 'Tomorrow, 9:00 AM', experience: 18, age: 50, gender: 'Male', qualifications: 'MBBS, MS (Orthopaedics)', languages: ['English', 'Hindi', 'Malayalam'], biography: 'Orthopaedics consultant profile in the MediConnect sample directory.', achievements: ['Sample profile: verified awards and achievements not provided.'] },
  { id: 'd4', name: 'Dr. Deepak Rao', specialty: 'Endocrinology', hospital: 'Sanjivani Hospital', city: 'Delhi', availability: 'Free now', nextSlot: 'Walk-ins welcome', experience: 12, age: 43, gender: 'Male', qualifications: 'MBBS, MD (Internal Medicine), DM (Endocrinology)', languages: ['English', 'Hindi', 'Telugu'], biography: 'Endocrinology consultant profile in the MediConnect sample directory.', achievements: ['Sample profile: verified awards and achievements not provided.'] },
  { id: 'd5', name: 'Dr. Meena Joshi', specialty: 'General Medicine', hospital: 'Care Hospital', city: 'Surat', availability: 'Available today', nextSlot: 'Today, 4:00 PM', experience: 9, age: 38, gender: 'Female', qualifications: 'MBBS, MD (General Medicine)', languages: ['English', 'Hindi', 'Gujarati'], biography: 'General Medicine consultant profile in the MediConnect sample directory.', achievements: ['Sample profile: verified awards and achievements not provided.'] },
  { id: 'd6', name: 'Dr. Arun Tiwari', specialty: 'Neurology', hospital: 'Fortis Hospital', city: 'Nagpur', availability: 'Busy / on call', nextSlot: 'Today, 6:15 PM', experience: 16, age: 48, gender: 'Male', qualifications: 'MBBS, MD (Medicine), DM (Neurology)', languages: ['English', 'Hindi'], biography: 'Neurology consultant profile in the MediConnect sample directory.', achievements: ['Sample profile: verified awards and achievements not provided.'] },
  { id: 'd7', name: 'Dr. Kavita Kulkarni', specialty: 'Pulmonology', hospital: 'City Hospital', city: 'Nashik', availability: 'Free now', nextSlot: 'Walk-ins welcome', experience: 10, age: 39, gender: 'Female', qualifications: 'MBBS, MD (Pulmonary Medicine)', languages: ['English', 'Hindi', 'Marathi'], biography: 'Pulmonology consultant profile in the MediConnect sample directory.', achievements: ['Sample profile: verified awards and achievements not provided.'] },
  { id: 'd8', name: 'Dr. Suresh Patel', specialty: 'Gastroenterology', hospital: 'Apollo Medical', city: 'Hyderabad', availability: 'Available today', nextSlot: 'Today, 5:00 PM', experience: 13, age: 44, gender: 'Male', qualifications: 'MBBS, MD (Medicine), DM (Gastroenterology)', languages: ['English', 'Hindi', 'Gujarati'], biography: 'Gastroenterology consultant profile in the MediConnect sample directory.', achievements: ['Sample profile: verified awards and achievements not provided.'] },
  { id: 'd9', name: 'Dr. Rahul Mehta', specialty: 'Nephrology', hospital: 'Lifeline Clinic', city: 'Kolkata', availability: 'Busy / on call', nextSlot: 'Tomorrow, 11:30 AM', experience: 15, age: 47, gender: 'Male', qualifications: 'MBBS, MD (Medicine), DM (Nephrology)', languages: ['English', 'Hindi', 'Bengali'], biography: 'Nephrology consultant profile in the MediConnect sample directory.', achievements: ['Sample profile: verified awards and achievements not provided.'] },
  { id: 'd10', name: 'Dr. Neha Kapoor', specialty: 'Dermatology', hospital: 'Sanjivani Hospital', city: 'Jaipur', availability: 'Available today', nextSlot: 'Today, 3:45 PM', experience: 8, age: 36, gender: 'Female', qualifications: 'MBBS, MD (Dermatology)', languages: ['English', 'Hindi'], biography: 'Dermatology consultant profile in the MediConnect sample directory.', achievements: ['Sample profile: verified awards and achievements not provided.'] },
  { id: 'd11', name: 'Dr. Rohan Das', specialty: 'Psychiatry', hospital: 'Care Hospital', city: 'Chennai', availability: 'Free now', nextSlot: 'Walk-ins welcome', experience: 12, age: 42, gender: 'Male', qualifications: 'MBBS, MD (Psychiatry)', languages: ['English', 'Hindi', 'Tamil'], biography: 'Psychiatry consultant profile in the MediConnect sample directory.', achievements: ['Sample profile: verified awards and achievements not provided.'] },
  { id: 'd12', name: 'Dr. Asha Menon', specialty: 'Oncology', hospital: 'Fortis Hospital', city: 'Coimbatore', availability: 'Available today', nextSlot: 'Today, 1:30 PM', experience: 20, age: 52, gender: 'Female', qualifications: 'MBBS, MD (Medicine), DM (Medical Oncology)', languages: ['English', 'Hindi', 'Malayalam'], biography: 'Oncology consultant profile in the MediConnect sample directory.', achievements: ['Sample profile: verified awards and achievements not provided.'] },
];

const additionalNames = [
  'Ishita Banerjee', 'Karan Malhotra', 'Sneha Iyer', 'Aditya Verma', 'Pooja Chawla',
  'Nikhil Deshmukh', 'Ritu Khanna', 'Sanjay Reddy', 'Divya Nambiar', 'Manish Gupta',
  'Tanya Bose', 'Harsh Vardhan', 'Mira Shah', 'Amitabh Sen', 'Nandini Rao',
  'Rakesh Pillai', 'Shreya Ghosh', 'Vivek Sinha', 'Ananya Roy', 'Rajiv Bhatia',
  'Simran Kaur', 'Gaurav Joshi', 'Lakshmi Krishnan', 'Mohit Arora', 'Farah Khan',
  'Devendra Pawar', 'Aparna Das', 'Siddharth Jain', 'Radhika Menon', 'Yash Thakur',
  'Leela Thomas', 'Pranav Kulkarni', 'Zoya Ali', 'Nitin Choudhary', 'Sonal Mishra',
  'Kabir Anand', 'Geeta Sethi', 'Omkar Patil',
];

const specialties = [
  'Cardiology', 'General Surgery', 'Homeopathy', 'Cardiothoracic Surgery',
  'Orthopaedics', 'Gynaecology', 'Neurology', 'Paediatrics', 'Urology',
  'Plastic Surgery', 'Endocrinology', 'Ophthalmology', 'ENT', 'Oncology',
  'General Medicine', 'Dermatology', 'Pulmonology', 'Gastroenterology',
  'Nephrology', 'Psychiatry',
];

const hospitals = ['City Hospital', 'Lifeline Clinic', 'Apollo Medical', 'Sanjivani Hospital', 'Care Hospital', 'Fortis Hospital'];
const cities = ['Mumbai', 'Pune', 'Ahmedabad', 'Delhi', 'Surat', 'Nagpur', 'Nashik', 'Hyderabad', 'Kolkata', 'Jaipur', 'Chennai', 'Coimbatore'];

const generatedDoctors = additionalNames.map((fullName, index): DoctorProfile => {
  const specialty = specialties[index % specialties.length];
  const isFemale = index % 2 === 0;
  return {
    id: `d${index + 13}`,
    name: `Dr. ${fullName}`,
    specialty,
    hospital: hospitals[index % hospitals.length],
    city: cities[index % cities.length],
    availability: (['Free now', 'Available today', 'Busy / on call'] as const)[index % 3],
    nextSlot: index % 3 === 0 ? 'Walk-ins welcome' : index % 3 === 1 ? 'Today, 3:00 PM' : 'Tomorrow, 10:00 AM',
    experience: 5 + (index % 19),
    age: 32 + (index % 27),
    gender: isFemale ? 'Female' : 'Male',
    qualifications: specialty === 'Homeopathy' ? 'BHMS, MD (Homeopathy)' : `MBBS, ${specialty.includes('Surgery') ? 'MS' : 'MD'} (${specialty})`,
    languages: ['English', index % 2 === 0 ? 'Hindi' : 'Hindi', cities[index % cities.length] === 'Mumbai' || cities[index % cities.length] === 'Pune' ? 'Marathi' : 'Regional language'],
    biography: `${specialty} directory profile for demonstration. Replace with verified doctor biography before production use.`,
    achievements: ['Sample profile: verified awards, procedures, and achievements not provided.'],
  };
});

const supplementalFirstNames = [
  'Aarav', 'Aditi', 'Akash', 'Amara', 'Aniket', 'Anushka', 'Arjun', 'Avani',
  'Dev', 'Diya', 'Ira', 'Kabir', 'Kiara', 'Madhav', 'Maya', 'Neel',
  'Reyansh', 'Sara', 'Tara', 'Vihaan',
];
const supplementalLastNames = [
  'Agarwal', 'Bose', 'Chatterjee', 'Desai', 'Fernandes', 'Ghosh', 'Iyer',
  'Kapoor', 'Khan', 'Kulkarni', 'Malik', 'Mukherjee', 'Nair', 'Pandey',
  'Rao', 'Saxena', 'Shah', 'Shetty', 'Tripathi', 'Varma',
];
const knownDoctors = [...coreDoctors, ...generatedDoctors];
const knownNames = new Set(knownDoctors.map(doctor => doctor.name.toLowerCase()));
let nextNameIndex = 0;

const supplementalDoctors = specialties.flatMap((specialty): DoctorProfile[] => {
  const departmentCount = knownDoctors.filter(doctor => doctor.specialty === specialty).length;
  const needed = Math.max(0, 6 - departmentCount);

  return Array.from({ length: needed }, (_, doctorIndex) => {
    let fullName = '';
    while (!fullName || knownNames.has(`dr. ${fullName}`.toLowerCase())) {
      const firstIndex = nextNameIndex % supplementalFirstNames.length;
      const lastIndex = Math.floor(nextNameIndex / supplementalFirstNames.length) % supplementalLastNames.length;
      fullName = `${supplementalFirstNames[firstIndex]} ${supplementalLastNames[lastIndex]}`;
      nextNameIndex += 1;
    }
    knownNames.add(`Dr. ${fullName}`.toLowerCase());

    const index = knownDoctors.length + specialty.length + doctorIndex + nextNameIndex;
    const isFemale = index % 2 === 0;
    return {
      id: `d${knownDoctors.length + nextNameIndex}`,
      name: `Dr. ${fullName}`,
      specialty,
      hospital: hospitals[index % hospitals.length],
      city: cities[index % cities.length],
      availability: (['Free now', 'Available today', 'Busy / on call'] as const)[index % 3],
      nextSlot: index % 3 === 0 ? 'Walk-ins welcome' : index % 3 === 1 ? 'Today, 3:00 PM' : 'Tomorrow, 10:00 AM',
      experience: 5 + (index % 19),
      age: 32 + (index % 27),
      gender: isFemale ? 'Female' : 'Male',
      qualifications: specialty === 'Homeopathy' ? 'BHMS, MD (Homeopathy)' : `MBBS, ${specialty.includes('Surgery') ? 'MS' : 'MD'} (${specialty})`,
      languages: ['English', 'Hindi', cities[index % cities.length] === 'Mumbai' || cities[index % cities.length] === 'Pune' ? 'Marathi' : 'Regional language'],
      biography: `${specialty} directory profile for demonstration. Replace with verified doctor biography before production use.`,
      achievements: ['Sample profile: verified awards, procedures, and achievements not provided.'],
    };
  });
});

export const DOCTORS: DoctorProfile[] = [...knownDoctors, ...supplementalDoctors];

export const DOCTOR_SPECIALTIES = Array.from(new Set(DOCTORS.map(doctor => doctor.specialty))).sort();
