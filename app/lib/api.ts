const STRAPI_URL = "http://10.34.129.38:1337";
const API_URL = `${STRAPI_URL}/api/laporans`;

export interface LaporanBukti {
  id: number;
  url: string;
  name: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
  };
}

export interface LaporanData {
  id: number;
  documentId: string;
  tanggal: string;
  debit: number;
  kredit: number;
  sisa_saldo: number;
  keterangan: string;
  bukti?: LaporanBukti | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface StrapiResponse {
  data: LaporanData[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse {
  data: LaporanData;
}

export function getStrapiMediaUrl(url: string | undefined): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${STRAPI_URL}${url}`;
}

export async function getLaporans(): Promise<StrapiResponse> {
  const res = await fetch(`${API_URL}?populate=bukti&sort=tanggal:desc`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch laporans: ${res.statusText}`);
  }
  return res.json();
}

export async function createLaporan(
  data: {
    tanggal: string;
    debit: number;
    kredit: number;
    sisa_saldo: number;
    keterangan: string;
  },
  buktiFile?: File
): Promise<StrapiSingleResponse> {
  // Step 1: Create entry via JSON
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    // console.error("Strapi POST error:", errorBody);
    throw new Error(`Gagal menyimpan data: ${res.statusText}`);
  }

  const result: StrapiSingleResponse = await res.json();

  // Step 2: If there's a file, upload it via Strapi upload API and link to entry
  if (buktiFile && result.data?.id) {
    const formData = new FormData();
    formData.append("files", buktiFile, buktiFile.name);
    formData.append("ref", "api::laporan.laporan");
    formData.append("refId", String(result.data.id));
    formData.append("field", "bukti");

    const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      const uploadError = await uploadRes.text();
      console.error("Strapi upload error:", uploadError);
      // Entry was created, just file upload failed
    }
  }

  return result;
}

export async function deleteLaporan(documentId: string): Promise<void> {
  const res = await fetch(`${API_URL}/${documentId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete laporan: ${res.statusText}`);
  }
}
