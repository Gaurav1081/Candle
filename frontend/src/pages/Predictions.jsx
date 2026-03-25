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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { Target, TrendingUp, AlertCircle, Calendar, Clock, TrendingDown } from 'lucide-react';

const DURATION_OPTIONS = [
  { value: 10, label: '10 Minutes', category: 'Intraday' },
  { value: 20, label: '20 Minutes', category: 'Intraday' },
  { value: 30, label: '30 Minutes', category: 'Intraday' },
  { value: 60, label: '1 Hour', category: 'Intraday' },
  { value: 1440, label: '1 Day', category: 'Daily' },
  { value: 10080, label: '7 Days', category: 'Weekly' },
  { value: 43200, label: '30 Days', category: 'Monthly' }
];

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

function Predictions({ selectedStock, onNavigate }) {
  const { apiCall } = useAuth();

  const [predictionType, setPredictionType] = useState('');
  const [confidence, setConfidence] = useState('3');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [eventType, setEventType] = useState('earnings');
  const [eventDate, setEventDate] = useState('');
  const [eventOutcome, setEventOutcome] = useState('');

  const [durationMinutes, setDurationMinutes] = useState('');
  const [priceDirection, setPriceDirection] = useState('');

  const [targetPrice, setTargetPrice] = useState('');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    setError(null);
    setConfidence('3');
    setEventType('earnings');
    setEventDate('');
    setEventOutcome('');
    setDurationMinutes('');
    setPriceDirection('');
    setTargetPrice('');
    setTargetDate('');
  }, [predictionType]);

  if (!selectedStock) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="relative rounded-xl">
          <GlowingEffect {...glowProps} />
          <Card className="relative z-10 border-transparent">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-5 text-candle-accent-blue" />
                <p className="text-sm text-candle-muted-blue">
                  No stock selected. Please search for a stock first.
                </p>
              </div>
              <Button
                onClick={() => onNavigate('stocks')}
                className="mt-4 border-candle-electric-blue/30 text-candle-muted-blue hover:border-candle-accent-blue"
                variant="outline"
              >
                Go to Stock Search
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!predictionType || !confidence) {
      setError('Please select a prediction type and confidence level');
      return;
    }

    let requestBody = {
      ticker: selectedStock.symbol,
      company: selectedStock.company,
      predictionType,
      confidence: parseInt(confidence),
    };

    if (predictionType === 'EVENT') {
      if (!eventType || !eventDate || !eventOutcome) {
        setError('Please fill in all event prediction fields');
        return;
      }
      requestBody = { ...requestBody, eventType, eventDate, eventOutcome };
    } else if (predictionType === 'TIME_WINDOW') {
      if (!durationMinutes || !priceDirection) {
        setError('Please fill in all time window fields');
        return;
      }
      requestBody = {
        ...requestBody,
        durationMinutes: parseInt(durationMinutes),
        priceDirection,
        startPrice: selectedStock.currentPrice,
      };
    } else if (predictionType === 'TARGET') {
      if (!targetPrice || !targetDate) {
        setError('Please fill in all target price fields');
        return;
      }
      const targetPriceNum = parseFloat(targetPrice);
      if (isNaN(targetPriceNum) || targetPriceNum <= 0) {
        setError('Target price must be a positive number');
        return;
      }
      requestBody = {
        ...requestBody,
        targetPrice: targetPriceNum,
        targetDate,
        entryPrice: selectedStock.currentPrice,
      };
    }

    setSubmitting(true);
    try {
      const response = await apiCall('/predictions', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      if (response) onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Failed to submit prediction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);

  const formatPercent = (percent) => `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;

  const getMinDate = () => new Date().toISOString().split('T')[0];

  const groupedDurations = DURATION_OPTIONS.reduce((acc, option) => {
    if (!acc[option.category]) acc[option.category] = [];
    acc[option.category].push(option);
    return acc;
  }, {});

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Make a Prediction</h1>
        <p className="text-candle-muted-blue">
          Choose your prediction strategy for {selectedStock.company}
        </p>
      </div>

      {/* Selected Stock Info */}
      <div className="relative rounded-xl">
        <GlowingEffect {...glowProps} />
        <Card className="relative z-10 border-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="size-5 text-candle-accent-blue" />
              Selected Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-xl text-white">{selectedStock.symbol}</span>
                  <span className="text-candle-muted-blue">{selectedStock.company}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-medium text-white">
                  Current Price: {formatPrice(selectedStock.currentPrice)}
                </span>
                <span className={`flex items-center gap-1 ${selectedStock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <TrendingUp className="size-4" />
                  {formatPrice(Math.abs(selectedStock.change))} ({formatPercent(selectedStock.changePercent)})
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prediction Type Selection */}
      <div className="relative rounded-xl">
        <GlowingEffect {...glowProps} />
        <Card className="relative z-10 border-transparent">
          <CardHeader>
            <CardTitle className="text-white">Select Prediction Type</CardTitle>
            <CardDescription className="text-candle-muted-blue">
              Choose how you want to predict this stock's performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <button
                onClick={() => setPredictionType('EVENT')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  predictionType === 'EVENT'
                    ? 'border-candle-electric-blue bg-candle-electric-blue/10 shadow-glow-sm'
                    : 'border-candle-electric-blue/20 glass-card hover:glass-card-light'
                }`}
              >
                <Calendar className="size-6 mb-2 text-candle-accent-blue" />
                <h3 className="font-semibold mb-1 text-white">Event-Based</h3>
                <p className="text-xs text-candle-muted-blue">
                  Predict earnings or event outcomes (Beat/Meet/Miss)
                </p>
              </button>

              <button
                onClick={() => setPredictionType('TIME_WINDOW')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  predictionType === 'TIME_WINDOW'
                    ? 'border-candle-electric-blue bg-candle-electric-blue/10 shadow-glow-sm'
                    : 'border-candle-electric-blue/20 glass-card hover:glass-card-light'
                }`}
              >
                <Clock className="size-6 mb-2 text-candle-accent-blue" />
                <h3 className="font-semibold mb-1 text-white">Time Window</h3>
                <p className="text-xs text-candle-muted-blue">
                  Predict price direction: 10m, 20m, 30m, 1h, 1D, 7D, or 30D
                </p>
              </button>

              <button
                onClick={() => setPredictionType('TARGET')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  predictionType === 'TARGET'
                    ? 'border-candle-electric-blue bg-candle-electric-blue/10 shadow-glow-sm'
                    : 'border-candle-electric-blue/20 glass-card hover:glass-card-light'
                }`}
              >
                <TrendingDown className="size-6 mb-2 text-candle-accent-blue" />
                <h3 className="font-semibold mb-1 text-white">Target Price</h3>
                <p className="text-xs text-candle-muted-blue">
                  Set a target price and deadline
                </p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Prediction Form */}
      {predictionType && (
        <div className="relative rounded-xl">
          <GlowingEffect {...glowProps} />
          <Card className="relative z-10 border-transparent">
            <CardHeader>
              <CardTitle className="text-white">
                {predictionType === 'EVENT' && 'Event Prediction Details'}
                {predictionType === 'TIME_WINDOW' && 'Time Window Prediction'}
                {predictionType === 'TARGET' && 'Target Price Prediction'}
              </CardTitle>
              <CardDescription className="text-candle-muted-blue">
                {predictionType === 'EVENT' && 'Predict how the company will perform at their next event'}
                {predictionType === 'TIME_WINDOW' && 'Predict the price movement over a specific time period'}
                {predictionType === 'TARGET' && 'Set your target price and date'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company & Ticker */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-white">Company</Label>
                    <Input
                      id="company"
                      value={selectedStock.company}
                      disabled
                      className="bg-candle-deep-dark/50 border-candle-electric-blue/20 text-candle-muted-blue"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ticker" className="text-white">Ticker</Label>
                    <Input
                      id="ticker"
                      value={selectedStock.symbol}
                      disabled
                      className="bg-candle-deep-dark/50 border-candle-electric-blue/20 text-candle-muted-blue"
                    />
                  </div>
                </div>

                {/* EVENT FIELDS */}
                {predictionType === 'EVENT' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="eventType" className="text-white">Event Type *</Label>
                      <Select value={eventType} onValueChange={setEventType}>
                        <SelectTrigger id="eventType" className="border-candle-electric-blue/30 text-white">
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="earnings">Earnings Report</SelectItem>
                          <SelectItem value="product_launch">Product Launch</SelectItem>
                          <SelectItem value="other">Other Event</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eventDate" className="text-white">Event Date *</Label>
                      <Input
                        id="eventDate"
                        type="date"
                        min={getMinDate()}
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="border-candle-electric-blue/30 text-white"
                      />
                      <p className="text-xs text-candle-muted-blue">
                        Your prediction will lock 24 hours before this date
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eventOutcome" className="text-white">Prediction *</Label>
                      <Select value={eventOutcome} onValueChange={setEventOutcome}>
                        <SelectTrigger id="eventOutcome" className="border-candle-electric-blue/30 text-white">
                          <SelectValue placeholder="Select outcome" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beat">Beat - Exceed Expectations</SelectItem>
                          <SelectItem value="Meet">Meet - Match Expectations</SelectItem>
                          <SelectItem value="Miss">Miss - Fall Short of Expectations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* TIME WINDOW FIELDS */}
                {predictionType === 'TIME_WINDOW' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="durationMinutes" className="text-white">Time Window *</Label>
                      <Select value={durationMinutes} onValueChange={setDurationMinutes}>
                        <SelectTrigger id="durationMinutes" className="border-candle-electric-blue/30 text-white">
                          <SelectValue placeholder="Select time window" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="px-2 py-1.5 text-xs font-semibold text-candle-muted-blue">Intraday</div>
                          {groupedDurations.Intraday?.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>{option.label}</SelectItem>
                          ))}
                          <div className="px-2 py-1.5 text-xs font-semibold text-candle-muted-blue mt-2">Multi-Day</div>
                          {groupedDurations.Daily?.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>{option.label}</SelectItem>
                          ))}
                          {groupedDurations.Weekly?.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>{option.label}</SelectItem>
                          ))}
                          {groupedDurations.Monthly?.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-candle-muted-blue">Price will be evaluated after this time period</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startPrice" className="text-white">Starting Price</Label>
                      <Input
                        id="startPrice"
                        value={formatPrice(selectedStock.currentPrice)}
                        disabled
                        className="bg-candle-deep-dark/50 border-candle-electric-blue/20 text-candle-muted-blue"
                      />
                      <p className="text-xs text-candle-muted-blue">Current market price (locks immediately)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priceDirection" className="text-white">Price Direction *</Label>
                      <Select value={priceDirection} onValueChange={setPriceDirection}>
                        <SelectTrigger id="priceDirection" className="border-candle-electric-blue/30 text-white">
                          <SelectValue placeholder="Select direction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UP">UP - Price will increase</SelectItem>
                          <SelectItem value="DOWN">DOWN - Price will decrease</SelectItem>
                          <SelectItem value="FLAT">FLAT - Price stays within ±2%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* TARGET PRICE FIELDS */}
                {predictionType === 'TARGET' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="entryPrice" className="text-white">Entry Price</Label>
                      <Input
                        id="entryPrice"
                        value={formatPrice(selectedStock.currentPrice)}
                        disabled
                        className="bg-candle-deep-dark/50 border-candle-electric-blue/20 text-candle-muted-blue"
                      />
                      <p className="text-xs text-candle-muted-blue">Current market price</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetPrice" className="text-white">Target Price *</Label>
                      <Input
                        id="targetPrice"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Enter target price"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        className="border-candle-electric-blue/30 text-white"
                      />
                      <p className="text-xs text-candle-muted-blue">The price you predict the stock will reach</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetDate" className="text-white">Target Date *</Label>
                      <Input
                        id="targetDate"
                        type="date"
                        min={getMinDate()}
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="border-candle-electric-blue/30 text-white"
                      />
                      <p className="text-xs text-candle-muted-blue">Stock must reach target price before this date</p>
                    </div>
                  </>
                )}

                {/* Confidence */}
                <div className="space-y-2">
                  <Label htmlFor="confidence" className="text-white">Confidence Level *</Label>
                  <Select value={confidence} onValueChange={setConfidence}>
                    <SelectTrigger id="confidence" className="border-candle-electric-blue/30 text-white">
                      <SelectValue placeholder="Select confidence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Very Low Confidence</SelectItem>
                      <SelectItem value="2">2 - Low Confidence</SelectItem>
                      <SelectItem value="3">3 - Medium Confidence</SelectItem>
                      <SelectItem value="4">4 - High Confidence</SelectItem>
                      <SelectItem value="5">5 - Very High Confidence</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-candle-muted-blue">
                    Higher confidence multiplies your points but increases risk
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 border border-red-400/30 bg-red-500/10 rounded-lg backdrop-blur-sm">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onNavigate('stocks')}
                    disabled={submitting}
                    className="border-candle-electric-blue/30 text-candle-muted-blue hover:border-candle-accent-blue"
                  >
                    Back to Search
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 candle-gradient hover:shadow-glow"
                  >
                    {submitting ? 'Submitting...' : 'Submit Prediction'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Predictions;