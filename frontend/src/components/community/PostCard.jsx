import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare } from 'lucide-react';

function PostCard({ post, onLike }) {
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

  return (
    <div className="p-4 rounded-lg border border-candle-electric-blue/20 glass-card hover:glass-card-light hover:border-candle-accent-blue/40 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex size-10 items-center justify-center rounded-full candle-gradient text-white font-bold text-sm ring-2 ring-candle-electric-blue/20 shrink-0">
            {post.author?.fullName?.[0] || post.author?.username?.[0] || 'U'}
          </div>

          {/* Author Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-white">
                {post.author?.fullName || post.author?.username || 'Anonymous'}
              </span>
              <Badge
                variant="outline"
                className="text-xs border-candle-accent-blue/40 text-candle-accent-blue bg-candle-accent-blue/10"
              >
                {post.ticker}
              </Badge>
            </div>
            <div className="text-xs text-candle-muted-blue">
              {post.company} • {getTimeAgo(post.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3 text-sm leading-relaxed pl-[52px] text-white">
        {post.content}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pl-[52px]">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLike(post._id)}
          className={`gap-1 transition-colors ${
            post.isLikedByUser
              ? 'text-red-400 hover:text-red-300 hover:bg-red-400/10'
              : 'text-candle-muted-blue hover:text-red-400 hover:bg-red-400/10'
          }`}
        >
          <Heart className={`size-4 ${post.isLikedByUser ? 'fill-red-400' : ''}`} />
          <span>{post.likeCount || 0}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-candle-muted-blue/50 cursor-not-allowed"
          disabled
        >
          <MessageSquare className="size-4" />
          <span className="text-xs">Reply (Coming Soon)</span>
        </Button>
      </div>
    </div>
  );
}

export default PostCard;