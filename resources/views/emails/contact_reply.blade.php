<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $replySubject }}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; }
        .header { background: linear-gradient(135deg, #4f46e5, #06b6d4); padding: 30px 24px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; }
        .header p { margin: 6px 0 0 0; color: #e2e8f0; font-size: 14px; }
        .content { padding: 30px 24px; color: #e2e8f0; line-height: 1.6; }
        .reply-body { background: #0f172a; border-left: 4px solid #06b6d4; padding: 16px; border-radius: 6px; margin: 20px 0; color: #f1f5f9; white-space: pre-line; }
        .original-msg { margin-top: 24px; padding: 14px; background: rgba(51, 65, 85, 0.4); border-radius: 6px; font-size: 13px; color: #94a3b8; }
        .footer { text-align: center; padding: 20px 24px; font-size: 12px; color: #64748b; border-top: 1px solid #334155; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CodeVenture Tech</h1>
            <p>Response to your project inquiry</p>
        </div>
        <div class="content">
            <p>Hello <strong>{{ $recipientName }}</strong>,</p>
            <p>Thank you for reaching out to us. We have reviewed your inquiry and our team is pleased to get back to you with the following response:</p>
            
            <div class="reply-body">
                {!! nl2br(e($replyMessage)) !!}
            </div>

            @if(!empty($originalMessage))
            <div class="original-msg">
                <strong>Your original message:</strong>
                <p style="margin: 6px 0 0 0;">{{ $originalMessage }}</p>
            </div>
            @endif

            <p style="margin-top: 24px;">If you have any further questions or would like to schedule a call, feel free to reply directly to this email or reach us on WhatsApp.</p>
            <p>Best regards,<br><strong>The CodeVenture Tech Team</strong></p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} CodeVenture Technology. All rights reserved.
        </div>
    </div>
</body>
</html>
