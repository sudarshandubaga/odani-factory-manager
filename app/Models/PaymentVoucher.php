<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentVoucher extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'voucher_no',
        'date',
        'type',
        'work_order_id',
        'khilai_id',
        'price',
        'total_due',
        'description',
        'tenant_id'
    ];

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class);
    }

    public function khilai()
    {
        return $this->belongsTo(Purchase::class, 'khilai_id');
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
