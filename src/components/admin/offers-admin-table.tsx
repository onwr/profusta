type OfferRow = {
  id: string;
  price: number;
  status: string;
  createdAt: Date;
  provider: { user: { fullName: string; email: string } };
  request: { id: string; category: { name: string } };
};

export function OffersAdminTable({ offers }: { offers: OfferRow[] }) {
  if (offers.length === 0) {
    return <p className="text-sm text-[#53635f]">Teklif yok.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-black/5 bg-[#f7f7f3]">
          <tr>
            <th className="px-4 py-3 font-bold">Usta</th>
            <th className="px-4 py-3 font-bold">Kategori</th>
            <th className="px-4 py-3 font-bold">Fiyat</th>
            <th className="px-4 py-3 font-bold">Durum</th>
            <th className="px-4 py-3 font-bold">Tarih</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((o) => (
            <tr key={o.id} className="border-b border-black/5 last:border-0">
              <td className="px-4 py-3">
                <p className="font-semibold">{o.provider.user.fullName}</p>
                <p className="text-xs text-[#53635f]">{o.provider.user.email}</p>
              </td>
              <td className="px-4 py-3">{o.request.category.name}</td>
              <td className="px-4 py-3">{o.price.toLocaleString("tr-TR")} ₺</td>
              <td className="px-4 py-3">{o.status}</td>
              <td className="px-4 py-3 text-[#53635f]">
                {new Date(o.createdAt).toLocaleDateString("tr-TR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
