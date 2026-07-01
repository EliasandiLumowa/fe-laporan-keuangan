"use client";

import { useState } from "react";
import type { LaporanData } from "../lib/api";
import { deleteLaporan, getStrapiMediaUrl } from "../lib/api";

interface LaporanTableProps {
  data: LaporanData[];
  onRefresh: () => void;
}

export default function LaporanTable({ data, onRefresh }: LaporanTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  function formatCurrency(val: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  }

  function formatDate(dateStr: string) {
    try {
      // Handle dd/mm/yyyy format
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        return `${parts[0]}/${parts[1]}/${parts[2]}`;
      }
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch {
      return dateStr;
    }
  }

  async function handleDelete(documentId: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
    setDeletingId(documentId);
    try {
      await deleteLaporan(documentId);
      onRefresh();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Gagal menghapus data"
      );
    } finally {
      setDeletingId(null);
    }
  }

  const totalDebit = data.reduce(
    (sum, item) => sum + (item.debit || 0),
    0
  );
  const totalKredit = data.reduce(
    (sum, item) => sum + (item.kredit || 0),
    0
  );
  const currentSaldo =
    data.length > 0 ? data[0].sisa_saldo : 0;

  return (
    <div
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: "16px",
        backdropFilter: "blur(20px)",
        boxShadow: "var(--shadow-glow)",
        overflow: "hidden",
        animation: "fadeInUp 0.6s ease-out 0.15s both",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 28px",
          borderBottom: "1px solid var(--card-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "var(--gradient-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
          >
            📊
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
              Riwayat Transaksi
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              {data.length} transaksi tercatat
            </p>
          </div>
        </div>

        {/* Summary Badges */}
        <div className="flex gap-3 flex-wrap">
          <div
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              fontSize: "13px",
              fontWeight: 600,
              color: "#6ee7b7",
              fontFamily: "var(--font-mono)",
            }}
          >
            ↗ {formatCurrency(totalDebit)}
          </div>
          <div
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              background: "rgba(244, 63, 94, 0.1)",
              border: "1px solid rgba(244, 63, 94, 0.25)",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fda4af",
              fontFamily: "var(--font-mono)",
            }}
          >
            ↙ {formatCurrency(totalKredit)}
          </div>
          <div
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              background: "rgba(34, 211, 238, 0.1)",
              border: "1px solid rgba(34, 211, 238, 0.25)",
              fontSize: "13px",
              fontWeight: 600,
              color: "#67e8f9",
              fontFamily: "var(--font-mono)",
            }}
          >
            💰 {formatCurrency(currentSaldo)}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {data.length === 0 ? (
        <div
          style={{
            padding: "60px 28px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
          <p
            style={{
              fontSize: "16px",
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            Belum ada data transaksi
          </p>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
            }}
          >
            Mulai input laporan keuangan pertama Anda
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div
            className="hidden md:block"
            style={{ overflowX: "auto" }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--card-border)",
                  }}
                >
                  {[
                    "Tanggal",
                    "Keterangan",
                    "Debit",
                    "Kredit",
                    "Sisa Saldo",
                    "Bukti",
                    "",
                  ].map((header) => (
                    <th
                      key={header}
                      style={{
                        padding: "12px 16px",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        textAlign: header === "" ? "center" : "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => {
                  const buktiUrl = item.bukti?.url;
                  const thumbUrl =
                    item.bukti?.formats?.thumbnail?.url || buktiUrl;
                  return (
                    <tr
                      key={item.documentId}
                      style={{
                        borderBottom: "1px solid rgba(99, 130, 255, 0.06)",
                        transition: "background 0.2s ease",
                        animation: `fadeIn 0.4s ease-out ${index * 0.05}s both`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "var(--table-row-hover)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: "14px",
                          color: "var(--text-primary)",
                          whiteSpace: "nowrap",
                          fontWeight: 500,
                        }}
                      >
                        {formatDate(item.tanggal)}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: "14px",
                          color: "var(--text-secondary)",
                          maxWidth: "220px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.keterangan}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: "14px",
                          fontWeight: 600,
                          fontFamily: "var(--font-mono)",
                          color: item.debit
                            ? "#6ee7b7"
                            : "var(--text-muted)",
                        }}
                      >
                        {item.debit
                          ? formatCurrency(item.debit)
                          : "-"}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: "14px",
                          fontWeight: 600,
                          fontFamily: "var(--font-mono)",
                          color: item.kredit
                            ? "#fda4af"
                            : "var(--text-muted)",
                        }}
                      >
                        {item.kredit
                          ? formatCurrency(item.kredit)
                          : "-"}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: "14px",
                          fontWeight: 700,
                          fontFamily: "var(--font-mono)",
                          color: "#67e8f9",
                        }}
                      >
                        {formatCurrency(item.sisa_saldo)}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          textAlign: "center",
                        }}
                      >
                        {buktiUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewImage(
                                getStrapiMediaUrl(buktiUrl)
                              )
                            }
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "8px",
                              border: "1px solid var(--card-border)",
                              background: "var(--input-bg)",
                              overflow: "hidden",
                              cursor: "pointer",
                              padding: 0,
                              transition: "transform 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "scale(1.15)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform =
                                "scale(1)";
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={getStrapiMediaUrl(thumbUrl)}
                              alt="Bukti"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </button>
                        ) : (
                          <span
                            style={{
                              fontSize: "12px",
                              color: "var(--text-muted)",
                            }}
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          textAlign: "center",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleDelete(item.documentId)}
                          disabled={deletingId === item.documentId}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background:
                              deletingId === item.documentId
                                ? "rgba(244, 63, 94, 0.2)"
                                : "transparent",
                            border: "1px solid transparent",
                            color: "var(--text-muted)",
                            cursor:
                              deletingId === item.documentId
                                ? "not-allowed"
                                : "pointer",
                            fontSize: "14px",
                            transition: "all 0.2s ease",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onMouseEnter={(e) => {
                            if (deletingId !== item.documentId) {
                              e.currentTarget.style.background =
                                "rgba(244, 63, 94, 0.15)";
                              e.currentTarget.style.borderColor =
                                "rgba(244, 63, 94, 0.3)";
                              e.currentTarget.style.color = "#fda4af";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (deletingId !== item.documentId) {
                              e.currentTarget.style.background =
                                "transparent";
                              e.currentTarget.style.borderColor =
                                "transparent";
                              e.currentTarget.style.color =
                                "var(--text-muted)";
                            }
                          }}
                        >
                          {deletingId === item.documentId ? (
                            <span
                              style={{
                                display: "inline-block",
                                width: "14px",
                                height: "14px",
                                border:
                                  "2px solid rgba(244,63,94,0.3)",
                                borderTopColor: "#fda4af",
                                borderRadius: "50%",
                                animation:
                                  "spin 0.6s linear infinite",
                              }}
                            />
                          ) : (
                            "🗑"
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div
            className="md:hidden"
            style={{ padding: "12px" }}
          >
            {data.map((item, index) => {
              const buktiUrl = item.bukti?.url;
              return (
                <div
                  key={item.documentId}
                  style={{
                    background: "rgba(15, 23, 42, 0.4)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "12px",
                    padding: "16px",
                    marginBottom: "10px",
                    animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <div
                    className="flex justify-between items-start"
                    style={{ marginBottom: "10px" }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "var(--text-muted)",
                          fontWeight: 500,
                          marginBottom: "2px",
                        }}
                      >
                        {formatDate(item.tanggal)}
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          color: "var(--text-primary)",
                          fontWeight: 600,
                        }}
                      >
                        {item.keterangan}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.documentId)}
                      disabled={deletingId === item.documentId}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "8px",
                        background: "rgba(244, 63, 94, 0.1)",
                        border: "1px solid rgba(244, 63, 94, 0.2)",
                        color: "#fda4af",
                        cursor: "pointer",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {deletingId === item.documentId ? "⏳" : "🗑"}
                    </button>
                  </div>

                  <div
                    className="grid grid-cols-3 gap-2"
                    style={{ marginBottom: buktiUrl ? "10px" : 0 }}
                  >
                    <div
                      style={{
                        background: "rgba(16, 185, 129, 0.08)",
                        borderRadius: "8px",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "10px",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: "2px",
                        }}
                      >
                        Debit
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          fontFamily: "var(--font-mono)",
                          color: item.debit
                            ? "#6ee7b7"
                            : "var(--text-muted)",
                        }}
                      >
                        {item.debit
                          ? formatCurrency(item.debit)
                          : "-"}
                      </div>
                    </div>
                    <div
                      style={{
                        background: "rgba(244, 63, 94, 0.08)",
                        borderRadius: "8px",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "10px",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: "2px",
                        }}
                      >
                        Kredit
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          fontFamily: "var(--font-mono)",
                          color: item.kredit
                            ? "#fda4af"
                            : "var(--text-muted)",
                        }}
                      >
                        {item.kredit
                          ? formatCurrency(item.kredit)
                          : "-"}
                      </div>
                    </div>
                    <div
                      style={{
                        background: "rgba(34, 211, 238, 0.08)",
                        borderRadius: "8px",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "10px",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: "2px",
                        }}
                      >
                        Saldo
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          fontFamily: "var(--font-mono)",
                          color: "#67e8f9",
                        }}
                      >
                        {formatCurrency(item.sisa_saldo)}
                      </div>
                    </div>
                  </div>

                  {buktiUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewImage(getStrapiMediaUrl(buktiUrl))
                      }
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "8px",
                        background: "rgba(99, 102, 241, 0.08)",
                        border: "1px solid rgba(99, 102, 241, 0.2)",
                        color: "var(--primary-light)",
                        fontSize: "13px",
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                    >
                      📎 Lihat Bukti Pembayaran
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
            animation: "fadeIn 0.2s ease-out",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setPreviewImage(null)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              animation: "fadeInUp 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              style={{
                position: "absolute",
                top: "-12px",
                right: "-12px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "var(--gradient-primary)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                boxShadow: "0 4px 20px rgba(99, 102, 241, 0.4)",
              }}
            >
              ✕
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt="Bukti pembayaran"
              style={{
                maxWidth: "90vw",
                maxHeight: "85vh",
                objectFit: "contain",
                borderRadius: "12px",
                border: "1px solid var(--card-border)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
