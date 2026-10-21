import { after, afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { prisma } from "../src/lib/prisma";
import { createCourseRecord, updateCourseRecord, duplicateCourseRecord, publishCourseRecord, archiveCourseRecord, saveModuleRecord, saveLessonRecord, removeModuleRecord, removeLessonRecord, moveCourseItem } from "../src/lib/course-store";
const database = new URL(process.env.DATABASE_URL ?? "http://missing");
if (!["localhost", "127.0.0.1"].includes(database.hostname) || !database.pathname.endsWith("_test")) throw new Error("Explicit local test database required");
const ids: string[] = [];
const users: string[] = [];
const values = (title = `Corso ${randomUUID()}`) => ({ title, description: "Descrizione completa del corso", price: 0, level: "BEGINNER" as const, published: true });
async function course() { const row = await createCourseRecord(values()); ids.push(row.id); return row; }
async function moduleFor(id: string, title = "Modulo") { await saveModuleRecord(id, title); return (await prisma.module.findFirstOrThrow({ where: { courseId: id }, orderBy: { order: "desc" } })).id; }
async function lessonFor(id: string, moduleId: string, title = "Lezione") { await saveLessonRecord(id, { title, moduleId, type: "TEXT", content: "Contenuto della lezione" }); return (await prisma.lesson.findFirstOrThrow({ where: { moduleId }, orderBy: { order: "desc" } })).id; }
afterEach(async () => { await prisma.user.deleteMany({ where: { id: { in: users.splice(0) } } }); await prisma.course.deleteMany({ where: { id: { in: ids.splice(0) } } }); });
after(() => prisma.$disconnect());
test("creation is draft, renaming retains URLs, duplicate titles get unique slugs", async () => {
  const first = await course();
  assert.equal(first.published, false);
  const updated = await updateCourseRecord(first.id, values("Titolo diverso"));
  assert.equal(updated.slug, first.slug);
  const second = await createCourseRecord(values(first.title)); ids.push(second.id);
  assert.notEqual(second.slug, first.slug);
});
test("publishing is guarded and archiving retains enrollments and progress", async () => {
  const row = await course();
  await assert.rejects(publishCourseRecord(row.id, true), /lezione/);
  const mod = await moduleFor(row.id), lesson = await lessonFor(row.id, mod);
  await publishCourseRecord(row.id, true);
  const user = await prisma.user.create({ data: { email: `${randomUUID()}@example.invalid`, passwordHash: "fixture" } }); users.push(user.id);
  await prisma.enrollment.create({ data: { userId: user.id, courseId: row.id, amountPaidCents: 0 } });
  await prisma.progress.create({ data: { userId: user.id, lessonId: lesson, completed: true } });
  await assert.rejects(removeLessonRecord(row.id, lesson), /storico/);
  await assert.rejects(removeModuleRecord(row.id, mod), /storico/);
  await archiveCourseRecord(row.id, true);
  assert.equal(await prisma.enrollment.count({ where: { courseId: row.id } }), 1);
  assert.equal(await prisma.progress.count({ where: { userId: user.id } }), 1);
  await assert.rejects(publishCourseRecord(row.id, true), /Ripristina/);
  assert.equal((await archiveCourseRecord(row.id, false)).published, false);
});
test("duplicates copy curriculum, never enrollment or progress", async () => {
  const row = await course(), mod = await moduleFor(row.id); await lessonFor(row.id, mod);
  const user = await prisma.user.create({ data: { email: `${randomUUID()}@example.invalid`, passwordHash: "fixture" } }); users.push(user.id);
  await prisma.enrollment.create({ data: { userId: user.id, courseId: row.id, amountPaidCents: 0 } });
  const copy = await duplicateCourseRecord(row.id); ids.push(copy.id);
  assert.equal(copy.published, false); assert.equal(copy.featured, false);
  assert.equal(await prisma.lesson.count({ where: { module: { courseId: copy.id } } }), 1);
  assert.equal(await prisma.enrollment.count({ where: { courseId: copy.id } }), 0);
});
test("ownership, ordering and final published lesson are protected", async () => {
  const a = await course(), b = await course();
  const ma = await moduleFor(a.id), mb = await moduleFor(b.id);
  const first = await lessonFor(a.id, ma, "Prima"), second = await lessonFor(a.id, ma, "Seconda");
  await assert.rejects(saveModuleRecord(a.id, "Alterato", mb), /non trovato/);
  await assert.rejects(saveLessonRecord(a.id, { title: "Alterata", type: "TEXT", content: "Testo", moduleId: mb }), /non trovato/);
  await assert.rejects(removeLessonRecord(b.id, first), /non trovata/);
  await moveCourseItem(a.id, second, "lesson", "up");
  assert.deepEqual((await prisma.lesson.findMany({ where: { moduleId: ma }, orderBy: { order: "asc" } })).map(x => x.id), [second, first]);
  await removeLessonRecord(a.id, first);
  await publishCourseRecord(a.id, true);
  await assert.rejects(removeLessonRecord(a.id, second), /Ritira/);
  await assert.rejects(removeModuleRecord(a.id, ma), /Ritira/);
});
test("concurrent module additions have distinct order positions", async () => {
  const row = await course();
  await Promise.all([saveModuleRecord(row.id, "Primo"), saveModuleRecord(row.id, "Secondo"), saveModuleRecord(row.id, "Terzo")]);
  const modules = await prisma.module.findMany({ where: { courseId: row.id } });
  assert.equal(new Set(modules.map(x => x.order)).size, 3);
});
