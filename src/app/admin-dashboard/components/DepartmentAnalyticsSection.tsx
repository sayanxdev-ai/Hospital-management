'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, Download, FileBarChart, Users } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ADMIN_PATIENTS_CHANGED, getPatientCareRecords, type PatientCareRecord } from '../lib/patientStorage';
import { DOCTORS, DOCTOR_SPECIALTIES } from '../lib/doctorsData';

const chartColors = ['#2563eb', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const activeStatuses = new Set(['Discharged', 'Transferred']);

interface DepartmentSummary {
  name: string;
  total: number;
  active: number;
  emergency: number;
  discharged: number;
  transferred: number;
  successRate: number;
  statusData: { name: string; value: number }[];
  diagnosisData: { name: string; value: number }[];
  doctorNames: string[];
}

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
      active: departmentPatients.filter(patient => !activeStatuses.has(patient.status)).length,
      emergency: statusCounts.get('Emergency') ?? 0,
      discharged,
      transferred,
      successRate: departmentPatients.length ? Math.round(discharged / departmentPatients.length * 100) : 0,
      statusData: Array.from(statusCounts, ([status, value]) => ({ name: status, value })),
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
        wordParagraph(`Total department records: ${totalPatients} · Departments included: ${departments.length}`),
        wordParagraph('*Success rate is calculated as discharged records divided by total department records. This is a discharge-rate proxy, not a verified clinical outcome rate.', { size: 18 }),
        wordParagraph('All department summary', { size: 28, bold: true, color: '0F766E' }),
        wordTable(
          ['Department', 'Records', 'Active', 'Emergency', 'Discharged', 'Success rate*'],
          departments.map(department => [department.name, String(department.total), String(department.active), String(department.emergency), String(department.discharged), `${department.successRate}%`]),
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
              ['Success rate*', `${department.successRate}%`],
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

      body.push(wordParagraph('*Discharge-rate proxy only; verified clinical outcome data is not recorded by this app.', { size: 18 }));
      downloadWordDocument(body.join(''), chartFiles);
    } catch (error) {
      setExportError(error instanceof Error ? `Word export failed: ${error.message}` : 'Word export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const statusChartData = selected?.statusData ?? [];
  const diagnosisChartData = selected?.diagnosisData ?? [];

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">Department Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choose a department to view its live patient workload, outcomes, diagnoses and doctors.</p>
        </div>
        <button type="button" onClick={exportAllDepartments} disabled={exporting || departments.length === 0} className="btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-50">
          <Download size={16} /> {exporting ? 'Preparing export…' : 'Export Data'}
        </button>
      </div>

      {exportError && <p role="alert" className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{exportError}</p>}

      <section className="card-base flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <label htmlFor="department-analytics-filter" className="text-sm font-semibold text-foreground">Department</label>
          <p className="text-xs text-muted-foreground">All metrics and charts below update for this department.</p>
        </div>
        <select id="department-analytics-filter" value={selectedDepartment} onChange={event => setSelectedDepartment(event.target.value)} className="select-field min-w-56 text-sm">
          {departmentNames.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
      </section>

      {selected && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="card-base flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary"><Users size={19} /></div>
              <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Patient records</p><p className="text-2xl font-extrabold tabular-nums">{selected.total}</p></div>
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
              <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Success rate*</p><p className="text-2xl font-extrabold tabular-nums">{selected.successRate}%</p></div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="card-base p-5">
              <h2 className="section-header mb-1">{selected.name} patient status</h2>
              <p className="mb-3 text-xs text-muted-foreground">{selected.total} records · bars show status totals for the selected department</p>
              {statusChartData.length ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusChartData} margin={{ top: 8, right: 12, left: 0, bottom: 38 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" angle={-22} textAnchor="end" interval={0} height={58} tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" name="Patient records" radius={[4, 4, 0, 0]}>
                        {statusChartData.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="py-16 text-center text-sm text-muted-foreground">No patient records are currently assigned to this department.</p>}
            </section>

            <section className="card-base p-5">
              <h2 className="section-header mb-1">{selected.name} diseases / diagnoses</h2>
              <p className="mb-3 text-xs text-muted-foreground">Diagnosis counts from current patient records; no patient list is shown.</p>
              {diagnosisChartData.length ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={diagnosisChartData} margin={{ top: 8, right: 12, left: 0, bottom: 52 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" angle={-28} textAnchor="end" interval={0} height={76} tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" name="Patient records" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="py-16 text-center text-sm text-muted-foreground">No diagnosis data is available for this department.</p>}
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
                  <tr><td className="table-cell">Patient records</td><td className="table-cell tabular-nums">{selected.total}</td></tr>
                  <tr><td className="table-cell">Active patients</td><td className="table-cell tabular-nums">{selected.active}</td></tr>
                  <tr><td className="table-cell">Emergency</td><td className="table-cell tabular-nums">{selected.emergency}</td></tr>
                  <tr><td className="table-cell">Discharged</td><td className="table-cell tabular-nums">{selected.discharged}</td></tr>
                  <tr><td className="table-cell">Transferred</td><td className="table-cell tabular-nums">{selected.transferred}</td></tr>
                  <tr><td className="table-cell">Success rate*</td><td className="table-cell tabular-nums">{selected.successRate}%</td></tr>
                  <tr><td className="table-cell">Doctors in directory</td><td className="table-cell">{selected.doctorNames.length ? selected.doctorNames.join(', ') : 'No matching doctor profiles'}</td></tr>
                  {selected.diagnosisData.map(diagnosis => (
                    <tr key={diagnosis.name}><td className="table-cell">Diagnosis: {diagnosis.name}</td><td className="table-cell tabular-nums">{diagnosis.value}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
              *Success rate is displayed as discharged records divided by total records. It is a discharge-rate proxy, not a verified clinical outcome rate; clinical outcomes are not recorded by this app.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
