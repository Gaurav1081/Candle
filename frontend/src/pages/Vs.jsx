import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../components/utils/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { Swords, Trophy, Clock, Target, Plus, Users, Mail, Search, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

function Vs() {
  const { user } = useAuth();
  const [activeMatches, setActiveMatches] = useState([]);
  const [waitingMatches, setWaitingMatches] = useState([]);
  const [completedMatches, setCompletedMatches] = useState([]);
  const [openMatches, setOpenMatches] = useState([]);
  const [invites, setInvites] = useState([]);
  const [vsStats, setVsStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  const [formData, setFormData] = useState({
    durationMinutes: 60,
    matchType: 'open',
    invitedUsername: ''
  });

  const [showPredictModal, setShowPredictModal] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [predictionData, setPredictionData] = useState({
    priceDirection: '',
    confidence: 3
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

  useEffect(() => {
    fetchVsData();
  }, []);

  const fetchVsData = async () => {
    try {
      setLoading(true);
      const [waiting, locked, completed, open, myInvites, stats] = await Promise.all([
        apiService.getMyVsMatches('waiting'),
        apiService.getMyVsMatches('locked'),
        apiService.getMyVsMatches('completed'),
        apiService.getOpenVsMatches(),
        apiService.getMyVsInvites(),
        apiService.getVsStats()
      ]);
      setWaitingMatches(waiting.matches || []);
      setActiveMatches(locked.matches || []);
      setCompletedMatches(completed.matches || []);
      setOpenMatches(open.matches || []);
      setInvites(myInvites.invites || []);
      setVsStats(stats.vsStats);
    } catch (error) {
      console.error('Error fetching VS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setUserSearchResults([]);
      return;
    }
    setUserSearchLoading(true);
    try {
      const response = await apiService.request(`/auth/search-users?q=${encodeURIComponent(query)}`);
      setUserSearchResults(response.users || []);
    } catch (err) {
      console.error('User search error:', err);
      setUserSearchResults([]);
    } finally {
      setUserSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => searchUsers(userSearchQuery), 300);
    return () => clearTimeout(timeoutId);
  }, [userSearchQuery, searchUsers]);

  const searchStocks = useCallback(async (query) => {
    if (!query || query.trim().length < 1) {
      setSearchResults([]);
      return;
    }
    if (!FINNHUB_API_KEY) {
      setCreateError('API key not configured');
      return;
    }
    setSearchLoading(true);
    try {
      const searchResponse = await fetch(
        `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`
      );
      if (!searchResponse.ok) throw new Error('Failed to search stocks');
      const searchData = await searchResponse.json();
      const usStocks = (searchData.result || [])
        .filter(stock => stock.type === 'Common Stock' && !stock.symbol.includes('.'))
        .slice(0, 10);
      const stocksWithQuotes = await Promise.all(
        usStocks.map(async (stock) => {
          try {
            const quoteResponse = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${FINNHUB_API_KEY}`
            );
            const quoteData = await quoteResponse.json();
            return {
              symbol: stock.symbol,
              description: stock.description,
              currentPrice: quoteData.c || 0,
              change: quoteData.d || 0,
              changePercent: quoteData.dp || 0,
            };
          } catch (err) {
            return null;
          }
        })
      );
      setSearchResults(stocksWithQuotes.filter(Boolean));
    } catch (err) {
      console.error('Search error:', err);
      setCreateError('Failed to search stocks');
    } finally {
      setSearchLoading(false);
    }
  }, [FINNHUB_API_KEY]);

  useEffect(() => {
    const timeoutId = setTimeout(() => searchStocks(searchQuery), 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchStocks]);

  const handleSelectStock = (stock) => {
    setSelectedStock(stock);
    setCreateStep(2);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSelectUser = (selectedUser) => {
    setFormData({ ...formData, invitedUsername: selectedUser.username });
    setUserSearchQuery('');
    setUserSearchResults([]);
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    try {
      if (!selectedStock) throw new Error('Please select a stock');
      if (formData.matchType === 'invite' && !formData.invitedUsername.trim())
        throw new Error('Please select a user to invite');

      await apiService.createVsMatch({
        stockSymbol: selectedStock.symbol,
        company: selectedStock.description,
        exchange: 'NASDAQ',
        durationMinutes: parseInt(formData.durationMinutes),
        matchType: formData.matchType,
        invitedUsername: formData.matchType === 'invite' ? formData.invitedUsername.trim() : null
      });

      setSelectedStock(null);
      setFormData({ durationMinutes: 60, matchType: 'open', invitedUsername: '' });
      setCreateStep(1);
      setShowCreateModal(false);
      await fetchVsData();
    } catch (error) {
      setCreateError(error.message || 'Failed to create challenge');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinMatch = async (matchId) => {
    try {
      await apiService.joinVsMatch(matchId);
      await fetchVsData();
    } catch (error) {
      console.error('Error joining match:', error);
      alert(error.message || 'Failed to join match');
    }
  };

  const handleOpenPredictModal = (match) => {
    setCurrentMatch(match);
    setPredictionData({ priceDirection: '', confidence: 3 });
    setShowPredictModal(true);
  };

  const handleSubmitPrediction = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      if (!predictionData.priceDirection) throw new Error('Please select a price direction');
      await apiService.submitVsPrediction(currentMatch._id, {
        priceDirection: predictionData.priceDirection,
        confidence: predictionData.confidence
      });
      setShowPredictModal(false);
      setCurrentMatch(null);
      await fetchVsData();
    } catch (error) {
      alert(error.message || 'Failed to submit prediction');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getDurationLabel = (minutes) => {
    const labels = {
      10: '10 Minutes', 20: '20 Minutes', 30: '30 Minutes',
      60: '1 Hour', 1440: '1 Day', 10080: '7 Days', 43200: '30 Days'
    };
    return labels[minutes] || `${minutes} minutes`;
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(price);

  const formatPercent = (percent) =>
    `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;

  const renderMatchCard = (match) => {
    const isWaiting = match.status === 'waiting';
    const isLocked = match.status === 'locked';
    const isCompleted = match.status === 'completed';

    const currentUserId = user?._id || user?.id;
    const currentUserParticipant = match.participants?.find(
      p => p.userId._id === currentUserId || p.userId === currentUserId
    );
    const needsToSubmit = isWaiting && currentUserParticipant && !currentUserParticipant.priceDirection;

    return (
      <div key={match._id} className="relative rounded-xl mb-4">
        <GlowingEffect {...glowProps} />
        <Card className="relative z-10 premium-card border-transparent">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                  <Target className="size-5 text-candle-accent-blue" />
                  {match.stockSymbol}
                </h3>
                <p className="text-sm text-candle-muted-blue">{match.company}</p>
              </div>
              <Badge
                className={
                  isCompleted ? 'bg-candle-electric-blue/20 text-candle-electric-blue border-candle-electric-blue/30' :
                  isLocked ? 'bg-candle-muted-blue/20 text-candle-muted-blue border-candle-muted-blue/30' :
                  'bg-candle-accent-blue/20 text-candle-accent-blue border-candle-accent-blue/30'
                }
              >
                {match.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-candle-muted-blue">Duration</p>
                <p className="font-medium text-white">{getDurationLabel(match.durationMinutes)}</p>
              </div>
              <div>
                <p className="text-xs text-candle-muted-blue">Match Type</p>
                <p className="font-medium text-white capitalize">{match.matchType}</p>
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-2">
              {match.participants?.map((participant, idx) => {
                const participantId = participant.userId._id || participant.userId;
                const isCurrentUser = participantId === currentUserId;

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border border-candle-electric-blue/20 rounded-lg glass-card"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full candle-gradient flex items-center justify-center text-white font-bold text-sm ring-2 ring-candle-electric-blue/20">
                        {participant.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {participant.username || 'Unknown'}
                          {isCurrentUser && (
                            <span className="text-xs text-candle-muted-blue ml-2">(You)</span>
                          )}
                        </p>
                        {participant.priceDirection ? (
                          <p className="text-xs text-candle-muted-blue">
                            Predicted: {participant.priceDirection}
                            {participant.confidence && ` (${participant.confidence}⭐)`}
                          </p>
                        ) : (
                          <p className="text-xs text-candle-muted-blue italic">Waiting for prediction...</p>
                        )}
                      </div>
                    </div>
                    {isCompleted && (
                      <div className="text-right">
                        <Badge
                          className={
                            participant.isWinner
                              ? 'bg-green-400/20 text-green-400 border-green-400/30'
                              : 'bg-red-400/20 text-red-400 border-red-400/30'
                          }
                        >
                          {participant.isWinner ? 'Winner' : participant.outcome}
                        </Badge>
                        <p className={`text-sm font-bold mt-1 ${participant.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {participant.points > 0 ? '+' : ''}{participant.points} pts
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {needsToSubmit && (
              <Button
                onClick={() => handleOpenPredictModal(match)}
                className="w-full mt-4 candle-gradient hover:shadow-glow transition-all"
              >
                <Target className="size-4 mr-2" />
                Submit Your Prediction
              </Button>
            )}

            {isCompleted && match.resultDetails && (
              <div className="mt-4 p-3 border border-candle-electric-blue/20 rounded-lg glass-card flex items-center gap-2">
                <Trophy className="size-4 text-candle-accent-blue shrink-0" />
                <p className="text-sm text-candle-muted-blue">{match.resultDetails}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderOpenMatchCard = (match) => (
    <div key={match._id} className="relative rounded-xl mb-4">
      <GlowingEffect {...glowProps} />
      <Card className="relative z-10 premium-card border-transparent">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">{match.stockSymbol}</h3>
              <p className="text-sm text-candle-muted-blue">{match.company}</p>
            </div>
            <Badge className="bg-candle-electric-blue/20 text-candle-electric-blue border-candle-electric-blue/30">
              {getDurationLabel(match.durationMinutes)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="size-4 text-candle-muted-blue" />
            <span className="text-sm text-candle-muted-blue">
              Created by {match.createdBy?.username || 'Unknown'}
            </span>
          </div>
          <Button
            onClick={() => handleJoinMatch(match._id)}
            className="w-full candle-gradient hover:shadow-glow transition-all"
          >
            Join Challenge
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Clock className="size-12 mx-auto mb-4 animate-spin text-candle-accent-blue" />
            <p className="text-candle-muted-blue">Loading VS matches...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
            VS Mode
          </h1>
          <p className="text-candle-muted-blue mt-1">
            Challenge others in head-to-head predictions
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          size="lg"
          className="candle-gradient hover:shadow-glow transition-all"
        >
          <Plus className="size-4 mr-2" />
          Create Challenge
        </Button>
      </div>

      {/* VS Stats */}
      {vsStats && (
        <div className="relative rounded-xl">
          <GlowingEffect {...glowProps} />
          <Card className="relative z-10 premium-card border-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="size-5 text-candle-accent-blue" />
                Your VS Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {[
                  { label: 'Wins', value: vsStats.wins || 0, color: 'text-green-400' },
                  { label: 'Losses', value: vsStats.losses || 0, color: 'text-red-400' },
                  { label: 'Ties', value: vsStats.ties || 0, color: 'text-candle-muted-blue' },
                  { label: 'Win Rate', value: `${vsStats.winRate?.toFixed(1) || '0.0'}%`, color: 'text-white' },
                  { label: 'Total Points', value: vsStats.totalPoints || 0, color: 'text-candle-accent-blue' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-sm text-candle-muted-blue">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-candle-electric-blue/20">
        <div className="flex gap-4">
          {[
            { id: 'active', label: 'Active', count: activeMatches.length },
            { id: 'waiting', label: 'Waiting', count: waitingMatches.length },
            { id: 'invites', label: 'Invites', count: invites.length },
            { id: 'open', label: 'Open Challenges', count: openMatches.length },
            { id: 'history', label: 'History', count: completedMatches.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-candle-accent-blue text-candle-accent-blue font-medium'
                  : 'border-transparent text-candle-muted-blue hover:text-white'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'active' && (
          <div>
            {activeMatches.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="size-12 mx-auto mb-4 text-candle-muted-blue opacity-30" />
                <p className="text-candle-muted-blue">No active matches</p>
              </div>
            ) : activeMatches.map(renderMatchCard)}
          </div>
        )}

        {activeTab === 'waiting' && (
          <div>
            {waitingMatches.length === 0 ? (
              <div className="text-center py-12">
                <Users className="size-12 mx-auto mb-4 text-candle-muted-blue opacity-30" />
                <p className="text-candle-muted-blue">No waiting matches</p>
              </div>
            ) : waitingMatches.map(renderMatchCard)}
          </div>
        )}

        {activeTab === 'invites' && (
          <div>
            {invites.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="size-12 mx-auto mb-4 text-candle-muted-blue opacity-30" />
                <p className="text-candle-muted-blue">No pending invites</p>
              </div>
            ) : invites.map(renderOpenMatchCard)}
          </div>
        )}

        {activeTab === 'open' && (
          <div>
            {openMatches.length === 0 ? (
              <div className="text-center py-12">
                <Target className="size-12 mx-auto mb-4 text-candle-muted-blue opacity-30" />
                <p className="text-candle-muted-blue">No open challenges available</p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 candle-gradient hover:shadow-glow transition-all"
                >
                  Create One
                </Button>
              </div>
            ) : openMatches.map(renderOpenMatchCard)}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {completedMatches.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="size-12 mx-auto mb-4 text-candle-muted-blue opacity-30" />
                <p className="text-candle-muted-blue">No match history yet</p>
              </div>
            ) : completedMatches.map(renderMatchCard)}
          </div>
        )}
      </div>

      {/* Create Challenge Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => {
        setShowCreateModal(open);
        if (!open) {
          setCreateStep(1);
          setSelectedStock(null);
          setSearchQuery('');
          setSearchResults([]);
          setCreateError(null);
          setUserSearchQuery('');
          setUserSearchResults([]);
        }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto premium-card border-candle-electric-blue/30">
          <DialogHeader>
            <DialogTitle className="text-white">
              {createStep === 1 ? 'Search Stock' : 'Create VS Challenge'}
            </DialogTitle>
            <DialogDescription className="text-candle-muted-blue">
              {createStep === 1
                ? 'Search for a stock to create a challenge'
                : 'Set up your challenge details'}
            </DialogDescription>
          </DialogHeader>

          {createStep === 1 ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 size-4 text-candle-muted-blue" />
                <Input
                  type="text"
                  placeholder="Search stocks (e.g., AAPL, Tesla)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-candle-electric-blue/10 border-candle-electric-blue/30 text-white placeholder:text-candle-muted-blue focus:border-candle-accent-blue"
                />
              </div>

              {searchLoading && (
                <p className="text-center text-candle-muted-blue py-4">Searching...</p>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="flex items-center justify-between p-3 border border-candle-electric-blue/20 rounded-lg glass-card hover:glass-card-light hover:border-candle-accent-blue/50 cursor-pointer transition-all duration-300"
                      onClick={() => handleSelectStock(stock)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{stock.symbol}</span>
                          <span className="text-sm text-candle-muted-blue truncate">{stock.description}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm mt-1">
                          <span className="text-white">{formatPrice(stock.currentPrice)}</span>
                          <span className={stock.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {stock.change >= 0
                              ? <TrendingUp className="inline size-3" />
                              : <TrendingDown className="inline size-3" />}
                            {formatPercent(stock.changePercent)}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="size-4 text-candle-muted-blue" />
                    </div>
                  ))}
                </div>
              )}

              {!searchLoading && searchQuery && searchResults.length === 0 && (
                <p className="text-center text-candle-muted-blue py-4">No stocks found</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleCreateChallenge} className="space-y-4">
              {createError && (
                <Alert variant="destructive" className="border-red-400/30 bg-red-500/10">
                  <AlertDescription className="text-red-400">{createError}</AlertDescription>
                </Alert>
              )}

              <div className="p-4 border border-candle-electric-blue/20 rounded-lg glass-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{selectedStock?.symbol}</p>
                    <p className="text-sm text-candle-muted-blue">{selectedStock?.description}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setCreateStep(1); setSelectedStock(null); }}
                    className="text-candle-muted-blue hover:text-white hover:bg-candle-electric-blue/10"
                  >
                    Change
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-candle-muted-blue">Match Type</Label>
                <Select
                  value={formData.matchType}
                  onValueChange={(value) => setFormData({ ...formData, matchType: value, invitedUsername: '' })}
                >
                  <SelectTrigger className="border-candle-electric-blue/30 bg-candle-electric-blue/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open Challenge (Anyone can join)</SelectItem>
                    <SelectItem value="invite">Invite Specific User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.matchType === 'invite' && (
                <div className="space-y-2">
                  <Label className="text-candle-muted-blue">Search and Select User</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 size-4 text-candle-muted-blue" />
                    <Input
                      id="userSearch"
                      placeholder="Search username..."
                      value={userSearchQuery || formData.invitedUsername}
                      onChange={(e) => {
                        setUserSearchQuery(e.target.value);
                        setFormData({ ...formData, invitedUsername: '' });
                      }}
                      className="pl-10 bg-candle-electric-blue/10 border-candle-electric-blue/30 text-white placeholder:text-candle-muted-blue focus:border-candle-accent-blue"
                    />
                  </div>

                  {userSearchLoading && (
                    <p className="text-xs text-candle-muted-blue">Searching users...</p>
                  )}

                  {userSearchResults.length > 0 && (
                    <div className="border border-candle-electric-blue/20 rounded-lg max-h-40 overflow-y-auto glass-card">
                      {userSearchResults.map((searchUser) => (
                        <div
                          key={searchUser._id}
                          className="p-2 hover:bg-candle-electric-blue/10 cursor-pointer flex items-center gap-2 transition-colors"
                          onClick={() => handleSelectUser(searchUser)}
                        >
                          <div className="w-6 h-6 rounded-full candle-gradient flex items-center justify-center text-white font-bold text-xs">
                            {searchUser.username[0].toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{searchUser.username}</p>
                            <p className="text-xs text-candle-muted-blue">{searchUser.fullName}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.invitedUsername && (
                    <div className="p-2 border border-candle-accent-blue/30 bg-candle-accent-blue/10 rounded-lg flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full candle-gradient flex items-center justify-center text-white font-bold text-xs">
                        {formData.invitedUsername[0].toUpperCase()}
                      </div>
                      <p className="text-sm font-medium flex-1 text-white">{formData.invitedUsername}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData({ ...formData, invitedUsername: '' })}
                        className="text-candle-muted-blue hover:text-white"
                      >
                        ✕
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-candle-muted-blue">Duration</Label>
                <Select
                  value={formData.durationMinutes.toString()}
                  onValueChange={(value) => setFormData({ ...formData, durationMinutes: parseInt(value) })}
                >
                  <SelectTrigger className="border-candle-electric-blue/30 bg-candle-electric-blue/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 Minutes</SelectItem>
                    <SelectItem value="20">20 Minutes</SelectItem>
                    <SelectItem value="30">30 Minutes</SelectItem>
                    <SelectItem value="60">1 Hour</SelectItem>
                    <SelectItem value="1440">1 Day</SelectItem>
                    <SelectItem value="10080">7 Days</SelectItem>
                    <SelectItem value="43200">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setCreateStep(1); setSelectedStock(null); }}
                  disabled={createLoading}
                  className="border-candle-electric-blue/30 text-candle-muted-blue hover:text-white hover:bg-candle-electric-blue/10"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={createLoading}
                  className="candle-gradient hover:shadow-glow transition-all"
                >
                  {createLoading ? 'Creating...' : 'Create Challenge'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Submit Prediction Modal */}
      <Dialog open={showPredictModal} onOpenChange={setShowPredictModal}>
        <DialogContent className="premium-card border-candle-electric-blue/30">
          <DialogHeader>
            <DialogTitle className="text-white">Submit Your Prediction</DialogTitle>
            <DialogDescription className="text-candle-muted-blue">
              Predict the price movement for {currentMatch?.stockSymbol}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitPrediction} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-candle-muted-blue">Price Direction</Label>
              <Select
                value={predictionData.priceDirection}
                onValueChange={(value) => setPredictionData({ ...predictionData, priceDirection: value })}
              >
                <SelectTrigger className="border-candle-electric-blue/30 bg-candle-electric-blue/10 text-white">
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UP">📈 UP - Price will increase</SelectItem>
                  <SelectItem value="DOWN">📉 DOWN - Price will decrease</SelectItem>
                  <SelectItem value="FLAT">➡️ FLAT - Price stays within ±2%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-candle-muted-blue">Confidence Level</Label>
              <Select
                value={predictionData.confidence.toString()}
                onValueChange={(value) => setPredictionData({ ...predictionData, confidence: parseInt(value) })}
              >
                <SelectTrigger className="border-candle-electric-blue/30 bg-candle-electric-blue/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 ⭐ - Very Low</SelectItem>
                  <SelectItem value="2">2 ⭐⭐ - Low</SelectItem>
                  <SelectItem value="3">3 ⭐⭐⭐ - Medium</SelectItem>
                  <SelectItem value="4">4 ⭐⭐⭐⭐ - High</SelectItem>
                  <SelectItem value="5">5 ⭐⭐⭐⭐⭐ - Very High</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-candle-muted-blue">
                Higher confidence = more points if correct, more penalty if wrong
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPredictModal(false)}
                disabled={submitLoading}
                className="border-candle-electric-blue/30 text-candle-muted-blue hover:text-white hover:bg-candle-electric-blue/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitLoading}
                className="candle-gradient hover:shadow-glow transition-all"
              >
                {submitLoading ? 'Submitting...' : 'Submit Prediction'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Vs;