import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  HeadingLevel,
} from "docx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { LaporanData } from "./api";

function formatCurrency(val: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}

function getReportTitle(): string {
  const now = new Date();
  return `Laporan Keuangan - ${new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(now)}`;
}

function getTimestamp(): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function getFilename(ext: string): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return `laporan-keuangan-${dateStr}.${ext}`;
}

// ──────────────────────────────────────────────
// EXCEL EXPORT
// ──────────────────────────────────────────────
export function exportToExcel(data: LaporanData[]): void {
  const title = getReportTitle();

  const totalDebit = data.reduce((s, d) => s + (d.debit || 0), 0);
  const totalKredit = data.reduce((s, d) => s + (d.kredit || 0), 0);
  const lastSaldo = data.length > 0 ? data[0].sisa_saldo : 0;

  // Build worksheet data
  const wsData: (string | number)[][] = [
    [title],
    [`Dicetak pada: ${getTimestamp()}`],
    [],
    ["No", "Tanggal", "Keterangan", "Debit (Rp)", "Kredit (Rp)", "Sisa Saldo (Rp)"],
  ];

  data.forEach((item, i) => {
    wsData.push([
      i + 1,
      item.tanggal,
      item.keterangan,
      item.debit || 0,
      item.kredit || 0,
      item.sisa_saldo,
    ]);
  });

  // Summary rows
  wsData.push([]);
  wsData.push(["", "", "Total", totalDebit, totalKredit, lastSaldo]);

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws["!cols"] = [
    { wch: 5 },  // No
    { wch: 15 }, // Tanggal
    { wch: 35 }, // Keterangan
    { wch: 18 }, // Debit
    { wch: 18 }, // Kredit
    { wch: 20 }, // Sisa Saldo
  ];

  // Merge title row
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Laporan Keuangan");

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, getFilename("xlsx"));
}

// ──────────────────────────────────────────────
// WORD EXPORT
// ──────────────────────────────────────────────
export async function exportToWord(data: LaporanData[]): Promise<void> {
  const title = getReportTitle();
  const totalDebit = data.reduce((s, d) => s + (d.debit || 0), 0);
  const totalKredit = data.reduce((s, d) => s + (d.kredit || 0), 0);
  const lastSaldo = data.length > 0 ? data[0].sisa_saldo : 0;

  const borderStyle = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: "999999",
  };
  const borders = {
    top: borderStyle,
    bottom: borderStyle,
    left: borderStyle,
    right: borderStyle,
  };

  function headerCell(text: string, width: number): TableCell {
    return new TableCell({
      width: { size: width, type: WidthType.PERCENTAGE },
      borders,
      shading: {
        type: ShadingType.SOLID,
        color: "4338ca",
        fill: "4338ca",
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({
              text,
              bold: true,
              color: "ffffff",
              size: 20,
              font: "Arial",
            }),
          ],
        }),
      ],
    });
  }

  function dataCell(
    text: string,
    width: number,
    opts?: { bold?: boolean; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; color?: string; shading?: string }
  ): TableCell {
    return new TableCell({
      width: { size: width, type: WidthType.PERCENTAGE },
      borders,
      shading: opts?.shading
        ? { type: ShadingType.SOLID, color: opts.shading, fill: opts.shading }
        : undefined,
      children: [
        new Paragraph({
          alignment: opts?.align ?? AlignmentType.LEFT,
          spacing: { before: 40, after: 40 },
          children: [
            new TextRun({
              text,
              bold: opts?.bold ?? false,
              color: opts?.color ?? "333333",
              size: 19,
              font: "Arial",
            }),
          ],
        }),
      ],
    });
  }

  // Header row
  const headerRow = new TableRow({
    children: [
      headerCell("No", 6),
      headerCell("Tanggal", 14),
      headerCell("Keterangan", 30),
      headerCell("Debit (Rp)", 17),
      headerCell("Kredit (Rp)", 17),
      headerCell("Sisa Saldo (Rp)", 16),
    ],
  });

  // Data rows
  const dataRows = data.map((item, i) => {
    const rowShading = i % 2 === 0 ? undefined : "f3f4f6";
    return new TableRow({
      children: [
        dataCell(String(i + 1), 6, { align: AlignmentType.CENTER, shading: rowShading }),
        dataCell(item.tanggal, 14, { shading: rowShading }),
        dataCell(item.keterangan, 30, { shading: rowShading }),
        dataCell(item.debit ? formatCurrency(item.debit) : "-", 17, {
          align: AlignmentType.RIGHT,
          color: item.debit ? "059669" : "999999",
          shading: rowShading,
        }),
        dataCell(item.kredit ? formatCurrency(item.kredit) : "-", 17, {
          align: AlignmentType.RIGHT,
          color: item.kredit ? "dc2626" : "999999",
          shading: rowShading,
        }),
        dataCell(formatCurrency(item.sisa_saldo), 16, {
          align: AlignmentType.RIGHT,
          bold: true,
          color: "1e40af",
          shading: rowShading,
        }),
      ],
    });
  });

  // Summary row
  const summaryRow = new TableRow({
    children: [
      new TableCell({
        width: { size: 50, type: WidthType.PERCENTAGE },
        columnSpan: 3,
        borders,
        shading: { type: ShadingType.SOLID, color: "eef2ff", fill: "eef2ff" },
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({
                text: "TOTAL",
                bold: true,
                color: "4338ca",
                size: 20,
                font: "Arial",
              }),
            ],
          }),
        ],
      }),
      dataCell(formatCurrency(totalDebit), 17, {
        align: AlignmentType.RIGHT,
        bold: true,
        color: "059669",
        shading: "eef2ff",
      }),
      dataCell(formatCurrency(totalKredit), 17, {
        align: AlignmentType.RIGHT,
        bold: true,
        color: "dc2626",
        shading: "eef2ff",
      }),
      dataCell(formatCurrency(lastSaldo), 16, {
        align: AlignmentType.RIGHT,
        bold: true,
        color: "1e40af",
        shading: "eef2ff",
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: title,
                bold: true,
                color: "1e1b4b",
                size: 32,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: `Dicetak pada: ${getTimestamp()}`,
                color: "6b7280",
                size: 18,
                font: "Arial",
                italics: true,
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [headerRow, ...dataRows, summaryRow],
          }),
          new Paragraph({
            spacing: { before: 400 },
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `Total transaksi: ${data.length}`,
                color: "6b7280",
                size: 18,
                font: "Arial",
                italics: true,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, getFilename("docx"));
}

// ──────────────────────────────────────────────
// PDF EXPORT
// ──────────────────────────────────────────────
export function exportToPDF(data: LaporanData[]): void {
  const title = getReportTitle();
  const totalDebit = data.reduce((s, d) => s + (d.debit || 0), 0);
  const totalKredit = data.reduce((s, d) => s + (d.kredit || 0), 0);
  const lastSaldo = data.length > 0 ? data[0].sisa_saldo : 0;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(18);
  doc.setTextColor(30, 27, 75);
  doc.text(title, pageWidth / 2, 18, { align: "center" });

  // Subtitle
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(`Dicetak pada: ${getTimestamp()}`, pageWidth / 2, 25, {
    align: "center",
  });

  // Table data
  const tableBody = data.map((item, i) => [
    String(i + 1),
    item.tanggal,
    item.keterangan,
    item.debit ? formatCurrency(item.debit) : "-",
    item.kredit ? formatCurrency(item.kredit) : "-",
    formatCurrency(item.sisa_saldo),
  ]);

  // Summary row
  tableBody.push([
    "",
    "",
    "TOTAL",
    formatCurrency(totalDebit),
    formatCurrency(totalKredit),
    formatCurrency(lastSaldo),
  ]);

  autoTable(doc, {
    startY: 32,
    head: [["No", "Tanggal", "Keterangan", "Debit (Rp)", "Kredit (Rp)", "Sisa Saldo (Rp)"]],
    body: tableBody,
    theme: "grid",
    headStyles: {
      fillColor: [67, 56, 202],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 8.5,
      cellPadding: 2.5,
      textColor: [51, 51, 51],
    },
    alternateRowStyles: {
      fillColor: [243, 244, 246],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      1: { cellWidth: 30 },
      2: { cellWidth: "auto" },
      3: { halign: "right", cellWidth: 38 },
      4: { halign: "right", cellWidth: 38 },
      5: { halign: "right", cellWidth: 40, fontStyle: "bold" },
    },
    didParseCell: (hookData) => {
      const { row, column, cell } = hookData;
      // Style the summary row (last row)
      if (row.section === "body" && row.index === tableBody.length - 1) {
        cell.styles.fillColor = [238, 242, 255];
        cell.styles.fontStyle = "bold";
        if (column.index === 2) {
          cell.styles.halign = "right";
          cell.styles.textColor = [67, 56, 202];
        }
        if (column.index === 3) cell.styles.textColor = [5, 150, 105];
        if (column.index === 4) cell.styles.textColor = [220, 38, 38];
        if (column.index === 5) cell.styles.textColor = [30, 64, 175];
      }
      // Color debit column green
      if (row.section === "body" && column.index === 3 && row.index < tableBody.length - 1) {
        const val = data[row.index]?.debit;
        if (val) cell.styles.textColor = [5, 150, 105];
        else cell.styles.textColor = [156, 163, 175];
      }
      // Color kredit column red
      if (row.section === "body" && column.index === 4 && row.index < tableBody.length - 1) {
        const val = data[row.index]?.kredit;
        if (val) cell.styles.textColor = [220, 38, 38];
        else cell.styles.textColor = [156, 163, 175];
      }
      // Color saldo column blue
      if (row.section === "body" && column.index === 5 && row.index < tableBody.length - 1) {
        cell.styles.textColor = [30, 64, 175];
      }
    },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const finalY =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? 200;
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Total transaksi: ${data.length}`,
    pageWidth - 14,
    finalY + 8,
    { align: "right" }
  );

  doc.save(getFilename("pdf"));
}
