import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { 
  User, 
  Mail, 
  Calendar,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Star,
  Flame,
  Edit3,
  Save,
  X,
  Loader2,
  Activity,
  Zap,
  Award,
} from 'lucide-react';

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768;

const glowProps = {
  spread: 60,
  glow: true,
  disabled: IS_MOBILE,
  proximity: 80,
  inactiveZone: 0.01,
  borderWidth: 2,
  movementDuration: 1.2,
};

const UserProfile = () => {
  const { user, updateProfile, loading, apiCall } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    avatar: user?.avatar || ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [globalRank, setGlobalRank] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Fetch user's global rank from leaderboard
  useEffect(() => {
    const fetchGlobalRank = async () => {
      try {
        const response = await apiCall('/leaderboard/my-rank');
        setGlobalRank(response?.rank);
      } catch (error) {
        console.error('Failed to fetch global rank:', error);
        setGlobalRank(null);
      }
    };

    if (user && apiCall) {
      fetchGlobalRank();
    }
  }, [apiCall, user]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        const response = await apiCall('/analytics/overview');
        setAnalytics(response);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        setAnalytics(null);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    if (user && apiCall) {
      fetchAnalytics();
    }
  }, [apiCall, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }

    const result = await updateProfile({
      fullName: formData.fullName.trim(),
      avatar: formData.avatar.trim()
    });

    if (result.success) {
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } else {
      setError(result.error);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      avatar: user?.avatar || ''
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  // Prefer analytics data over user.stats where available
  const summary = analytics?.summary;
  const points = analytics?.points;
  const streaks = analytics?.streaks;
  const topStocks = analytics?.topStocks;

  const totalPredictions = summary?.totalPredictions ?? user.stats.totalPredictions;
  const correctPredictions = summary?.correct ?? user.stats.correctPredictions;
  const wrongPredictions = summary?.wrong ?? (user.stats.totalPredictions - user.stats.correctPredictions);
  const accuracyRate = summary?.accuracy != null
    ? parseFloat(summary.accuracy)
    : user.stats.accuracyRate;
  const totalPoints = points?.net != null ? points.net : user.stats.totalPoints;
  const currentStreak = streaks?.current ?? user.stats.currentStreak;
  const longestStreak = streaks?.longest ?? null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Profile</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Edit3 className="size-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <div className="relative rounded-xl">
          <GlowingEffect {...glowProps} />
          <Card className="relative z-10 premium-card border-transparent h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="size-5 text-candle-accent-blue" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-green-400/30 bg-green-400/10">
                  <AlertDescription className="text-green-400">{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center space-x-4">
                <Avatar className="size-20">
                  <AvatarImage src={user.avatar} alt={user.fullName} />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-orange-500 to-red-600 text-white">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-white">{user.fullName}</h3>
                  <p className="text-candle-muted-blue">@{user.username}</p>
                </div>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-white">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar" className="text-white">Avatar URL</Label>
                    <Input
                      id="avatar"
                      name="avatar"
                      type="url"
                      value={formData.avatar}
                      onChange={handleChange}
                      placeholder="https://example.com/avatar.jpg"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <><Loader2 className="size-4 mr-2 animate-spin" />Saving...</>
                      ) : (
                        <><Save className="size-4 mr-2" />Save Changes</>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                      <X className="size-4 mr-2" />Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="size-4 text-candle-muted-blue" />
                    <span className="text-white">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="size-4 text-candle-muted-blue" />
                    <span className="text-white">Joined {formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="size-4 text-candle-muted-blue" />
                    <span className="text-white">Last login {formatDate(user.lastLogin)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <div className="relative rounded-xl">
          <GlowingEffect {...glowProps} />
          <Card className="relative z-10 premium-card border-transparent h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="size-5 text-candle-accent-blue" />
                Performance Statistics
              </CardTitle>
              <CardDescription className="text-candle-muted-blue">
                Your prediction performance overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="size-6 animate-spin text-candle-muted-blue" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 glass-card border border-orange-400/30 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Flame className="size-6 text-orange-400" />
                      </div>
                      <div className="text-2xl font-bold text-orange-400">{currentStreak}</div>
                      <div className="text-sm text-candle-muted-blue">Day Streak</div>
                      {longestStreak != null && (
                        <div className="text-xs text-candle-muted-blue mt-1">Best: {longestStreak}</div>
                      )}
                    </div>

                    <div className="text-center p-4 glass-card border border-candle-accent-blue/30 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Star className="size-6 text-candle-accent-blue" />
                      </div>
                      <div className={`text-2xl font-bold ${totalPoints >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {totalPoints >= 0 ? '+' : ''}{totalPoints.toLocaleString()}
                      </div>
                      <div className="text-sm text-candle-muted-blue">Net Points</div>
                    </div>

                    <div className="text-center p-4 glass-card border border-candle-electric-blue/20 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Trophy className="size-6 text-amber-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {globalRank != null ? `#${globalRank}` : '—'}
                      </div>
                      <div className="text-sm text-candle-muted-blue">Global Rank</div>
                    </div>

                    <div className="text-center p-4 glass-card border border-green-400/30 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Target className="size-6 text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-green-400">
                        {accuracyRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-candle-muted-blue">Accuracy</div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-candle-electric-blue/20">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-candle-muted-blue">Total Predictions:</span>
                        <span className="font-medium text-white">{totalPredictions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-candle-muted-blue">Correct:</span>
                        <span className="font-medium text-green-400">{correctPredictions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-candle-muted-blue">Wrong:</span>
                        <span className="font-medium text-red-400">{wrongPredictions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-candle-muted-blue">Win Rate:</span>
                        <Badge className={
                          accuracyRate >= 70
                            ? 'bg-green-400/20 text-green-400 border-green-400/30'
                            : accuracyRate >= 50
                            ? 'bg-candle-accent-blue/20 text-candle-accent-blue border-candle-accent-blue/30'
                            : 'bg-red-400/20 text-red-400 border-red-400/30'
                        }>
                          {totalPredictions > 0
                            ? `${((correctPredictions / totalPredictions) * 100).toFixed(1)}%`
                            : '0.0%'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Points Breakdown */}
      {analytics?.hasData && points && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative rounded-xl">
            <GlowingEffect {...glowProps} />
            <Card className="relative z-10 premium-card border-transparent h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="size-5 text-candle-accent-blue" />
                  Points Breakdown
                </CardTitle>
                <CardDescription className="text-candle-muted-blue">Earned vs lost points</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 glass-card border border-green-400/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-5 text-green-400" />
                    <span className="font-medium text-white">Points Earned</span>
                  </div>
                  <span className="text-xl font-bold text-green-400">+{points.earned}</span>
                </div>

                <div className="flex items-center justify-between p-3 glass-card border border-red-400/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="size-5 text-red-400" />
                    <span className="font-medium text-white">Points Lost</span>
                  </div>
                  <span className="text-xl font-bold text-red-400">-{points.lost}</span>
                </div>

                {points.best && (
                  <div className="pt-3 border-t border-candle-electric-blue/20">
                    <div className="text-sm font-medium mb-2 text-white">Best Prediction</div>
                    <div className="flex items-center justify-between p-2 glass-card border border-candle-accent-blue/30 rounded">
                      <div>
                        <div className="font-bold text-white">{points.best.ticker}</div>
                        <div className="text-xs text-candle-muted-blue">
                          {new Date(points.best.date).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge className="bg-candle-accent-blue/20 text-candle-accent-blue border-candle-accent-blue/30">
                        +{points.best.points} pts
                      </Badge>
                    </div>
                  </div>
                )}

                {points.worst && points.worst.points < 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2 text-white">Worst Prediction</div>
                    <div className="flex items-center justify-between p-2 glass-card border border-candle-electric-blue/20 rounded">
                      <div>
                        <div className="font-bold text-white">{points.worst.ticker}</div>
                        <div className="text-xs text-candle-muted-blue">
                          {new Date(points.worst.date).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge className="bg-red-500/20 text-red-400 border-red-400/30">
                        {points.worst.points} pts
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Stocks */}
          {topStocks && topStocks.length > 0 && (
            <div className="relative rounded-xl">
              <GlowingEffect {...glowProps} />
              <Card className="relative z-10 premium-card border-transparent h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Award className="size-5 text-candle-accent-blue" />
                    Top Performing Stocks
                  </CardTitle>
                  <CardDescription className="text-candle-muted-blue">
                    Stocks where you've earned the most points
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topStocks.slice(0, 5).map((stock, index) => (
                      <div key={stock.ticker} className="flex items-center justify-between p-3 glass-card border border-candle-electric-blue/20 rounded-lg hover:glass-card-light">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-candle-electric-blue/20 text-candle-electric-blue font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-bold text-white">{stock.ticker}</div>
                            <div className="text-xs text-candle-muted-blue">
                              {stock.total} predictions • {stock.accuracy}% accuracy
                            </div>
                          </div>
                        </div>
                        <Badge className={
                          stock.points >= 0
                            ? 'bg-green-400/20 text-green-400 border-green-400/30'
                            : 'bg-red-400/20 text-red-400 border-red-400/30'
                        }>
                          {stock.points >= 0 ? '+' : ''}{stock.points} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Pending count callout */}
      {summary?.pending > 0 && (
        <div className="relative rounded-xl">
          <GlowingEffect {...glowProps} />
          <Card className="relative z-10 premium-card border-transparent">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Activity className="size-5 text-candle-accent-blue" />
                <div>
                  <span className="font-semibold text-white">{summary.pending} predictions</span>
                  <span className="text-candle-muted-blue"> are still pending evaluation</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserProfile;