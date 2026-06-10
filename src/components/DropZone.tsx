import { useState, useCallback } from 'react'
import { Upload, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DropZoneProps {
  onFileAccepted: (file: File) => void
  previewUrl: string | null
}

export function DropZone({ onFileAccepted, previewUrl }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith('image/')) {
        onFileAccepted(file)
      }
    },
    [onFileAccepted]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) onFileAccepted(file)
    },
    [onFileAccepted]
  )

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={cn(
        'relative flex h-full w-full flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200',
        isDragging
          ? 'border-foreground/50 bg-foreground/5 scale-[0.995]'
          : 'border-border hover:border-foreground/30 hover:bg-foreground/[0.02]',
        previewUrl ? 'border-solid border-border/50' : ''
      )}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="absolute inset-0 cursor-pointer opacity-0"
      />

      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Uploaded"
          className="h-full w-full rounded-xl object-contain p-4"
        />
      ) : (
        <div className="flex flex-col items-center gap-4 text-center select-none pointer-events-none">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground/[0.06]">
            {isDragging ? (
              <Upload className="h-6 w-6 text-foreground/60" strokeWidth={1.5} />
            ) : (
              <ImageIcon className="h-6 w-6 text-foreground/40" strokeWidth={1.5} />
            )}
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground/80">
              {isDragging ? 'Release to upload' : 'Drop an image here'}
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WEBP up to 50 MB
            </p>
          </div>
          <div className="mt-1 rounded-md border border-border bg-secondary/60 px-3 py-1.5 text-xs text-muted-foreground">
            or click to browse
          </div>
        </div>
      )}
    </div>
  )
}
