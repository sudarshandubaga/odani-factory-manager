<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->tenant->suppliers;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'mobile' => 'nullable|string',
            'email' => 'nullable|email',
            'shop_name' => 'nullable|string',
            'address' => 'nullable|string',
            'state' => 'nullable|string',
            'city' => 'nullable|string',
            'pincode' => 'nullable|string',
        ]);

        return $request->user()->tenant->suppliers()->create($validated);
    }

    public function show(Request $request, string $id)
    {
        return $request->user()->tenant->suppliers()->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $supplier = $request->user()->tenant->suppliers()->findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string',
            'mobile' => 'nullable|string',
            'email' => 'nullable|email',
            'shop_name' => 'nullable|string',
            'address' => 'nullable|string',
            'state' => 'nullable|string',
            'city' => 'nullable|string',
            'pincode' => 'nullable|string',
        ]);

        $supplier->update($validated);
        return $supplier;
    }

    public function destroy(Request $request, string $id)
    {
        $supplier = $request->user()->tenant->suppliers()->findOrFail($id);
        $supplier->delete();
        return response()->json(['message' => 'Supplier deleted']);
    }
}
