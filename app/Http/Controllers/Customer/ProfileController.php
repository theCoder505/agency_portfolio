<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\User;
use App\Models\UserOtp;
use Carbon\Carbon;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Ensure the user_otps table exists.
     */
    protected function ensureOtpTableExists(): void
    {
        if (!Schema::hasTable('user_otps')) {
            Schema::create('user_otps', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('type');
                $table->string('new_value')->nullable();
                $table->string('otp_code', 10);
                $table->timestamp('expires_at');
                $table->timestamps();
            });
        }
    }

    /**
     * Display customer profile page.
     */
    public function index(): Response
    {
        return Inertia::render('customer/profile', [
            'user' => Auth::user(),
        ]);
    }

    /**
     * Update customer basic profile info (name, phone, company, address).
     */
    public function update(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'company_name' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
        ]);

        $user->update($validated);

        return back()->with('success', 'Profile information updated successfully!');
    }

    /**
     * Request OTP for updating customer email address.
     */
    public function requestEmailOtp(Request $request): JsonResponse
    {
        $request->validate([
            'new_email' => 'required|email|max:255|unique:users,email',
        ]);

        $user = Auth::user();
        $newEmail = strtolower(trim($request->new_email));

        if ($newEmail === strtolower($user->email)) {
            return response()->json([
                'success' => false,
                'message' => 'The new email address cannot be the same as your current email.',
            ], 422);
        }

        $this->ensureOtpTableExists();

        $otpCode = (string) rand(100000, 999999);

        // Delete old pending email change OTPs for this user
        UserOtp::where('user_id', $user->id)
            ->where('type', 'email_change')
            ->delete();

        UserOtp::create([
            'user_id' => $user->id,
            'type' => 'email_change',
            'new_value' => $newEmail,
            'otp_code' => $otpCode,
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);

        try {
            Mail::to($user->email)->send(new OtpMail($otpCode, 'Email Address Update', 10));
        } catch (\Exception $e) {
            Log::error('Failed to send Customer Email OTP: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Verification code sent to ' . $user->email . '. Please enter the 6-digit code to confirm.',
            'dev_otp' => app()->environment('local') ? $otpCode : null,
        ]);
    }

    /**
     * Confirm customer email change using OTP.
     */
    public function confirmEmailChange(Request $request): JsonResponse
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $user = Auth::user();
        $otp = trim($request->otp);

        $this->ensureOtpTableExists();

        $record = UserOtp::where('user_id', $user->id)
            ->where('type', 'email_change')
            ->where('otp_code', $otp)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$record || empty($record->new_value)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP verification code. Please request a new code.',
            ], 422);
        }

        $newEmail = $record->new_value;

        // Double check uniqueness
        if (User::where('email', $newEmail)->where('id', '!=', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'This email address is already taken by another account.',
            ], 422);
        }

        $user->update(['email' => $newEmail]);
        $record->delete();

        return response()->json([
            'success' => true,
            'message' => 'Your account email address has been updated successfully to ' . $newEmail,
        ]);
    }

    /**
     * Request OTP for changing customer password.
     */
    public function requestPasswordOtp(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Your current password does not match our records.',
            ], 422);
        }

        $this->ensureOtpTableExists();

        $otpCode = (string) rand(100000, 999999);
        $hashedNewPassword = Hash::make($request->new_password);

        // Delete old pending password change OTPs for this user
        UserOtp::where('user_id', $user->id)
            ->where('type', 'password_change')
            ->delete();

        UserOtp::create([
            'user_id' => $user->id,
            'type' => 'password_change',
            'new_value' => $hashedNewPassword,
            'otp_code' => $otpCode,
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);

        try {
            Mail::to($user->email)->send(new OtpMail($otpCode, 'Password Change Verification', 10));
        } catch (\Exception $e) {
            Log::error('Failed to send Customer Password OTP: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Verification code sent to ' . $user->email . '. Please enter the 6-digit code to finalize password change.',
            'dev_otp' => app()->environment('local') ? $otpCode : null,
        ]);
    }

    /**
     * Confirm customer password change using OTP.
     */
    public function confirmPasswordChange(Request $request): JsonResponse
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $user = Auth::user();
        $otp = trim($request->otp);

        $this->ensureOtpTableExists();

        $record = UserOtp::where('user_id', $user->id)
            ->where('type', 'password_change')
            ->where('otp_code', $otp)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$record || empty($record->new_value)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP verification code. Please request a new code.',
            ], 422);
        }

        $user->update([
            'password' => $record->new_value,
        ]);

        $record->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully! Your account is now secured with the new password.',
        ]);
    }
}
