import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchUserClassrooms,
  createClassroom,
  joinClassroomByCode,
  fetchAssignments,
  createAssignment,
  submitAssignment,
  fetchAssignmentSubmissions,
} from '../services/classroomService';
import { Classroom, Assignment, AssignmentSubmission } from '../types/cloud';
import { UserProgressStore } from '../types/game';
import { ALL_LEVELS } from '../data/levels';
import { soundEngine } from '../utils/audio';
import {
  X,
  GraduationCap,
  Plus,
  Users,
  CheckCircle,
  Clock,
  Send,
  Star,
  Award,
  BookOpen,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';

interface ClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgressStore;
  onSelectLevelId: (levelId: string) => void;
}

export const ClassroomModal: React.FC<ClassroomModalProps> = ({
  isOpen,
  onClose,
  progress,
  onSelectLevelId,
}) => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>(
    profile?.role === 'teacher' ? 'teacher' : 'student'
  );

  // Classroom state
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);

  // Form states
  const [joinCode, setJoinCode] = useState<string>('');
  const [newClassName, setNewClassName] = useState<string>('');
  const [newAsgTitle, setNewAsgTitle] = useState<string>('');
  const [selectedLevelIds, setSelectedLevelIds] = useState<string[]>([]);
  const [codeCopied, setCodeCopied] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load classrooms for current user
  const loadClassrooms = useCallback(async () => {
    const list = await fetchUserClassrooms(user?.id || 'guest', activeTab === 'teacher');
    setClassrooms(list);
    if (list.length > 0 && !selectedClassroom) {
      setSelectedClassroom(list[0]);
    }
  }, [user?.id, activeTab, selectedClassroom]);

  useEffect(() => {
    if (isOpen) {
      loadClassrooms();
    }
  }, [isOpen, loadClassrooms]);

  // Load assignments when classroom changes
  useEffect(() => {
    if (selectedClassroom) {
      fetchAssignments(selectedClassroom.id).then((asgs) => {
        setAssignments(asgs);
        if (asgs.length > 0) {
          setSelectedAssignment(asgs[0]);
        } else {
          setSelectedAssignment(null);
        }
      });
    }
  }, [selectedClassroom]);

  // Load submissions when assignment changes in teacher view
  useEffect(() => {
    if (selectedAssignment && activeTab === 'teacher') {
      fetchAssignmentSubmissions(selectedAssignment.id).then(setSubmissions);
    }
  }, [selectedAssignment, activeTab]);

  if (!isOpen) return null;

  // Student: Join classroom with code
  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    const res = await joinClassroomByCode(joinCode, user?.id || 'guest');
    if (res.success && res.classroom) {
      soundEngine.playVictoryFanfare();
      setClassrooms((prev) => [res.classroom!, ...prev]);
      setSelectedClassroom(res.classroom);
      setJoinCode('');
      setStatusMessage(`Successfully joined ${res.classroom.name}!`);
    } else {
      soundEngine.playErrorBuzz();
      setStatusMessage(res.error || 'Could not join classroom.');
    }
  };

  // Teacher: Create new classroom
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    setStatusMessage(null);
    const res = await createClassroom(newClassName, user?.id || 'guest');
    if (res.success && res.classroom) {
      soundEngine.playVictoryFanfare();
      setClassrooms((prev) => [res.classroom!, ...prev]);
      setSelectedClassroom(res.classroom);
      setNewClassName('');
      setStatusMessage(`Classroom "${res.classroom.name}" created with code: ${res.classroom.code}`);
    } else {
      soundEngine.playErrorBuzz();
      setStatusMessage(res.error || 'Failed to create classroom.');
    }
  };

  // Teacher: Create new assignment
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassroom || !newAsgTitle.trim() || selectedLevelIds.length === 0) {
      setStatusMessage('Please select a title and at least one required level.');
      return;
    }
    const res = await createAssignment(selectedClassroom.id, newAsgTitle, selectedLevelIds);
    if (res.success && res.assignment) {
      soundEngine.playVictoryFanfare();
      setAssignments((prev) => [res.assignment!, ...prev]);
      setSelectedAssignment(res.assignment);
      setNewAsgTitle('');
      setSelectedLevelIds([]);
      setStatusMessage(`Assignment "${res.assignment.title}" published to classroom!`);
    }
  };

  // Student: Submit assignment progress
  const handleSubmitHomework = async (assignment: Assignment) => {
    const studentName = profile?.displayName || user?.email?.split('@')[0] || 'Cadet Pilot';
    const res = await submitAssignment(
      assignment.id,
      user?.id || 'guest',
      studentName,
      assignment.requiredLevelIds,
      progress
    );

    if (res.success) {
      soundEngine.playVictoryFanfare();
      setStatusMessage(`Assignment submitted! Stored ${res.submission?.totalStars} stars and ${res.submission?.goldMasteriesCount} Gold Masteries.`);
    } else {
      soundEngine.playErrorBuzz();
      setStatusMessage(res.error || 'Submission failed');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    soundEngine.playTargetHit(2);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-mono text-sm max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 text-purple-400 rounded-xl border border-purple-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center space-x-2">
                <span>Classroom Assignment Network</span>
                <span className="text-[10px] text-purple-400 px-2 py-0.5 bg-purple-950 rounded border border-purple-800">
                  Pedagogical Hub
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Track homework assignments, solve curricular levels, and audit mastery progress
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Mode Selector & Status Bar */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => {
                setActiveTab('student');
                setStatusMessage(null);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'student'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Student Portal</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('teacher');
                setStatusMessage(null);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'teacher'
                  ? 'bg-purple-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Instructor / Teacher Dashboard</span>
            </button>
          </div>

          {statusMessage && (
            <div className="text-xs text-cyan-300 bg-cyan-950/80 px-3 py-1 rounded-lg border border-cyan-800/80 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto no-scrollbar space-y-6 flex-1">
          {/* ========================================================================= */}
          {/* STUDENT VIEW */}
          {/* ========================================================================= */}
          {activeTab === 'student' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Enrolled Classes & Join Box */}
              <div className="lg:col-span-4 space-y-4">
                {/* Join Classroom Box */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Enroll in Class</span>
                  </h3>
                  <form onSubmit={handleJoinClass} className="space-y-2">
                    <input
                      type="text"
                      required
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="Enter code (e.g. MATH-42)"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none font-mono"
                    />
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                    >
                      Join Class
                    </button>
                  </form>
                </div>

                {/* Enrolled Classes List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    My Enrolled Classes
                  </h4>
                  {classrooms.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedClassroom(c)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col space-y-1 ${
                        selectedClassroom?.id === c.id
                          ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <span className="font-bold text-xs text-slate-100">{c.name}</span>
                      <span className="text-[10px] text-slate-500">Code: {c.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Assignments for Selected Class */}
              <div className="lg:col-span-8 space-y-4">
                {selectedClassroom ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-100 text-sm">{selectedClassroom.name}</h3>
                        <p className="text-xs text-slate-400">Class Code: <strong className="text-cyan-400">{selectedClassroom.code}</strong></p>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        {assignments.length} Active Assignments
                      </span>
                    </div>

                    {assignments.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                        No assignments posted for this classroom yet.
                      </div>
                    ) : (
                      assignments.map((asg) => {
                        const totalReq = asg.requiredLevelIds.length;
                        const clearedReq = asg.requiredLevelIds.filter((id) => progress[id]?.completed).length;
                        const pct = totalReq > 0 ? Math.round((clearedReq / totalReq) * 100) : 0;

                        return (
                          <div
                            key={asg.id}
                            className="p-5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl space-y-4 shadow-md"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <h4 className="font-bold text-slate-100 text-sm">{asg.title}</h4>
                                <p className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Due: {asg.dueDate ? new Date(asg.dueDate).toLocaleDateString() : 'Self-Paced'}</span>
                                </p>
                              </div>

                              {/* Progress Pill */}
                              <div className="flex items-center space-x-2">
                                <div className="text-right">
                                  <span className="text-xs font-bold text-cyan-300">
                                    {clearedReq} / {totalReq} Cleared
                                  </span>
                                  <span className="text-[10px] text-slate-500 block">({pct}%)</span>
                                </div>
                                <button
                                  onClick={() => handleSubmitHomework(asg)}
                                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-md shadow-emerald-600/20"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Submit</span>
                                </button>
                              </div>
                            </div>

                            {/* Required Levels Grid */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                Required Problem Levels (Click to Solve):
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {asg.requiredLevelIds.map((lvlId) => {
                                  const lvl = ALL_LEVELS.find((l) => l.id === lvlId);
                                  const p = progress[lvlId];
                                  const isDone = !!p?.completed;
                                  const stars = p?.stars || 0;
                                  const hasGold = !!p?.masteryStatus?.hypothesisCorrect;

                                  return (
                                    <button
                                      key={lvlId}
                                      onClick={() => {
                                        onSelectLevelId(lvlId);
                                        onClose();
                                      }}
                                      className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all group ${
                                        isDone
                                          ? 'bg-cyan-950/30 border-cyan-800/60 hover:border-cyan-500/60 text-slate-200'
                                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'
                                      }`}
                                    >
                                      <div className="flex items-center space-x-2 truncate">
                                        {isDone ? (
                                          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                        ) : (
                                          <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0" />
                                        )}
                                        <span className="text-xs font-semibold group-hover:text-cyan-300 truncate">
                                          {lvl ? `${lvl.code}: ${lvl.title}` : lvlId}
                                        </span>
                                      </div>

                                      <div className="flex items-center space-x-1.5 pl-2 flex-shrink-0">
                                        {hasGold && <Award className="w-3.5 h-3.5 text-amber-400" />}
                                        {stars > 0 && (
                                          <span className="text-[11px] text-amber-400 font-bold flex items-center">
                                            <Star className="w-3 h-3 fill-current inline mr-0.5" />
                                            {stars}
                                          </span>
                                        )}
                                        <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                    Select a classroom from the left or join using a code to view assignments.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TEACHER DASHBOARD VIEW */}
          {/* ========================================================================= */}
          {activeTab === 'teacher' && (
            <div className="space-y-6">
              {/* Top Row: Create Class & Class Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Create Class Card */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Plus className="w-3.5 h-3.5 text-purple-400" />
                    <span>Create New Classroom</span>
                  </h3>
                  <form onSubmit={handleCreateClass} className="space-y-2">
                    <input
                      type="text"
                      required
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      placeholder="e.g. AP Calculus BC - Period 4"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-purple-400 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none"
                    />
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                    >
                      Generate Class & Code
                    </button>
                  </form>
                </div>

                {/* Active Classrooms Selector & Code Badge */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Select Classroom to Manage
                  </h3>
                  <select
                    value={selectedClassroom?.id || ''}
                    onChange={(e) => {
                      const found = classrooms.find((c) => c.id === e.target.value);
                      if (found) setSelectedClassroom(found);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none"
                  >
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>

                  {selectedClassroom && (
                    <div className="flex items-center justify-between p-2.5 bg-purple-950/30 border border-purple-800/50 rounded-lg">
                      <span className="text-xs text-purple-300">
                        Student Join Code: <strong className="text-base text-white">{selectedClassroom.code}</strong>
                      </span>
                      <button
                        onClick={() => copyCode(selectedClassroom.code)}
                        className="flex items-center space-x-1 px-2.5 py-1 bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded text-xs transition-colors"
                      >
                        {codeCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{codeCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Assignment Publisher for Teacher */}
              {selectedClassroom && (
                <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span>Publish Curriculum Assignment</span>
                  </h3>

                  <form onSubmit={handleCreateAssignment} className="space-y-3">
                    <input
                      type="text"
                      required
                      value={newAsgTitle}
                      onChange={(e) => setNewAsgTitle(e.target.value)}
                      placeholder="Assignment Title (e.g. Unit 3: Linear Space Warping)"
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none"
                    />

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Select Required Levels ({selectedLevelIds.length} selected):
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto no-scrollbar p-2 bg-slate-900/60 border border-slate-800 rounded-lg">
                        {ALL_LEVELS.map((lvl) => {
                          const isSelected = selectedLevelIds.includes(lvl.id);
                          return (
                            <button
                              key={lvl.id}
                              type="button"
                              onClick={() => {
                                setSelectedLevelIds((prev) =>
                                  isSelected ? prev.filter((id) => id !== lvl.id) : [...prev, lvl.id]
                                );
                              }}
                              className={`p-1.5 rounded text-left text-xs truncate border transition-all ${
                                isSelected
                                  ? 'bg-purple-950 border-purple-500 text-purple-200 font-bold'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {lvl.code}: {lvl.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                    >
                      Publish Assignment
                    </button>
                  </form>
                </div>
              )}

              {/* Live Student Submission Telemetry Table */}
              {selectedAssignment && (
                <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                      <Users className="w-4 h-4 text-cyan-400" />
                      <span>Live Student Submissions ({selectedAssignment.title})</span>
                    </h3>
                    <span className="text-xs text-slate-500">
                      {submissions.length} Submissions Logged
                    </span>
                  </div>

                  {submissions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No student submissions recorded for this assignment yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full text-left text-xs font-mono">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                            <th className="pb-2">Student Callsign</th>
                            <th className="pb-2">Cleared Levels</th>
                            <th className="pb-2">Total Stars</th>
                            <th className="pb-2">Gold Masteries</th>
                            <th className="pb-2">Submission Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {submissions.map((sub) => (
                            <tr key={sub.id} className="hover:bg-slate-900/40">
                              <td className="py-2.5 text-slate-200 font-bold">{sub.studentName}</td>
                              <td className="py-2.5 text-cyan-300">
                                {sub.completedLevels.length} / {selectedAssignment.requiredLevelIds.length}
                              </td>
                              <td className="py-2.5 text-amber-400 font-bold">{sub.totalStars} ★</td>
                              <td className="py-2.5 text-purple-300">{sub.goldMasteriesCount} 🥇</td>
                              <td className="py-2.5 text-slate-500 text-[11px]">
                                {new Date(sub.submittedAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
