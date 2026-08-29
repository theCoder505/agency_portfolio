<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Project Proposal Update</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #131b2e; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; }
        .header { background: linear-gradient(135deg, #e11d48, #4f46e5); padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; }
        .header p { margin: 8px 0 0 0; color: #ffe4e6; font-size: 14px; }
        .content { padding: 32px 24px; color: #e2e8f0; line-height: 1.6; }
        .reason-box { background: #0b1120; border-left: 4px solid #f43f5e; padding: 18px; border-radius: 8px; margin: 20px 0; color: #f1f5f9; white-space: pre-line; font-size: 14px; }
        .footer { text-align: center; padding: 24px; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; background: #0b1120; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CodeVenture Tech</h1>
            <p>Custom Project Proposal Review</p>
        </div>
        <div class="content">
            <p>Hello <strong>{{ $order->user?->name ?? 'Valued Customer' }}</strong>,</p>
            <p>Thank you for submitting your custom project proposal for <strong>"{{ $order->title }}"</strong> (#{{ $order->order_number }}).</p>
            <p>After thorough analysis by our engineering leadership, we are unfortunately unable to proceed with this project at this stage due to the reasons outlined below:</p>

            <div class="reason-box">
                {{ !empty($reason) ? $reason : (!empty($order->rejection_reason) ? $order->rejection_reason : 'Scope / Timeline / Resource constraints at this time.') }}
            </div>

            <p>You may submit a revised proposal or contact us to discuss alternatives if desired. We appreciate your interest in CodeVenture Tech!</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} CodeVenture Technology. All rights reserved.
        </div>
    </div>
</body>
</html>
