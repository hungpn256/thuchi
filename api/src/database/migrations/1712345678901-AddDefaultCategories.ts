import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDefaultCategories1712345678901 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm các default categories (global - userId = null)
    await queryRunner.query(`
      INSERT INTO categories (name, userId, "createdAt", "updatedAt")
      VALUES 
        ('Ăn uống', NULL, NOW(), NOW()),
        ('Đi lại', NULL, NOW(), NOW()),
        ('Mua sắm', NULL, NOW(), NOW()),
        ('Giải trí', NULL, NOW(), NOW()),
        ('Sức khỏe', NULL, NOW(), NOW()),
        ('Giáo dục', NULL, NOW(), NOW()),
        ('Tiền nhà', NULL, NOW(), NOW()),
        ('Điện nước', NULL, NOW(), NOW()),
        ('Internet', NULL, NOW(), NOW()),
        ('Bảo hiểm', NULL, NOW(), NOW()),
        ('Lương', NULL, NOW(), NOW()),
        ('Thưởng', NULL, NOW(), NOW()),
        ('Đầu tư', NULL, NOW(), NOW()),
        ('Khác', NULL, NOW(), NOW());
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa các default categories
    await queryRunner.query(`DELETE FROM categories WHERE userId IS NULL;`);
  }
}
