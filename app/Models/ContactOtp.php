<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactOtp extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'otp_code',
        'expires_at',
        'verified',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'verified' => 'boolean',
    ];

    public function isValid(): bool
    {
        return $this->expires_at->isFuture();
    }
}
