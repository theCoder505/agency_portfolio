<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\Admin;
use App\Models\AdminOtp;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the Admin Profile view.
     */
    public function index(): Response
    {
        return Inertia::render('admin/profile/index', [
            'admin' => Auth::guard('admin')->user(),
        ]);
    }

    /**
     * Update basic profile info (name, avatar).
     */
    public function updateBasic(Request $request): RedirectResponse
    {
        $admin = Auth::guard('admin')->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'avatar' => 'nullable',
        ]);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('admins', 'public');
            $validated['avatar'] = '/storage/' . $path;
        } else {
            unset($validated['avatar']);
        }

        $admin->update($validated);

        return back()->with('success', 'Profile information updated successfully.');
    }

    /**
     * Request OTP for changing admin email.
     */
    public function requestEmailOtp(Request $request): JsonResponse
    {
        $request->validate([
            'new_email' => 'required|email|unique:admins,email',
        ]);

        $admin = Auth::guard('admin')->user();
        $newEmail = strtolower(trim($request->new_email));
        $otpCode = (string) rand(100000, 999999);

        // Remove previous OTPs of this type for this admin
        AdminOtp::where('admin_id', $admin->id)
            ->where('type', 'email_change')
            ->delete();

        AdminOtp::create([
            'admin_id' => $admin->id,
            'type' => 'email_change',
            'new_value' => $newEmail,
            'otp_code' => $otpCode,
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);

        try {
            Mail::to($admin->email)->send(new OtpMail($otpCode, 'Email Address Update', 10));
        } catch (\Exception $e) {
            Log::error('Failed to send Admin Email OTP: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Verification code sent to ' . $admin->email . '. Please enter it to confirm.',
            'dev_otp' => app()->environment('local') ? $otpCode : null,
        ]);
    }

    /**
     * Confirm and finalize email change with OTP.
     */
    public function confirmEmailChange(Request $request): JsonResponse
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $admin = Auth::guard('admin')->user();
        $otp = trim($request->otp);

        $record = AdminOtp::where('admin_id', $admin->id)
            ->where('type', 'email_change')
            ->where('otp_code', $otp)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$record || empty($record->new_value)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP code. Please request a new code.',
            ], 422);
        }

        $newEmail = $record->new_value;
        $admin->update(['email' => $newEmail]);
        $record->delete();

        return response()->json([
            'success' => true,
            'message' => 'Admin email updated successfully to ' . $newEmail,
        ]);
    }

    /**
     * Request OTP for changing admin password.
     */
    public function requestPasswordOtp(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $admin = Auth::guard('admin')->user();

        if (!Hash::check($request->current_password, $admin->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Your current password does not match.',
            ], 422);
        }

        $otpCode = (string) rand(100000, 999999);
        $hashedNewPassword = Hash::make($request->new_password);

        AdminOtp::where('admin_id', $admin->id)
            ->where('type', 'password_change')
            ->delete();

        AdminOtp::create([
            'admin_id' => $admin->id,
            'type' => 'password_change',
            'new_value' => $hashedNewPassword,
            'otp_code' => $otpCode,
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);

        try {
            Mail::to($admin->email)->send(new OtpMail($otpCode, 'Password Change Verification', 10));
        } catch (\Exception $e) {
            Log::error('Failed to send Admin Password OTP: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Verification code sent to ' . $admin->email . '. Please enter it to complete password change.',
            'dev_otp' => app()->environment('local') ? $otpCode : null,
        ]);
    }

    /**
     * Confirm and finalize password change with OTP.
     */
    public function confirmPasswordChange(Request $request): JsonResponse
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $admin = Auth::guard('admin')->user();
        $otp = trim($request->otp);

        $record = AdminOtp::where('admin_id', $admin->id)
            ->where('type', 'password_change')
            ->where('otp_code', $otp)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$record || empty($record->new_value)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP code. Please request a new code.',
            ], 422);
        }

        // update with pre-hashed new password
        DB::table('admins')->where('id', $admin->id)->update([
            'password' => $record->new_value,
            'updated_at' => now(),
        ]);

        $record->delete();

        return response()->json([
            'success' => true,
            'message' => 'Admin password has been changed successfully.',
        ]);
    }
}
