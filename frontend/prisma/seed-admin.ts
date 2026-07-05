import { PrismaClient } from "@prisma/client";
import { DEFAULT_ADMIN_EMAIL, ensureDefaultAdmin } from "../lib/bootstrap-admin";

const prisma = new PrismaClient();

async function main() {
  const admin = await ensureDefaultAdmin(prisma);
  console.log(`Default admin ready: ${admin.email} (${admin.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
