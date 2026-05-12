'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface FormState {
  title: string
  description: string
  location: string
  images: File[]
}

export function useReportForm() {
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

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])

    const newFiles = [...form.images, ...files].slice(0, 5)

    setForm((prev) => ({
      ...prev,
      images: newFiles,
    }))

    setPreviews(newFiles.map((file) => URL.createObjectURL(file)))
  }

  function removeImage(index: number) {
    const newImages = form.images.filter((_, i) => i !== index)

    setForm((prev) => ({
      ...prev,
      images: newImages,
    }))

    setPreviews((prev) => prev.filter((_, i) => i !== index))
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

      for (const imageFile of form.images) {
        const formData = new FormData()

        formData.append('file', imageFile)
        formData.append('alt', form.title)

        const uploadResponse = await fetch('/api/media', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error('Gagal mengunggah salah satu foto')
        }

        const data = await uploadResponse.json()

        const id = data.doc?.id || data.id

        if (id) {
          uploadedImageIds.push(id)
        }
      }

      const reportResponse = await fetch('/api/maintenance-reports', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          location: form.location,
          images: uploadedImageIds.map((id) => ({
            image: id,
          })),
        }),
      })

      const finalData = await reportResponse.json()

      if (!reportResponse.ok) {
        throw new Error(
          finalData.errors?.[0]?.message || finalData.message || 'Gagal membuat laporan',
        )
      }

      setSuccess(true)

      setTimeout(() => {
        router.push('/reports')
        router.refresh()
      }, 1500)
    } catch (err) {
      console.error(err)

      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
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
  }
}
