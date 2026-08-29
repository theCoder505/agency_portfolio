<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Milestone Payment Submitted</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #131b2e; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; }
        .header { background: linear-gradient(135deg, #0284c7, #4f46e5); padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; }
        .header p { margin: 8px 0 0 0; color: #e0f2fe; font-size: 14px; }
        .content { padding: 32px 24px; color: #e2e8f0; line-height: 1.6; }
        .info-grid { background: #0b1120; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #1e293b; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1e293b; font-size: 14px; }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #94a3b8; font-weight: 500; }
        .info-value { color: #f8fafc; font-weight: 600; text-align: right; }
        .btn { display: inline-block; background: linear-gradient(135deg, #0284c7, #4f46e5); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; text-align: center; margin-top: 10px; }
        .footer { text-align: center; padding: 24px; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; background: #0b1120; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CodeVenture Tech</h1>
            <p>Milestone Payment Processing Notification</p>
        </div>
        <div class="content">
            <p>A client has submitted payment proof for milestone <strong>"{{ $milestone->title }}"</strong> under Order #<strong>{{ $order->order_number }}</strong>.</p>

            <div class="info-grid">
                <div class="info-row">
                    <span class="info-label">Project:</span>
                    <span class="info-value">{{ $order->title }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Client Name:</span>
                    <span class="info-value">{{ $order->user?->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Milestone Amount:</span>
                    <span class="info-value" style="color: #38bdf8; font-size: 16px;">
                        {{ $order->currency }} {{ number_format($milestone->amount, 2) }}
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Payment Channel:</span>
                    <span class="info-value">{{ strtoupper($milestone->client_payment_method ?? 'Bank / Online') }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Transaction ID / Ref:</span>
                    <span class="info-value" style="font-family: monospace; color: #fbbf24;">{{ $milestone->client_trx_id ?? 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Sender Account / Info:</span>
                    <span class="info-value">{{ $milestone->client_sender_info ?? 'N/A' }}</span>
                </div>
            </div>

            @if(!empty($milestone->client_payment_notes))
            <p style="margin: 12px 0 6px 0; color: #94a3b8; font-size: 13px;">Client Notes:</p>
            <div style="background: #0b1120; padding: 12px; border-radius: 6px; font-size: 13px; color: #cbd5e1; margin-bottom: 20px;">
                {{ $milestone->client_payment_notes }}
            </div>
            @endif

            <div style="text-align: center; margin-top: 24px;">
                <a href="{{ url('/admin/custom-orders/' . $order->id) }}" class="btn">
                    Verify & Mark Collected in Admin Panel &rarr;
                </a>
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} CodeVenture Technology. Admin Notification.
        </div>
    </div>
</body>
</html>
