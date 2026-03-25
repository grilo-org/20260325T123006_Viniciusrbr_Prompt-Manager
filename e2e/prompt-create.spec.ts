import { PrismaClient } from '@/generated/prisma/client';
import { test, expect } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

test('Prompt Creation via UI (Success)', async ({ page }) => {
  const promptTitle = 'New Prompt';
  const promptContent = 'This is a new prompt created for testing purposes.';

  await page.goto('/new');
  await expect(page.getByPlaceholder('Título do prompt')).toBeVisible();
  await page.fill('input[name="title"]', promptTitle);
  await page.fill('textarea[name="content"]', promptContent);
  await page.getByRole('button', { name: 'Salvar' }).click();

  await page.waitForSelector('text=Prompt criado com sucesso', {
    state: 'visible',
    timeout: 15000,
  });
});

test('Validation of duplicate titles', async ({ page }) => {
  const duplicateTitle = 'Duplicate Prompt';
  const duplicateContent =
    'This prompt is created to test duplicate title validation.';

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  await prisma.prompt.deleteMany({ where: { title: duplicateTitle } });
  await prisma.prompt.create({
    data: {
      title: duplicateTitle,
      content: duplicateContent,
    },
  });
  await prisma.$disconnect();

  await page.goto('/new');
  await expect(page.getByPlaceholder('Título do prompt')).toBeVisible();
  await page.fill('input[name="title"]', duplicateTitle);
  await page.fill('textarea[name="content"]', duplicateContent);
  await page.getByRole('button', { name: 'Salvar' }).click();

  await page.waitForSelector('text=Este prompt já existe', {
    state: 'visible',
    timeout: 15000,
  });
  await expect(page.getByRole('heading', { name: duplicateTitle })).toHaveCount(
    1
  );
});
