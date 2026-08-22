<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisitorLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'ip_address',
        'url',
        'method',
        'user_agent',
        'device_type',
        'browser',
        'platform',
        'referer',
        'portfolio_id',
    ];

    public function portfolio()
    {
        return $this->belongsTo(Portfolio::class);
    }
}
