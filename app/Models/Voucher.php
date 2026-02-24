<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Voucher extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'voucher_no',
        'date',
        'type',
        'work_order_id',
        'khilai_id',
        'total_received',
        'total_due',
        'balance',
        'description',
        'image',
        'tenant_id',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class);
    }

    public function khilai()
    {
        return $this->belongsTo(Purchase::class, 'khilai_id');
    }
}
