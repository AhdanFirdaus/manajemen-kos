'use client'

import { useState, useEffect } from 'react'
import {
  UserCog,
  LogIn,
  CreditCard,
  CheckCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

const steps = [
  {
    icon: UserCog,
    title: 'Akun Dibuatkan',
    description: 'Pemilik kos membuat akun untuk penghuni yang akan menempati kamar.',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: LogIn,
    title: 'Login & Cek Tagihan',
    description: 'Penghuni login ke dashboard untuk melihat informasi kamar dan tagihan.',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: CreditCard,
    title: 'Pembayaran',
    description: 'Jika terdapat tagihan aktif, penghuni dapat langsung melakukan pembayaran.',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
  {
    icon: CheckCircle,
    title: 'Selesai',
    description: 'Pembayaran berhasil dan data tagihan otomatis diperbarui.',
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
]

export default function StepGuide() {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([])

  useEffect(() => {
    const timeouts = steps.map((_, index) => {
      return setTimeout(() => {
        setVisibleSteps((prev) => [...prev, index])
      }, index * 200)
    })

    return () => timeouts.forEach((timeout) => clearTimeout(timeout))
  }, [])

  return (
    <div className="w-full max-w-6xl mx-auto pt-20  px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 mb-6">
          <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />

          <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">
            Alur Penggunaan
          </span>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
          Cara Menggunakan Sistem
        </h2>

        <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg leading-8">
          Sistem pengelolaan Kos Dadan dirancang sederhana agar penghuni
          maupun pemilik kos dapat mengelola tagihan dan data kamar dengan mudah.
        </p>
      </div>

      {/* Steps */}
      <div className="relative">
        {/* Garis penghubung */}
        <div className="hidden lg:block absolute top-24 left-[12%] right-[12%] h-[2px]">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isVisible = visibleSteps.includes(index)
            const isLast = index === steps.length - 1

            return (
              <div
                key={index}
                className={`
                  transform transition-all duration-700 ease-out
                  ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}
                `}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="group relative">
                  <div
                    className="
                      relative rounded-3xl bg-white border border-gray-100
                      p-7 text-center shadow-sm
                      transition-all duration-300
                      hover:shadow-xl hover:-translate-y-2
                    "
                  >
                    {/* Step Number */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div
                        className={`
                          w-9 h-9 rounded-full bg-gradient-to-r ${step.color}
                          text-white text-sm font-bold flex items-center justify-center
                          shadow-lg
                        `}
                      >
                        {index + 1}
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="relative mb-6 mt-4">
                      <div
                        className={`
                          w-20 h-20 mx-auto rounded-2xl ${step.bgColor}
                          flex items-center justify-center
                          transition-all duration-300
                          group-hover:rounded-full group-hover:scale-105
                        `}
                      >
                        <Icon
                          className={`
                            w-10 h-10 ${step.iconColor}
                            transition-transform duration-300
                            group-hover:scale-110
                          `}
                        />
                      </div>
                    </div>

                    {/* Text */}
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      {step.title}
                    </h3>

                    <p className="text-sm leading-7 text-gray-500">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  {!isLast && (
                    <div className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20">
                      <div className="w-10 h-10 rounded-full bg-white border border-emerald-100 shadow-sm flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 text-emerald-500" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}