import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { expect, test } from '@playwright/test';

test('Edit prompt (success)', async ({ page }) => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const now = Date.now();
  const originalTitle = `Prompt de teste ${now}`;
  const originalContent = `Conteúdo do prompt de teste ${now}`;
  const updatedTitle = `Prompt de teste atualizado ${now}`;
  const updatedContent = `Conteúdo do prompt de teste atualizado ${now}`;

  const created = await prisma.prompt.create({
    data: {
      title: originalTitle,
      content: originalContent,
    },
  });
  await prisma.$disconnect();

  await page.goto(`/${created.id}`);
  await expect(page.getByPlaceholder('Título do prompt')).toBeVisible();

  await page.fill('input[name="title"]', updatedTitle);
  await page.fill('textarea[name="content"]', updatedContent);
  await page.getByRole('button', { name: 'Salvar' }).click();

  await page.waitForSelector('text=Prompt atualizado com sucesso', {
    state: 'visible',
    timeout: 5000,
  });

  await expect(page.getByRole('heading', { name: updatedTitle })).toBeVisible();
  await expect(page.locator('input[name="title"]')).toHaveValue(updatedTitle);
});
