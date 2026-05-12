'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Trash2, Upload, Check } from 'lucide-react'

interface FormState {
  title: string
  description: string
  location: string
  images: File[]
}

export function ReportForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    location: '',
    images: [],
  })

  const [previews, setPreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const newFiles = [...form.images, ...files].slice(0, 5) // max 5 images

    setForm((prev) => ({ ...prev, images: newFiles }))

    // Generate previews
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
    setPreviews(newPreviews)
  }

  function removeImage(index: number) {
    const newImages = form.images.filter((_, i) => i !== index)
    setForm((prev) => ({ ...prev, images: newImages }))

    setPreviews((prev) => {
      const newPrev = prev.filter((_, i) => i !== index)
      return newPrev
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
      setError('Semua field harus diisi')
      return
    }

    if (form.images.length === 0) {
      setError('Silakan unggah minimal 1 foto')
      return
    }

    setIsSubmitting(true)

    try {
      const uploadedImageIds: string[] = []

      // 1. Upload images satu per satu
      for (const imageFile of form.images) {
        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('alt', form.title) // Menggunakan judul laporan sebagai alt text

        const uploadResponse = await fetch('/api/media', {
          method: 'POST',
          credentials: 'include',
          // Note: Jangan set headers Content-Type untuk FormData
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error('Gagal mengunggah salah satu foto')
        }

        const data = await uploadResponse.json()

        // Ambil ID dari doc yang baru dibuat
        // Payload v3 biasanya: data.doc.id
        const id = data.doc?.id || data.id
        if (id) {
          uploadedImageIds.push(id)
        }
      }

      // 2. Kirim laporan utama
      const reportResponse = await fetch('/api/maintenance-reports', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          location: form.location,
          // Format sesuai skema array di backend: [{ image: "ID" }]
          images: uploadedImageIds.map((id) => ({
            image: id,
          })),
        }),
      })

      const finalData = await reportResponse.json()

      if (!reportResponse.ok) {
        // Tampilkan pesan error spesifik dari Payload jika ada
        const detailError = finalData.errors?.[0]?.message || finalData.message
        throw new Error(detailError || 'Gagal membuat laporan')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/reports')
        router.refresh()
      }, 1500)
    } catch (err) {
      console.error('Submission error:', err)
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="rounded-full bg-green-100 p-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Laporan berhasil dikirim!</h2>
        <p className="text-sm text-muted-foreground">Admin akan segera menangani laporan Anda</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back Button */}
      <Button asChild variant="ghost" size="lg" className="rounded-full group -ml-2">
        <Link href="/reports" className="flex items-center gap-2">
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Kembali ke Laporan
        </Link>
      </Button>

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium text-foreground/90">
          Judul Laporan *
        </label>
        <Input
          id="title"
          type="text"
          placeholder="Contoh: Toilet bocor, Pintu rusak, Lampu mati"
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          className="h-14 rounded-2xl border border-border/60 bg-white/50 dark:bg-zinc-900/50 px-5 text-base focus:border-primary focus:ring-4 focus:ring-primary/10"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-foreground/90">
          Deskripsi Masalah *
        </label>
        <textarea
          id="description"
          placeholder="Jelaskan masalah secara detail..."
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          className="h-32 rounded-2xl border border-border/60 bg-white/50 dark:bg-zinc-900/50 px-5 py-3 text-base placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 resize-none"
          required
        />
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label htmlFor="location" className="block text-sm font-medium text-foreground/90">
          Lokasi (Kamar/Area) *
        </label>
        <Input
          id="location"
          type="text"
          placeholder="Contoh: Kamar 5, Kamar Mandi, Dapur"
          value={form.location}
          onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
          className="h-14 rounded-2xl border border-border/60 bg-white/50 dark:bg-zinc-900/50 px-5 text-base focus:border-primary focus:ring-4 focus:ring-primary/10"
          required
        />
      </div>

      {/* Image Upload */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground/90">
          Foto Bukti (Max 5 foto) *
        </label>

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-32 rounded-2xl border-2 border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors flex flex-col items-center justify-center gap-2 text-sm"
        >
          <Upload className="w-6 h-6 text-primary" />
          <span className="font-medium text-foreground">Klik untuk unggah foto</span>
          <span className="text-xs text-muted-foreground">{form.images.length}/5 foto</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        {/* Previews */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {previews.map((preview, idx) => (
              <div key={idx} className="relative rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-24 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-14 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-70"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Mengunggah...
          </span>
        ) : (
          'Kirim Laporan'
        )}
      </Button>
    </form>
  )
}
