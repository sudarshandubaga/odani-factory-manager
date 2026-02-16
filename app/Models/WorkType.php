<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkType extends Model
{
    protected $fillable = [
        'tenant_id',
        'name',
        'parent_id',
    ];

    public function parent()
    {
        return $this->belongsTo(WorkType::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(WorkType::class, 'parent_id');
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
