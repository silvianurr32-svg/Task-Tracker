import { useState } from 'react'
import { X, Trash2, CheckCircle, Clock, Loader } from 'lucide-react'
import { format, isPast, differenceInHours } from 'date-fns'
import { api } from '../api'
import { useToast } from './Toast'
import StatusBadge from './StatusBadge'
import ProofUpload from './ProofUpload'

const STATUS_FLOW = {
  pending:        'in_progress',
  in_progress:    'awaiting_proof',
  awaiting_proof: 'completed',
  completed:      null,
}

const STATUS_ACTION = {
  pending:        'Start Task',
  in_progress:    'Upload Proof & Review',
  awaiting_proof: 'Mark Complete',
  completed:      null,
}

export default function TaskModal({ task: initTask, onClose, onUpdate, onDelete }) {
  const toast = useToast()
  const [task, setTask] = useState(initTask)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: task.title, description: task.description || '', deadline: task.deadline?.slice(0,16) || '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const deadlinePast   = task.deadline && isPast(new Date(task.deadline))
  const deadlineSoon   = task.deadline && !deadlinePast && differenceInHours(new Date(task.deadline), new Date()) < 3

  const handleProofUploaded = (updated) => {
    setTask(updated)
    onUpdate(updated)
  }

  const handleStatusNext = async () => {
    const next = STATUS_FLOW[task.status]
    if (!next) return
    if (next === 'completed' && !task.proof_image) {
      toast('Upload a proof image first!', 'error')
      return
    }
    if (next === 'awaiting_proof') {
      toast('Upload your proof below to continue', 'error')
      return
    }
    setSaving(true)
    try {
      const updated = await api.updateTask(task.id, { status: next })
      setTask(updated)
      onUpdate(updated)
      toast(next === 'completed' ? 'Task completed!' : 'Status updated')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!form.title.trim()) { toast('Title required', 'error'); return }
    setSaving(true)
    try {
      const updated = await api.updateTask(task.id, {
        title: form.title.trim(),
        description: form.description,
        deadline: form.deadline || null
      })
      setTask(updated)
      onUpdate(updated)
      setEditing(false)
      toast('Task updated')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return
    setDeleting(true)
    try {
      await api.deleteTask(task.id)
      onDelete(task.id)
      onClose()
      toast('Task deleted')
    } catch (e) {
      toast(e.message, 'error')
      setDeleting(false)
    }
  }

  const nextAction = STATUS_ACTION[task.status]
  const canComplete = task.status === 'awaiting_proof' && !!task.proof_image

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 fade-in">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div className="modal-enter relative card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-ink/8">
          <div className="flex-1 min-w-0 pr-4">
            {editing ? (
              <input
                autoFocus
                className="input-field text-lg font-display"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            ) : (
              <h2 className="text-xl leading-tight text-ink">{task.title}</h2>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={task.status} />
              {task.deadline && (
                <span className={`text-xs flex items-center gap-1
                  ${deadlinePast ? 'text-red-500 font-semibold' : deadlineSoon ? 'text-amber-600 font-semibold' : 'text-navy/50'}`}>
                  <Clock size={11} />
                  {format(new Date(task.deadline), 'MMM d, HH:mm')}
                  {deadlinePast && ' · Overdue'}
                  {deadlineSoon && !deadlinePast && ' · Due soon'}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-navy/40 hover:text-ink transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {editing ? (
            <>
              <div>
                <label className="text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5 block">Description</label>
                <textarea
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Optional description…"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5 block">Deadline</label>
                <input
                  type="datetime-local"
                  className="input-field"
                  value={form.deadline}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                />
              </div>
            </>
          ) : (
            task.description && (
              <p className="text-navy/70 text-sm leading-relaxed">{task.description}</p>
            )
          )}

          {/* Proof section */}
          {task.status !== 'pending' && task.status !== 'in_progress' && (
            <div>
              <p className="text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">
                Proof of Completion
              </p>
              <ProofUpload task={task} onUploaded={handleProofUploaded} />
            </div>
          )}

          {task.status === 'in_progress' && (
            <div className="bg-skin/40 rounded-xl p-3 text-sm text-navy">
              Move to "Awaiting Proof" to upload your submission screenshot.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 pt-0 flex flex-col gap-2">
          {editing ? (
            <div className="flex gap-2">
              <button onClick={handleSaveEdit} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving && <Loader size={14} className="animate-spin" />}
                Save Changes
              </button>
              <button onClick={() => setEditing(false)} className="btn-ghost">Cancel</button>
            </div>
          ) : (
            <>
              {nextAction && task.status !== 'awaiting_proof' && (
                <button
                  onClick={handleStatusNext}
                  disabled={saving}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  {saving
                    ? <Loader size={14} className="animate-spin" />
                    : task.status === 'awaiting_proof' && <CheckCircle size={14} />
                  }
                  {nextAction}
                </button>
              )}
              {task.status === 'awaiting_proof' && (
                <button
                  onClick={handleStatusNext}
                  disabled={!canComplete || saving}
                  className="btn-primary flex items-center justify-center gap-2 disabled:opacity-40"
                  title={!canComplete ? 'Upload proof image first' : ''}
                >
                  {saving ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Mark as Complete
                  {!canComplete && <span className="text-xs opacity-70">(upload proof first)</span>}
                </button>
              )}
              <div className="flex gap-2">
                <button onClick={() => setEditing(true)} className="btn-ghost flex-1" disabled={task.status === 'completed'}>
                  Edit Task
                </button>
                <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors">
                  <Trash2 size={14} />
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
