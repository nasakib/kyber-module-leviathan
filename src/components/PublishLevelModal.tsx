import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { publishCommunityLevel } from '../services/communityService';
import { LevelDefinition } from '../types/game';
import { LevelDifficulty } from '../types/cloud';
import { soundEngine } from '../utils/audio';
import { X, UploadCloud, Sparkles, Check, AlertCircle } from 'lucide-react';

interface PublishLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  levelToPublish: LevelDefinition;
  onPublished?: (levelId: string) => void;
}

export const PublishLevelModal: React.FC<PublishLevelModalProps> = ({
  isOpen,
  onClose,
  levelToPublish,
  onPublished,
}) => {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState<string>(levelToPublish.title || 'Custom Challenge');
  const [description, setDescription] = useState<string>(
    levelToPublish.description || 'A challenging trajectory puzzle crafted in VectorForge.'
  );
  const [sectorId, setSectorId] = useState<string>(levelToPublish.sectorId || 'linear');
  const [difficulty, setDifficulty] = useState<LevelDifficulty>('medium');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setErrorMsg(null);

    const authorName = profile?.displayName || user?.email?.split('@')[0] || 'Community Pilot';
    const res = await publishCommunityLevel(
      levelToPublish,
      title,
      description,
      sectorId,
      difficulty,
      authorName,
      user?.id
    );

    setIsPublishing(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to publish level');
      soundEngine.playErrorBuzz();
    } else {
      setSuccess(true);
      soundEngine.playVictoryFanfare();
      if (onPublished && res.levelId) {
        onPublished(res.levelId);
      }
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-mono text-sm max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/30">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Publish to Community Network</h3>
              <p className="text-[10px] text-slate-400">Share your custom puzzle level with players worldwide</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto no-scrollbar space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>Level published to Community successfully!</span>
            </div>
          )}

          <form onSubmit={handlePublish} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Puzzle Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Parabolic Gravity Slingshot"
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Mathematical Description & Hints</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the mathematical physics law or challenge..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Mathematical Sector</label>
                <select
                  value={sectorId}
                  onChange={(e) => setSectorId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-2.5 py-2 rounded-lg outline-none"
                >
                  <option value="linear">Sector I: Linear</option>
                  <option value="kinetics">Sector II: Kinetics</option>
                  <option value="warp">Sector III: Warp</option>
                  <option value="tangent">Sector IV: Tangent</option>
                  <option value="vault">Sector V: Vault</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Assessed Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as LevelDifficulty)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-2.5 py-2 rounded-lg outline-none"
                >
                  <option value="easy">Easy (Foundations)</option>
                  <option value="medium">Medium (Standard)</option>
                  <option value="hard">Hard (Advanced)</option>
                  <option value="expert">Expert (Leviathan)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs text-slate-400">
              <div className="flex items-center space-x-1.5 text-cyan-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Publishing Snapshot</span>
              </div>
              <p className="text-[11px]">
                Targets: {levelToPublish.targets.length} | Obstacles: {levelToPublish.obstacles.length} | Controls:{' '}
                {levelToPublish.paramControls.length}
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPublishing}
                className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
              >
                {isPublishing ? 'Publishing...' : 'Publish Level'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
