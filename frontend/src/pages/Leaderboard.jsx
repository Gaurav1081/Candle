import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import {
  Trophy,
  Medal,
  Award,
  Star,
  Target,
  Flame,
  TrendingUp,
} from 'lucide-react';

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768;

const glowProps = {
  spread: 60,
  glow: true,
  disabled: IS_MOBILE,
  proximity: 64,
  inactiveZone: 0.01,
  borderWidth: 2,
  movementDuration: 1.2,
};

function Leaderboard() {
  const { user, apiCall } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState(null);
  const [myRankData, setMyRankData] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await apiCall('/leaderboard');
        setLeaderboard(response?.leaderboard || []);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [apiCall]);

  useEffect(() => {
    const fetchMyRank = async () => {
      try {
        const response = await apiCall('/leaderboard/my-rank');
        setMyRank(response?.rank);
        setMyRankData(response?.user);
      } catch (error) {
        console.error('Failed to fetch user rank:', error);
      }
    };
    if (user) fetchMyRank();
  }, [apiCall, user]);

  const getRankDisplay = (rank) => {
    const r = Number(rank);
    if (r === 1) return {
      icon: <Trophy className="size-5 sm:size-6 text-candle-accent-blue" />,
      bgColor: 'glass-card',
      borderColor: 'border-candle-accent-blue/40',
      textColor: 'text-white',
      badge: 'bg-candle-accent-blue/20 text-candle-accent-blue border-candle-accent-blue/30'
    };
    if (r === 2) return {
      icon: <Medal className="size-5 sm:size-6 text-candle-muted-blue" />,
      bgColor: 'glass-card',
      borderColor: 'border-candle-muted-blue/30',
      textColor: 'text-white',
      badge: 'bg-candle-muted-blue/20 text-candle-muted-blue border-candle-muted-blue/30'
    };
    if (r === 3) return {
      icon: <Award className="size-5 sm:size-6 text-candle-electric-blue" />,
      bgColor: 'glass-card',
      borderColor: 'border-candle-electric-blue/30',
      textColor: 'text-white',
      badge: 'bg-candle-electric-blue/20 text-candle-electric-blue border-candle-electric-blue/30'
    };
    return {
      icon: <span className="text-base sm:text-lg font-bold text-candle-muted-blue">#{r}</span>,
      bgColor: 'glass-card',
      borderColor: 'border-candle-electric-blue/20',
      textColor: 'text-white',
      badge: 'bg-candle-electric-blue/10 text-candle-muted-blue border-candle-electric-blue/20'
    };
  };

  const isCurrentUser = (username) => user?.username === username;

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Leaderboard</h1>
          <p className="text-sm sm:text-base text-candle-muted-blue mt-0.5">
            See how you rank against other traders on CANDLE
          </p>
        </div>
      </div>

      {/* Your Ranking Card */}
      {myRank && (
        <div className="relative rounded-xl">
          <GlowingEffect {...glowProps} />
          <Card className="relative z-10 border-transparent">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
                <Target className="size-4 sm:size-5 text-candle-accent-blue" />
                Your Ranking
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mobile: stacked layout; sm+: horizontal */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div className="space-y-0.5">
                  <div className="text-xl sm:text-2xl font-bold text-white">Rank #{myRank}</div>
                  <div className="text-sm text-candle-muted-blue">
                    {myRankData?.fullName || myRankData?.username || user?.fullName || user?.username}
                  </div>
                </div>

                {/* Stats: 3-column grid on mobile, row on sm+ */}
                <div className="grid grid-cols-3 sm:flex sm:items-center gap-3 sm:gap-4">
                  <div className="text-center sm:text-right">
                    <div className="text-xs sm:text-sm text-candle-muted-blue">Points</div>
                    <div className="text-lg sm:text-xl font-bold text-white">
                      {myRankData?.stats?.totalPoints ?? user?.stats?.totalPoints ?? 0}
                    </div>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-xs sm:text-sm text-candle-muted-blue">Accuracy</div>
                    <div className="text-lg sm:text-xl font-bold text-white">
                      {(myRankData?.stats?.accuracyRate ?? user?.stats?.accuracyRate ?? 0).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-xs sm:text-sm text-candle-muted-blue">Streak</div>
                    <div className="text-lg sm:text-xl font-bold flex items-center justify-center sm:justify-end gap-1 text-white">
                      <Flame className="size-3.5 sm:size-4 text-candle-accent-blue" />
                      {myRankData?.stats?.currentStreak ?? user?.stats?.currentStreak ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Traders Card */}
      <div className="relative rounded-xl">
        <GlowingEffect {...glowProps} />
        <Card className="relative z-10 border-transparent">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
              <Trophy className="size-4 sm:size-5 text-candle-accent-blue" />
              Top Traders
            </CardTitle>
            <CardDescription className="text-candle-muted-blue text-xs sm:text-sm">
              Rankings based on total points, accuracy, and predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-candle-muted-blue py-8 text-sm">
                Loading leaderboard...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center text-candle-muted-blue py-8 text-sm px-4">
                No users on the leaderboard yet. Be the first to make predictions!
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {leaderboard.map((entry) => {
                  const rankDisplay = getRankDisplay(entry.rank);
                  const isCurrent = isCurrentUser(entry.username);

                  return (
                    <div
                      key={entry.username}
                      className={`p-3 sm:p-4 border-2 rounded-lg transition-all ${
                        isCurrent
                          ? 'border-candle-electric-blue bg-candle-electric-blue/10 shadow-glow-sm'
                          : rankDisplay.borderColor
                      } ${rankDisplay.bgColor} hover:glass-card-light`}
                    >
                      {/* ── Mobile layout (< sm) ── */}
                      <div className="flex sm:hidden items-start gap-3">
                        {/* Rank icon */}
                        <div className="flex items-center justify-center w-10 h-10 shrink-0 mt-0.5">
                          {rankDisplay.icon}
                        </div>

                        {/* Name + stats */}
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Name row */}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-bold text-base leading-tight truncate ${rankDisplay.textColor}`}>
                                {entry.fullName || entry.username}
                              </span>
                              {isCurrent && (
                                <Badge className="text-xs bg-candle-electric-blue/20 text-candle-electric-blue border-candle-electric-blue/30 shrink-0">
                                  You
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-candle-muted-blue">@{entry.username}</div>
                          </div>

                          {/* 2×2 stats grid */}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                            <div>
                              <div className="flex items-center gap-1 text-xs text-candle-muted-blue">
                                <Star className="size-3" />Points
                              </div>
                              <div className="text-sm font-bold text-white">
                                {entry.stats.totalPoints.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1 text-xs text-candle-muted-blue">
                                <TrendingUp className="size-3" />Accuracy
                              </div>
                              <div className="text-sm font-bold text-white">
                                {entry.stats.accuracyRate.toFixed(1)}%
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1 text-xs text-candle-muted-blue">
                                <Flame className="size-3" />Streak
                              </div>
                              <div className="text-sm font-bold text-candle-accent-blue">
                                {entry.stats.currentStreak}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1 text-xs text-candle-muted-blue">
                                <Target className="size-3" />Predictions
                              </div>
                              <div className="text-xs font-medium text-white">
                                {entry.stats.correctPredictions}/{entry.stats.totalPredictions}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ── Desktop layout (≥ sm) ── */}
                      <div className="hidden sm:flex items-center gap-4">
                        {/* Rank icon */}
                        <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 shrink-0">
                          {rankDisplay.icon}
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`font-bold text-base md:text-lg truncate ${rankDisplay.textColor}`}>
                              {entry.fullName || entry.username}
                            </span>
                            {isCurrent && (
                              <Badge className="text-xs bg-candle-electric-blue/20 text-candle-electric-blue border-candle-electric-blue/30">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-candle-muted-blue">@{entry.username}</div>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-4 md:gap-6 shrink-0">
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-candle-muted-blue mb-1">
                              <Star className="size-3" />Points
                            </div>
                            <div className="text-base md:text-lg font-bold text-white">
                              {entry.stats.totalPoints.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-candle-muted-blue mb-1">
                              <TrendingUp className="size-3" />Accuracy
                            </div>
                            <div className="text-base md:text-lg font-bold text-white">
                              {entry.stats.accuracyRate.toFixed(1)}%
                            </div>
                          </div>
                          <div className="text-center hidden md:block">
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-candle-muted-blue mb-1">
                              <Flame className="size-3" />Streak
                            </div>
                            <div className="text-base md:text-lg font-bold text-candle-accent-blue">
                              {entry.stats.currentStreak}
                            </div>
                          </div>
                          <div className="text-center hidden lg:block">
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-candle-muted-blue mb-1">
                              <Target className="size-3" />Predictions
                            </div>
                            <div className="text-sm font-medium text-white">
                              {entry.stats.correctPredictions}/{entry.stats.totalPredictions}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* How Rankings Work */}
      <div className="relative rounded-xl">
        <GlowingEffect {...glowProps} />
        <Card className="relative z-10 border-transparent">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg text-white">How Rankings Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs sm:text-sm text-candle-muted-blue">
              <p>
                <span className="font-semibold text-white">1. Total Points</span> —
                Your primary ranking metric. Earn points by making accurate predictions.
              </p>
              <p>
                <span className="font-semibold text-white">2. Accuracy Rate</span> —
                If tied on points, higher accuracy percentage wins.
              </p>
              <p>
                <span className="font-semibold text-white">3. Total Predictions</span> —
                If still tied, more predictions places you higher (shows activity).
              </p>
              <p className="pt-1 text-xs opacity-70">
                Only active users with at least 1 prediction are shown on the leaderboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Leaderboard;