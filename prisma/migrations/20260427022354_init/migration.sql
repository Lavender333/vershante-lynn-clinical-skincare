-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(255),
    "fullName" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "age" VARCHAR(50) NOT NULL,
    "concerns" TEXT[],
    "sensitivityLevel" VARCHAR(50) NOT NULL,
    "hormonalStage" VARCHAR(100) NOT NULL,
    "stressLevel" INTEGER NOT NULL,
    "sleepQuality" VARCHAR(50) NOT NULL,
    "waterIntake" VARCHAR(50) NOT NULL,
    "dietaryProfile" TEXT[],
    "activityLevel" VARCHAR(50) NOT NULL,
    "caffeineIntake" VARCHAR(50) NOT NULL,
    "currentRoutine" TEXT NOT NULL,
    "professionalHistory" TEXT NOT NULL,
    "goals" TEXT NOT NULL,
    "investmentPreference" VARCHAR(100) NOT NULL,
    "primaryIntent" TEXT NOT NULL,
    "clinicalFocus" TEXT[],
    "stepFeedback" JSONB,
    "clinicalResponse" TEXT,
    "meetingId" VARCHAR(255),
    "clinicalInsights" JSONB,
    "professionalNotes" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatingHours" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "dayConfig" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperatingHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationSlot" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "date" VARCHAR(50) NOT NULL,
    "time" VARCHAR(50) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultationSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" VARCHAR(100) NOT NULL,
    "bio" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConsultationSlot_assessmentId_key" ON "ConsultationSlot"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_email_key" ON "TeamMember"("email");

-- AddForeignKey
ALTER TABLE "ConsultationSlot" ADD CONSTRAINT "ConsultationSlot_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
