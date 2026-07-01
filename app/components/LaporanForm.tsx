"use client";

import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { createLaporan } from "../lib/api";

interface LaporanFormProps {
  onSuccess: () => void;
  lastSaldo: number;
}

export default function LaporanForm({ onSuccess, lastSaldo }: LaporanFormProps) {
  const [tanggal, setTanggal] = useState("");
  const [debit, setDebit] = useState("");
  const [kredit, setKredit] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [buktiFile, setBuktiFile] = useState<File | null>(null);
  const [buktiPreview, setBuktiPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculatedSaldo =
    lastSaldo + (Number(debit) || 0) - (Number(kredit) || 0);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setBuktiFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBuktiPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setBuktiFile(null);
      setBuktiPreview(null);
    }
  }

  function removeFile() {
    setBuktiFile(null);
    setBuktiPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!tanggal || (!debit && !kredit) || !keterangan) {
      setError("Mohon lengkapi semua field yang wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        tanggal,
        debit: Number(debit) || 0,
        kredit: Number(kredit) || 0,
        sisa_saldo: calculatedSaldo,
        keterangan,
      };
      console.log("Sending to Strapi:", JSON.stringify({ data: payload }, null, 2));
      await createLaporan(payload, buktiFile || undefined);

      // Reset form
      setTanggal("");
      setDebit("");
      setKredit("");
      setKeterangan("");
      setBuktiFile(null);
      setBuktiPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan data."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(val: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: "16px",
        padding: "28px",
        backdropFilter: "blur(20px)",
        boxShadow: "var(--shadow-glow)",
        animation: "fadeInUp 0.6s ease-out",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "var(--gradient-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          ✏️
        </div>
        <div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            Input Laporan Baru
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              margin: 0,
            }}
          >
            Masukkan data transaksi keuangan
          </p>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div
          style={{
            background: "rgba(244, 63, 94, 0.1)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            borderRadius: "10px",
            padding: "12px 16px",
            marginBottom: "16px",
            color: "#fda4af",
            fontSize: "14px",
            animation: "slideDown 0.3s ease-out",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div
          style={{
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "10px",
            padding: "12px 16px",
            marginBottom: "16px",
            color: "#6ee7b7",
            fontSize: "14px",
            animation: "slideDown 0.3s ease-out",
          }}
        >
          ✅ Data berhasil disimpan!
        </div>
      )}

      {/* Form Grid */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        }}
      >
        {/* Tanggal */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="tanggal"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Tanggal <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <input
            id="tanggal"
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            required
            style={{
              background: "var(--input-bg)",
              border: "1px solid var(--input-border)",
              borderRadius: "10px",
              padding: "10px 14px",
              color: "var(--text-primary)",
              fontSize: "14px",
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px var(--input-focus)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--input-border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Debit */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="debit"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--success)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Debit (Masuk)
          </label>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              Rp
            </span>
            <input
              id="debit"
              type="number"
              min="0"
              value={debit}
              onChange={(e) => setDebit(e.target.value)}
              placeholder="0"
              style={{
                width: "100%",
                background: "var(--input-bg)",
                border: "1px solid var(--input-border)",
                borderRadius: "10px",
                padding: "10px 14px 10px 36px",
                color: "var(--text-primary)",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--success)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(16, 185, 129, 0.2)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--input-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* Kredit */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="kredit"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--danger)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Kredit (Keluar)
          </label>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              Rp
            </span>
            <input
              id="kredit"
              type="number"
              min="0"
              value={kredit}
              onChange={(e) => setKredit(e.target.value)}
              placeholder="0"
              style={{
                width: "100%",
                background: "var(--input-bg)",
                border: "1px solid var(--input-border)",
                borderRadius: "10px",
                padding: "10px 14px 10px 36px",
                color: "var(--text-primary)",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--danger)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(244, 63, 94, 0.2)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--input-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* Sisa Saldo (Auto-calculated) */}
        <div className="flex flex-col gap-1.5">
          <label
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--accent)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Sisa Saldo
          </label>
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(34, 211, 238, 0.08), rgba(99, 102, 241, 0.08))",
              border: "1px solid rgba(34, 211, 238, 0.2)",
              borderRadius: "10px",
              padding: "10px 14px",
              color: "var(--accent)",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
            }}
          >
            {formatCurrency(calculatedSaldo)}
          </div>
        </div>
      </div>

      {/* Keterangan - full width */}
      <div className="flex flex-col gap-1.5 mt-4">
        <label
          htmlFor="keterangan"
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Keterangan <span style={{ color: "var(--danger)" }}>*</span>
        </label>
        <textarea
          id="keterangan"
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          placeholder="Deskripsikan transaksi..."
          rows={2}
          required
          style={{
            width: "100%",
            background: "var(--input-bg)",
            border: "1px solid var(--input-border)",
            borderRadius: "10px",
            padding: "10px 14px",
            color: "var(--text-primary)",
            fontSize: "14px",
            outline: "none",
            resize: "vertical",
            transition: "all 0.2s ease",
            fontFamily: "inherit",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--primary)";
            e.currentTarget.style.boxShadow =
              "0 0 0 3px var(--input-focus)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--input-border)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Bukti Pembayaran */}
      <div className="flex flex-col gap-1.5 mt-4">
        <label
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Bukti Pembayaran
        </label>

        {!buktiPreview ? (
          <label
            htmlFor="bukti"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "24px",
              border: "2px dashed var(--input-border)",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              background: "var(--input-bg)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.background =
                "rgba(99, 102, 241, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--input-border)";
              e.currentTarget.style.background = "var(--input-bg)";
            }}
          >
            <div style={{ fontSize: "28px" }}>📎</div>
            <span
              style={{
                fontSize: "14px",
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              Klik atau drag file ke sini
            </span>
            <span
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
              }}
            >
              PNG, JPG, PDF (Maks. 5MB)
            </span>
            <input
              id="bukti"
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>
        ) : (
          <div
            style={{
              position: "relative",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid var(--card-border)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={buktiPreview}
              alt="Preview bukti"
              style={{
                width: "100%",
                maxHeight: "160px",
                objectFit: "cover",
              }}
            />
            <button
              type="button"
              onClick={removeFile}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "rgba(244, 63, 94, 0.9)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              ✕
            </button>
            <div
              style={{
                padding: "8px 12px",
                background: "rgba(0,0,0,0.5)",
                fontSize: "12px",
                color: "var(--text-secondary)",
              }}
            >
              📄 {buktiFile?.name}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          marginTop: "20px",
          padding: "12px 24px",
          background: loading
            ? "rgba(99, 102, 241, 0.3)"
            : "var(--gradient-primary)",
          color: "#fff",
          border: "none",
          borderRadius: "12px",
          fontSize: "15px",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          letterSpacing: "0.02em",
        }}
        onMouseEnter={(e) => {
          if (!loading) {
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
        {loading ? (
          <>
            <span
              style={{
                display: "inline-block",
                width: "18px",
                height: "18px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "#fff",
                borderRadius: "50%",
                animation: "spin 0.6s linear infinite",
              }}
            />
            Menyimpan...
          </>
        ) : (
          <>💾 Simpan Laporan</>
        )}
      </button>
    </form>
  );
}
