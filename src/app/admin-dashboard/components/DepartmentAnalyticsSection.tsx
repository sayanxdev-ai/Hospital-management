'just like  9 sample ye sabhi number sample haa de and use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, Download, FileBarChart, Users } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ADMIN_PATIENTS_CHANGED, getPatientCareRecords, type PatientCareRecord } from '../lib/patientStorage';
import { DOCTORS, DOCTOR_SPECIALTIES } from '../lib/doctorsData';

const chartColors = [
  '#2563eb',
  '#14b8a6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
  '#f97316',
  '#6366f1',
];
const patientStatusColors: Record<string, string> = {
  Admitted: '#2563eb',
  'Awaiting Bed': '#f59e0b',
  Critical: '#dc2626',
  Discharged: '#22c55e',
  Emergency: '#ef4444',
  'In Surgery': '#8b5cf6',
  Observation: '#06b6d4',
  Outpatient: '#64748b',
  Recovery: '#14b8a6',
  Transferred: '#f97316',
  'Under Treatment': '#6366f1',
};
const patientStatusNames = Object.keys(patientStatusColors).sort((a, b) => a.localeCompare(b));

function getIllustrativeStatusCounts(departmentName: string) {
  return patientStatusNames.map((name, index) => {
    const seed = `${departmentName}:${name}`.split('').reduce(
      (value, character) => (value * 31 + character.charCodeAt(0)) >>> 0,
      7,
    );
    const value = 3 + ((seed + index * 17) % 23);
    return { name, value };
  });
}

const inactiveStatuses = new Set(['Discharged', 'Transferred']);

interface DepartmentSummary {
  name: string;
  total: number;
  active: number;
  emergency: number;
  discharged: number;
  transferred: number;
  successRateTarget: number;
  statusData: { name: string; value: number }[];
  diagnosisData: { name: string; value: number }[];
  doctorNames: string[];
}

const PATIENT_ARCHIVE_BASELINE = 12_600;
const SUCCESS_RATE_TARGET = 97;
const DEPARTMENT_CARE_LOAD = 100;
const DEPARTMENT_CARE_CAPACITY = 165;

function escapeXml(value: string) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  })[character] ?? character);
}

function makeBarChartSvg(title: string, items: { name: string; value: number }[], color: string) {
  const width = 900;
  const rowHeight = 36;
  const top = 56;
  const height = Math.max(160, top + items.length * rowHeight + 18);
  const labelX = 12;
  const barX = 330;
  const barWidth = 500;
  const maxValue = Math.max(1, ...items.map(item => item.value));
  const rows = items.map((item, index) => {
    const y = top + index * rowHeight;
    const valueWidth = item.value === 0 ? 0 : Math.max(3, item.value / maxValue * barWidth);
    const label = item.name.length > 38 ? `${item.name.slice(0, 35)}...` : item.name;
    return `<text x="${labelX}" y="${y + 19}" font-size="14" fill="#334155">${escapeXml(label)}</text><rect x="${barX}" y="${y + 4}" width="${valueWidth}" height="22" rx="5" fill="${color}"/><text x="${barX + valueWidth + 9}" y="${y + 20}" font-size="13" fill="#334155">${item.value}</text>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#ffffff"/><text x="12" y="30" font-family="Arial,sans-serif" font-size="18" font-weight="700" fill="#0f172a">${escapeXml(title)}</text>${rows || '<text x="12" y="80" font-size="14" fill="#64748b">No records</text>'}</svg>`;
}

function svgToPngDataUrl(svg: string) {
  return new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error('Could not create the chart image.'));
        return;
      }
      context.drawImage(image, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not render a chart image for the report.'));
    };
    image.src = url;
  });
}

