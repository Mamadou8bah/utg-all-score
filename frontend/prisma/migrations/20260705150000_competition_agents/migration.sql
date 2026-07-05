-- CreateTable
CREATE TABLE "CompetitionAgent" (
    "competitionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitionAgent_pkey" PRIMARY KEY ("competitionId","userId")
);

-- AddForeignKey
ALTER TABLE "CompetitionAgent" ADD CONSTRAINT "CompetitionAgent_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionAgent" ADD CONSTRAINT "CompetitionAgent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
