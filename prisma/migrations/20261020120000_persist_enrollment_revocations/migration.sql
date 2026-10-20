CREATE TABLE "enrollment_revocations" (
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "checkoutSessionId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "enrollment_revocations_pkey" PRIMARY KEY ("userId", "courseId", "checkoutSessionId")
);
