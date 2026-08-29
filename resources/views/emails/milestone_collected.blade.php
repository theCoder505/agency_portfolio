<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Milestone Payment Collected</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #131b2e; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; }
        .header { background: linear-gradient(135deg, #10b981, #06b6d4); padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; }
        .header p { margin: 8px 0 0 0; color: #ecfdf5; font-size: 14px; }
        .content { padding: 32px 24px; color: #e2e8f0; line-height: 1.6; }
        .info-grid { background: #0b1120; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #1e293b; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1e293b; font-size: 14px; }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #94a3b8; font-weight: 500; }
        .info-value { color: #f8fafc; font-weight: 600; text-align: right; }
        .deliverable-box { background: #0b1120; border: 1px solid #059669; border-radius: 10px; padding: 18px; margin: 20px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #10b981, #06b6d4); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; text-align: center; margin-top: 10px; }
        .footer { text-align: center; padding: 24px; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; background: #0b1120; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CodeVenture Tech</h1>
            <p>Milestone Payment Collected & Confirmed</p>
        </div>
        <div class="content">
            <p>Hello <strong>{{ $order->user?->name ?? 'Valued Client' }}</strong>,</p>
            <p>We are pleased to confirm that your payment for <strong>"{{ $milestone->title }}"</strong> has been successfully received and collected into our account!</p>

            <div class="info-grid">
                <div class="info-row">
                    <span class="info-label">Project:</span>
                    <span class="info-value">{{ $order->title }} (#{{ $order->order_number }})</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Milestone:</span>
                    <span class="info-value">{{ $milestone->title }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Amount Collected:</span>
                    <span class="info-value" style="color: #34d399; font-size: 16px;">
                        {{ $order->currency }} {{ number_format($milestone->amount, 2) }}
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Payment Status:</span>
                    <span class="info-value" style="color: #34d399;">Collected (Verified)</span>
                </div>
            </div>

            @if($milestone->has_deliverables && $milestone->is_deliverable_unlocked)
            <div class="deliverable-box">
                <h3 style="color: #34d399; margin: 0 0 10px 0; font-size: 15px;">🚀 Milestone Deliverables & Codebase Ready:</h3>
                <p style="font-size: 13px; color: #e2e8f0; margin: 0 0 12px 0;">The source code repository, project files, and deliverables for this phase are unlocked and accessible in your customer workspace.</p>
            </div>
            @endif

            <div style="text-align: center; margin: 24px 0;">
                <a href="{{ url('/customer/custom-orders/' . $order->id) }}" class="btn">
                    Access Project & Deliverables &rarr;
                </a>
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} CodeVenture Technology. All rights reserved.
        </div>
    </div>
</body>
</html>
