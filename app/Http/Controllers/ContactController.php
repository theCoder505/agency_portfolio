<?php

namespace App\Http\Controllers;

use App\Mail\OtpMail;
use App\Models\Contact;
use App\Models\ContactOtp;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    /**
     * Display the Contact & Location Page.
     */
    public function index(): Response
    {
        return Inertia::render('surface/contact');
    }

    /**
     * Generate a new captcha challenge.
     */
    public function getCaptcha(): JsonResponse
    {
        $num1 = rand(2, 9);
        $num2 = rand(1, 9);
        $operator = rand(0, 1) ? '+' : '*';
        $result = $operator === '+' ? ($num1 + $num2) : ($num1 * $num2);

        $captchaId = Str::random(16);
        session()->put("captcha_{$captchaId}", $result);

        return response()->json([
            'captcha_id' => $captchaId,
            'question' => "What is {$num1} {$operator} {$num2}?",
        ]);
    }

    /**
     * Send OTP to visitor email before contact form submission.
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $email = strtolower(trim($request->email));
        $otpCode = (string) rand(100000, 999999);
        $expiresAt = Carbon::now()->addMinutes(10);

        // Delete any past OTP for this email
        ContactOtp::where('email', $email)->delete();

        // Create new OTP
        ContactOtp::create([
            'email' => $email,
            'otp_code' => $otpCode,
            'expires_at' => $expiresAt,
            'verified' => false,
        ]);

        try {
            Mail::to($email)->send(new OtpMail($otpCode, 'contact form verification', 10));
        } catch (\Exception $e) {
            Log::error('Failed to send contact OTP email: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Verification code sent to ' . $email . '. Please check your inbox.',
            // For smooth development & testing preview
            'dev_otp' => app()->environment('local') ? $otpCode : null,
        ]);
    }

    /**
     * Verify OTP code entered by visitor.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|max:255',
            'otp' => 'required|string|size:6',
        ]);

        $email = strtolower(trim($request->email));
        $otp = trim($request->otp);

        $record = ContactOtp::where('email', $email)
            ->where('otp_code', $otp)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired verification code. Please try again.',
            ], 422);
        }

        $record->update(['verified' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully!',
        ]);
    }

    /**
     * Store submitted contact inquiry.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'service_interested' => 'nullable|string|max:100',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|min:10|max:5000',
            'captcha_id' => 'required|string',
            'captcha_answer' => 'required|numeric',
        ]);

        $email = strtolower(trim($request->email));

        // Validate Captcha
        $captchaKey = "captcha_{$request->captcha_id}";
        $expectedAnswer = session()->get($captchaKey);

        if ($expectedAnswer === null || (int)$request->captcha_answer !== (int)$expectedAnswer) {
            return back()->withErrors([
                'captcha_answer' => 'Captcha answer is incorrect. Please try again.',
            ])->withInput();
        }

        session()->forget($captchaKey);

        // Validate that email has been verified via OTP
        $otpRecord = ContactOtp::where('email', $email)
            ->where('verified', true)
            ->first();

        if (!$otpRecord) {
            return back()->withErrors([
                'email' => 'Please verify your email address using the OTP button first.',
            ])->withInput();
        }

        // Save Contact Inquiry
        Contact::create([
            'name' => $request->name,
            'email' => $email,
            'phone' => $request->phone,
            'service_interested' => $request->service_interested,
            'subject' => $request->subject,
            'message' => $request->message,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'is_read' => false,
        ]);

        // Consume OTP record
        $otpRecord->delete();

        return back()->with('success', 'Thank you! Your message has been sent successfully. Our team will contact you shortly.');
    }
}
