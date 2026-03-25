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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Flame,
  Star,
  Activity,
  Zap,
  Trophy,
  Calendar,
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

function Analytics() {
  const { apiCall } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await apiCall('/analytics/overview');
        setAnalytics(response);
        setHasData(response?.hasData !== false);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        setHasData(false);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [apiCall]);

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg font-medium text-white">Loading analytics...</div>
            <div className="text-sm text-candle-muted-blue mt-2">
              Calculating your prediction performance
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasData || !analytics?.hasData) {
    return (
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-6">Analytics</h1>
        <div className="relative rounded-xl">
          <GlowingEffect {...glowProps} />
          <Card className="relative z-10 premium-card border-transparent">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <BarChart3 className="size-12 mx-auto text-candle-muted-blue mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-white">No Analytics Available</h3>
                <p className="text-candle-muted-blue">
                  Start making predictions to see your performance analytics!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { summary, byPredictionType, byConfidence, byType, points, streaks, monthly, topStocks } = analytics;

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Analytics</h1>
        <p className="text-candle-muted-blue mt-1">
          Understand your prediction performance and improve your strategy
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Total Predictions',
            icon: <Target className="size-4 text-candle-accent-blue" />,
            value: summary.totalPredictions,
            sub: `${summary.evaluated} evaluated • ${summary.pending} pending`,
            valueColor: 'text-white',
            cardClass: 'glass-card',
          },
          {
            title: 'Accuracy Rate',
            icon: <Activity className="size-4 text-green-400" />,
            value: `${summary.accuracy}%`,
            sub: `${summary.correct} correct • ${summary.wrong} wrong`,
            valueColor: 'text-green-400',
            titleColor: 'text-green-400',
            cardClass: 'glass-card',
          },
          {
            title: 'Net Points',
            icon: <Star className="size-4 text-candle-accent-blue" />,
            value: `${points.net >= 0 ? '+' : ''}${points.net}`,
            sub: `${points.average > 0 ? '+' : ''}${points.average} avg per prediction`,
            valueColor: points.net >= 0 ? 'text-green-400' : 'text-red-400',
            cardClass: 'glass-card',
          },
          {
            title: 'Current Streak',
            icon: <Flame className="size-4 text-candle-accent-blue" />,
            value: streaks.current,
            sub: `Longest: ${streaks.longest}`,
            valueColor: 'text-white',
            titleColor: 'text-candle-accent-blue',
            cardClass: 'glass-card',
          },
        ].map((card) => (
          <div
            key={card.title}
            className="relative rounded-xl hover:scale-[1.02] transition-all duration-300"
          >
            <GlowingEffect {...glowProps} />
            <Card className={`relative z-10 ${card.cardClass} border-transparent h-full`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${card.titleColor || 'text-white'}`}>
                  {card.title}
                </CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</div>
                <p className="text-xs text-candle-muted-blue mt-1">{card.sub}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Points Breakdown + Prediction Type Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Points Analytics */}
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

        {/* Prediction Type Distribution */}
        <div className="relative rounded-xl">
          <GlowingEffect {...glowProps} />
          <Card className="relative z-10 premium-card border-transparent h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Target className="size-5 text-candle-accent-blue" />
                Prediction Types
              </CardTitle>
              <CardDescription className="text-candle-muted-blue">Distribution by type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { label: 'Event-Based', key: 'EVENT', color: 'bg-candle-electric-blue', dot: 'bg-candle-electric-blue' },
                  { label: 'Time Window', key: 'TIME_WINDOW', color: 'bg-green-400', dot: 'bg-green-400' },
                  { label: 'Target Price', key: 'TARGET', color: 'bg-candle-accent-blue', dot: 'bg-candle-accent-blue' },
                ].map(({ label, key, dot }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 ${dot} rounded`}></div>
                      <span className="text-sm font-medium text-white">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{byType[key]}</span>
                      <span className="text-xs text-candle-muted-blue">
                        ({((byType[key] / summary.totalPredictions) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-candle-electric-blue/20">
                <div className="h-4 flex rounded overflow-hidden">
                  <div className="bg-candle-electric-blue" style={{ width: `${(byType.EVENT / summary.totalPredictions) * 100}%` }} />
                  <div className="bg-green-400" style={{ width: `${(byType.TIME_WINDOW / summary.totalPredictions) * 100}%` }} />
                  <div className="bg-candle-accent-blue" style={{ width: `${(byType.TARGET / summary.totalPredictions) * 100}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Beat/Meet/Miss Breakdown */}
      <div className="relative rounded-xl">
        <GlowingEffect {...glowProps} />
        <Card className="relative z-10 premium-card border-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Trophy className="size-5 text-candle-accent-blue" />
              Outcome Distribution (Event Predictions)
            </CardTitle>
            <CardDescription className="text-candle-muted-blue">
              Your Beat/Meet/Miss prediction performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  label: 'Beat',
                  key: 'Beat',
                  color: 'text-green-400',
                  border: 'border-green-400/30',
                  icon: <TrendingUp className="size-5 text-green-400" />,
                },
                {
                  label: 'Meet',
                  key: 'Meet',
                  color: 'text-candle-accent-blue',
                  border: 'border-candle-accent-blue/30',
                  icon: <Activity className="size-5 text-candle-accent-blue" />,
                },
                {
                  label: 'Miss',
                  key: 'Miss',
                  color: 'text-red-400',
                  border: 'border-red-400/30',
                  icon: <TrendingDown className="size-5 text-red-400" />,
                },
              ].map(({ label, key, color, border, icon }) => {
                const data = byPredictionType[key];
                const evaluated = data.correct + data.wrong;
                return (
                  <div key={key} className={`p-4 border rounded-lg glass-card ${border} hover:glass-card-light`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-bold ${color}`}>{label}</span>
                      {icon}
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-white">{data.total}</div>
                      <div className="text-xs text-candle-muted-blue">
                        {data.correct} correct • {data.wrong} wrong
                        {data.pending > 0 && ` • ${data.pending} pending`}
                      </div>
                      {evaluated > 0 && (
                        <div className={`text-sm font-medium mt-2 ${color}`}>
                          Accuracy: {((data.correct / evaluated) * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confidence Analysis & Top Stocks */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Confidence Levels */}
        <div className="relative rounded-xl">
          <GlowingEffect {...glowProps} />
          <Card className="relative z-10 premium-card border-transparent h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Star className="size-5 text-candle-accent-blue" />
                Confidence Analysis
              </CardTitle>
              <CardDescription className="text-candle-muted-blue">
                How your confidence correlates with accuracy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map(level => {
                  const data = byConfidence[level];
                  const levelHasData = data.total > 0;
                  return (
                    <div key={level} className="flex items-center justify-between p-3 glass-card border border-candle-electric-blue/20 rounded-lg hover:glass-card-light">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          {[...Array(level)].map((_, i) => (
                            <Star key={i} className="size-4 fill-candle-accent-blue text-candle-accent-blue" />
                          ))}
                          {[...Array(5 - level)].map((_, i) => (
                            <Star key={i} className="size-4 text-candle-electric-blue/30" />
                          ))}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">Level {level}</div>
                          <div className="text-xs text-candle-muted-blue">{data.total} predictions</div>
                        </div>
                      </div>
                      {levelHasData && (
                        <Badge className={
                          data.accuracy >= 60
                            ? 'bg-candle-electric-blue/20 text-candle-electric-blue border-candle-electric-blue/30'
                            : 'bg-candle-electric-blue/10 text-candle-muted-blue border-candle-electric-blue/20'
                        }>
                          {data.accuracy}% accuracy
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Stocks */}
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
              {topStocks && topStocks.length > 0 ? (
                <div className="space-y-3">
                  {topStocks.map((stock, index) => (
                    <div key={stock.ticker} className="flex items-center justify-between p-3 glass-card border border-candle-electric-blue/20 rounded-lg hover:glass-card-light">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-candle-electric-blue/20 text-candle-electric-blue font-bold">
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
              ) : (
                <div className="text-center text-candle-muted-blue py-4">
                  No stock data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Monthly Performance */}
      {monthly && monthly.length > 0 && (
        <div className="relative rounded-xl">
          <GlowingEffect {...glowProps} />
          <Card className="relative z-10 premium-card border-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="size-5 text-candle-accent-blue" />
                Monthly Performance
              </CardTitle>
              <CardDescription className="text-candle-muted-blue">
                Track your performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {monthly.slice().reverse().map(month => (
                  <div key={month.month} className="flex items-center justify-between p-4 glass-card border border-candle-electric-blue/20 rounded-lg hover:glass-card-light">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-bold text-white">
                          {new Date(month.month + '-01').toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-sm text-candle-muted-blue">
                          {month.total} predictions • {month.correct} correct • {month.wrong} wrong
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-candle-muted-blue">Accuracy</div>
                        <div className="text-lg font-bold text-white">{month.accuracy}%</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-candle-muted-blue">Points</div>
                        <div className={`text-lg font-bold ${month.points >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {month.points >= 0 ? '+' : ''}{month.points}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Analytics;