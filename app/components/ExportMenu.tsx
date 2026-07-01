"use client";

import { useState, useRef, useEffect } from "react";
import type { LaporanData } from "../lib/api";
import {
  exportToExcel,
  exportToWord,
  exportToPDF,
} from "../lib/exportReport";

interface ExportMenuProps {
  data: LaporanData[];
}

export default function ExportMenu({ data }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleExport(format: "excel" | "word" | "pdf") {
    setExporting(format);
    try {
      switch (format) {
        case "excel":
          exportToExcel(data);
          break;
        case "word":
          await exportToWord(data);
          break;
        case "pdf":
          exportToPDF(data);
          break;
      }
    } catch (err) {
      alert(
        `Gagal mengexport ke ${format}: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setTimeout(() => {
        setExporting(null);
        setOpen(false);
      }, 600);
    }
  }

  const exportOptions = [
    {
      key: "excel" as const,
      icon: "📗",
      label: "Export ke Excel",
      desc: "Format .xlsx spreadsheet",
      color: "#22c55e",
      bgColor: "rgba(34, 197, 94, 0.1)",
      borderColor: "rgba(34, 197, 94, 0.25)",
    },
    {
      key: "word" as const,
      icon: "📘",
      label: "Export ke Word",
      desc: "Format .docx dokumen",
      color: "#3b82f6",
      bgColor: "rgba(59, 130, 246, 0.1)",
      borderColor: "rgba(59, 130, 246, 0.25)",
    },
    {
      key: "pdf" as const,
      icon: "📕",
      label: "Export ke PDF",
      desc: "Format .pdf cetak",
      color: "#ef4444",
      bgColor: "rgba(239, 68, 68, 0.1)",
      borderColor: "rgba(239, 68, 68, 0.25)",
    },
  ];

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={data.length === 0}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 20px",
          borderRadius: "12px",
          background:
            data.length === 0
              ? "rgba(99, 102, 241, 0.1)"
              : "var(--gradient-primary)",
          border: "none",
          color: data.length === 0 ? "var(--text-muted)" : "#fff",
          fontSize: "14px",
          fontWeight: 600,
          cursor: data.length === 0 ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          letterSpacing: "0.01em",
          opacity: data.length === 0 ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (data.length > 0) {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow =
              "0 8px 25px rgba(99, 102, 241, 0.35)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <span style={{ fontSize: "16px" }}>📄</span>
        Generate Laporan
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "18px",
            height: "18px",
            fontSize: "10px",
            transition: "transform 0.3s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: "280px",
            background: "rgba(15, 20, 40, 0.95)",
            border: "1px solid var(--card-border)",
            borderRadius: "14px",
            backdropFilter: "blur(20px)",
            boxShadow:
              "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.1)",
            padding: "8px",
            zIndex: 50,
            animation: "slideDown 0.2s ease-out",
          }}
        >
          {/* Menu Header */}
          <div
            style={{
              padding: "10px 14px 8px",
              borderBottom: "1px solid var(--card-border)",
              marginBottom: "6px",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              Pilih Format Export
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                margin: "2px 0 0",
              }}
            >
              {data.length} transaksi akan diexport
            </p>
          </div>

          {/* Options */}
          {exportOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleExport(opt.key)}
              disabled={exporting !== null}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid transparent",
                background: "transparent",
                cursor: exporting !== null ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                marginBottom: "4px",
                textAlign: "left",
                opacity: exporting && exporting !== opt.key ? 0.4 : 1,
              }}
              onMouseEnter={(e) => {
                if (!exporting) {
                  e.currentTarget.style.background = opt.bgColor;
                  e.currentTarget.style.borderColor = opt.borderColor;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: opt.bgColor,
                  border: `1px solid ${opt.borderColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  flexShrink: 0,
                }}
              >
                {exporting === opt.key ? (
                  <span
                    style={{
                      display: "inline-block",
                      width: "16px",
                      height: "16px",
                      border: `2px solid ${opt.borderColor}`,
                      borderTopColor: opt.color,
                      borderRadius: "50%",
                      animation: "spin 0.6s linear infinite",
                    }}
                  />
                ) : (
                  opt.icon
                )}
              </div>

              {/* Text */}
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: exporting === opt.key ? opt.color : "var(--text-primary)",
                    margin: 0,
                  }}
                >
                  {exporting === opt.key ? "Mengexport..." : opt.label}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    margin: "1px 0 0",
                  }}
                >
                  {opt.desc}
                </p>
              </div>

              {/* Checkmark when done */}
              {exporting === opt.key && (
                <span
                  style={{
                    marginLeft: "auto",
                    color: opt.color,
                    fontSize: "14px",
                  }}
                >
                  ⏳
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
