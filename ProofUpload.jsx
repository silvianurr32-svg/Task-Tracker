import { useState, useEffect } from 'react'
import { isToday, isPast } from 'date-fns'
import { Plus, LogOut, CheckSquare, X, Loader } from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'

const FILTERS = [
  { key: 'all',       label: 'All' },
  { key: 'today',     label: "Today's" },
  { key: 'active',    label: 'Active' },
  { key: 'completed', label: 'Done' },
]

function filterTasks(tasks, key) {
  if (key === 'today')     return tasks.filter(t => t.deadline && isToday(new Date(t.deadline)))
  if (key === 'active')    return tasks.filter(t => t.status !== 'completed')
  if (key === 'completed') return tasks.filter(t => t.status === 'completed')
  return tasks
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({ title: '', description: '', deadline: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    api.getTasks()
      .then(setTasks)
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newForm.title.trim()) { toast('Title required', 'error'); return }
    setCreating(true)
    try {
      const t = await api.createTask({ ...newForm, deadline: newForm.deadline || null })
      setTasks(prev => [t, ...prev])
      setNewForm({ title: '', description: '', deadline: '' })
      setShowNew(false)
      toast('Task created!')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleUpdate = (updated) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
    if (selected?.id === updated.id) setSelected(updated)
  }

  const handleDelete = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const overdue   = tasks.filter(t => t.deadline && isPast(new Date(t.deadline)) && t.status !== 'completed').length
  const completed = tasks.filter(t => t.status === 'completed').length
  const visible   = filterTasks(tasks, filter)

  return (
    <div className="min-h-screen">
      {/* Top nav */}
      <header className="sticky top-0 z-30 bg-cream/80 backdrop-blur-sm border-b border-ink/8">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blush rounded-lg flex items-center justify-center shadow-btn">
              <CheckSquare size={14} className="text-ink" />
            </div>
            <span className="font-display text-ink text-lg leading-none">TaskProof</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-navy/60 hidden sm:block">{user?.name}</span>
            <button onClick={logout} className="text-navy/40 hover:text-ink transition-colors" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total',     val: tasks.length,    cls: 'bg-skin/60' },
            { label: 'Overdue',   val: overdue,         cls: overdue > 0 ? 'bg-red-100' : 'bg-skin/60' },
            { label: 'Completed', val: completed,       cls: 'bg-sky/20' },
          ].map(s => (
            <div key={s.label} className={`${s.cls} rounded-xl p-3 text-center`}>
              <p className="text-2xl font-display text-ink">{s.val}</p>
              <p className="text-xs text-navy/60 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-sm px-4 py-1.5 rounded-full whitespace-nowrap transition-all duration-150 font-medium
                ${filter === f.key
                  ? 'bg-ink text-cream'
                  : 'bg-white/80 text-navy/60 hover:text-ink border border-ink/10'}`}
            >
              {f.label}
              {f.key === 'all' && tasks.length > 0 &&
                <span className={`ml-1.5 text-xs ${filter === f.key ? 'text-cream/60' : 'text-navy/40'}`}>{tasks.length}</span>
              }
            </button>
          ))}
        </div>

        {/* New task form */}
        {showNew && (
          <div className="card p-5 mb-4 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-ink">New Task</h3>
              <button onClick={() => setShowNew(false)} className="text-navy/40 hover:text-ink"><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                autoFocus required
                className="input-field"
                placeholder="Task title…"
                value={newForm.title}
                onChange={e => setNewForm(f => ({ ...f, title: e.target.value }))}
              />
              <textarea
                rows={2}
                className="input-field resize-none"
                placeholder="Description (optional)…"
                value={newForm.description}
                onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))}
              />
              <div>
                <label className="text-xs text-navy/50 mb-1 block">Deadline (optional)</label>
                <input
                  type="datetime-local"
                  className="input-field"
                  value={newForm.deadline}
                  onChange={e => setNewForm(f => ({ ...f, deadline: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={creating} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {creating && <Loader size={13} className="animate-spin" />}
                  Create Task
                </button>
                <button type="button" onClick={() => setShowNew(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Task list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader size={24} className="animate-spin text-navy/30" />
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-navy/50 text-sm">
              {filter === 'today' ? "Nothing due today" : "No tasks yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {visible.map(task => (
              <TaskCard key={task.id} task={task} onClick={() => setSelected(task)} />
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      {!showNew && (
        <button
          onClick={() => setShowNew(true)}
          className="fixed bottom-6 right-6 w-12 h-12 bg-blush text-ink rounded-full shadow-btn flex items-center justify-center hover:bg-pink-400 active:scale-95 transition-all z-40"
        >
          <Plus size={22} />
        </button>
      )}

      {/* Task modal */}
      {selected && (
        <TaskModal
          task={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
