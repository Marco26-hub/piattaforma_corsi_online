import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeLessonVideoUrl, isDirectLessonVideo } from "../src/lib/lesson-media";
import { coursePublicationIssues } from "../src/lib/course-publishing";
import { parseCourseFilters, courseFilterHref, courseFilterWhere } from "../src/lib/course-filters";
import { courseSchema, lessonSchema } from "../src/lib/validations";

test("video links normalize supported hosts and reject unsafe or misleading links", () => {
  assert.equal(normalizeLessonVideoUrl("https://youtu.be/dQw4w9WgXcQ?t=3"), "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  assert.equal(normalizeLessonVideoUrl("https://vimeo.com/123456/abcdef"), "https://player.vimeo.com/video/123456?h=abcdef");
  assert.equal(normalizeLessonVideoUrl("https://cdn.example/video.mp4?token=x"), "https://cdn.example/video.mp4?token=x");
  for (const url of ["javascript:alert(1)", "http://example.com/video.mp4", "https://u:p@example.com/video.mp4", "https://youtube.com.evil.invalid/watch?v=dQw4w9WgXcQ", "https://example.com/?video=.mp4"]) assert.equal(normalizeLessonVideoUrl(url), null);
  assert.equal(isDirectLessonVideo("https://example.com/?video=.mp4"), false);
});
test("publication requires usable lesson content and an active course", () => {
  const course = { title: "Corso esempio", description: "Descrizione completa", archivedAt: null, modules: [] };
  assert.ok(coursePublicationIssues(course).length);
  const complete = { ...course, modules: [{ lessons: [{ title: "Introduzione", type: "TEXT" as const, content: "Contenuto", videoUrl: null }] }] };
  assert.deepEqual(coursePublicationIssues(complete), []);
  assert.ok(coursePublicationIssues({ ...complete, archivedAt: new Date() }).length);
});
test("filters validate input, preserve encoded searches and reset status links", () => {
  const filters = parseCourseFilters({ q: "  a & b  ", status: "unknown", page: "-2", sort: "unknown" });
  assert.equal(filters.page, 1);
  assert.equal(filters.status, "all");
  assert.equal(courseFilterHref({ ...filters, status: "draft" }), "/admin/corsi?q=a+%26+b&status=draft");
  assert.equal(courseFilterHref({ status: "published" }), "/admin/corsi?status=published");
  assert.deepEqual(courseFilterWhere({ ...filters, q: "", status: "draft" }), { published: false, archivedAt: null });
});
test("course and lesson validation accepts free courses but requires actual content", () => {
  const course = { title: "Corso", description: "Descrizione del corso", price: 0, level: "BEGINNER" };
  assert.ok(courseSchema.safeParse(course).success);
  assert.equal(courseSchema.safeParse({ ...course, price: 1.001 }).success, false);
  const lesson = { title: "Lezione", moduleId: "module", type: "TEXT", content: "Testo" };
  assert.ok(lessonSchema.safeParse(lesson).success);
  assert.equal(lessonSchema.safeParse({ ...lesson, content: "  " }).success, false);
  assert.equal(lessonSchema.safeParse({ ...lesson, type: "VIDEO", videoUrl: "https://unknown.invalid/watch" }).success, false);
});
