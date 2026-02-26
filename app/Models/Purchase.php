<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Purchase extends Model
{
    use SoftDeletes;
    protected $guarded = [];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }

    public function items()
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function vouchers()
    {
        return $this->hasMany(Voucher::class, 'khilai_id');
    }

    public function paymentVouchers()
    {
        return $this->hasMany(PaymentVoucher::class, 'khilai_id');
    }
}
