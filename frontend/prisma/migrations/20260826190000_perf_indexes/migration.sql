-- Performance indexes for common list/filter queries
CREATE INDEX IF NOT EXISTS "Player_teamId_idx" ON "Player"("teamId");
CREATE INDEX IF NOT EXISTS "Player_goals_assists_idx" ON "Player"("goals", "assists");
CREATE INDEX IF NOT EXISTS "CompetitionGroup_competitionId_idx" ON "CompetitionGroup"("competitionId");
CREATE INDEX IF NOT EXISTS "CompetitionAgent_userId_idx" ON "CompetitionAgent"("userId");
CREATE INDEX IF NOT EXISTS "Match_status_kickoff_idx" ON "Match"("status", "kickoff");
CREATE INDEX IF NOT EXISTS "Match_competitionId_status_kickoff_idx" ON "Match"("competitionId", "status", "kickoff");
CREATE INDEX IF NOT EXISTS "Match_homeTeamId_idx" ON "Match"("homeTeamId");
CREATE INDEX IF NOT EXISTS "Match_awayTeamId_idx" ON "Match"("awayTeamId");
CREATE INDEX IF NOT EXISTS "Match_groupId_idx" ON "Match"("groupId");
CREATE INDEX IF NOT EXISTS "MatchAgent_userId_idx" ON "MatchAgent"("userId");
CREATE INDEX IF NOT EXISTS "MatchEvent_matchId_idx" ON "MatchEvent"("matchId");
CREATE INDEX IF NOT EXISTS "LineupPlayer_matchId_teamId_idx" ON "LineupPlayer"("matchId", "teamId");
CREATE INDEX IF NOT EXISTS "Standing_competitionId_idx" ON "Standing"("competitionId");
CREATE INDEX IF NOT EXISTS "NewsArticle_published_publishedAt_idx" ON "NewsArticle"("published", "publishedAt");
CREATE INDEX IF NOT EXISTS "Announcement_active_createdAt_idx" ON "Announcement"("active", "createdAt");
