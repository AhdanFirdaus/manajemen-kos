# Payment Flow Documentation

Property Management System - Alur Admin & Tenant

---

## 1. Admin Flow

### Step 1: Setup Data Master

```
Admin Panel → Collections
├── Properties (Gedung/Rumah Kos)
│   ├── Nama
│   ├── Alamat
│   └── ...detail lainnya
│
├── Rooms (Kamar Individual)
│   ├── Nomor Kamar
│   ├── Harga Sewa/Bulan
│   ├── Link ke Property
│   └── ...
│
└── Users (Tenant/Penghuni)
    ├── Email
    ├── Password
    ├── Nama Lengkap
    └── ...
```

### Step 2: Create Lease (Perjanjian Sewa)

Admin buat **Lease** baru:

| Field     | Value        | Keterangan                                   |
| --------- | ------------ | -------------------------------------------- |
| Tenant    | [Pilih User] | Siapa yang menyewa                           |
| Room      | [Pilih Room] | Kamar mana yang disewa                       |
| startDate | [Tanggal]    | Kapan sewa dimulai                           |
| dueDate   | [1-31]       | Tanggal jatuh tempo sewa (1-31 setiap bulan) |
| isActive  | true/false   | Aktif atau tidak                             |

**SAVE** ↓

### Step 3: Sistem Auto-Generate Invoice

Saat Lease **isActive=true** disimpan:

```
Leases.ts afterChange Hook
    ↓
ensureMonthlyInvoiceForLease({payload, lease})
    ├─ Cek: Invoice untuk bulan ini sudah ada?
    │       (Query: invoiceNumber = INV-{bulan}-{leaseId})
    │
    ├─ JIKA BELUM ADA:
    │   ├─ Fetch Room → ambil harga sewa
    │   ├─ Hitung due date (dueDate field)
    │   └─ CREATE Invoice:
    │       ├── invoiceNumber: INV-202406-ABC123
    │       ├── tenant: [dari lease]
    │       ├── room: [dari lease]
    │       ├── billingMonth: 2024-06
    │       ├── amount: [harga kamar]
    │       ├── dueOn: [tanggal jatuh tempo]
    │       ├── status: 'pending'
    │       └── paymentProvider: 'xendit'
    │
    └─ JIKA SUDAH ADA:
        └─ Return existing invoice
```

### Step 4: Monitor di Admin Panel

Admin bisa lihat di `Invoices` collection:

```
Invoices Table:
┌─────────────────┬──────────┬──────────┬────────────┬─────────────┐
│ Invoice Number  │ Tenant   │ Bulan    │ Status     │ Amount      │
├─────────────────┼──────────┼──────────┼────────────┼─────────────┤
│ INV-202406-XX1  │ Budi     │ 2024-06  │ pending    │ Rp 2.000.000│
│ INV-202406-YY2  │ Ani      │ 2024-06  │ paid       │ Rp 1.500.000│
│ INV-202405-XX1  │ Budi     │ 2024-05  │ overdue    │ Rp 2.000.000│
└─────────────────┴──────────┴──────────┴────────────┴─────────────┘

Status dapat difilter: pending, paid, overdue, void
```

---

## 2. Tenant (User) Flow

### Diagram Alur Lengkap

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TENANT FLOW                                 │
└─────────────────────────────────────────────────────────────────────┘

[1] LANDING PAGE
    └─→ Klik "Masuk sebagai Tenant"

[2] LOGIN PAGE (/login)
    ├─ Input email & password
    └─ POST /api/users/login (Payload built-in)
       └─ Sukses → Set session cookie
       └─ Redirect ke /dashboard

[3] AUTHENTICATION CHECK
    ├─ User sudah login?
    │  └─ YES → Lanjut
    │  └─ NO → Redirect /login?next=/dashboard
    │
    └─ User adalah Admin?
       └─ YES → Redirect /admin
       └─ NO → Lanjut (Tenant)

[4] DASHBOARD (/dashboard)
    │
    ├─ Server fetch:
    │  ├─ Lease untuk user ini
    │  │  └─ Ambil: room, property, harga bulanan
    │  │
    │  └─ Invoices terbaru (limit 6)
    │     └─ Sorted by createdAt DESC
    │
    └─ Tampilkan:
       ├─ Kartu Info Kamar
       │  ├─ Nomor Kamar: #XX
       │  ├─ Nama Property: [Property Name]
       │  ├─ Sewa Bulanan: Rp X,XXX,000
       │  └─ Status: Aktif
       │
       └─ Mini Invoice List
          ├─ Invoice terbaru 6 bulan
          ├─ Kolom: No., Bulan, Jatuh Tempo, Status, Jumlah
          └─ Status badge: Menunggu (merah), Lunas (hijau), Terlambat (orange)

[5] BILLING PAGE (/billing)
    │
    ├─ Server fetch:
    │  └─ Semua invoices tenant
    │     └─ Sorted by billingMonth DESC
    │
    ├─ Tampilkan SUMMARY:
    │  └─ Total Tagihan Terbuka
    │     └─ SUM(amount WHERE status='pending')
    │
    └─ Tampilkan INVOICE TABLE:
       │
       ├─ Kolom:
       │  ├─ No. Invoice
       │  ├─ Bulan Tagihan
       │  ├─ Jatuh Tempo
       │  ├─ Status
       │  ├─ Jumlah
       │  └─ Action: [Bayar Sekarang]
       │
       └─ Button "Bayar Sekarang":
          ├─ ENABLED jika: status = 'pending'
          └─ DISABLED jika: status = 'paid' atau 'overdue'

[6] PAYMENT REQUEST
    │
    ├─ Tenant klik "Bayar Sekarang"
    │
    └─ CLIENT: POST /api/xendit/create-invoice
       │
       ├─ Body: { invoiceId: "xxx" }
       │
       └─ SERVER:
          ├─ Verify auth: User login?
          │  └─ NO → 401 Unauthorized
          │
          ├─ Verify ownership: Invoice milik user ini?
          │  └─ NO → 403 Forbidden
          │
          ├─ Check existing: xenditInvoiceId sudah ada?
          │  └─ YES → Return existing paymentUrl
          │  └─ NO → Lanjut
          │
          ├─ Verify status: invoice.status = 'pending'?
          │  └─ NO → 400 Bad Request
          │
          └─ CREATE INVOICE DI XENDIT:
             │
             ├─ Xendit API: POST https://api.xendit.co/v2/invoices
             ├─ Auth: Basic Auth (apiKey:)
             │
             └─ Request Body:
                {
                  "external_id": "INV-202406-XX1",
                  "amount": 2000000,
                  "payer_email": "tenant@example.com",
                  "description": "Sewa Kamar Bulan 2024-06",
                  "invoice_duration": 604800,        // 7 hari
                  "currency": "IDR"
                }
             │
             └─ Response:
                {
                  "id": "64c7cbe520e2e90011fcf2ca",
                  "invoice_url": "https://checkout.xendit.co/...",
                  "external_id": "INV-202406-XX1",
                  "status": "PENDING"
                }
             │
             └─ UPDATE di Payload:
                {
                  "xenditInvoiceId": "64c7cbe520e2e90011fcf2ca",
                  "paymentUrl": "https://checkout.xendit.co/..."
                }
             │
             └─ RETURN: { paymentUrl, xenditInvoiceId }

[7] PAYMENT PAGE (XENDIT)
    │
    ├─ CLIENT: window.open(paymentUrl, '_blank')
    │
    └─ TENANT:
       ├─ Lihat Xendit payment page
       ├─ Pilih metode: CC / Transfer Bank / E-wallet
       ├─ Input detail pembayaran
       ├─ Klik "Bayar" atau "Konfirmasi"
       └─ Tunggu konfirmasi dari bank/payment gateway

[8] PAYMENT SUCCESS (Xendit)
    │
    ├─ Status di Xendit berubah: PAID
    │
    └─ Xendit kirim webhook ke SERVER:
       │
       └─ POST /api/xendit/webhook
          │
          ├─ Body:
          │  {
          │    "id": "64c7cbe520e2e90011fcf2ca",
          │    "external_id": "INV-202406-XX1",
          │    "status": "PAID",
          │    ...detail lainnya
          │  }
          │
          ├─ (Optional) Verify signature:
          │  ├─ Jika XENDIT_WEBHOOK_SECRET ada di .env
          │  │  └─ Compute HMAC-SHA256(body, secret)
          │  │  └─ Compare dengan x-xendit-signature header
          │  │  └─ JIKA MATCH → Lanjut
          │  │  └─ JIKA TIDAK → Return 401
          │  │
          │  └─ Jika XENDIT_WEBHOOK_SECRET tidak ada
          │     └─ SKIP verification (webhook diterima as-is)
          │
          └─ PROCESS EVENT:
             │
             ├─ IF status = 'PAID':
             │  │
             │  └─ FIND invoice:
             │     ├─ Query by xenditInvoiceId OR invoiceNumber
             │     └─ Get invoice doc
             │
             │  └─ UPDATE invoice di Payload:
             │     {
             │       "status": "paid",
             │       "paidAt": "2024-06-15T10:30:00Z"
             │     }
             │
             │  └─ Log: "Invoice XXX marked as paid"
             │
             └─ RETURN: { received: true } (HTTP 200)

[9] REFRESH BILLING PAGE
    │
    ├─ TENANT: Refresh /billing (atau tunggu auto-refresh)
    │
    └─ CLIENT: Fetch invoices lagi
       │
       └─ SERVER:
          └─ Query invoices untuk tenant
          │
          └─ Status sudah updated ke 'paid' dari webhook
       │
       └─ TAMPILKAN:
          ├─ Invoice row status: "Lunas" (hijau)
          ├─ Button "Bayar Sekarang": DISABLED
          └─ Total Tagihan Terbuka: Updated (exclude invoice yang sudah paid)

[10] COMPLETE ✓
     └─ Payment successful!
```

---

## 3. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DATABASE (MongoDB)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Users Collection          Properties Collection    Rooms Collection│
│  ┌──────────────┐         ┌──────────────┐        ┌──────────────┐ │
│  │ id           │         │ id           │        │ id           │ │
│  │ email        │────┐    │ name         │────┐   │ number       │ │
│  │ password     │    │    │ address      │    │   │ price        │ │
│  │ name         │    │    │ ...          │    │   │ parentProp─┐ │ │
│  └──────────────┘    │    └──────────────┘    │   └──────────────┘ │ │
│                      │                        │                    │ │
│  Leases Collection   │   References           │   References       │ │
│  ┌──────────────┐    │                        │                    │ │
│  │ id           │    └─ tenant ─────────┐     │                    │ │
│  │ tenant ─────────────────────────────┘     │                    │ │
│  │ room ──────────────────────────────────────┘                    │ │
│  │ startDate    │                                                  │ │
│  │ dueDate      │ (1-31)                                           │ │
│  │ isActive     │ ◄─── TRIGGER Hook ensureMonthlyInvoiceForLease   │ │
│  └──────────────┘            │                                    │ │
│        ▲                      │                                    │ │
│        │                      ▼                                    │ │
│        │            Invoices Collection                            │ │
│        │            ┌──────────────────┐                           │ │
│        │            │ id               │                           │ │
│        │            │ invoiceNumber    │                           │ │
│        │            │ tenant ◄─────────┼─ References              │ │
│        └────────────│ lease  ◄─────────┼─ References              │ │
│                     │ room   ◄─────────┼─ References              │ │
│                     │ billingMonth     │                           │ │
│                     │ amount           │                           │ │
│                     │ dueOn            │                           │ │
│                     │ status           │ (pending/paid/overdue)    │ │
│                     │ xenditInvoiceId  │ ◄─ Updated by API        │ │
│                     │ paymentUrl       │                           │ │
│                     │ paidAt           │ ◄─ Updated by Webhook    │ │
│                     └──────────────────┘                           │ │
│                                                                     │ │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL: XENDIT API                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Create Invoice:                                                   │
│  POST /v2/invoices                                                 │
│  Body: {external_id, amount, payer_email, invoice_duration, ...}  │
│  Auth: Basic (apiKey:)                                             │
│  Returns: {id, invoice_url, status, ...}                           │
│           ▲                                                        │
│           │ Stored in Payload                                     │
│           │ (xenditInvoiceId, paymentUrl)                         │
│           │                                                        │
│  Payment Status Updates:                                           │
│  Webhook: POST /api/xendit/webhook                                 │
│  Body: {id, external_id, status: "PAID"/"EXPIRED", ...}           │
│  (Optional) Header: x-xendit-signature (HMAC-SHA256)              │
│           │                                                        │
│           └─► Update Payload Invoice: status='paid', paidAt=now   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. API Endpoints Reference

### Tenant Endpoints

| Method | Endpoint                     | Auth     | Body                | Response                        |
| ------ | ---------------------------- | -------- | ------------------- | ------------------------------- |
| POST   | `/api/users/login`           | None     | `{email, password}` | `{token, user}`                 |
| POST   | `/api/xendit/create-invoice` | Required | `{invoiceId}`       | `{paymentUrl, xenditInvoiceId}` |

### Webhook Endpoint

| Method | Endpoint              | Auth       | Body         | Response           |
| ------ | --------------------- | ---------- | ------------ | ------------------ |
| POST   | `/api/xendit/webhook` | Optional\* | Xendit event | `{received: true}` |

\*Optional: Only verify if `XENDIT_WEBHOOK_SECRET` env var set

---

## 5. Environment Variables

```env
# Xendit Configuration
XENDIT_API_KEY=xnd_development_XXXXXXXXXXXX

# Webhook signature verification
XENDIT_WEBHOOK_SECRET=whsec_XXXXXXXXXXXX  # Leave empty/unset to skip verification

# Database & Payload
DATABASE_URL=mongodb+srv://...
PAYLOAD_SECRET=your-secret-key

# S3/MinIO (Media storage)
S3_ENDPOINT=http://minio:9000
S3_BUCKET=manajemen-kos
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
```

---

## 6. Status Legend

| Status    | Makna               | Dari                  | Action            |
| --------- | ------------------- | --------------------- | ----------------- |
| `pending` | Menunggu pembayaran | Auto-created          | Tenant bisa bayar |
| `paid`    | Sudah dibayar       | Webhook PAID event    | No action needed  |
| `overdue` | Jatuh tempo         | Webhook EXPIRED event | Follow-up admin   |
| `void`    | Batal/Void          | Webhook VOID event    | Manual review     |

---

## 7. Testing Checklist

### Setup

- [ ] Xendit API key set di `.env` (sandbox mode)
- [ ] MongoDB database running & connected
- [ ] MinIO/S3 storage configured

### Flow Test

- [ ] Admin create Property
- [ ] Admin create Rooms (assign to Property, set price)
- [ ] Admin create Users (email, password)
- [ ] Admin create Lease (tenant + room + dueDate)
  - [ ] Check: Invoice auto-created (check Payload Invoices collection)
- [ ] Login as Tenant → `/dashboard` shows correct lease & invoices
- [ ] Navigate to `/billing` → see invoice list
- [ ] Click "Bayar Sekarang"
  - [ ] API called ✓
  - [ ] Xendit invoice created ✓
  - [ ] Payment URL opened in new tab ✓
- [ ] Complete payment in Xendit sandbox
  - [ ] Xendit webhook sent to `/api/xendit/webhook` ✓
  - [ ] Invoice status updated to 'paid' in Payload ✓
- [ ] Refresh `/billing` → invoice shows "Lunas" ✓

---

## Notes

- Invoice auto-generation hanya trigger saat Lease **isActive=true** disimpan
- Webhook endpoint **tidak require authentication** (Xendit hit dari luar)
- Payment URL idempotency: jika tenant click "Bayar" 2x, return same paymentUrl (tidak double-create di Xendit)
- Untuk production, set `XENDIT_WEBHOOK_SECRET` untuk keamanan extra
