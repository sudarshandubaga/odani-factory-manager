<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseItem extends Model
{
    protected $fillable = [
        'tenant_id',
        'purchase_id',
        's_no',
        'size_meters',
        'pat_raw',
        'pat_round',
        'pieces_raw',
        'pieces_round',
        'status',
    ];

    protected $casts = [
        's_no' => 'integer',
        'size_meters' => 'float',
        'pat_raw' => 'float',
        'pat_round' => 'integer',
        'pieces_raw' => 'float',
        'pieces_round' => 'integer',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }
}
