import { useState, useRef, useCallback } from 'react'
import { Upload, ImageIcon, X } from 'lucide-react'
import { api } from '../api'
import { useToast } from './Toast'

export default function ProofUpload({ task, onUploaded }) {
  const toast = useToast()
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(task.proof_image ? `${task.proof_image}` : null)
  const inputRef = useRef()

  const handleFile = async (file) => {
    if (!file) return
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast('Only JPG/PNG allowed', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target.result)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const form = new FormData()
      form.append('proof', file)
      const updated = await api.uploadProof(task.id, form)
      onUploaded(updated)
      toast('Proof uploaded!')
    } catch (e) {
      toast(e.message, 'error')
      setPreview(task.proof_image || null)
    } finally {
      setUploading(false)
    }
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [task])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  if (task.status === 'completed') {
    return preview
      ? <div className="mt-3 rounded-xl overflow-hidden border border-ink/10">
          <img src={preview} alt="Proof" className="w-full max-h-48 object-cover" />
          <p className="text-xs text-navy/60 px-3 py-1.5 bg-skin/30">Submitted proof</p>
        </div>
      : null
  }

  return (
    <div className="mt-3">
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-ink/10 group">
          <img src={preview.startsWith('data:') || preview.startsWith('/uploads') ? preview : `/uploads/${preview}`}
               alt="Proof preview" className="w-full max-h-48 object-cover" />
          {task.status !== 'completed' && (
            <button
              onClick={() => { setPreview(null); inputRef.current.value = '' }}
              className="absolute top-2 right-2 bg-ink/70 text-cream rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          )}
          <p className="text-xs text-navy/60 px-3 py-1.5 bg-skin/30">
            {uploading ? 'Uploading…' : 'Proof uploaded — ready to complete'}
          </p>
        </div>
      ) : (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-150
            ${dragging ? 'border-blush bg-blush/10 scale-[1.01]' : 'border-ink/15 hover:border-sky hover:bg-sky/5'}`}
        >
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-skin flex items-center justify-center">
              {uploading ? (
                <span className="text-xs text-navy font-medium">…</span>
              ) : dragging ? (
                <ImageIcon size={18} className="text-blush" />
              ) : (
                <Upload size={18} className="text-navy" />
              )}
            </div>
            <p className="text-sm text-navy font-medium">
              {uploading ? 'Uploading proof…' : 'Drop screenshot here or tap to browse'}
            </p>
            <p className="text-xs text-navy/50">JPG or PNG, max 10MB</p>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
        onChange={e => handleFile(e.target.files[0])}
      />
    </div>
  )
}
