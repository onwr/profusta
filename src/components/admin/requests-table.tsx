type RequestRow = {
  id: string;
  status: string;
  city: string;
  district: string | null;
  createdAt: Date;
  customer: { fullName: string; email: string };
  category: { name: string };
  service: { name: string } | null;
  _count: { matches: number };
};

const statusLabels: Record<string, string> = {
  OPEN: "Açık",
  OFFER_ACCEPTED: "Teklif kabul",
  CANCELLED: "İptal",
};

export function AdminRequestsTable({ requests }: { requests: RequestRow[] }) {
  if (requests.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-black/10 bg-white p-8 text-center text-sm text-[#53635f]">
        Henüz talep yok.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-black/5 bg-[#f7f7f3] text-xs font-bold uppercase text-[#53635f]">
          <tr>
            <th className="px-4 py-3">Müşteri</th>
            <th className="px-4 py-3">Kategori</th>
            <th className="px-4 py-3">Konum</th>
            <th className="px-4 py-3">Durum</th>
            <th className="px-4 py-3">Eşleşme</th>
            <th className="px-4 py-3">Tarih</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id} className="border-b border-black/5 last:border-0">
              <td className="px-4 py-3">
                <p className="font-semibold text-[#083228]">{r.customer.fullName}</p>
                <p className="text-xs text-[#53635f]">{r.customer.email}</p>
              </td>
              <td className="px-4 py-3">
                {r.category.name}
                {r.service ? (
                  <span className="block text-xs text-[#53635f]">{r.service.name}</span>
                ) : null}
              </td>
              <td className="px-4 py-3 text-[#53635f]">
                {r.city}
                {r.district ? ` / ${r.district}` : ""}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-[#eef8f5] px-2 py-1 text-xs font-bold text-[#087a61]">
                  {statusLabels[r.status] ?? r.status}
                </span>
              </td>
              <td className="px-4 py-3">{r._count.matches} usta</td>
              <td className="px-4 py-3 text-[#53635f]">
                {new Date(r.createdAt).toLocaleDateString("tr-TR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
