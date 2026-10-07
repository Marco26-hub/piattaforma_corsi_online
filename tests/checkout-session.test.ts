import test from "node:test";
import assert from "node:assert/strict";
import { isCompletedCoursePayment } from "../src/lib/checkout-session";

const paid = {
  mode: "payment", status: "complete", payment_status: "paid", amount_total: 4900,
  metadata: { userId: "user-a", courseId: "course-a" },
} as const;
const expected = { userId: "user-a", courseId: "course-a" };

test("accepts a completed payment for the authenticated user and requested course", () => {
  assert.equal(isCompletedCoursePayment(paid, expected), true);
});
test("rejects a receipt for another course or another user", () => {
  assert.equal(isCompletedCoursePayment(paid, { ...expected, courseId: "course-b" }), false);
  assert.equal(isCompletedCoursePayment(paid, { ...expected, userId: "user-b" }), false);
});
test("rejects pending payment, open checkout and subscription checkout", () => {
  assert.equal(isCompletedCoursePayment({ ...paid, payment_status: "unpaid" }, expected), false);
  assert.equal(isCompletedCoursePayment({ ...paid, status: "open" }, expected), false);
  assert.equal(isCompletedCoursePayment({ ...paid, mode: "subscription" }, expected), false);
});
test("rejects missing metadata/amount and permits a fully discounted completed payment", () => {
  assert.equal(isCompletedCoursePayment({ ...paid, metadata: {} }), false);
  assert.equal(isCompletedCoursePayment({ ...paid, amount_total: null }), false);
  assert.equal(isCompletedCoursePayment({ ...paid, amount_total: -1 }), false);
  assert.equal(isCompletedCoursePayment({ ...paid, payment_status: "no_payment_required", amount_total: 0 }, expected), true);
});
