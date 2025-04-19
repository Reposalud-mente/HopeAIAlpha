-- CreateTable
CREATE TABLE "DSM5Criteria" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "icdEquivalent" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DSM5Criteria_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "AssessmentDSM5Criteria" (
    "assessmentId" UUID NOT NULL,
    "dsmCode" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "certaintyLevel" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentDSM5Criteria_pkey" PRIMARY KEY ("assessmentId","dsmCode")
);

-- AddForeignKey
ALTER TABLE "AssessmentDSM5Criteria" ADD CONSTRAINT "AssessmentDSM5Criteria_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentDSM5Criteria" ADD CONSTRAINT "AssessmentDSM5Criteria_dsmCode_fkey" FOREIGN KEY ("dsmCode") REFERENCES "DSM5Criteria"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DSM5Criteria" ADD CONSTRAINT "DSM5Criteria_icdEquivalent_fkey" FOREIGN KEY ("icdEquivalent") REFERENCES "ICDCriteria"("code") ON DELETE SET NULL ON UPDATE CASCADE;
