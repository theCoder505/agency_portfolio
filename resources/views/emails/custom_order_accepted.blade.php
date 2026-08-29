<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Project Proposal Accepted</title>
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
        .btn { display: inline-block; background: linear-gradient(135deg, #10b981, #06b6d4); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; text-align: center; margin-top: 10px; }
        .footer { text-align: center; padding: 24px; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; background: #0b1120; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CodeVenture Tech</h1>
            <p>Project Accepted & Ready for Development</p>
        </div>
        <div class="content">
            <p>Hello <strong>{{ $order->user?->name ?? 'Valued Customer' }}</strong>,</p>
            <p>We are delighted to inform you that our technical team has reviewed and <strong>accepted</strong> your custom project proposal for <strong>"{{ $order->title }}"</strong>!</p>

            <div class="info-grid">
                <div class="info-row">
                    <span class="info-label">Order Number:</span>
                    <span class="info-value">#{{ $order->order_number }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Agreed Total Price:</span>
                    <span class="info-value" style="color: #34d399; font-size: 16px;">
                        {{ $order->currency }} {{ number_format($order->agreed_price ?? $order->estimated_budget ?? 0, 2) }}
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Target Completion:</span>
                    <span class="info-value">
                        {{ $order->target_deadline ? \Carbon\Carbon::parse($order->target_deadline)->format('M d, Y') : 'Scheduled' }}
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Milestones Defined:</span>
                    <span class="info-value">{{ $order->milestones()->count() }} Milestone(s)</span>
                </div>
            </div>

            @if(!empty($order->admin_notes))
            <h3 style="color: #ffffff; font-size: 15px; margin-bottom: 8px;">Architect Notes & Terms:</h3>
            <div style="background: #0b1120; border-left: 4px solid #10b981; padding: 14px; border-radius: 6px; font-size: 14px; color: #e2e8f0; margin-bottom: 20px; white-space: pre-line;">
                {{ $order->admin_notes }}
            </div>
            @endif

            <p>You can view the project breakdown, review milestone payments, and find payment details (PayPal link, Payoneer link/email, Bank account details, etc.) in your customer workspace:</p>

            <div style="text-align: center; margin: 24px 0;">
                <a href="{{ url('/customer/custom-orders/' . $order->id) }}" class="btn">
                    Open Project Milestones & Pay &rarr;
                </a>
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} CodeVenture Technology. All rights reserved.
        </div>
    </div>
</body>
</html>
