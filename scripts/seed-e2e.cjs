/* eslint-disable @typescript-eslint/no-require-imports -- Local CommonJS fixture runner. */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const db = new URL(process.env.DATABASE_URL || '');
if (db.pathname !== '/swa_courses_test' || db.searchParams.get('host') !== '/private/tmp/swa-launch-pg.EPdzJk') {
  throw new Error('This fixture only accepts the isolated SWA test database');
}
const prisma = new PrismaClient();
async function main() {
  const passwordHash = await bcrypt.hash('local-test-password-2026', 10);
  await prisma.user.upsert({ where: { email: 'student@swa.test' }, update: {},
    create: { id: 'e2e-student', email: 'student@swa.test', name: 'Studente test', passwordHash } });
  // Reset only the synthetic fixture, so repeated test runs start unpaid.
  await prisma.enrollment.deleteMany({ where: { userId: 'e2e-student', courseId: { in: ['e2e-free', 'e2e-paid'] } } });
  await prisma.progress.deleteMany({ where: { userId: 'e2e-student', lessonId: { in: ['e2e-free-preview', 'e2e-free-private', 'e2e-paid-preview', 'e2e-paid-private'] } } });
  for (const [id, price] of [['e2e-free', 0], ['e2e-paid', 4900]]) {
    await prisma.course.upsert({ where: { id }, update: {}, create: {
      id, slug: id, title: price ? 'Corso test a pagamento' : 'Corso test gratuito',
      description: 'Corso sintetico per collaudare l’integrazione SWA. Non è un corso commerciale.',
      priceCents: price, published: true, category: 'Collaudo',
      modules: { create: { title: 'Modulo test', lessons: { create: [
        { id: id + '-preview', title: 'Anteprima test', type: 'TEXT', content: 'ANTEPRIMA-PUBBLICA-TEST', isFreePreview: true },
        { id: id + '-private', title: 'Lezione riservata test', type: 'TEXT', content: 'CONTENUTO-RISERVATO-TEST' },
      ] } } },
    } });
  }
}
main().finally(() => prisma.$disconnect());
