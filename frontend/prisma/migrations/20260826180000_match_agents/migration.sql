-- CreateTable
CREATE TABLE "MatchAgent" (
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchAgent_pkey" PRIMARY KEY ("matchId","userId")
);

-- AddForeignKey
ALTER TABLE "MatchAgent" ADD CONSTRAINT "MatchAgent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchAgent" ADD CONSTRAINT "MatchAgent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
