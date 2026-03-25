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
      } catch (error) {
        console.error('Failed to fetch user rank:', error);
      }
    };
    if (user) fetchMyRank();
  }, [apiCall, user]);

  const getRankDisplay = (rank) => {
    if (rank === 1) return {
      icon: <Trophy className="size-6 text-candle-accent-blue" />,
      bgColor: 'glass-card',
      borderColor: 'border-candle-accent-blue/40',
      textColor: 'text-white',
      badge: 'bg-candle-accent-blue/20 text-candle-accent-blue border-candle-accent-blue/30'
    };
    if (rank === 2) return {
      icon: <Medal className="size-6 text-candle-muted-blue" />,
      bgColor: 'glass-card',
      borderColor: 'border-candle-muted-blue/30',
      textColor: 'text-white',
      badge: 'bg-candle-muted-blue/20 text-candle-muted-blue border-candle-muted-blue/30'
    };
    if (rank === 3) return {
      icon: <Award className="size-6 text-candle-electric-blue" />,
      bgColor: 'glass-card',
      borderColor: 'border-candle-electric-blue/30',
      textColor: 'text-white',
      badge: 'bg-candle-electric-blue/20 text-candle-electric-blue border-candle-electric-blue/30'
    };
    return {
      icon: <span className="text-lg font-bold text-candle-muted-blue">#{rank}</span>,
      bgColor: 'glass-card',
      borderColor: 'border-candle-electric-blue/20',
      textColor: 'text-white',
      badge: 'bg-candle-electric-blue/10 text-candle-muted-blue border-candle-electric-blue/20'
    };
  };

  const isCurrentUser = (username) => user?.username === username;

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Leaderboard</h1>
          <p className="text-candle-muted-blue">
            See how you rank against other traders on CANDLE
          </p>
        </div>
      </div>

      {/* Your Ranking Card */}
      {myRank && (
        <div className="relative rounded-xl">
          <GlowingEffect {...glowProps} />
          <Card className="relative z-10 border-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Target className="size-5 text-candle-accent-blue" />
                Your Ranking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-white">Rank #{myRank}</div>
                  <div className="text-sm text-candle-muted-blue">
                    {user?.fullName || user?.username}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-candle-muted-blue">Points</div>
                    <div className="text-xl font-bold text-white">{user?.stats?.totalPoints || 0}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-candle-muted-blue">Accuracy</div>
                    <div className="text-xl font-bold text-white">
                      {user?.stats?.accuracyRate?.toFixed(1) || '0.0'}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-candle-muted-blue">Streak</div>
                    <div className="text-xl font-bold flex items-center gap-1 text-white">
                      <Flame className="size-4 text-candle-accent-blue" />
                      {user?.stats?.currentStreak || 0}
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Trophy className="size-5 text-candle-accent-blue" />
              Top Traders
            </CardTitle>
            <CardDescription className="text-candle-muted-blue">
              Rankings based on total points, accuracy, and predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-candle-muted-blue py-8">
                Loading leaderboard...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center text-candle-muted-blue py-8">
                No users on the leaderboard yet. Be the first to make predictions!
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry) => {
                  const rankDisplay = getRankDisplay(entry.rank);
                  const isCurrent = isCurrentUser(entry.username);

                  return (
                    <div
                      key={entry.username}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        isCurrent
                          ? 'border-candle-electric-blue bg-candle-electric-blue/10 shadow-glow-sm'
                          : rankDisplay.borderColor
                      } ${rankDisplay.bgColor} hover:glass-card-light`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-16 h-16">
                          {rankDisplay.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-bold text-lg truncate ${rankDisplay.textColor}`}>
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
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-sm text-candle-muted-blue mb-1">
                              <Star className="size-3" />Points
                            </div>
                            <div className="text-lg font-bold text-white">
                              {entry.stats.totalPoints.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-sm text-candle-muted-blue mb-1">
                              <TrendingUp className="size-3" />Accuracy
                            </div>
                            <div className="text-lg font-bold text-white">
                              {entry.stats.accuracyRate.toFixed(1)}%
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-sm text-candle-muted-blue mb-1">
                              <Flame className="size-3" />Streak
                            </div>
                            <div className="text-lg font-bold text-candle-accent-blue">
                              {entry.stats.currentStreak}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-sm text-candle-muted-blue mb-1">
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
          <CardHeader>
            <CardTitle className="text-lg text-white">How Rankings Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-candle-muted-blue">
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
              <p className="pt-2 text-xs">
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