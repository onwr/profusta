import "dotenv/config";
import { db } from "../src/lib/db";

async function main() {
  const result = await db.homepageItem.deleteMany({
    where: { type: "FEATURED_SERVICE" },
  });
  console.log(`Silinen manuel popüler hizmet kartı: ${result.count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
