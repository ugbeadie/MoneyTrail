// import { PrismaClient } from "@prisma/client";

// declare global {
//   var prismaGlobal: PrismaClient | undefined;
// }
// const prisma = globalThis.prismaGlobal ?? new PrismaClient();
// if (process.env.NODE_ENV !== "production") {
//   globalThis.prismaGlobal = prisma;
// }

// export default prisma;
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
