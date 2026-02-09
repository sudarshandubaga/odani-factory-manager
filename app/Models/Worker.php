<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Worker extends Model
{
    protected $fillable = [
        'tenant_id',
        'name',
        'image',
        'email',
        'mobile',
        'notes',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
