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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { 
  Target, 
  Filter, 
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Duration display helper - matches backend config
const DURATION_LABELS = {
  10: '10m',
  20: '20m',
  30: '30m',
  60: '1h',
  1440: '1D',
  10080: '7D',
  43200: '30D'
};

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768;

// Shared glow props — matches Dashboard
const glowProps = {
  spread: 60,
  glow: true,
  disabled: IS_MOBILE,
  proximity: 80,
  inactiveZone: 0.01,
  borderWidth: 2,
  movementDuration: 1.2,
};

function MyPredictions({ onNavigate }) {
  const { apiCall } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, total: 1 });
  
  // Filters
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch predictions
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        
        const params = new URLSearchParams({
          page: pagination.current,
          limit: 20
        });
        
        if (filterType !== 'all') params.append('type', filterType);
        if (filterStatus !== 'all') params.append('status', filterStatus);
        
        const response = await apiCall(`/predictions?${params.toString()}`);
        setPredictions(response?.predictions || []);
        setPagination(response?.pagination || { current: 1, total: 1 });
      } catch (error) {
        console.error('Failed to fetch predictions:', error);
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [apiCall, pagination.current, filterType, filterStatus]);

  const getPredictionTypeBadge = (type) => {
    const badges = {
      EVENT: { label: 'Event', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      TIME_WINDOW: { label: 'Time Window', color: 'bg-green-100 text-green-700 border-green-200' },
      TARGET: { label: 'Target Price', color: 'bg-purple-100 text-purple-700 border-purple-200' }
    };
    return badges[type] || { label: type, color: 'bg-gray-100 text-gray-700 border-gray-200' };
  };

  const getResultIcon = (result) => {
    if (result === 'Beat') return <TrendingUp className="size-4 text-green-600" />;
    if (result === 'Miss') return <TrendingDown className="size-4 text-red-600" />;
    if (result === 'Meet') return <Minus className="size-4 text-yellow-600" />;
    return null;
  };

  const getResultColor = (result) => {
    if (result === 'Beat') return 'text-green-700 bg-green-50 border-green-200';
    if (result === 'Miss') return 'text-red-700 bg-red-50 border-red-200';
    if (result === 'Meet') return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const formatDuration = (prediction) => {
    if (prediction.durationMinutes) {
      return DURATION_LABELS[prediction.durationMinutes] || `${prediction.durationMinutes}m`;
    }
    if (prediction.timeWindow) {
      return prediction.timeWindow;
    }
    return 'N/A';
  };

  const getPredictionDetails = (prediction) => {
    if (prediction.predictionType === 'EVENT') {
      const outcome = prediction.eventPrediction || prediction.eventOutcome;
      const eventType = prediction.eventType || 'Event';
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <span className="text-sm">{eventType.replace('_', ' ')}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Prediction:</span>{' '}
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border ${getResultColor(outcome)}`}>
              {getResultIcon(outcome)}
              <span className="font-medium">{outcome}</span>
            </span>
          </div>
          {prediction.eventDate && (
            <div className="text-xs text-muted-foreground">
              Event: {new Date(prediction.eventDate).toLocaleDateString()}
            </div>
          )}
          {prediction.status === 'evaluated' && prediction.actualResult && (
            <div className="text-sm mt-2">
              <span className="text-muted-foreground">Actual:</span>{' '}
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border ${getResultColor(prediction.actualResult)}`}>
                {getResultIcon(prediction.actualResult)}
                <span className="font-medium">{prediction.actualResult}</span>
              </span>
            </div>
          )}
        </div>
      );
    } else if (prediction.predictionType === 'TIME_WINDOW') {
      const direction = prediction.priceDirection || prediction.direction;
      const duration = formatDuration(prediction);
      
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">{duration}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Prediction:</span>{' '}
            <span className={`inline-flex items-center px-2 py-1 rounded border ${
              direction === 'UP' ? 'bg-green-50 text-green-700 border-green-200' :
              direction === 'DOWN' ? 'bg-red-50 text-red-700 border-red-200' :
              'bg-gray-50 text-gray-700 border-gray-200'
            }`}>
              {direction === 'UP' && <TrendingUp className="size-3 mr-1" />}
              {direction === 'DOWN' && <TrendingDown className="size-3 mr-1" />}
              {direction === 'FLAT' && <Minus className="size-3 mr-1" />}
              <span className="font-medium">{direction}</span>
            </span>
          </div>
          {prediction.entryPrice && (
            <div className="text-xs text-muted-foreground">
              Entry: ${prediction.entryPrice.toFixed(2)}
            </div>
          )}
          {prediction.exitPrice && (
            <div className="text-xs text-muted-foreground">
              Exit: ${prediction.exitPrice.toFixed(2)}
            </div>
          )}
          {prediction.status === 'evaluated' && prediction.actualResult && (
            <div className="text-sm mt-2">
              <span className="text-muted-foreground">Result:</span>{' '}
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border ${getResultColor(prediction.actualResult)}`}>
                {getResultIcon(prediction.actualResult)}
                <span className="font-medium">{prediction.actualResult}</span>
              </span>
            </div>
          )}
        </div>
      );
    } else if (prediction.predictionType === 'TARGET') {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-muted-foreground" />
            <span className="text-sm">Target Price</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Target:</span>{' '}
            <span className="inline-flex items-center px-2 py-1 rounded border bg-purple-50 text-purple-700 border-purple-200">
              <span className="font-medium">${prediction.targetPrice?.toFixed(2) || 'N/A'}</span>
            </span>
          </div>
          {prediction.targetDate && (
            <div className="text-xs text-muted-foreground">
              By: {new Date(prediction.targetDate).toLocaleDateString()}
            </div>
          )}
          {prediction.entryPrice && (
            <div className="text-xs text-muted-foreground">
              Entry: ${prediction.entryPrice.toFixed(2)}
            </div>
          )}
          {prediction.highestPrice && (
            <div className="text-xs text-muted-foreground">
              Highest: ${prediction.highestPrice.toFixed(2)}
            </div>
          )}
          {prediction.status === 'evaluated' && prediction.actualResult && (
            <div className="text-sm mt-2">
              <span className="text-muted-foreground">Result:</span>{' '}
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border ${getResultColor(prediction.actualResult)}`}>
                {getResultIcon(prediction.actualResult)}
                <span className="font-medium">{prediction.actualResult}</span>
              </span>
            </div>
          )}
        </div>
      );
    }
    return <div className="text-sm text-muted-foreground">No details</div>;
  };

  const formatStatus = (prediction) => {
    if (prediction.status === 'pending') return 'Pending';
    if (prediction.status === 'locked') return 'Locked';
    if (prediction.status === 'evaluated') {
      if (prediction.actualResult) return prediction.actualResult;
      return prediction.isCorrect ? 'Correct' : 'Wrong';
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
    if (points == null || points === 0) return '0 pts';
    return points > 0 ? `+${points} pts` : `${points} pts`;
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, current: newPage }));
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">My Predictions</h1>
          <p className="text-candle-muted-blue mt-1">
            Track all your predictions and see how you performed
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

      {/* Filters Card */}
      <div className="relative rounded-xl">
        <GlowingEffect {...glowProps} />
        <Card className="relative z-10 premium-card border-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Filter className="size-5 text-candle-accent-blue" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-candle-muted-blue">Prediction Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="EVENT">Event-Based</SelectItem>
                    <SelectItem value="TIME_WINDOW">Time Window</SelectItem>
                    <SelectItem value="TARGET">Target Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-candle-muted-blue">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="locked">Locked</SelectItem>
                    <SelectItem value="evaluated">Evaluated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictions List Card */}
      <div className="relative rounded-xl">
        <GlowingEffect {...glowProps} />
        <Card className="relative z-10 premium-card border-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="size-5 text-candle-accent-blue" />
              All Predictions
            </CardTitle>
            <CardDescription className="text-candle-muted-blue">
              {pagination.totalRecords || 0} total predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-candle-muted-blue py-8">
                Loading predictions...
              </div>
            ) : predictions.length === 0 ? (
              <div className="text-center text-candle-muted-blue py-8">
                No predictions found. Try adjusting your filters or make your first prediction!
              </div>
            ) : (
              <div className="space-y-4">
                {predictions.map((prediction) => {
                  const typeBadge = getPredictionTypeBadge(prediction.predictionType);
                  const showBeatMeetMiss = prediction.status === 'evaluated' && prediction.actualResult;
                  
                  return (
                    <div 
                      key={prediction._id} 
                      className="p-4 border border-candle-electric-blue/20 rounded-lg glass-card hover:glass-card-light hover:border-candle-accent-blue/50 transition-all duration-300 space-y-3 cursor-pointer"
                    >
                      {/* Header Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg text-white">{prediction.ticker}</span>
                          <span className="text-candle-muted-blue">
                            {prediction.company}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
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
                              <span className="flex items-center gap-1">
                                {getResultIcon(prediction.actualResult)}
                                {prediction.actualResult}
                              </span>
                            ) : (
                              formatStatus(prediction)
                            )}
                          </Badge>
                          <span className={`text-sm font-semibold ${
                            prediction.points > 0 ? 'text-green-400' : 
                            prediction.points < 0 ? 'text-red-400' : 
                            'text-candle-muted-blue'
                          }`}>
                            {formatPoints(prediction.points)}
                          </span>
                        </div>
                      </div>

                      {/* Details Row */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-6">
                          <div>
                            <span className={`inline-block text-xs px-2 py-1 rounded border ${typeBadge.color}`}>
                              {typeBadge.label}
                            </span>
                          </div>
                          <div>
                            {getPredictionDetails(prediction)}
                          </div>
                        </div>
                        
                        <div className="text-right space-y-1">
                          <div className="text-xs text-candle-muted-blue">
                            Confidence: {prediction.confidence}/5
                          </div>
                          <div className="text-xs text-candle-muted-blue">
                            {new Date(prediction.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Result Details (if evaluated) */}
                      {prediction.status === 'evaluated' && prediction.resultDetails && (
                        <div className="pt-2 border-t border-candle-electric-blue/10">
                          <div className="text-xs text-candle-muted-blue">
                            {prediction.resultDetails}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {predictions.length > 0 && pagination.total > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-candle-muted-blue">
                  Page {pagination.current} of {pagination.total}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.current - 1)}
                    disabled={pagination.current === 1}
                    className="border-candle-electric-blue/30 text-candle-muted-blue hover:text-white hover:bg-candle-electric-blue/10 hover:border-candle-accent-blue"
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.current + 1)}
                    disabled={pagination.current === pagination.total}
                    className="border-candle-electric-blue/30 text-candle-muted-blue hover:text-white hover:bg-candle-electric-blue/10 hover:border-candle-accent-blue"
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default MyPredictions;