<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verification Code - CodeVenture Tech</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 540px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; text-align: center; }
        .header { background: linear-gradient(135deg, #4f46e5, #06b6d4); padding: 28px 20px; }
        .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; }
        .content { padding: 32px 24px; color: #e2e8f0; line-height: 1.6; }
        .otp-box { margin: 24px auto; padding: 16px 28px; background: #0f172a; border: 2px dashed #06b6d4; border-radius: 10px; display: inline-block; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; }
        .warning { font-size: 13px; color: #94a3b8; margin-top: 20px; }
        .footer { padding: 16px 20px; font-size: 12px; color: #64748b; border-top: 1px solid #334155; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CodeVenture Tech</h1>
        </div>
        <div class="content">
            <h2 style="margin-top: 0; color: #ffffff; font-size: 18px;">Security Verification Code</h2>
            <p>Please use the following One-Time Password (OTP) to complete your {{ $purpose }}:</p>
            
            <div class="otp-box">
                <div class="otp-code">{{ $otpCode }}</div>
            </div>

            <p class="warning">This verification code is valid for <strong>{{ $expiryMinutes }} minutes</strong>. If you did not request this code, please ignore this email.</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} CodeVenture Technology. All rights reserved.
        </div>
    </div>
</body>
</html>
