<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkOrder extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'tenant_id',
        'purchase_id',
        'parent_order_id',
        'worker_id',
        'work_type_id',
        'deadline',
        'status',
        'image',
        'received_pcs',
        'due_pcs',
        'notes',
        'no_of_pieces',
        'remarks',
        'price_per_pc',
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        if (!$this->image)
            return null;
        if (strpos($this->image, 'http') === 0 || strpos($this->image, 'data:') === 0) {
            return $this->image;
        }
        return asset($this->image);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }

    public function parentOrder()
    {
        return $this->belongsTo(WorkOrder::class, 'parent_order_id');
    }

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }

    public function workType()
    {
        return $this->belongsTo(WorkType::class);
    }

    public function items()
    {
        return $this->belongsToMany(PurchaseItem::class, 'work_order_items');
    }

    public function childOrders()
    {
        return $this->hasMany(WorkOrder::class, 'parent_order_id');
    }

    public function vouchers()
    {
        return $this->hasMany(Voucher::class);
    }

    public function paymentVouchers()
    {
        return $this->hasMany(PaymentVoucher::class);
    }
}
