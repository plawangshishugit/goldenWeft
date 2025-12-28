import "dotenv/config";
import { MongoClient } from "mongodb";
import { PRODUCTS } from "../src/lib/products";

const uri = process.env.DATABASE_URL!;

async function main() {
  console.log("🌱 Seeding products using MongoDB native driver...");

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db("goldenWeft");
  const products = db.collection("Product");

  await products.deleteMany({}); // optional reset

  await products.insertMany(
    PRODUCTS.map((p) => ({
      slug: p.id,
      name: p.name,
      description: "",
      fabric: p.fabric,
      weight: p.weight,
      style: p.style,
      tier: p.tier,
      tones: p.tones,
      occasions: p.occasion,
      isNew: p.isNew ?? false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );

  console.log("✅ Product seeding complete.");
  await client.close();
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
