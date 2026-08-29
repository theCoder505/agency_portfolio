<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Custom Order Request</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #131b2e; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #4f46e5, #06b6d4); padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 8px 0 0 0; color: #e0e7ff; font-size: 14px; }
        .content { padding: 32px 24px; color: #e2e8f0; line-height: 1.6; }
        .badge { display: inline-block; background: rgba(99, 102, 241, 0.2); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.4); padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .info-grid { background: #0b1120; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #1e293b; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1e293b; font-size: 14px; }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #94a3b8; font-weight: 500; }
        .info-value { color: #f8fafc; font-weight: 600; text-align: right; }
        .scope-box { background: #0b1120; border-left: 4px solid #06b6d4; padding: 18px; border-radius: 8px; margin: 20px 0; color: #f1f5f9; white-space: pre-line; font-size: 14px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #4f46e5, #06b6d4); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; text-align: center; margin-top: 10px; }
        .footer { text-align: center; padding: 24px; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; background: #0b1120; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CodeVenture Tech</h1>
            <p>New Custom Project Request Received</p>
        </div>
        <div class="content">
            <span class="badge">Order #{{ $order->order_number }}</span>
            <h2 style="color: #ffffff; margin: 12px 0 6px 0; font-size: 20px;">{{ $order->title }}</h2>
            <p style="color: #94a3b8; margin: 0 0 20px 0;">A client has submitted a bespoke project request and is awaiting your review and quotation.</p>

            <div class="info-grid">
                <div class="info-row">
                    <span class="info-label">Client Name:</span>
                    <span class="info-value">{{ $order->user?->name ?? 'Guest / Client' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Client Email:</span>
                    <span class="info-value">{{ $order->user?->email }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Client Phone:</span>
                    <span class="info-value">{{ $order->user?->phone ?? 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Category:</span>
                    <span class="info-value">{{ $order->category ?? 'Custom Software' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Estimated Budget:</span>
                    <span class="info-value" style="color: #34d399;">
                        {{ $order->estimated_budget ? ($order->currency . ' ' . number_format($order->estimated_budget, 2)) : 'Open / Negotiable' }}
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Target Deadline:</span>
                    <span class="info-value">{{ $order->target_deadline ? \Carbon\Carbon::parse($order->target_deadline)->format('M d, Y') : 'Flexible' }}</span>
                </div>
            </div>

            <h3 style="color: #ffffff; font-size: 15px; margin-bottom: 8px;">Project Scope & Requirements:</h3>
            <div class="scope-box">
                {{ $order->requirements }}
            </div>

            @if(!empty($order->reference_links))
            <h3 style="color: #ffffff; font-size: 15px; margin-bottom: 8px;">Reference Links:</h3>
            <div style="background: #0b1120; padding: 14px; border-radius: 8px; font-size: 13px; color: #38bdf8; word-break: break-all; margin-bottom: 20px;">
                {{ $order->reference_links }}
            </div>
            @endif

            <div style="text-align: center; margin-top: 30px;">
                <a href="{{ url('/admin/custom-orders/' . $order->id) }}" class="btn">
                    Review & Judge Order in Admin Panel &rarr;
                </a>
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} CodeVenture Technology. Admin Notification.
        </div>
    </div>
</body>
</html>
