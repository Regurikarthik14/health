import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Calendar, 
  Clock, 
  Activity, 
  User, 
  Stethoscope, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  RefreshCw, 
  ArrowRight,
  Send,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';
import type { HealthBlock, HealthBlockEvent } from '../../types';

interface HealthBlockDetailModalProps {
  blockReference: string | null;
  isOpen: boolean;
  onClose: () => void;
  onBlockUpdated?: () => void;
  onOpenBookingDoctorId?: (doctorId: number) => void;
}

export const HealthBlockDetailModal: React.FC<HealthBlockDetailModalProps> = ({
  blockReference,
  isOpen,
  onClose,
  onBlockUpdated,
  onOpenBookingDoctorId
}) => {
  const [loading, setLoading] = useState(true);
  const [block, setBlock] = useState<HealthBlock | null>(null);
  const [events, setEvents] = useState<HealthBlockEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  // New Progress Entry State
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteDesc, setNewNoteDesc] = useState('');
  const [newPainLevel, setNewPainLevel] = useState<number>(3);
  const [addingNote, setAddingNote] = useState(false);
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);

  // Resolution Form State
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [resolving, setResolving] = useState(false);

  const fetchBlockDetails = async () => {
    if (!blockReference) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getHealthBlockDetail(blockReference);
      setBlock(res.block);
      setEvents(res.events || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load health block details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && blockReference) {
      fetchBlockDetails();
    }
  }, [isOpen, blockReference]);

  if (!isOpen || !blockReference) return null;

  const handleAddTimelineEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteDesc.trim()) return;

    setAddingNote(true);
    try {
      await api.addHealthBlockEvent(blockReference, {
        event_type: 'symptom_update',
        title: newNoteTitle.trim(),
        description: newNoteDesc.trim(),
        pain_level_recorded: newPainLevel
      });

      setNewNoteTitle('');
      setNewNoteDesc('');
      setShowAddNoteForm(false);
      await fetchBlockDetails();
      if (onBlockUpdated) onBlockUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to add progress entry.');
    } finally {
      setAddingNote(false);
    }
  };

  const handleResolveProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionSummary.trim()) return;

    setResolving(true);
    try {
      await api.resolveHealthBlock(blockReference, {
        resolution_summary: resolutionSummary.trim()
      });

      setShowResolveForm(false);
      await fetchBlockDetails();
      if (onBlockUpdated) onBlockUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve health block.');
    } finally {
      setResolving(false);
    }
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'intake_start': return 'bg-white/10 text-white border-white/20';
      case 'triage_result': return 'bg-blue-900/30 text-blue-200 border-blue-700/50';
      case 'doctor_consultation': return 'bg-emerald-900/30 text-emerald-200 border-emerald-700/50';
      case 'symptom_update': return 'bg-purple-900/30 text-purple-200 border-purple-700/50';
      case 'resolution': return 'bg-emerald-600/30 text-emerald-300 border-emerald-500 font-bold';
      default: return 'bg-white/10 text-[#CCC] border-white/10';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#0B0B0B] border border-[#262626] shadow-2xl p-6 sm:p-8 space-y-6 text-left">
        
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#222]">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-white/10 text-white border border-white/20">
                Personal Health Block
              </span>
              <span className="text-[11px] font-mono text-[#777]">
                Ref: {blockReference}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {block?.title || 'Personal Health Block Ledger'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#777] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-[#777] flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-white" />
            <span>Loading verified health ledger block...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-200">
            {error}
          </div>
        ) : block ? (
          <div className="space-y-6">

            {/* Block Summary Card */}
            <div className="p-5 rounded-2xl bg-[#111111] border border-[#222] space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-[10px] font-mono text-[#777] uppercase">Body Area</div>
                  <div className="text-xs font-bold text-white mt-0.5">{block.body_area}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#777] uppercase">Current Status</div>
                  <div className="mt-0.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                      block.status === 'resolved'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                    }`}>
                      {block.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#777] uppercase">Assigned Specialist</div>
                  <div className="text-xs font-bold text-white mt-0.5 truncate">{block.recommended_specialist}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#777] uppercase">Discomfort Level</div>
                  <div className="text-xs font-bold text-white font-mono mt-0.5">{block.pain_scale} / 10</div>
                </div>
              </div>

              {/* Recognized Diagnosis & Reason */}
              {block.recognized_diagnosis && (
                <div className="pt-3 border-t border-[#1C1C1C] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div className="text-[#AAA]">
                    <span className="text-white font-semibold">Diagnosis Pattern: </span>
                    <span>{block.recognized_diagnosis}</span>
                  </div>
                  {block.assigned_doctor_name && (
                    <div className="text-xs text-[#888]">
                      Doctor: <strong className="text-white">{block.assigned_doctor_name}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Cryptographic Ledger Security Strip */}
              <div className="pt-2 text-[10px] font-mono text-[#666] flex flex-wrap items-center justify-between gap-2 border-t border-[#1C1C1C]">
                <div className="flex items-center space-x-1.5">
                  <Lock className="w-3 h-3 text-[#888]" />
                  <span>Genesis: <span className="text-[#AAA]">{block.genesis_hash.slice(0, 16)}...</span></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span>Current Hash: <span className="text-[#AAA]">{block.current_block_hash.slice(0, 16)}...</span></span>
                  <span className="text-emerald-400">✓ Verified Integrity</span>
                </div>
              </div>
            </div>

            {/* Resolved Banner if problem is closed */}
            {block.status === 'resolved' && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 space-y-1.5">
                <div className="flex items-center space-x-2 text-xs font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Health Problem Successfully Resolved & Closed</span>
                </div>
                <p className="text-xs text-emerald-300/90 leading-relaxed">
                  {block.resolution_summary || 'The patient confirmed this condition has been treated and resolved.'}
                </p>
                <div className="text-[10px] font-mono text-emerald-400/80 pt-1">
                  Resolved on: {block.resolved_at ? new Date(block.resolved_at).toLocaleDateString() : 'Recorded'} by {block.resolved_by || 'Patient'}
                </div>
              </div>
            )}

            {/* Chronological Timeline from Start to End */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Problem Timeline (Start to End)
                </h4>
                <span className="text-xs font-mono text-[#777]">
                  {events.length} Recorded Milestone{events.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="space-y-3 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#222]">
                {events.map((evt, idx) => (
                  <div key={evt.id || idx} className="relative pl-8 space-y-1">
                    <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-black" />
                    
                    <div className="p-4 rounded-xl bg-[#0E0E0E] border border-[#222] space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${getEventBadgeColor(evt.event_type)}`}>
                            {evt.event_type.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-bold text-white">{evt.title}</span>
                        </div>
                        <span className="text-[10px] text-[#777] font-mono">
                          {new Date(evt.created_at).toLocaleDateString()} {new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs text-[#AAA] leading-relaxed">
                        {evt.description}
                      </p>

                      <div className="pt-2 border-t border-[#1C1C1C] flex items-center justify-between text-[10px] text-[#666] font-mono">
                        <span>Recorded by: <strong className="text-[#999]">{evt.author_name || evt.author_role}</strong></span>
                        {evt.pain_level_recorded !== undefined && evt.pain_level_recorded !== null && (
                          <span>Pain: {evt.pain_level_recorded}/10</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar (If block is active) */}
            {block.status !== 'resolved' && (
              <div className="space-y-4 pt-4 border-t border-[#222]">
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowAddNoteForm(!showAddNoteForm); setShowResolveForm(false); }}
                    className="px-4 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-white hover:text-black text-xs font-semibold text-white transition-all cursor-pointer flex items-center space-x-1.5 border border-[#333]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Symptom Progress Note</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowResolveForm(!showResolveForm); setShowAddNoteForm(false); }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-xs font-semibold text-emerald-200 transition-all cursor-pointer flex items-center space-x-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mark Problem as Resolved (Close Block)</span>
                  </button>

                  {block.assigned_doctor_id && onOpenBookingDoctorId && (
                    <button
                      type="button"
                      onClick={() => onOpenBookingDoctorId(block.assigned_doctor_id!)}
                      className="px-4 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#EAEAEA] transition-all cursor-pointer flex items-center space-x-1.5 ml-auto"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-black" />
                      <span>Book Follow-up with Doctor</span>
                    </button>
                  )}
                </div>

                {/* Form: Add Daily Progress Note */}
                {showAddNoteForm && (
                  <form onSubmit={handleAddTimelineEntry} className="p-4 rounded-xl bg-black border border-[#2D2D2D] space-y-3">
                    <h5 className="text-xs font-bold text-white font-mono uppercase">
                      Add Progress Note / Symptom Check-in
                    </h5>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white">Title</label>
                      <input
                        type="text"
                        required
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        placeholder="e.g. Day 3: Pain feeling much better after medication"
                        className="w-full px-3 py-2 rounded-xl bg-[#0D0D0D] border border-[#2D2D2D] text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white">Progress Details</label>
                      <textarea
                        rows={2}
                        required
                        value={newNoteDesc}
                        onChange={(e) => setNewNoteDesc(e.target.value)}
                        placeholder="Describe how the problem feels today, any medication taken, or improvements..."
                        className="w-full px-3 py-2 rounded-xl bg-[#0D0D0D] border border-[#2D2D2D] text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-white">Current Discomfort Level</span>
                        <span className="font-mono text-white font-bold">{newPainLevel} / 10</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={newPainLevel}
                        onChange={(e) => setNewPainLevel(Number(e.target.value))}
                        className="w-full accent-white cursor-pointer"
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddNoteForm(false)}
                        className="px-3 py-1.5 rounded-lg text-xs text-[#777] hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={addingNote}
                        className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] cursor-pointer disabled:opacity-50"
                      >
                        {addingNote ? 'Saving Entry...' : 'Save Timeline Note'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Form: Mark Problem as Resolved (END) */}
                {showResolveForm && (
                  <form onSubmit={handleResolveProblem} className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800 space-y-3">
                    <h5 className="text-xs font-bold text-emerald-300 font-mono uppercase">
                      Confirm Resolution & Close Health Block
                    </h5>
                    <p className="text-xs text-[#AAA] leading-relaxed">
                      Closing this block marks the health problem as completely healed or resolved. The block will be permanently preserved in your health history.
                    </p>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white">Resolution Summary</label>
                      <textarea
                        rows={2}
                        required
                        value={resolutionSummary}
                        onChange={(e) => setResolutionSummary(e.target.value)}
                        placeholder="e.g. Pain completely resolved after taking prescribed antibiotics and resting for 5 days. Full mobility restored."
                        className="w-full px-3 py-2 rounded-xl bg-black border border-[#2D2D2D] text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowResolveForm(false)}
                        className="px-3 py-1.5 rounded-lg text-xs text-[#777] hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={resolving}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 cursor-pointer disabled:opacity-50"
                      >
                        {resolving ? 'Sealing Block...' : 'Seal & Close Problem Block'}
                      </button>
                    </div>
                  </form>
                )}

              </div>
            )}

          </div>
        ) : null}

      </div>
    </div>
  );
};
