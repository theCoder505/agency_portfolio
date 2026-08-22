<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminOtp extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'type',
        'new_value',
        'otp_code',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }

    public function isValid(): bool
    {
        return $this->expires_at->isFuture();
    }
}
