// Seed file to populate default categories for all users

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default categories for all users
const DEFAULT_CATEGORIES = [
  // Income categories
  { name: 'Tiền lương', profileId: null },
  { name: 'Tiền thưởng', profileId: null },
  { name: 'Đầu tư', profileId: null },
  { name: 'Quà tặng', profileId: null },
  { name: 'Bán hàng', profileId: null },
  { name: 'Thu nhập phụ', profileId: null },

  // Expense categories
  { name: 'Ăn uống', profileId: null },
  { name: 'Mua sắm', profileId: null },
  { name: 'Di chuyển', profileId: null },
  { name: 'Nhà ở', profileId: null },
  { name: 'Hóa đơn & Tiện ích', profileId: null },
  { name: 'Giải trí', profileId: null },
  { name: 'Sức khỏe', profileId: null },
  { name: 'Giáo dục', profileId: null },
  { name: 'Bảo hiểm', profileId: null },
  { name: 'Quà tặng & Từ thiện', profileId: null },
  { name: 'Trả nợ', profileId: null },
  { name: 'Tiết kiệm', profileId: null },
  { name: 'Đầu tư', profileId: null },
  { name: 'Phí & Thuế', profileId: null },

  // Other category - default fallback
  { name: 'Khác', profileId: null },
];

async function main() {
  console.log(`Start seeding default categories...`);

  // Clear existing global categories
  await prisma.category.deleteMany({
    where: {
      profileId: null,
    },
  });

  // Insert default categories
  const categories = await Promise.all(
    DEFAULT_CATEGORIES.map(async (category) => {
      return prisma.category.create({
        data: category,
      });
    }),
  );

  console.log(`Seeded ${categories.length} default categories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
