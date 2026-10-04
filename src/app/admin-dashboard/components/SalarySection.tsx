'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, CircleDollarSign, Download, Plus, Users } from 'lucide-react';
import { DOCTORS, DOCTOR_SPECIALTIES } from '../lib/doctorsData';

interface SalaryEntry {
  amount: string;
  paidAt: string | null;
}

interface HolidayEntry {
  id: string;
  date: string;
  name: string;
}

const SALARIES_STORAGE_KEY = 'mediconnect-doctor-salaries';
const HOLIDAYS_STORAGE_KEY = 'mediconnect-hospital-holidays';

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function formatMonth(month: string) {
  return new Date(`${month}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export default function SalarySection() {
  const [department, setDepartment] = useState(DOCTOR_SPECIALTIES[0] ?? '');
  const [month, setMonth] = useState(getCurrentMonth);
  const [salaryRecords, setSalaryRecords] = useState<Record<string, SalaryEntry>>({});
  const [holidays, setHolidays] = useState<HolidayEntry[]>([]);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayName, setHolidayName] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    try {
      const storedSalaries = window.localStorage.getItem(SALARIES_STORAGE_KEY);
      const storedHolidays = window.localStorage.getItem(HOLIDAYS_STORAGE_KEY);
      if (storedSalaries) setSalaryRecords(JSON.parse(storedSalaries) as Record<string, SalaryEntry>);
      if (storedHolidays) setHolidays(JSON.parse(storedHolidays) as HolidayEntry[]);
    } catch {
      setStorageError('Saved salary or holiday data could not be read. Check browser storage before continuing.');
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(SALARIES_STORAGE_KEY, JSON.stringify(salaryRecords));
      window.localStorage.setItem(HOLIDAYS_STORAGE_KEY, JSON.stringify(holidays));
    } catch {
      setStorageError('Changes could not be saved to browser storage.');
    }
  }, [salaryRecords, holidays, loaded]);

  const departmentDoctors = useMemo(
    () => DOCTORS.filter(doctor => doctor.specialty === department),
    [department],
  );

  const selectedMonthRecords = departmentDoctors.map(doctor => ({
    doctor,
    entry: salaryRecords[`${month}:${doctor.id}`] ?? { amount: '', paidAt: null },
  }));
  const paidCount = selectedMonthRecords.filter(({ entry }) => Boolean(entry.paidAt)).length;
  const totalSalary = selectedMonthRecords.reduce((total, { entry }) => total + (Number(entry.amount) || 0), 0);
  const hasUnpaidSalaries = selectedMonthRecords.some(({ entry }) => !entry.paidAt);
  const canPayDepartment = hasUnpaidSalaries &&
    selectedMonthRecords.every(({ entry }) => Boolean(entry.paidAt) || Number(entry.amount) > 0);

  const updateSalary = (doctorId: string, amount: string) => {
    const recordKey = `${month}:${doctorId}`;
    setSalaryRecords(current => ({
      ...current,
      [recordKey]: { amount, paidAt: current[recordKey]?.paidAt ?? null },
    }));
    setStorageError('');
  };

  const markDepartmentPaid = () => {
    if (!canPayDepartment) return;
    const paidAt = new Date().toISOString();
    setSalaryRecords(current => {
      const updated = { ...current };
      departmentDoctors.forEach(doctor => {
        const key = `${month}:${doctor.id}`;
        const entry = updated[key] ?? { amount: '', paidAt: null };
        if (!entry.paidAt) updated[key] = { ...entry, paidAt };
      });
      return updated;
    });
    setStorageError('');
  };

  const exportSalary = async () => {
    try {
      const XLSX = await import('xlsx');
      const salaryRows = selectedMonthRecords.map(({ doctor, entry }) => ({
        Department: doctor.specialty,
        Doctor: doctor.name,
        Month: formatMonth(month),
        'Monthly Salary (INR)': Number(entry.amount) || 0,
        'Payment Status': entry.paidAt ? 'Done' : 'Pending',
        'Paid On': entry.paidAt ? new Date(entry.paidAt).toLocaleDateString('en-IN') : '',
      }));
      const workbook = XLSX.utils.book_new();
      const registerSheet = XLSX.utils.json_to_sheet(salaryRows);
      registerSheet['!cols'] = [
        { wch: 24 },
        { wch: 28 },
        { wch: 20 },
        { wch: 22 },
        { wch: 18 },
        { wch: 16 },
      ];
      XLSX.utils.book_append_sheet(workbook, registerSheet, 'Salary Register');

      const summarySheet = XLSX.utils.json_to_sheet([
        { Metric: 'Department', Value: department },
        { Metric: 'Salary month', Value: formatMonth(month) },
        { Metric: 'Doctors', Value: departmentDoctors.length },
        { Metric: 'Paid', Value: paidCount },
        { Metric: 'Pending', Value: departmentDoctors.length - paidCount },
        { Metric: 'Total monthly salary (INR)', Value: totalSalary },
        { Metric: 'Exported on', Value: new Date().toLocaleDateString('en-IN') },
      ]);
      summarySheet['!cols'] = [{ wch: 30 }, { wch: 28 }];
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      XLSX.writeFile(workbook, `MediConnect_Salaries_${department.replace(/[^a-z0-9]+/gi, '-')}_${month}.xlsx`);
      setStorageError('');
    } catch (error) {
      setStorageError(error instanceof Error ? `Salary export failed: ${error.message}` : 'Salary export failed. Please try again.');
    }
  };

  const addHoliday = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedName = holidayName.trim();
    if (!holidayDate || !normalizedName) return;
    setHolidays(current => [...current, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date: holidayDate,
      name: normalizedName,
    }].sort((a, b) => a.date.localeCompare(b.date)));
    setHolidayDate('');
    setHolidayName('');
    setStorageError('');
  };

  const removeHoliday = (holidayId: string) => {
    setHolidays(current => current.filter(holiday => holiday.id !== holidayId));
    setStorageError('');
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">Salaries & Holidays</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage monthly doctor salary records and the hospital holiday calendar.</p>
        </div>
        <button type="button" onClick={exportSalary} disabled={!loaded} className="btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-50">
          <Download size={16} /> Export Salary
        </button>
      </div>

      {storageError && (
        <p role="alert" className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{storageError}</p>
      )}

      <section className="card-base space-y-5 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="section-header flex items-center gap-2"><CircleDollarSign size={18} className="text-primary" /> Doctor salaries</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose a department to list its doctors, enter each monthly salary, then mark the department paid.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-muted-foreground">
              Department
              <select value={department} onChange={event => setDepartment(event.target.value)} className="select-field mt-1 block min-w-48 text-sm">
                {DOCTOR_SPECIALTIES.map(specialty => <option key={specialty} value={specialty}>{specialty}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-muted-foreground">
              Salary month
              <input type="month" value={month} onChange={event => setMonth(event.target.value)} className="input-field mt-1 block text-sm" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-muted/60 p-4"><p className="text-xs font-semibold uppercase text-muted-foreground">Doctors</p><p className="mt-1 text-2xl font-extrabold tabular-nums">{departmentDoctors.length}</p></div>
          <div className="rounded-xl bg-muted/60 p-4"><p className="text-xs font-semibold uppercase text-muted-foreground">Paid for {formatMonth(month)}</p><p className="mt-1 text-2xl font-extrabold tabular-nums">{paidCount} / {departmentDoctors.length}</p></div>
          <div className="rounded-xl bg-muted/60 p-4"><p className="text-xs font-semibold uppercase text-muted-foreground">Department total</p><p className="mt-1 text-2xl font-extrabold tabular-nums">₹{totalSalary.toLocaleString('en-IN')}</p></div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="table-header-cell">Doctor</th>
                <th className="table-header-cell">Department</th>
                <th className="table-header-cell">Monthly salary (₹)</th>
                <th className="table-header-cell">Payment status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {selectedMonthRecords.map(({ doctor, entry }) => (
                <tr key={doctor.id}>
                  <td className="table-cell font-medium text-foreground">{doctor.name}</td>
                  <td className="table-cell">{doctor.specialty}</td>
                  <td className="table-cell">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={entry.amount}
                      onChange={event => updateSalary(doctor.id, event.target.value)}
                      disabled={Boolean(entry.paidAt)}
                      aria-label={`Monthly salary for ${doctor.name}`}
                      placeholder="Enter amount"
                      className="input-field w-40 text-sm"
                    />
                  </td>
                  <td className="table-cell">
                    {entry.paidAt ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                        <Check size={13} /> Done · {new Date(entry.paidAt).toLocaleDateString('en-IN')}
                      </span>
                    ) : <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">Pending</span>}
                  </td>
                </tr>
              ))}
              {departmentDoctors.length === 0 && <tr><td colSpan={4} className="table-cell py-8 text-center text-muted-foreground">No doctors are listed for this department.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">Payment records are stored for the selected month. Paid salary amounts are locked to preserve the payment record.</p>
          <button type="button" onClick={markDepartmentPaid} disabled={!canPayDepartment} className="btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-50">
            <Check size={16} /> {hasUnpaidSalaries ? 'Mark department salaries paid' : 'All salaries done'}
          </button>
        </div>
      </section>

      <section className="card-base space-y-5 p-5">
        <div>
          <h2 className="section-header flex items-center gap-2"><CalendarDays size={18} className="text-primary" /> Hospital holidays</h2>
          <p className="mt-1 text-sm text-muted-foreground">Keep a shared record of upcoming hospital holidays.</p>
        </div>
        <form onSubmit={addHoliday} className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_2fr_auto]">
          <label className="text-xs font-semibold text-muted-foreground">
            Holiday date
            <input type="date" value={holidayDate} onChange={event => setHolidayDate(event.target.value)} required className="input-field mt-1 block text-sm" />
          </label>
          <label className="text-xs font-semibold text-muted-foreground">
            Holiday name
            <input type="text" value={holidayName} onChange={event => setHolidayName(event.target.value)} required maxLength={100} placeholder="e.g. Republic Day" className="input-field mt-1 block text-sm" />
          </label>
          <button type="submit" className="btn-primary justify-center"><Plus size={16} /> Add holiday</button>
        </form>
        <div className="overflow-hidden rounded-xl border border-border">
          {holidays.length ? holidays.map(holiday => (
            <div key={holiday.id} className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0">
              <div className="flex items-center gap-3">
                <CalendarDays size={16} className="text-primary" />
                <span className="text-sm font-medium text-foreground">{holiday.name}</span>
                <time className="text-sm text-muted-foreground">{new Date(`${holiday.date}T00:00:00`).toLocaleDateString('en-IN')}</time>
              </div>
              <button type="button" onClick={() => removeHoliday(holiday.id)} className="text-xs font-medium text-danger hover:underline">Remove</button>
            </div>
          )) : (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground"><Users size={16} className="mr-2 inline" />No holidays recorded yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
