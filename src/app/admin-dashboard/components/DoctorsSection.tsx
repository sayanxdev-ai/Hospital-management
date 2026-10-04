'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Award, CalendarDays, Clock3, Languages, MapPin, Search, Stethoscope, UserRoundCheck, Users } from 'lucide-react';
import { ADMIN_PATIENTS_CHANGED, getPatientCareRecords, type PatientCareRecord } from '../lib/patientStorage';
import { DOCTORS, DOCTOR_SPECIALTIES, type DoctorAvailability, type DoctorProfile } from '../lib/doctorsData';

type DirectoryDoctor = DoctorProfile & { patientNames: string[] };

const availabilityStyles: Record<DoctorAvailability, string> = {
  'Free now': 'bg-success/10 text-success border-success/20',
  'Available today': 'bg-info/10 text-info border-info/20',
  'Busy / on call': 'bg-warning/10 text-warning border-warning/20',
};

export default function DoctorsSection() {
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All specialties');
  const [availability, setAvailability] = useState<'All availability' | DoctorAvailability>('All availability');
  const [patientRecords, setPatientRecords] = useState<PatientCareRecord[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const directoryRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const refreshPatients = () => setPatientRecords(getPatientCareRecords());
    refreshPatients();
    window.addEventListener(ADMIN_PATIENTS_CHANGED, refreshPatients);
    window.addEventListener('storage', refreshPatients);
    return () => {
      window.removeEventListener(ADMIN_PATIENTS_CHANGED, refreshPatients);
      window.removeEventListener('storage', refreshPatients);
    };
  }, []);

  const doctors = useMemo<DirectoryDoctor[]>(() => DOCTORS.map(doctor => {
    const assignedPatients = patientRecords.filter(patient =>
      patient.doctor.trim().toLowerCase() === doctor.name.toLowerCase()
    );
    const activePatients = assignedPatients.filter(patient =>
      patient.status !== 'Discharged' && patient.status !== 'Transferred'
    );

    if (activePatients.length > 0) {
      return {
        ...doctor,
        availability: 'Busy / on call',
        nextSlot: `Currently treating ${activePatients.length} patient${activePatients.length === 1 ? '' : 's'}`,
        patientNames: activePatients.map(patient => patient.name).filter((name): name is string => Boolean(name)),
      };
    }

    return {
      ...doctor,
      availability: assignedPatients.length > 0 && doctor.availability === 'Busy / on call' ? 'Free now' : doctor.availability,
      nextSlot: assignedPatients.length > 0 ? 'Available for new patients' : doctor.nextSlot,
      patientNames: [],
    };
  }), [patientRecords]);

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();
    return doctors.filter(doctor => {
      const matchesQuery = !query || doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query) || doctor.hospital.toLowerCase().includes(query);
      const matchesSpecialty = specialty === 'All specialties' || doctor.specialty === specialty;
      const matchesAvailability = availability === 'All availability' || doctor.availability === availability;
      return matchesQuery && matchesSpecialty && matchesAvailability;
    });
  }, [doctors, search, specialty, availability]);

  const selectedDoctor = selectedDoctorId
    ? doctors.find(doctor => doctor.id === selectedDoctorId) ?? null
    : null;
  const freeNowCount = doctors.filter(doctor => doctor.availability === 'Free now').length;
  const todayCount = doctors.filter(doctor => doctor.availability === 'Available today').length;
  const busyCount = doctors.filter(doctor => doctor.availability === 'Busy / on call').length;

  const clearFilters = () => {
    setSearch('');
    setSpecialty('All specialties');
    setAvailability('All availability');
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Find a Doctor</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Browse doctors by name, specialty, and availability.</p>
        </div>
        {selectedDoctor ? (
          <button
            type="button"
            onClick={() => setSelectedDoctorId(null)}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <ArrowLeft size={16} /> Back to doctor list
          </button>
        ) : (
          <button
            type="button"
            onClick={() => directoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-muted"
          >
            <Users size={14} /> Doctor Profiles
          </button>
        )}
      </div>

      {selectedDoctor ? (
        <article className="card-base overflow-hidden">
          <div className="bg-primary/5 border-b border-border p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-white"><Stethoscope size={30} /></div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedDoctor.name}</h2>
                  <p className="mt-1 text-primary font-semibold">{selectedDoctor.specialty}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedDoctor.qualifications}</p>
                </div>
              </div>
              <span className={`badge-base self-start border ${availabilityStyles[selectedDoctor.availability]}`}>{selectedDoctor.availability}</span>
            </div>
          </div>
          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
            <section>
              <h3 className="mb-3 font-semibold text-foreground">Profile</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{selectedDoctor.biography}</p>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p><span className="font-medium text-foreground">Hospital:</span> {selectedDoctor.hospital}</p>
                <p><span className="font-medium text-foreground">Location:</span> {selectedDoctor.city}</p>
                <p><span className="font-medium text-foreground">Age:</span> {selectedDoctor.age}</p>
                <p><span className="font-medium text-foreground">Gender:</span> {selectedDoctor.gender}</p>
                <p><span className="font-medium text-foreground">Experience:</span> {selectedDoctor.experience} years</p>
                <p><span className="font-medium text-foreground">Next availability:</span> {selectedDoctor.nextSlot}</p>
              </div>
            </section>
            <section className="space-y-6">
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground"><Languages size={17} className="text-primary" /> Languages</h3>
                <p className="text-sm text-muted-foreground">{selectedDoctor.languages.join(', ')}</p>
              </div>
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground"><Award size={17} className="text-primary" /> Achievements</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {selectedDoctor.achievements.map(achievement => <li key={achievement}>{achievement}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground"><Users size={17} className="text-primary" /> Active patients</h3>
                {selectedDoctor.patientNames.length > 0
                  ? <p className="text-sm text-muted-foreground">{selectedDoctor.patientNames.join(', ')}</p>
                  : <p className="text-sm text-muted-foreground">No active patient assignments.</p>}
              </div>
            </section>
          </div>
          <p className="border-t border-border px-6 py-3 text-xs text-muted-foreground">Sample directory information; update with verified doctor records.</p>
        </article>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="card-base p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary text-primary flex items-center justify-center"><Stethoscope size={19} /></div>
              <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total doctors</p><p className="text-2xl font-extrabold tabular-nums">{doctors.length}+</p></div>
            </div>
            <div className="card-base p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center"><UserRoundCheck size={19} /></div>
              <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Free right now</p><p className="text-2xl font-extrabold tabular-nums">{freeNowCount}</p></div>
            </div>
            <div className="card-base p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center"><CalendarDays size={19} /></div>
              <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Available today</p><p className="text-2xl font-extrabold tabular-nums">{todayCount}</p></div>
            </div>
            <div className="card-base p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center"><Clock3 size={19} /></div>
              <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Busy doctors</p><p className="text-2xl font-extrabold tabular-nums">{busyCount}</p></div>
            </div>
          </div>
          <section ref={directoryRef} className="card-base p-4 sm:p-5 scroll-mt-4" aria-label="Search and filter doctor profiles">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(190px,1fr)_minmax(190px,1fr)]">
              <label className="relative block">
                <span className="sr-only">Search doctor name or specialty</span>
                <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search doctor by name or specialty..." className="w-full rounded-lg border border-border bg-input py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </label>
              <label>
                <span className="sr-only">Filter by specialty</span>
                <select value={specialty} onChange={event => setSpecialty(event.target.value)} className="select-field w-full text-sm">
                  <option value="All specialties">All specialties</option>
                  {DOCTOR_SPECIALTIES.map(item => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label>
                <span className="sr-only">Filter by availability</span>
                <select value={availability} onChange={event => setAvailability(event.target.value as 'All availability' | DoctorAvailability)} className="select-field w-full text-sm">
                  <option value="All availability">All availability</option>
                  <option value="Free now">Free now</option>
                  <option value="Available today">Available today</option>
                  <option value="Busy / on call">Busy / on call</option>
                </select>
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">Showing <span className="font-semibold text-foreground">{filteredDoctors.length}</span> of {doctors.length}+ doctor profiles</p>
              {(search || specialty !== 'All specialties' || availability !== 'All availability') && (
                <button type="button" onClick={clearFilters} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">Clear filters</button>
              )}
            </div>
          </section>
          {filteredDoctors.length === 0 ? (
            <div className="card-base p-12 text-center">
              <Search size={36} className="mx-auto mb-3 text-muted-foreground/40" />
              <p className="font-semibold text-foreground mb-1">No doctors found</p>
              <p className="text-sm text-muted-foreground">Try another name or specialty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredDoctors.map(doctor => (
                <button key={doctor.id} type="button" onClick={() => setSelectedDoctorId(doctor.id)} className="card-base p-5 text-left transition-colors hover:border-primary/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl gradient-primary text-white"><Stethoscope size={22} /></div>
                      <div className="min-w-0">
                        <h2 className="truncate font-bold text-foreground">{doctor.name}</h2>
                        <p className="text-sm font-medium text-primary">{doctor.specialty}</p>
                      </div>
                    </div>
                    <span className={`badge-base self-start border ${availabilityStyles[doctor.availability]}`}>{doctor.availability}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <p>{doctor.gender} · Age {doctor.age}</p>
                    <p>{doctor.experience} years experience</p>
                    <p className="col-span-2 flex items-center gap-1"><MapPin size={14} className="text-primary" />{doctor.hospital}, {doctor.city}</p>
                    <p className="col-span-2">{doctor.nextSlot}</p>
                  </div>
                  <span className="mt-4 inline-block text-xs font-semibold text-primary">View full profile →</span>
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">Profiles beyond the original directory are demonstration records; verify all details before clinical use.</p>
        </>
      )}
    </div>
  );
}
