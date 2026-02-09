<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkType extends Model
{
    protected $fillable = [
        'tenant_id',
        'name',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
