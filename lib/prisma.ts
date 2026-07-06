// Prisma client stub - requires real DATABASE_URL for production
// For development without DB, this provides type-safe mock responses

export const prisma: any = {
  user: {
    findUnique: async (args: any) => null,
    create: async ({ data }: any) => ({ ...data, id: 'mock-id' }),
  },
  wedding: {
    findUnique: async (args: any) => null,
    findMany: async (args: any) => [],
    create: async ({ data }: any) => ({ ...data, id: 'mock-id' }),
    update: async (args: any) => ({ ...(args.data || {}), id: 'mock-id' }),
    delete: async (args: any) => ({ success: true }),
  },
  photo: {
    findMany: async (args: any) => [],
    create: async ({ data }: any) => ({ ...data, id: 'mock-id' }),
  },
  order: {
    findMany: async (args: any) => [],
    count: async (args: any) => 0,
  },
  contactMessage: {
    create: async ({ data }: any) => ({ ...data, id: 'mock-id' }),
  },
  setting: {
    findMany: async () => [],
    upsert: async (args: any) => null,
  },
}
