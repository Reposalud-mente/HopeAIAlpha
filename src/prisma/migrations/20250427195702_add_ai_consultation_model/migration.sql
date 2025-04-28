-- CreateTable
CREATE TABLE "AIConsultation" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "messages" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConsultation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AIConsultation" ADD CONSTRAINT "AIConsultation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
