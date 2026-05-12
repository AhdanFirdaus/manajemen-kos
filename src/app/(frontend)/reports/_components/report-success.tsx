import { Check } from 'lucide-react'

export function ReportSuccess() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="rounded-full bg-green-100 p-4">
        <Check className="h-8 w-8 text-green-600" />
      </div>

      <h2 className="text-2xl font-semibold text-foreground">
        Laporan berhasil dikirim!
      </h2>

      <p className="text-sm text-muted-foreground">
        Admin akan segera menangani laporan Anda
      </p>
    </div>
  )
}