// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { getLaporans, type LaporanData } from "./lib/api";
// import LaporanForm from "./components/LaporanForm";
// import LaporanTable from "./components/LaporanTable";
// import ExportMenu from "./components/ExportMenu";

// export default function Home() {
//   const [laporans, setLaporans] = useState<LaporanData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [currentTime, setCurrentTime] = useState("");

//   const fetchData = useCallback(async () => {
//     try {
//       setError(null);
//       const response = await getLaporans();
//       setLaporans(response.data);
//     } catch (err) {
//       setError(
//         err instanceof Error
//           ? err.message
//           : "Gagal memuat data dari server"
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   useEffect(() => {
//     function updateTime() {
//       setCurrentTime(
//         new Intl.DateTimeFormat("id-ID", {
//           weekday: "long",
//           day: "numeric",
//           month: "long",
//           year: "numeric",
//           hour: "2-digit",
//           minute: "2-digit",
//         }).format(new Date())
//       );
//     }
//     updateTime();
//     const interval = setInterval(updateTime, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   const lastSaldo =
//     laporans.length > 0 ? laporans[0].sisa_saldo : 0;

//   const totalDebit = laporans.reduce(
//     (sum, item) => sum + (item.debit || 0),
//     0
//   );
//   const totalKredit = laporans.reduce(
//     (sum, item) => sum + (item.kredit || 0),
//     0
//   );

//   function formatCurrency(val: number) {
//     return new Intl.NumberFormat("id-ID", {
//       style: "currency",
//       currency: "IDR",
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(val);
//   }

//   return (
//     <div
//       className="relative"
//       style={{
//         minHeight: "100vh",
//         zIndex: 1,
//       }}
//     >
//       {/* Top Navigation Bar */}
//       <nav
//         style={{
//           position: "sticky",
//           top: 0,
//           zIndex: 100,
//           background: "rgba(10, 14, 26, 0.8)",
//           backdropFilter: "blur(20px)",
//           borderBottom: "1px solid var(--card-border)",
//           padding: "0 24px",
//         }}
//       >
//         <div
//           className="flex items-center justify-between"
//           style={{
//             maxWidth: "1280px",
//             margin: "0 auto",
//             height: "64px",
//           }}
//         >
//           <div className="flex items-center gap-3">
//             <div
//               style={{
//                 width: "36px",
//                 height: "36px",
//                 borderRadius: "10px",
//                 background: "var(--gradient-primary)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontSize: "18px",
//                 animation: "pulse-glow 3s ease-in-out infinite",
//               }}
//             >
//               💰
//             </div>
//             <div>
//               <h1
//                 style={{
//                   fontSize: "16px",
//                   fontWeight: 700,
//                   color: "var(--text-primary)",
//                   margin: 0,
//                   lineHeight: 1.2,
//                 }}
//               >
//                 Pencatatan Keuangan
//               </h1>
//               <p
//                 style={{
//                   fontSize: "11px",
//                   color: "var(--text-muted)",
//                   margin: 0,
//                 }}
//               >
//                 Sistem Laporan Keuangan
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-4">
//             <div
//               className="hidden sm:block"
//               style={{
//                 fontSize: "12px",
//                 color: "var(--text-muted)",
//                 fontFamily: "var(--font-mono)",
//               }}
//             >
//               {currentTime}
//             </div>
//             <ExportMenu data={laporans} />
//           </div>
//         </div>
//       </nav>

//       {/* Summary Cards */}
//       <div
//         style={{
//           maxWidth: "1280px",
//           margin: "0 auto",
//           padding: "24px 24px 0",
//         }}
//       >
//         <div
//           className="grid gap-4"
//           style={{
//             gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
//             animation: "fadeInUp 0.5s ease-out",
//           }}
//         >
//           {/* Saldo Card */}
//           <div
//             style={{
//               background:
//                 "linear-gradient(135deg, rgba(34, 211, 238, 0.12), rgba(99, 102, 241, 0.12))",
//               border: "1px solid rgba(34, 211, 238, 0.2)",
//               borderRadius: "14px",
//               padding: "20px",
//               position: "relative",
//               overflow: "hidden",
//             }}
//           >
//             <div
//               style={{
//                 position: "absolute",
//                 top: "-20px",
//                 right: "-20px",
//                 width: "80px",
//                 height: "80px",
//                 borderRadius: "50%",
//                 background: "rgba(34, 211, 238, 0.08)",
//               }}
//             />
//             <p
//               style={{
//                 fontSize: "12px",
//                 fontWeight: 600,
//                 color: "var(--text-muted)",
//                 textTransform: "uppercase",
//                 letterSpacing: "0.06em",
//                 margin: "0 0 6px",
//               }}
//             >
//               Saldo Saat Ini
//             </p>
//             <p
//               style={{
//                 fontSize: "24px",
//                 fontWeight: 800,
//                 color: "#67e8f9",
//                 margin: 0,
//                 fontFamily: "var(--font-mono)",
//               }}
//             >
//               {loading ? "..." : formatCurrency(lastSaldo)}
//             </p>
//           </div>

//           {/* Total Debit Card */}
//           <div
//             style={{
//               background: "rgba(16, 185, 129, 0.06)",
//               border: "1px solid rgba(16, 185, 129, 0.15)",
//               borderRadius: "14px",
//               padding: "20px",
//               position: "relative",
//               overflow: "hidden",
//             }}
//           >
//             <div
//               style={{
//                 position: "absolute",
//                 top: "-20px",
//                 right: "-20px",
//                 width: "80px",
//                 height: "80px",
//                 borderRadius: "50%",
//                 background: "rgba(16, 185, 129, 0.06)",
//               }}
//             />
//             <p
//               style={{
//                 fontSize: "12px",
//                 fontWeight: 600,
//                 color: "var(--text-muted)",
//                 textTransform: "uppercase",
//                 letterSpacing: "0.06em",
//                 margin: "0 0 6px",
//               }}
//             >
//               Total Debit
//             </p>
//             <p
//               style={{
//                 fontSize: "24px",
//                 fontWeight: 800,
//                 color: "#6ee7b7",
//                 margin: 0,
//                 fontFamily: "var(--font-mono)",
//               }}
//             >
//               {loading ? "..." : formatCurrency(totalDebit)}
//             </p>
//           </div>

//           {/* Total Kredit Card */}
//           <div
//             style={{
//               background: "rgba(244, 63, 94, 0.06)",
//               border: "1px solid rgba(244, 63, 94, 0.15)",
//               borderRadius: "14px",
//               padding: "20px",
//               position: "relative",
//               overflow: "hidden",
//             }}
//           >
//             <div
//               style={{
//                 position: "absolute",
//                 top: "-20px",
//                 right: "-20px",
//                 width: "80px",
//                 height: "80px",
//                 borderRadius: "50%",
//                 background: "rgba(244, 63, 94, 0.06)",
//               }}
//             />
//             <p
//               style={{
//                 fontSize: "12px",
//                 fontWeight: 600,
//                 color: "var(--text-muted)",
//                 textTransform: "uppercase",
//                 letterSpacing: "0.06em",
//                 margin: "0 0 6px",
//               }}
//             >
//               Total Kredit
//             </p>
//             <p
//               style={{
//                 fontSize: "24px",
//                 fontWeight: 800,
//                 color: "#fda4af",
//                 margin: 0,
//                 fontFamily: "var(--font-mono)",
//               }}
//             >
//               {loading ? "..." : formatCurrency(totalKredit)}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <main
//         style={{
//           maxWidth: "1280px",
//           margin: "0 auto",
//           padding: "24px",
//           display: "flex",
//           flexDirection: "column",
//           gap: "24px",
//         }}
//       >
//         {/* Connection Error */}
//         {error && (
//           <div
//             style={{
//               background: "rgba(245, 158, 11, 0.1)",
//               border: "1px solid rgba(245, 158, 11, 0.3)",
//               borderRadius: "12px",
//               padding: "16px 20px",
//               display: "flex",
//               alignItems: "center",
//               gap: "12px",
//               animation: "slideDown 0.3s ease-out",
//             }}
//           >
//             <span style={{ fontSize: "20px" }}>⚠️</span>
//             <div>
//               <p
//                 style={{
//                   fontSize: "14px",
//                   fontWeight: 600,
//                   color: "#fbbf24",
//                   margin: "0 0 2px",
//                 }}
//               >
//                 Koneksi ke Server Bermasalah
//               </p>
//               <p
//                 style={{
//                   fontSize: "13px",
//                   color: "var(--text-muted)",
//                   margin: 0,
//                 }}
//               >
//                 {error}. Pastikan Strapi berjalan di{" "}
//                 <code
//                   style={{
//                     background: "rgba(255,255,255,0.08)",
//                     padding: "2px 6px",
//                     borderRadius: "4px",
//                     fontSize: "12px",
//                     fontFamily: "var(--font-mono)",
//                   }}
//                 >
//                   localhost:1337
//                 </code>
//               </p>
//             </div>
//             <button
//               type="button"
//               onClick={() => {
//                 setLoading(true);
//                 fetchData();
//               }}
//               style={{
//                 marginLeft: "auto",
//                 padding: "8px 16px",
//                 borderRadius: "8px",
//                 background: "rgba(245, 158, 11, 0.2)",
//                 border: "1px solid rgba(245, 158, 11, 0.3)",
//                 color: "#fbbf24",
//                 fontSize: "13px",
//                 fontWeight: 600,
//                 cursor: "pointer",
//                 whiteSpace: "nowrap",
//                 transition: "all 0.2s ease",
//               }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.background =
//                   "rgba(245, 158, 11, 0.3)";
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.background =
//                   "rgba(245, 158, 11, 0.2)";
//               }}
//             >
//               🔄 Coba Lagi
//             </button>
//           </div>
//         )}

//         {/* Form */}
//         <LaporanForm onSuccess={fetchData} lastSaldo={lastSaldo} />

//         {/* Table / Loading */}
//         {loading ? (
//           <div
//             style={{
//               background: "var(--card-bg)",
//               border: "1px solid var(--card-border)",
//               borderRadius: "16px",
//               padding: "60px 28px",
//               textAlign: "center",
//               backdropFilter: "blur(20px)",
//             }}
//           >
//             <div
//               style={{
//                 width: "40px",
//                 height: "40px",
//                 border: "3px solid rgba(99, 102, 241, 0.2)",
//                 borderTopColor: "var(--primary)",
//                 borderRadius: "50%",
//                 animation: "spin 0.8s linear infinite",
//                 margin: "0 auto 16px",
//               }}
//             />
//             <p
//               style={{
//                 fontSize: "14px",
//                 color: "var(--text-secondary)",
//                 fontWeight: 500,
//               }}
//             >
//               Memuat data transaksi...
//             </p>
//           </div>
//         ) : (
//           <LaporanTable data={laporans} onRefresh={fetchData} />
//         )}
//       </main>

//       {/* Footer */}
//       <footer
//         style={{
//           textAlign: "center",
//           padding: "20px 24px 32px",
//           borderTop: "1px solid var(--card-border)",
//           marginTop: "24px",
//         }}
//       >
//         <p
//           style={{
//             fontSize: "12px",
//             color: "var(--text-muted)",
//             margin: 0,
//           }}
//         >
//           © 2026 Pencatatan Keuangan — Powered by Next.js & Strapi
//         </p>
//       </footer>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useCallback } from "react";
import { getLaporans, type LaporanData } from "./lib/api";
import LaporanForm from "./components/LaporanForm";
import LaporanTable from "./components/LaporanTable";
import ExportMenu from "./components/ExportMenu";

export default function Home() {
  const [laporans, setLaporans] = useState<LaporanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const response = await getLaporans();
      setLaporans(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat data dari server"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    function updateTime() {
      setCurrentTime(
        new Intl.DateTimeFormat("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date())
      );
    }
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // PERBAIKAN DI SINI: Mengambil data dari index terakhir array (transaksi terbaru)
  const lastSaldo =
    laporans.length > 0 ? laporans[laporans.length - 1].sisa_saldo : 0;

  const totalDebit = laporans.reduce(
    (sum, item) => sum + (item.debit || 0),
    0
  );
  const totalKredit = laporans.reduce(
    (sum, item) => sum + (item.kredit || 0),
    0
  );

  function formatCurrency(val: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  }

  return (
    <div
      className="relative"
      style={{
        minHeight: "100vh",
        zIndex: 1,
      }}
    >
      {/* Top Navigation Bar */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(10, 14, 26, 0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--card-border)",
          padding: "0 24px",
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            height: "64px",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "var(--gradient-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                animation: "pulse-glow 3s ease-in-out infinite",
              }}
            >
              💰
            </div>
            <div>
              <h1
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Pencatatan Keuangan
              </h1>
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  margin: 0,
                }}
              >
                Sistem Laporan Keuangan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="hidden sm:block"
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {currentTime}
            </div>
            <ExportMenu data={laporans} />
          </div>
        </div>
      </nav>

      {/* Summary Cards */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "24px 24px 0",
        }}
      >
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            animation: "fadeInUp 0.5s ease-out",
          }}
        >
          {/* Saldo Card */}
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(34, 211, 238, 0.12), rgba(99, 102, 241, 0.12))",
              border: "1px solid rgba(34, 211, 238, 0.2)",
              borderRadius: "14px",
              padding: "20px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-20px",
                right: "-20px",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(34, 211, 238, 0.08)",
              }}
            />
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: "0 0 6px",
              }}
            >
              Saldo Saat Ini
            </p>
            <p
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#67e8f9",
                margin: 0,
                fontFamily: "var(--font-mono)",
              }}
            >
              {loading ? "..." : formatCurrency(lastSaldo)}
            </p>
          </div>

          {/* Total Debit Card */}
          <div
            style={{
              background: "rgba(16, 185, 129, 0.06)",
              border: "1px solid rgba(16, 185, 129, 0.15)",
              borderRadius: "14px",
              padding: "20px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-20px",
                right: "-20px",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.06)",
              }}
            />
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: "0 0 6px",
              }}
            >
              Total Debit
            </p>
            <p
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#6ee7b7",
                margin: 0,
                fontFamily: "var(--font-mono)",
              }}
            >
              {loading ? "..." : formatCurrency(totalDebit)}
            </p>
          </div>

          {/* Total Kredit Card */}
          <div
            style={{
              background: "rgba(244, 63, 94, 0.06)",
              border: "1px solid rgba(244, 63, 94, 0.15)",
              borderRadius: "14px",
              padding: "20px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-20px",
                right: "-20px",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(244, 63, 94, 0.06)",
              }}
            />
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: "0 0 6px",
              }}
            >
              Total Kredit
            </p>
            <p
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#fda4af",
                margin: 0,
                fontFamily: "var(--font-mono)",
              }}
            >
              {loading ? "..." : formatCurrency(totalKredit)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Connection Error */}
        {error && (
          <div
            style={{
              background: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "12px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              animation: "slideDown 0.3s ease-out",
            }}
          >
            <span style={{ fontSize: "20px" }}>⚠️</span>
            <div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#fbbf24",
                  margin: "0 0 2px",
                }}
              >
                Koneksi ke Server Bermasalah
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  margin: 0,
                }}
              >
                {error}. Pastikan Strapi berjalan di{" "}
                <code
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  localhost:1337
                </code>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                fetchData();
              }}
              style={{
                marginLeft: "auto",
                padding: "8px 16px",
                borderRadius: "8px",
                background: "rgba(245, 158, 11, 0.2)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                color: "#fbbf24",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "rgba(245, 158, 11, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "rgba(245, 158, 11, 0.2)";
              }}
            >
              🔄 Coba Lagi
            </button>
          </div>
        )}

        {/* Form */}
        <LaporanForm onSuccess={fetchData} lastSaldo={lastSaldo} />

        {/* Table / Loading */}
        {loading ? (
          <div
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
              borderRadius: "16px",
              padding: "60px 28px",
              textAlign: "center",
              backdropFilter: "blur(20px)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "3px solid rgba(99, 102, 241, 0.2)",
                borderTopColor: "var(--primary)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              Memuat data transaksi...
            </p>
          </div>
        ) : (
          <LaporanTable data={laporans} onRefresh={fetchData} />
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "20px 24px 32px",
          borderTop: "1px solid var(--card-border)",
          marginTop: "24px",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            margin: 0,
          }}
        >
          © 2026 Pencatatan Keuangan Divisi Transportasi - Development by Eliasandi
        </p>
      </footer>
    </div>
  );
}