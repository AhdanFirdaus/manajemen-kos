'use client'

import Link from 'next/link'

import { ArrowLeft, Trash2, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { useReportForm } from '../_hooks/use-report-form'

import { ReportSuccess } from './report-success'

export function ReportForm() {
  const {
    form,
    previews,
    error,
    success,
    isSubmitting,
    fileInputRef,

    updateField,
    handleImageChange,
    removeImage,
    handleSubmit,
  } = useReportForm()

  if (success) {
    return <ReportSuccess />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back Button */}
      <Button asChild variant="ghost" size="lg" className="group -ml-2 rounded-full">
        <Link href="/reports" className="flex items-center gap-2">
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          Kembali ke Laporan
        </Link>
      </Button>

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-foreground/90">
          Judul Laporan *
        </label>

        <Input
          id="title"
          type="text"
          required
          value={form.title}
          placeholder="Contoh: Toilet bocor, Pintu rusak, Lampu mati"
          onChange={(e) => updateField('title', e.target.value)}
          className="h-12 rounded-xl border-border/60 bg-background/60 px-4 text-sm shadow-sm transition focus-visible:ring-2 focus-visible:ring-primary/20"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-foreground/90">
          Deskripsi Masalah *
        </label>

        <textarea
          id="description"
          required
          value={form.description}
          placeholder="Jelaskan masalah secara detail..."
          onChange={(e) => updateField('description', e.target.value)}
          className="min-h-[140px] w-full resize-none rounded-xl border border-border/60 bg-background/60 px-4 py-3 text-sm shadow-sm transition placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label htmlFor="location" className="text-sm font-medium text-foreground/90">
          Lokasi (Kamar/Area) *
        </label>

        <Input
          id="location"
          type="text"
          required
          value={form.location}
          placeholder="Contoh: Kamar 5, Kamar Mandi, Dapur"
          onChange={(e) => updateField('location', e.target.value)}
          className="h-12 rounded-xl border-border/60 bg-background/60 px-4 text-sm shadow-sm transition focus-visible:ring-2 focus-visible:ring-primary/20"
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
          className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/50 bg-primary/5 text-sm transition-colors hover:bg-primary/10"
        >
          <Upload className="h-6 w-6 text-primary" />

          <span className="font-medium text-foreground">Klik untuk unggah foto</span>

          <span className="text-xs text-muted-foreground">{form.images.length}/5 foto</span>
        </button>

        {/* Hidden Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        {/* Preview Images */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {previews.map((preview, idx) => (
              <div key={idx} className="relative overflow-hidden rounded-lg">
                <img
                  src={preview}
                  alt={`Preview ${idx + 1}`}
                  className="h-24 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 rounded bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-14 w-full rounded-2xl bg-primary text-base font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-70"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Mengunggah...
          </span>
        ) : (
          'Kirim Laporan'
        )}
      </Button>
    </form>
  )
}
