import "dotenv/config";
import { dedupeCategories } from "../src/lib/categories/dedupe";
import { db } from "../src/lib/db";

async function main() {
  const result = await dedupeCategories();
  if (result.merged.length === 0) {
    console.log("Yinelenen kategori bulunamadı.");
  } else {
    for (const row of result.merged) {
      console.log(
        `${row.name}: /${row.kept} kaldı, silinen: ${row.removed.map((s) => `/${s}`).join(", ")}`,
      );
    }
    console.log(`Toplam ${result.merged.length} grup birleştirildi.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
