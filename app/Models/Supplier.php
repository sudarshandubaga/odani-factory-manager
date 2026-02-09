<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $fillable = [
        'tenant_id',
        'name',
        'mobile',
        'email',
        'shop_name',
        'address',
        'state',
        'city',
        'pincode',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
