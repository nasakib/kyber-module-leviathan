import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchCommunityLevels, toggleLevelVote, incrementLevelPlayCount } from '../services/communityService';
import { CommunityLevel, LevelDifficulty } from '../types/cloud';
import { LevelDefinition } from '../types/game';
import { soundEngine } from '../utils/audio';
import {
  X,
  Globe2,
  ThumbsUp,
  Play,
  Search,
  Plus,
  Flame,
  Clock,
  Sparkles,
} from 'lucide-react';

interface CommunityBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayLevel: (level: LevelDefinition) => void;
  onOpenPublish: () => void;
}

export const CommunityBrowser: React.FC<CommunityBrowserProps> = ({
  isOpen,
  onClose,
  onPlayLevel,
  onOpenPublish,
}) => {
  const { user } = useAuth();
  const [levels, setLevels] = useState<CommunityLevel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'upvotes' | 'created_at' | 'play_count'>('upvotes');

  const loadLevels = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchCommunityLevels(
      {
        sectorId: sectorFilter,
        difficulty: difficultyFilter === 'all' ? undefined : (difficultyFilter as LevelDifficulty),
        search: searchQuery,
        sortBy,
      },
      user?.id
    );
    setLevels(data);
    setIsLoading(false);
  }, [sectorFilter, difficultyFilter, searchQuery, sortBy, user?.id]);

  useEffect(() => {
    if (isOpen) {
      loadLevels();
    }
  }, [isOpen, loadLevels]);

  if (!isOpen) return null;

  const handleVote = async (level: CommunityLevel) => {
    if (!user) {
      soundEngine.playObstacleClang();
      alert('Please sign in to vote for community levels.');
      return;
    }

    soundEngine.playSliderTick();
    const hasVoted = !!level.hasVoted;
    const res = await toggleLevelVote(level.id, user.id, hasVoted);

    if (res.success) {
      setLevels((prev) =>
        prev.map((l) =>
          l.id === level.id
            ? {
                ...l,
                upvotes: hasVoted ? Math.max(l.upvotes - 1, 0) : l.upvotes + 1,
                hasVoted: !hasVoted,
              }
            : l
        )
      );
    }
  };

  const handleLaunchLevel = (level: CommunityLevel) => {
    soundEngine.playTargetHit(2);
    incrementLevelPlayCount(level.id);
    onPlayLevel(level.levelData);
    onClose();
  };

  const getDifficultyColor = (diff: LevelDifficulty) => {
    switch (diff) {
      case 'easy': return 'text-emerald-400 bg-emerald-950/80 border-emerald-800';
      case 'medium': return 'text-cyan-400 bg-cyan-950/80 border-cyan-800';
      case 'hard': return 'text-amber-400 bg-amber-950/80 border-amber-800';
      case 'expert': return 'text-rose-400 bg-rose-950/80 border-rose-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-mono text-sm max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center space-x-2">
                <span>Community Level Network</span>
                <span className="text-[10px] text-cyan-400 px-2 py-0.5 bg-cyan-950 rounded border border-cyan-800">
                  Global Puzzles
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Explore, play, and vote on community-architected mathematical coordinate challenges
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenPublish}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish Level</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search levels..."
                className="w-48 sm:w-60 bg-slate-900 border border-slate-700 focus:border-cyan-400 text-slate-200 text-xs pl-7 pr-3 py-1.5 rounded-lg outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
            </div>

            {/* Sector Filter */}
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg outline-none"
            >
              <option value="all">All Sectors</option>
              <option value="linear">Sector I: Linear</option>
              <option value="kinetics">Sector II: Kinetics</option>
              <option value="warp">Sector III: Warp</option>
              <option value="tangent">Sector IV: Tangent</option>
              <option value="vault">Sector V: Vault</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setSortBy('upvotes')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                sortBy === 'upvotes'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Trending</span>
            </button>

            <button
              onClick={() => setSortBy('created_at')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                sortBy === 'created_at'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Newest</span>
            </button>
          </div>
        </div>

        {/* Level Cards Grid */}
        <div className="p-6 overflow-y-auto no-scrollbar space-y-4 flex-1">
          {isLoading ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              <Sparkles className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
              <span>Synchronizing community puzzles from cloud...</span>
            </div>
          ) : levels.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
              No community levels found matching your filters. Click <strong>Publish Level</strong> to create the first one!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {levels.map((level) => (
                <div
                  key={level.id}
                  className="bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all shadow-md group"
                >
                  <div className="space-y-2">
                    {/* Tags Bar */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700">
                        {level.sectorId}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getDifficultyColor(level.difficulty)}`}>
                        {level.difficulty}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {level.title}
                    </h3>

                    {/* Author & Plays */}
                    <p className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>By: <strong className="text-slate-300">{level.authorName}</strong></span>
                      <span className="text-slate-500">{level.playCount} plays</span>
                    </p>

                    {/* Description */}
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {level.description}
                    </p>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => handleVote(level)}
                      className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        level.hasVoted
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                      }`}
                      title="Upvote level"
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${level.hasVoted ? 'fill-current text-cyan-400' : ''}`} />
                      <span>{level.upvotes}</span>
                    </button>

                    <button
                      onClick={() => handleLaunchLevel(level)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-md shadow-cyan-600/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Puzzle</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
