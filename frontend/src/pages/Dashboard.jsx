import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import {
  Target,
  Flame,
  Star,
  Trophy,
  Activity,
  Calendar,
  MessageSquare,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Heart,
  AlertCircle,
} from 'lucide-react';

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY ;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768;

function Dashboard({ onNavigate }) {
  const { user, apiCall } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loadingPredictions, setLoadingPredictions] = useState(true);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  const [upcomingEarnings, setUpcomingEarnings] = useState([]);
  const [loadingEarnings, setLoadingEarnings] = useState(true);
  const [earningsError, setEarningsError] = useState(null);
  const [globalRank, setGlobalRank] = useState(null);

  useEffect(() => {
    const fetchGlobalRank = async () => {
      try {
        const response = await apiCall('/leaderboard/my-rank');
        setGlobalRank(response?.rank);
      } catch { setGlobalRank(null); }
    };
    if (user) fetchGlobalRank();
  }, [apiCall, user]);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoadingPredictions(true);
        const response = await apiCall('/predictions?limit=5');
        setPredictions(response?.predictions || []);
      } catch { setPredictions([]); }
      finally { setLoadingPredictions(false); }
    };
    fetchPredictions();
  }, [apiCall]);

  useEffect(() => {
    const fetchCommunityPosts = async () => {
      try {
        setLoadingCommunity(true);
        const response = await apiCall('/community?limit=3');
        setCommunityPosts(response?.posts || []);
      } catch { setCommunityPosts([]); }
      finally { setLoadingCommunity(false); }
    };
    fetchCommunityPosts();
  }, [apiCall]);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoadingEarnings(true);
        setEarningsError(null);
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 14);
        const fromDate = today.toISOString().split('T')[0];
        const toDate = futureDate.toISOString().split('T')[0];
        const response = await fetch(
          `${FINNHUB_BASE_URL}/calendar/earnings?from=${fromDate}&to=${toDate}&token=${FINNHUB_API_KEY}`
        );
        if (!response.ok) throw new Error(`Finnhub API error: ${response.status}`);
        const data = await response.json();
        if (data.earningsCalendar?.length > 0) {
          const processedEarnings = data.earningsCalendar
            .filter(item => item.symbol && item.date)
            .slice(0, 5)
            .map(item => ({
              symbol: item.symbol,
              company: item.symbol,
              date: formatEarningsDate(item.date),
              time: item.hour === 'bmo' ? 'Before Market' :
                    item.hour === 'amc' ? 'After Market' : 'During Market',
              rawDate: new Date(item.date),
            }))
            .sort((a, b) => a.rawDate - b.rawDate);
          setUpcomingEarnings(processedEarnings);
        } else {
          setUpcomingEarnings([]);
        }
      } catch (error) {
        setEarningsError(error.message);
        setUpcomingEarnings([]);
      } finally {
        setLoadingEarnings(false);
      }
    };
    fetchEarnings();
  }, []);

  const formatEarningsDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const activeStreak = user?.stats?.currentStreak || 0;
  const totalPoints = user?.stats?.totalPoints || 0;
  const displayRank = globalRank;
  const accuracyRate = user?.stats?.accuracyRate != null
    ? Number(user.stats.accuracyRate).toFixed(1) : '0.0';

  const getPredictionTypeBadge = (type) => {
    const badges = {
      EVENT: { label: 'Event', color: 'bg-candle-accent-blue/20 text-candle-accent-blue border border-candle-accent-blue/30' },
      TIME_WINDOW: { label: 'Time', color: 'bg-green-400/20 text-green-400 border border-green-400/30' },
      TARGET: { label: 'Target', color: 'bg-candle-electric-blue/20 text-candle-electric-blue border border-candle-electric-blue/30' }
    };
    return badges[type] || { label: type, color: 'bg-candle-muted-blue/20 text-candle-muted-blue border border-candle-muted-blue/30' };
  };

  const DURATION_LABELS = { 10: '10m', 20: '20m', 30: '30m', 60: '1h', 1440: '1D', 10080: '7D', 43200: '30D' };

  const formatDuration = (prediction) => {
    if (prediction.durationMinutes) return DURATION_LABELS[prediction.durationMinutes] || `${prediction.durationMinutes}m`;
    if (prediction.timeWindow) return prediction.timeWindow;
    return 'N/A';
  };

  const getPredictionDetails = (prediction) => {
    if (prediction.predictionType === 'EVENT') return `Predict: ${prediction.eventPrediction || prediction.eventOutcome}`;
    if (prediction.predictionType === 'TIME_WINDOW') return `${formatDuration(prediction)} ${prediction.priceDirection || prediction.direction}`;
    if (prediction.predictionType === 'TARGET') return `Target: $${prediction.targetPrice ? prediction.targetPrice.toFixed(2) : 'N/A'}`;
    return 'N/A';
  };

  const getResultIcon = (result) => {
    if (result === 'Beat') return <TrendingUp className="size-3 inline" />;
    if (result === 'Miss') return <TrendingDown className="size-3 inline" />;
    if (result === 'Meet') return <Minus className="size-3 inline" />;
    return null;
  };

  const formatStatus = (prediction) => {
    if (prediction.status === 'pending') return 'Pending';
    if (prediction.status === 'locked') return 'Locked';
    if (prediction.status === 'evaluated') {
      if (prediction.actualResult) return prediction.actualResult;
      return prediction.isCorrect ? 'Correct ✓' : 'Wrong ✗';
    }
    return prediction.status;
  };

  const getStatusVariant = (prediction) => {
    if (prediction.status === 'evaluated') {
      if (prediction.actualResult === 'Beat') return 'default';
      if (prediction.actualResult === 'Meet') return 'secondary';
      if (prediction.actualResult === 'Miss') return 'destructive';
      return prediction.isCorrect ? 'default' : 'destructive';
    }
    if (prediction.status === 'locked') return 'outline';
    return 'secondary';
  };

  const formatPoints = (points) => {
    if (points == null || points === 0) return '0';
    return points > 0 ? `+${points}` : `${points}`;
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'mo ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm ago';
    return Math.floor(seconds) + 's ago';
  };

  const statCards = [
    {
      title: 'Current Streak',
      icon: <Flame className="size-5 text-candle-accent-blue" />,
      value: `${activeStreak} days`,
      sub: { text: 'Keep it going!', color: 'text-candle-accent-blue' },
    },
    {
      title: 'Total Points',
      icon: <Star className="size-5 text-candle-muted-blue" />,
      value: totalPoints.toLocaleString(),
      sub: { text: 'Your lifetime score', color: 'text-candle-muted-blue' },
    },
    {
      title: 'Global Rank',
      icon: <Trophy className="size-5 text-candle-muted-blue" />,
      value: displayRank != null ? `#${displayRank}` : '—',
      sub: { text: 'Keep climbing!', color: 'text-green-400' },
    },
    {
      title: 'Accuracy Rate',
      icon: <Activity className="size-5 text-candle-muted-blue" />,
      value: `${accuracyRate}%`,
      sub: { text: 'Great accuracy!', color: 'text-green-400' },
    },
  ];

  // Shared glow props — stronger visibility
  const glowProps = {
    spread: 60,       // wider arc
    glow: true,
    disabled: IS_MOBILE,
    proximity: 80,
    inactiveZone: 0.01,
    borderWidth: 2,   // thicker border line so glow is more visible
    movementDuration: 1.2,
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Welcome back, {user?.fullName?.split(' ')[0] || user?.username || 'Trader'}!
          </h1>
          <p className="text-candle-muted-blue mt-1">
            Ready to make some predictions? Let's see how your portfolio performs today.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => onNavigate('stocks')}
          className="candle-gradient hover:shadow-glow transition-all"
        >
          <Target className="size-4 mr-2" />
          New Prediction
        </Button>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            // NO border here — GlowingEffect's borderWidth IS the only border
            className="relative rounded-xl hover:scale-[1.02] transition-all duration-300"
          >
            <GlowingEffect {...glowProps} />
            {/* border-transparent kills shadcn Card's default border */}
            <Card className="relative z-10 glass-card border-transparent h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">{card.title}</CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{card.value}</div>
                <p className={`text-xs font-medium mt-1 ${card.sub.color}`}>{card.sub.text}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* ── Recent Predictions + Upcoming Earnings ───────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* Recent Predictions */}
        <div className="relative rounded-xl">
          <GlowingEffect {...glowProps} />
          <Card className="relative z-10 premium-card border-transparent h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Target className="size-5 text-candle-accent-blue" />
                    Recent Predictions
                  </CardTitle>
                  <CardDescription className="text-candle-muted-blue">
                    Your latest predictions and results
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('myPredictions')}
                  className="text-candle-muted-blue hover:text-white hover:bg-candle-electric-blue/10"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingPredictions ? (
                <div className="text-center text-candle-muted-blue py-8">Loading predictions...</div>
              ) : predictions.length === 0 ? (
                <div className="text-center text-candle-muted-blue py-8">No predictions yet. Start making predictions!</div>
              ) : (
                predictions.map((prediction) => {
                  const typeBadge = getPredictionTypeBadge(prediction.predictionType);
                  const showBeatMeetMiss = prediction.status === 'evaluated' && prediction.actualResult;
                  return (
                    <div
                      key={prediction._id}
                      className="p-4 border border-candle-electric-blue/20 rounded-lg glass-card hover:glass-card-light hover:border-candle-accent-blue/50 transition-all duration-300 space-y-2 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-lg">{prediction.ticker}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${typeBadge.color}`}>{typeBadge.label}</span>
                        </div>
                        <Badge
                          variant={getStatusVariant(prediction)}
                          className={
                            prediction.actualResult === 'Beat' ? 'bg-green-400/20 text-green-400 border-green-400/30' :
                            prediction.actualResult === 'Meet' ? 'bg-candle-muted-blue/20 text-candle-muted-blue border-candle-muted-blue/30' :
                            prediction.actualResult === 'Miss' ? 'bg-red-400/20 text-red-400 border-red-400/30' :
                            prediction.isCorrect ? 'bg-candle-electric-blue/20 text-candle-electric-blue border-candle-electric-blue/30' :
                            'bg-candle-electric-blue/10 text-candle-muted-blue border-candle-electric-blue/20'
                          }
                        >
                          {showBeatMeetMiss ? (
                            <span className="flex items-center gap-1">{getResultIcon(prediction.actualResult)}{prediction.actualResult}</span>
                          ) : formatStatus(prediction)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-candle-muted-blue">{getPredictionDetails(prediction)}</span>
                        <span className={`font-bold ${prediction.points > 0 ? 'text-green-400' : prediction.points < 0 ? 'text-red-400' : 'text-candle-muted-blue'}`}>
                          {formatPoints(prediction.points)}
                        </span>
                      </div>
                      {prediction.status === 'evaluated' && prediction.resultDetails && (
                        <div className="text-xs text-candle-muted-blue pt-2 border-t border-candle-electric-blue/10">
                          {prediction.resultDetails}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Earnings */}
        <div className="relative rounded-xl">
          <GlowingEffect {...glowProps} />
          <Card className="relative z-10 premium-card border-transparent h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="size-5 text-candle-accent-blue" />
                Upcoming Earnings
              </CardTitle>
              <CardDescription className="text-candle-muted-blue">
                Companies reporting earnings soon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingEarnings ? (
                <div className="text-center text-candle-muted-blue py-8">Loading earnings calendar...</div>
              ) : earningsError ? (
                <div className="text-center py-8">
                  <AlertCircle className="size-12 mx-auto mb-4 text-candle-muted-blue opacity-30" />
                  <p className="text-sm text-candle-muted-blue mb-2">Unable to load earnings calendar</p>
                  <p className="text-xs text-candle-muted-blue/70">{earningsError}</p>
                </div>
              ) : upcomingEarnings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="size-12 mx-auto mb-4 text-candle-muted-blue opacity-30" />
                  <p className="text-sm text-candle-muted-blue">No upcoming earnings in the next 2 weeks</p>
                </div>
              ) : (
                <>
                  {upcomingEarnings.map((earning, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-candle-electric-blue/20 rounded-lg glass-card hover:glass-card-light hover:border-candle-accent-blue/50 transition-all duration-300 cursor-pointer"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-white">{earning.symbol}</div>
                        <div className="text-sm text-candle-muted-blue">{earning.company}</div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm font-semibold text-candle-accent-blue">{earning.date}</div>
                        <div className="text-xs text-candle-muted-blue">{earning.time}</div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full border-candle-electric-blue/30 text-candle-muted-blue hover:text-white hover:bg-candle-electric-blue/10 hover:border-candle-accent-blue"
                    onClick={() => onNavigate('stocks')}
                  >
                    <Calendar className="size-4 mr-2" />
                    Make Earnings Predictions
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Community Activity ───────────────────────────────────────────── */}
      <div className="relative rounded-xl">
        <GlowingEffect {...glowProps} />
        <Card className="relative z-10 premium-card border-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <MessageSquare className="size-5 text-candle-accent-blue" />
              Community Activity
            </CardTitle>
            <CardDescription className="text-candle-muted-blue">
              Latest discussions and insights from the CANDLE community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingCommunity ? (
              <div className="text-center text-candle-muted-blue py-8">Loading community posts...</div>
            ) : communityPosts.length === 0 ? (
              <div className="text-center text-candle-muted-blue py-12">
                <MessageSquare className="size-16 mx-auto mb-4 opacity-20" />
                <p className="mb-4 text-candle-muted-blue">No community posts yet. Be the first to share!</p>
                <Button
                  variant="outline"
                  onClick={() => onNavigate('community')}
                  className="border-candle-electric-blue/30 text-candle-muted-blue hover:text-white hover:bg-candle-electric-blue/10 hover:border-candle-accent-blue"
                >
                  <MessageSquare className="size-4 mr-2" />
                  Go to Community
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {communityPosts.map((post) => (
                    <div
                      key={post._id}
                      className="p-4 border border-candle-electric-blue/20 rounded-lg glass-card hover:glass-card-light hover:border-candle-accent-blue/50 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-full candle-gradient text-white font-bold text-sm ring-2 ring-candle-electric-blue/20">
                            {post.author?.fullName?.[0] || post.author?.username?.[0] || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-white">
                                {post.author?.fullName || post.author?.username || 'Anonymous'}
                              </span>
                              <Badge variant="outline" className="text-xs border-candle-accent-blue/30 text-candle-accent-blue">
                                {post.ticker}
                              </Badge>
                            </div>
                            <div className="text-xs text-candle-muted-blue">{getTimeAgo(post.createdAt)}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm leading-relaxed pl-13 mb-3 text-white">{post.content}</div>
                      <div className="flex items-center gap-2 pl-13">
                        <div className="flex items-center gap-1 text-xs text-candle-muted-blue">
                          <Heart className="size-3" />
                          <span>{post.likeCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full border-candle-electric-blue/30 text-candle-muted-blue hover:text-white hover:bg-candle-electric-blue/10 hover:border-candle-accent-blue"
                  onClick={() => onNavigate('community')}
                >
                  <Users className="size-4 mr-2" />
                  View Full Community Feed
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;