interface ZipFile {
  name: string;
  data: Uint8Array;
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createZip(files: ZipFile[]) {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let localOffset = 0;
  let centralSize = 0;

  files.forEach(file => {
    const name = encoder.encode(file.name);
    const crc = crc32(file.data);
    const localHeader = new Uint8Array(30 + name.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint16(12, 0x21, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, file.data.length, true);
    localView.setUint32(22, file.data.length, true);
    localView.setUint16(26, name.length, true);
    localView.setUint16(28, 0, true);
    localHeader.set(name, 30);
    localParts.push(localHeader, file.data);

    const centralHeader = new Uint8Array(46 + name.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0x21, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, file.data.length, true);
    centralView.setUint32(24, file.data.length, true);
    centralView.setUint16(28, name.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, localOffset, true);
    centralHeader.set(name, 46);
    centralParts.push(centralHeader);
    centralSize += centralHeader.length;
    localOffset += localHeader.length + file.data.length;
  });

  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, localOffset, true);
  endView.setUint16(20, 0, true);
  return new Blob([...localParts, ...centralParts, end], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

function wordParagraph(text: string, options: { size?: number; bold?: boolean; color?: string } = {}) {
  const runProperties = [
    options.bold ? '<w:b/>' : '',
    options.size ? `<w:sz w:val="${options.size}"/>` : '',
    options.color ? `<w:color w:val="${options.color}"/>` : '',
  ].join('');
  return `<w:p><w:r><w:rPr>${runProperties}</w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function wordTable(headers: string[], rows: string[][]) {
  const renderRow = (cells: string[], isHeader = false) => `<w:tr>${cells.map(cell =>
    `<w:tc><w:tcPr><w:tcW w:w="${Math.floor(9000 / cells.length)}" w:type="dxa"/>${isHeader ? '<w:shd w:fill="EAF2FF"/>' : ''}</w:tcPr>${wordParagraph(cell, { size: 18, bold: isHeader })}</w:tc>`
  ).join('')}</w:tr>`;
  const borders = '<w:tblBorders><w:top w:val="single" w:sz="4" w:color="CBD5E1"/><w:left w:val="single" w:sz="4" w:color="CBD5E1"/><w:bottom w:val="single" w:sz="4" w:color="CBD5E1"/><w:right w:val="single" w:sz="4" w:color="CBD5E1"/><w:insideH w:val="single" w:sz="4" w:color="CBD5E1"/><w:insideV w:val="single" w:sz="4" w:color="CBD5E1"/></w:tblBorders>';
  return `<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/>${borders}</w:tblPr>${renderRow(headers, true)}${rows.map(row => renderRow(row)).join('')}</w:tbl>`;
}

function wordImageParagraph(relationshipId: string, imageNumber: number, height: number) {
  const width = 5_943_600;
  const imageHeight = Math.round(width * height / 900);
  return `<w:p><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${width}" cy="${imageHeight}"/><wp:docPr id="${imageNumber}" name="Department chart ${imageNumber}"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="${imageNumber}" name="Chart ${imageNumber}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${relationshipId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${width}" cy="${imageHeight}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
}

function pngDataUrlToBytes(dataUrl: string) {
  const encoded = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const binary = atob(encoded);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function downloadWordDocument(documentBody: string, images: ZipFile[]) {
  const relationshipXml = images.map((image, index) =>
    `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${image.name.split('/').pop()}"/>`
  ).join('');
  const contentTypes = '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>';
  const rootRelationships = '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
  const documentRelationships = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relationshipXml}</Relationships>`;
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>${documentBody}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="720" w:right="900" w:bottom="720" w:left="900" w:header="360" w:footer="360" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  const encoder = new TextEncoder();
  const blob = createZip([
    { name: '[Content_Types].xml', data: encoder.encode(contentTypes) },
    { name: '_rels/.rels', data: encoder.encode(rootRelationships) },
    { name: 'word/document.xml', data: encoder.encode(documentXml) },
    { name: 'word/_rels/document.xml.rels', data: encoder.encode(documentRelationships) },
    ...images,
  ]);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `MediConnect_Department_Analysis_${new Date().toISOString().slice(0, 10)}.docx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function DepartmentAnalyticsSection() {
  const [patients, setPatients] = useState<PatientCareRecord[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState(DOCTOR_SPECIALTIES[0] ?? '');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    const refreshPatients = () => setPatients(getPatientCareRecords());
    refreshPatients();
    window.addEventListener(ADMIN_PATIENTS_CHANGED, refreshPatients);
    window.addEventListener('storage', refreshPatients);
    return () => {
      window.removeEventListener(ADMIN_PATIENTS_CHANGED, refreshPatients);
      window.removeEventListener('storage', refreshPatients);
    };
  }, []);

  const departmentNames = useMemo(() => Array.from(new Set([
    ...DOCTOR_SPECIALTIES,
    ...patients.map(patient => patient.department?.trim()).filter((name): name is string => Boolean(name)),
  ])).sort((a, b) => a.localeCompare(b)), [patients]);

  useEffect(() => {
    if (!departmentNames.includes(selectedDepartment) && departmentNames.length) {
      setSelectedDepartment(departmentNames[0]);
    }
  }, [departmentNames, selectedDepartment]);

  const departments = useMemo<DepartmentSummary[]>(() => departmentNames.map(name => {
    const departmentPatients = patients.filter(patient => patient.department?.trim() === name);
    const statusCounts = new Map<string, number>();
    const diagnosisCounts = new Map<string, number>();
    departmentPatients.forEach(patient => {
      statusCounts.set(patient.status, (statusCounts.get(patient.status) ?? 0) + 1);
      const diagnosis = patient.diagnosis?.trim() || 'Unspecified';
      diagnosisCounts.set(diagnosis, (diagnosisCounts.get(diagnosis) ?? 0) + 1);
    });
    const discharged = statusCounts.get('Discharged') ?? 0;
    const transferred = statusCounts.get('Transferred') ?? 0;
    const doctorNames = DOCTORS.filter(doctor => doctor.specialty.toLowerCase() === name.toLowerCase()).map(doctor => doctor.name);
    return {
      name,
      total: departmentPatients.length,
      active: departmentPatients.filter(patient => !inactiveStatuses.has(patient.status)).length,
      emergency: statusCounts.get('Emergency') ?? 0,
      discharged,
      transferred,
      successRateTarget: SUCCESS_RATE_TARGET,
      statusData: Array.from(new Set([...patientStatusNames, ...statusCounts.keys()]))
        .sort((a, b) => a.localeCompare(b))
        .map(status => ({ name: status, value: statusCounts.get(status) ?? 0 })),
      diagnosisData: Array.from(diagnosisCounts, ([diagnosis, value]) => ({ name: diagnosis, value }))
        .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name)),
      doctorNames,
    };
  }), [departmentNames, patients]);

  const selected = departments.find(department => department.name === selectedDepartment);

  const exportAllDepartments = async () => {
    setExporting(true);
    setExportError('');
    try {
      const chartFiles: ZipFile[] = [];
      const totalPatients = departments.reduce((total, department) => total + department.total, 0);
      const body: string[] = [
        wordParagraph('MediConnect Department Analysis', { size: 36, bold: true, color: '1D4ED8' }),
        wordParagraph(`Generated ${new Date().toLocaleString('en-IN')}`),
        wordParagraph(`Current patient-list records: ${totalPatients} · Departments included: ${departments.length}`),
        wordParagraph('*The success rate shown is a 97% target benchmark, not a measured clinical outcome. Active and emergency counts are calculated from current patient-list records.', { size: 18 }),
        wordParagraph('All department summary', { size: 28, bold: true, color: '0F766E' }),
        wordTable(
          ['Department', 'Records', 'Active', 'Emergency', 'Discharged', 'Success target*'],
          departments.map(department => [department.name, String(department.total), String(department.active), String(department.emergency), String(department.discharged), `${department.successRateTarget}%`]),
        ),
      ];

      for (const [departmentIndex, department] of departments.entries()) {
        if (departmentIndex > 0) body.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
        body.push(
          wordParagraph(department.name, { size: 30, bold: true, color: '0F766E' }),
          wordTable(
            ['Metric', 'Value'],
            [
              ['Patient records', String(department.total)],
              ['Active patients', String(department.active)],
              ['Emergency', String(department.emergency)],
              ['Discharged', String(department.discharged)],
              ['Transferred', String(department.transferred)],
              ['Success rate target*', `${department.successRateTarget}%`],
              ['Doctors in directory', department.doctorNames.join(', ') || 'No matching doctor profiles'],
            ],
          ),
          wordParagraph('Patient status chart', { size: 22, bold: true }),
        );

        const statusHeight = Math.max(160, 56 + department.statusData.length * 36 + 18);
        const statusPng = await svgToPngDataUrl(
          makeBarChartSvg(`${department.name} - Patient status`, department.statusData, '#2563eb'),
        );
        const statusImageNumber = chartFiles.length + 1;
        const statusImage = `word/media/chart-${statusImageNumber}.png`;
        chartFiles.push({ name: statusImage, data: pngDataUrlToBytes(statusPng) });
        body.push(
          wordImageParagraph(`rId${statusImageNumber}`, statusImageNumber, statusHeight),
          wordTable(
            ['Patient status', 'Records'],
            department.statusData.length
              ? department.statusData.map(item => [item.name, String(item.value)])
              : [['No patient records', '0']],
          ),
          wordParagraph('Disease / diagnosis chart', { size: 22, bold: true }),
        );

        const diagnosisHeight = Math.max(160, 56 + department.diagnosisData.length * 36 + 18);
        const diagnosisPng = await svgToPngDataUrl(
          makeBarChartSvg(`${department.name} - Diagnoses`, department.diagnosisData, '#14b8a6'),
        );
        const diagnosisImageNumber = chartFiles.length + 1;
        const diagnosisImage = `word/media/chart-${diagnosisImageNumber}.png`;
        chartFiles.push({ name: diagnosisImage, data: pngDataUrlToBytes(diagnosisPng) });
        body.push(
          wordImageParagraph(`rId${diagnosisImageNumber}`, diagnosisImageNumber, diagnosisHeight),
          wordTable(
            ['Disease / diagnosis', 'Records'],
            department.diagnosisData.length
              ? department.diagnosisData.map(item => [item.name, String(item.value)])
              : [['No diagnosis records', '0']],
          ),
        );
      }

      body.push(wordParagraph('*Success rate is a target benchmark only; verified clinical outcome data is not recorded by this app.', { size: 18 }));
      downloadWordDocument(body.join(''), chartFiles);
    } catch (error) {
      setExportError(error instanceof Error ? `Word export failed: ${error.message}` : 'Word export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const statusChartData = selected ? getIllustrativeStatusCounts(selected.name) : [];
  const statusChartSlices = statusChartData.filter(status => status.value > 0);
  const diagnosisChartData = selected?.diagnosisData ?? [];
  const activePatientCount = patients.filter(patient => !inactiveStatuses.has(patient.status)).length;
  const emergencyPatientCount = patients.filter(patient => patient.status === 'Emergency').length;
  const archivePatientCount = Math.max(PATIENT_ARCHIVE_BASELINE, patients.length);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">Department Analytics</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Choose a department to open its patient workload, status, diagnosis and care metrics.</p>
        </div>
        <button type="button" onClick={exportAllDepartments} disabled={exporting || departments.length === 0} className="btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-50">
          <Download size={16} /> {exporting ? 'Preparing export…' : 'Export Data'}
        </button>
      </div>

      {exportError && <p role="alert" className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{exportError}</p>}

      <section className="card-base flex flex-col gap-4 border-primary/15 bg-gradient-to-r from-primary/5 via-card to-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <label htmlFor="department-analytics-filter" className="text-sm font-bold text-foreground">Select department</label>
          <p className="mt-1 text-xs text-muted-foreground">Your selection opens the detailed analytics for that department.</p>
        </div>
        <select
          id="department-analytics-filter"
          value={selectedDepartment}
          onChange={event => setSelectedDepartment(event.target.value)}
          className="select-field min-w-56 text-sm font-semibold"
        >
          {departmentNames.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
      </section>

      <section aria-label="Hospital-wide patient overview" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card-base overflow-hidden border-primary/15 bg-gradient-to-br from-primary/10 via-card to-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Patient records · archive</p>
              <p className="mt-2 text-3xl font-extrabold tabular-nums text-foreground">{archivePatientCount.toLocaleString('en-IN')}+</p>
              <p className="mt-1 text-xs text-muted-foreground">Archive reference · live count below</p>
            </div>
            <div className="rounded-xl bg-primary/10 p-3 text-primary"><Users size={20} /></div>
          </div>
        </div>
        <div className="card-base border-info/15 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active patients</p>
              <p className="mt-2 text-3xl font-extrabold tabular-nums text-foreground">{activePatientCount.toLocaleString('en-IN')}</p>
              <p className="mt-1 text-xs text-muted-foreground">From the current patient list</p>
            </div>
            <div className="rounded-xl bg-info/10 p-3 text-info"><Activity size={20} /></div>
          </div>
        </div>
        <div className="card-base border-danger/15 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Emergency patients</p>
              <p className="mt-2 text-3xl font-extrabold tabular-nums text-foreground">{emergencyPatientCount.toLocaleString('en-IN')}</p>
              <p className="mt-1 text-xs text-muted-foreground">Live count from patient statuses</p>
            </div>
            <div className="rounded-xl bg-danger/10 p-3 text-danger"><AlertTriangle size={20} /></div>
          </div>
        </div>
        <div className="card-base border-success/15 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Success rate target</p>
              <p className="mt-2 text-3xl font-extrabold tabular-nums text-foreground">{SUCCESS_RATE_TARGET}%</p>
              <p className="mt-1 text-xs text-muted-foreground">Benchmark target, not a measured outcome</p>
            </div>
            <div className="rounded-xl bg-success/10 p-3 text-success"><FileBarChart size={20} /></div>
          </div>
        </div>
      </section>

      {selected && (
        <>
          <div className="flex flex-col gap-1 border-l-4 border-primary pl-4">
            <h2 className="text-xl font-bold text-foreground">{selected.name} overview</h2>
            <p className="text-sm text-muted-foreground">Detailed patient analytics for the selected department.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="card-base flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary"><Users size={19} /></div>
              <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Department records</p><p className="text-2xl font-extrabold tabular-nums">{selected.total}</p></div>
            </div>
            <div className="card-base flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info"><Activity size={19} /></div>
              <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active patients</p><p className="text-2xl font-extrabold tabular-nums">{selected.active}</p></div>
            </div>
            <div className="card-base flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10 text-danger"><AlertTriangle size={19} /></div>
              <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Emergency</p><p className="text-2xl font-extrabold tabular-nums">{selected.emergency}</p></div>
            </div>
            <div className="card-base flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success"><FileBarChart size={19} /></div>
              <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Success rate target</p><p className="text-2xl font-extrabold tabular-nums">{selected.successRateTarget}%</p></div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <section className="card-base p-5">
              <div className="mb-3">
                <h2 className="section-header mb-1">Patient status mix</h2>
                <p className="text-xs text-muted-foreground">Illustrative distribution with a distinct color for every status; figures are not live patient counts.</p>
              </div>
              {statusChartSlices.length ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartSlices}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={96}
                        paddingAngle={1}
                        isAnimationActive={false}
                      >
                        {statusChartSlices.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={patientStatusColors[entry.name] ?? chartColors[index % chartColors.length]}
                            stroke="#fff"
                            strokeWidth={1}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Patients']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="py-16 text-center text-sm text-muted-foreground">No patient records are currently assigned to this department.</p>}
              <div className="mt-1 grid grid-cols-1 gap-x-4 gap-y-2 border-t border-border pt-3 sm:grid-cols-2">
                {statusChartData.map(status => (
                  <div key={status.name} className="flex min-w-0 items-center justify-between gap-3 text-xs">
                    <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: patientStatusColors[status.name] ?? '#94a3b8' }}
                      />
                      <span className="truncate">{status.name}</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="card-base p-5">
              <h2 className="section-header mb-1">Diagnosis distribution</h2>
              <p className="mb-3 text-xs text-muted-foreground">Most frequent recorded diagnoses in this department.</p>
              {diagnosisChartData.length ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={diagnosisChartData} layout="vertical" margin={{ top: 4, right: 18, left: 8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" width={112} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="value" name="Patients" radius={[0, 5, 5, 0]}>
                        {diagnosisChartData.map((entry, index) => (
                          <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="py-16 text-center text-sm text-muted-foreground">No diagnosis data is available for this department.</p>}
              {diagnosisChartData.length > 0 && (
                <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 border-t border-border pt-3 sm:grid-cols-2">
                  {diagnosisChartData.map((diagnosis, index) => (
                    <div key={diagnosis.name} className="flex min-w-0 items-center justify-between gap-3 text-xs">
                      <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                        <span
                          aria-hidden="true"
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: chartColors[index % chartColors.length] }}
                        />
                        <span className="truncate" title={diagnosis.name}>{diagnosis.name}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="card-base p-5">
              <h2 className="section-header mb-1">Care load</h2>
              <p className="mb-3 text-xs text-muted-foreground">Department care-load indicator against the 165 capacity reference.</p>
              <div className="relative h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    data={[{ name: 'Care load', value: DEPARTMENT_CARE_LOAD, fill: '#2563eb' }]}
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="95%"
                    startAngle={90}
                    endAngle={-270}
                    barSize={18}
                  >
                    <PolarAngleAxis type="number" domain={[0, DEPARTMENT_CARE_CAPACITY]} tick={false} />
                    <RadialBar background dataKey="value" cornerRadius={12} />
                    <Tooltip formatter={(value) => [`${value} / ${DEPARTMENT_CARE_CAPACITY}`, 'Care load']} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold tabular-nums text-foreground">{DEPARTMENT_CARE_LOAD}</span>
                  <span className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">of {DEPARTMENT_CARE_CAPACITY} capacity</span>
                  <span className="mt-2 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    {Math.round(DEPARTMENT_CARE_LOAD / DEPARTMENT_CARE_CAPACITY * 100)}% load
                  </span>
                </div>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-3 border-t border-border pt-3">
                <div className="flex items-center gap-2 text-xs">
                  <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-muted-foreground">In use</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-muted-foreground/30" />
                  <span className="text-muted-foreground">Available</span>
                </div>
              </div>
            </section>
          </div>

          <section className="card-base overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h2 className="section-header">{selected.name} department summary</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/50">
                  <tr><th className="table-header-cell">Metric</th><th className="table-header-cell">Value</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="table-cell">Department records</td><td className="table-cell tabular-nums">{selected.total}</td></tr>
                  <tr><td className="table-cell">Active patients</td><td className="table-cell tabular-nums">{selected.active}</td></tr>
                  <tr><td className="table-cell">Emergency</td><td className="table-cell tabular-nums">{selected.emergency}</td></tr>
                  <tr><td className="table-cell">Care load</td><td className="table-cell tabular-nums">{DEPARTMENT_CARE_LOAD} / {DEPARTMENT_CARE_CAPACITY}</td></tr>
                  <tr><td className="table-cell">Discharged</td><td className="table-cell tabular-nums">{selected.discharged}</td></tr>
                  <tr><td className="table-cell">Transferred</td><td className="table-cell tabular-nums">{selected.transferred}</td></tr>
                  <tr><td className="table-cell">Success rate target</td><td className="table-cell tabular-nums">{selected.successRateTarget}%</td></tr>
                  <tr><td className="table-cell">Doctors in directory</td><td className="table-cell">{selected.doctorNames.length ? selected.doctorNames.join(', ') : 'No matching doctor profiles'}</td></tr>
                  {selected.diagnosisData.map(diagnosis => (
                    <tr key={diagnosis.name}><td className="table-cell">Diagnosis: {diagnosis.name}</td><td className="table-cell tabular-nums">{diagnosis.value}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
              *12,600+ is an archive reference, not the count of rows in the current patient list. The 97% success rate is a target benchmark, not a measured outcome. Emergency and active patient totals reflect the current patient list.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
