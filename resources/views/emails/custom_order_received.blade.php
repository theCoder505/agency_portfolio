<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>We Received Your Project Request</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #131b2e; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; }
        .header { background: linear-gradient(135deg, #4f46e5, #06b6d4); padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; }
        .header p { margin: 8px 0 0 0; color: #e0e7ff; font-size: 14px; }
        .content { padding: 32px 24px; color: #e2e8f0; line-height: 1.6; }
        .badge { display: inline-block; background: rgba(99, 102, 241, 0.2); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.4); padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .box { background: #0b1120; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #1e293b; }
        .btn { display: inline-block; background: linear-gradient(135deg, #4f46e5, #06b6d4); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; text-align: center; margin-top: 10px; }
        .footer { text-align: center; padding: 24px; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; background: #0b1120; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CodeVenture Tech</h1>
            <p>Custom Project Request Confirmation</p>
        </div>
        <div class="content">
            <p>Hello <strong>{{ $order->user?->name ?? 'Valued Customer' }}</strong>,</p>
            <p>Thank you for choosing CodeVenture Tech! We have received your custom product request for <strong>"{{ $order->title }}"</strong> (Order #<strong>{{ $order->order_number }}</strong>).</p>

            <div class="box">
                <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 13px;">Current Status:</p>
                <span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border-color: rgba(245, 158, 11, 0.4);">
                    Under Review by Engineers
                </span>
                <p style="margin: 14px 0 0 0; font-size: 14px; color: #cbd5e1;">
                    Our senior software architects are reviewing your specifications and timeline. We will determine project feasibility, milestone breakdown, and finalize quotation shortly.
                </p>
            </div>

            <p>You can track the progress of your order in real-time in your customer workspace:</p>
            <div style="text-align: center; margin: 24px 0;">
                <a href="{{ url('/customer/custom-orders/' . $order->id) }}" class="btn">
                    View Project Workspace &rarr;
                </a>
            </div>

            <p style="font-size: 13px; color: #94a3b8;">If you need to provide additional requirements or documents, you can reply directly to this email.</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} CodeVenture Technology. All rights reserved.
        </div>
    </div>
</body>
</html>
