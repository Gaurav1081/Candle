import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { AlertCircle, Send } from 'lucide-react';

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768;

function CreatePost({ onPostCreated, onCancel }) {
  const { apiCall } = useAuth();
  const [formData, setFormData] = useState({ ticker: '', company: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ticker' ? value.toUpperCase() : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ticker.trim() || !formData.company.trim() || !formData.content.trim()) {
      setError('All fields are required');
      return;
    }
    if (formData.content.length > 300) {
      setError('Content must be 300 characters or less');
      return;
    }
    if (!/^[A-Z]+$/.test(formData.ticker)) {
      setError('Ticker must contain only letters');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall('/community', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (response?.success) {
        setFormData({ ticker: '', company: '', content: '' });
        onPostCreated(response.post);
      }
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const characterCount = formData.content.length;
  const characterLimit = 300;
  const isOverLimit = characterCount > characterLimit;

  return (
    <div className="relative rounded-xl">
      <GlowingEffect
        spread={60}
        glow={true}
        disabled={IS_MOBILE}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={2}
        movementDuration={1.2}
      />
      <Card className="relative z-10 border-transparent">
        <CardHeader>
          <CardTitle className="text-white">Create Post</CardTitle>
          <CardDescription className="text-candle-muted-blue">
            Share your thoughts on an upcoming earnings report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="border-red-400/30 bg-red-500/10 backdrop-blur-sm">
                <AlertCircle className="size-4 text-red-400" />
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ticker" className="text-white">Stock Ticker</Label>
                <Input
                  id="ticker"
                  name="ticker"
                  placeholder="AAPL"
                  value={formData.ticker}
                  onChange={handleChange}
                  maxLength={10}
                  required
                  className="uppercase bg-candle-deep-dark/50 border-candle-electric-blue/30 text-white placeholder:text-candle-muted-blue/50 focus:border-candle-accent-blue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-white">Company Name</Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Apple Inc."
                  value={formData.company}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  className="bg-candle-deep-dark/50 border-candle-electric-blue/30 text-white placeholder:text-candle-muted-blue/50 focus:border-candle-accent-blue"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-white">Your Thoughts</Label>
              <textarea
                id="content"
                name="content"
                placeholder="Share why you think they'll beat, meet, or miss earnings..."
                value={formData.content}
                onChange={handleChange}
                rows={4}
                maxLength={300}
                required
                className="w-full px-3 py-2 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-candle-accent-blue/50 bg-candle-deep-dark/50 border border-candle-electric-blue/30 text-white placeholder:text-candle-muted-blue/50 transition-colors"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-candle-muted-blue">
                  Max 300 characters. Focus on earnings analysis.
                </p>
                <p className={`text-xs font-medium ${
                  isOverLimit ? 'text-red-400' :
                  characterCount > 250 ? 'text-yellow-400' :
                  'text-candle-muted-blue'
                }`}>
                  {characterCount}/{characterLimit}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading || isOverLimit}
                className="flex-1 candle-gradient hover:shadow-glow transition-all"
              >
                {loading ? 'Posting...' : (
                  <><Send className="size-4 mr-2" />Post</>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="border-candle-electric-blue/30 text-candle-muted-blue hover:text-white hover:bg-candle-electric-blue/10 hover:border-candle-accent-blue"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreatePost;