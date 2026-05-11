import crypto from 'crypto'

import type { Endpoint } from 'payload'

export const xenditWebhookEndpoint: Endpoint = {
  path: '/xendit/webhook',
  method: 'post',
  handler: async (req) => {
    try {
      const rawBody = await req.text()
      const payload = req.payload
      const debugMode =
        process.env.XENDIT_WEBHOOK_DEBUG === 'true' || req.searchParams.get('debug') === '1'

      const debug: Record<string, unknown> = {
        debugMode,
        receivedAt: new Date().toISOString(),
        headers: {
          hasCallbackToken: Boolean(req.headers.get('x-callback-token')),
          hasXenditSignature: Boolean(req.headers.get('x-xendit-signature')),
          hasCallbackSignature: Boolean(req.headers.get('x-callback-signature')),
        },
      }

      const callbackToken = req.headers.get('x-callback-token')
      const webhookSecret = process.env.XENDIT_WEBHOOK_SECRET

      debug.webhookSecretConfigured = Boolean(webhookSecret)
      debug.callbackTokenMatches = webhookSecret ? callbackToken === webhookSecret : null

      if (webhookSecret && callbackToken !== webhookSecret) {
        console.warn('Invalid callback token')
        return Response.json(
          {
            error: 'Invalid token',
            ...(debugMode ? debug : {}),
          },
          { status: 401 },
        )
      }

      const evt = JSON.parse(rawBody)
      debug.event = {
        id: evt?.id ?? null,
        external_id: evt?.external_id ?? null,
        status: evt?.status ?? null,
      }

      if (evt.status === 'PAID') {
        const { docs: invoices } = await payload.find({
          collection: 'invoices',
          where: {
            or: [
              { xenditInvoiceId: { equals: evt.id } },
              { invoiceNumber: { equals: evt.external_id } },
            ],
          },
          overrideAccess: true,
        })

        debug.matchedInvoiceCount = invoices.length

        if (invoices.length > 0) {
          const invoice = invoices[0]
          const matchedBy = invoice.xenditInvoiceId === evt.id ? 'xenditInvoiceId' : 'invoiceNumber'

          await payload.update({
            collection: 'invoices',
            id: invoice.id,
            overrideAccess: true,
            data: {
              status: 'paid',
              paidAt: new Date().toISOString(),
            },
          })

          debug.updated = {
            invoiceId: String(invoice.id),
            matchedBy,
            status: 'paid',
          }

          return Response.json({
            success: true,
            ...(debugMode ? debug : {}),
          })
        }
      }

      return Response.json({
        received: true,
        ...(debugMode ? debug : {}),
      })
    } catch (error: any) {
      console.error('Webhook Error Details:', error.message)
      return Response.json(
        {
          error: error.message,
          ...(process.env.XENDIT_WEBHOOK_DEBUG === 'true' ? { stack: error?.stack } : {}),
        },
        { status: 500 },
      )
    }
  },
}
