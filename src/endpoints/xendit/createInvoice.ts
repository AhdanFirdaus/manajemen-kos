import type { Endpoint } from 'payload'

export const createXenditInvoiceEndpoint: Endpoint = {
  path: '/xendit/create-invoice',
  method: 'post',
  handler: async (req) => {
    try {
      const { user, payload } = req

      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const data = (await req.json().catch(() => null)) as { invoiceId?: string } | null
      const invoiceId = data?.invoiceId

      if (!invoiceId) {
        return Response.json({ error: 'invoiceId required' }, { status: 400 })
      }

      const invoice = await payload.findByID({
        collection: 'invoices',
        id: invoiceId,
        depth: 2,
        overrideAccess: true,
      })

      if (!invoice) {
        return Response.json({ error: 'Invoice not found' }, { status: 404 })
      }

      const tenantId = typeof invoice.tenant === 'string' ? invoice.tenant : invoice.tenant?.id
      if (tenantId !== user.id) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }

      if (invoice.xenditInvoiceId && invoice.paymentUrl) {
        return Response.json({
          success: true,
          paymentUrl: invoice.paymentUrl,
          xenditInvoiceId: invoice.xenditInvoiceId,
        })
      }

      if (invoice.status !== 'pending') {
        return Response.json(
          { error: `Cannot create payment for invoice with status: ${invoice.status}` },
          { status: 400 },
        )
      }

      const apiKey = process.env.XENDIT_API_KEY
      if (!apiKey) {
        return Response.json({ error: 'Xendit API key not configured' }, { status: 500 })
      }

      const basicAuth = Buffer.from(`${apiKey}:`).toString('base64')
      const room = invoice.room as any
      const roomNumber = typeof room === 'object' ? (room?.roomNumber ?? 'N/A') : (room ?? 'N/A')

      const xenditPayload = {
        external_id: invoice.invoiceNumber,
        amount: invoice.amount,
        payer_email: user.email,
        description: `Sewa Kamar ${roomNumber} - ${invoice.billingMonth}`,
        invoice_duration: 86400 * 7,
        currency: 'IDR',
      }

      const xenditResp = await fetch('https://api.xendit.co/v2/invoices', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(xenditPayload),
      })

      if (!xenditResp.ok) {
        const errData = await xenditResp.text()
        console.error('Xendit API error:', errData)
        return Response.json({ error: 'Failed to create Xendit invoice' }, { status: 500 })
      }

      const xenditData = await xenditResp.json()

      await payload.update({
        collection: 'invoices',
        id: invoiceId,
        overrideAccess: true,
        data: {
          xenditInvoiceId: xenditData.id,
          paymentUrl: xenditData.invoice_url,
        },
      })

      return Response.json({
        success: true,
        paymentUrl: xenditData.invoice_url,
        xenditInvoiceId: xenditData.id,
      })
    } catch (error) {
      console.error('create-invoice endpoint error:', error)
      return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
  },
}
