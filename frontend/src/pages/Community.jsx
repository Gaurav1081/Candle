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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { MessageSquare, TrendingUp, Users, AlertCircle } from 'lucide-react';
import CreatePost from '../components/community/CreatePost';
import PostCard from '../components/community/PostCard';

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

function Community({ onNavigate }) {
  const { apiCall } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [filterTicker, setFilterTicker] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [filterTicker]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const query = filterTicker ? `?ticker=${filterTicker}` : '';
      const response = await apiCall(`/community${query}`);
      setPosts(response?.posts || []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load community posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowCreatePost(false);
  };

  const handleLikeToggle = async (postId) => {
    try {
      const response = await apiCall(`/community/${postId}/like`, {
        method: 'POST'
      });
      if (response?.success) {
        setPosts(posts.map(post =>
          post._id === postId
            ? { ...post, isLikedByUser: response.isLiked, likeCount: response.likeCount }
            : post
        ));
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const statCards = [
    {
      title: 'Total Posts',
      icon: <MessageSquare className="size-4 text-candle-muted-blue" />,
      value: posts.length,
      sub: 'Active discussions',
    },
    {
      title: 'Active Traders',
      icon: <Users className="size-4 text-candle-muted-blue" />,
      value: new Set(posts.map(p => p.author?.username)).size,
      sub: 'Contributing today',
    },
    {
      title: 'Trending Stock',
      icon: <TrendingUp className="size-4 text-candle-muted-blue" />,
      value: (() => {
        if (posts.length === 0) return 'N/A';
        const tickerCounts = posts.reduce((acc, post) => {
          acc[post.ticker] = (acc[post.ticker] || 0) + 1;
          return acc;
        }, {});
        return Object.entries(tickerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
      })(),
      sub: 'Most discussed',
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-white">
            
            Community
          </h1>
          <p className="text-candle-muted-blue mt-1">
            Discuss upcoming earnings and share your predictions with fellow traders
          </p>
        </div>
        <Button
          onClick={() => setShowCreatePost(!showCreatePost)}
          className="candle-gradient hover:shadow-glow transition-all"
        >
          <MessageSquare className="size-4 mr-2" />
          {showCreatePost ? 'Cancel' : 'Create Post'}
        </Button>
      </div>

      {/* Community Guidelines */}
      <Alert className="border-candle-accent-blue/30 bg-candle-accent-blue/10 backdrop-blur-sm">
        <AlertCircle className="size-4 text-candle-accent-blue" />
        <AlertDescription className="text-candle-muted-blue">
          <strong className="text-white">Community Guidelines:</strong> Focus on stock analysis and earnings predictions.
          Share why you chose Beat, Meet, or Miss. No spam, no portfolio discussion.
        </AlertDescription>
      </Alert>

      {/* Create Post Form */}
      {showCreatePost && (
        <CreatePost onPostCreated={handlePostCreated} onCancel={() => setShowCreatePost(false)} />
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="relative rounded-xl hover:scale-[1.02] transition-all duration-300"
          >
            <GlowingEffect {...glowProps} />
            <Card className="relative z-10 glass-card border-transparent h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">{card.title}</CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{card.value}</div>
                <p className="text-xs text-candle-muted-blue mt-1">{card.sub}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Feed Card */}
      <div className="relative rounded-xl">
        <GlowingEffect {...glowProps} />
        <Card className="relative z-10 premium-card border-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <MessageSquare className="size-5 text-candle-accent-blue" />
              Community Feed
            </CardTitle>
            <CardDescription className="text-candle-muted-blue">
              Latest thoughts and predictions from the CANDLE community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-red-400/30 bg-red-500/10 backdrop-blur-sm">
                <AlertCircle className="size-4 text-red-400" />
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="text-center text-candle-muted-blue py-8">
                Loading posts...
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center text-candle-muted-blue py-8">
                <MessageSquare className="size-12 mx-auto mb-4 opacity-20" />
                <p>No posts yet. Be the first to share your thoughts!</p>
                <Button
                  variant="outline"
                  className="mt-4 border-candle-electric-blue/30 text-candle-muted-blue hover:text-white hover:bg-candle-electric-blue/10 hover:border-candle-accent-blue"
                  onClick={() => setShowCreatePost(true)}
                >
                  Create First Post
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onLike={handleLikeToggle}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Community;