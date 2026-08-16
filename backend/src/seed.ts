import { prisma } from "./repositories/scm.repo.js";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");
  
  const superadminEmail = "superadmin@supplyx.com";
  const existing = await prisma.user.findUnique({
    where: { email: superadminEmail }
  });

  if (existing) {
    console.log(`⚠️ User ${superadminEmail} already exists. Skipping.`);
    return;
  }

  const hashedPassword = await bcrypt.hash("Password123", 10);
  
  // Set all permissions to true for Superadmin
  const fullPermissions: Record<string, any> = {};
  const modules = [
    "analytics",
    "suppliers",
    "requisitions",
    "rfqs",
    "orders",
    "goods-receipts",
    "invoices",
    "payments",
    "budget",
    "contracts",
    "warehouses",
    "inventory",
    "shipments",
    "logistics",
    "carriers",
    "customers",
    "users"
  ];
  
  for (const mod of modules) {
    fullPermissions[mod] = {
      view: true,
      create: true,
      edit: true,
      delete: true
    };
  }

  await prisma.user.create({
    data: {
      email: superadminEmail,
      name: "Super Administrator",
      password: hashedPassword,
      role: "Superadmin",
      permissions: fullPermissions
    }
  });

  console.log(`✅ Created Superadmin: ${superadminEmail} / Password123`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
