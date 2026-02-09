<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkOrder extends Model
{
    protected $fillable = [
        'tenant_id',
        'purchase_id',
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
}
