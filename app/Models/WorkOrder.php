<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkOrder extends Model
{
    protected $fillable = [
        'tenant_id',
        'purchase_id',
        'parent_order_id',
        'worker_id',
        'work_type_id',
        'deadline',
        'status',
    ];

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
}
