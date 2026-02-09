<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    protected $fillable = ['name', 'domain'];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function suppliers()
    {
        return $this->hasMany(Supplier::class);
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }

    public function purchaseItems()
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function workers()
    {
        return $this->hasMany(Worker::class);
    }

    public function workTypes()
    {
        return $this->hasMany(WorkType::class);
    }

    public function workOrders()
    {
        return $this->hasMany(WorkOrder::class);
    }
}
