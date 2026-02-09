<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->tenant->purchases()->withCount('items')->with(['supplier', 'items'])->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'invoice_no' => 'required|string',
            'date' => 'required|date',
            'pat_size' => 'required|numeric',
            'items' => 'required|array',
            'items.*.s_no' => 'required|integer',
            'items.*.size_meters' => 'required|numeric',
            'items.*.pat_raw' => 'required|numeric',
            'items.*.pat_round' => 'required|integer',
            'items.*.pieces_raw' => 'required|numeric',
            'items.*.pieces_round' => 'required|integer',
        ]);

        $purchase = $request->user()->tenant->purchases()->create([
            'supplier_id' => $validated['supplier_id'],
            'invoice_no' => $validated['invoice_no'],
            'date' => $validated['date'],
            'pat_size' => $validated['pat_size'],
        ]);

        foreach ($validated['items'] as $item) {
            $purchase->items()->create(array_merge($item, [
                'tenant_id' => $request->user()->tenant_id,
            ]));
        }

        return $purchase->load('items', 'supplier');
    }

    public function show(Request $request, string $id)
    {
        return $request->user()->tenant->purchases()->with('items', 'supplier')->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $purchase = $request->user()->tenant->purchases()->findOrFail($id);
        // Simplification: only update main fields, items update could be complex
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'invoice_no' => 'required|string',
            'date' => 'required|date',
            'pat_size' => 'required|numeric',
        ]);

        $purchase->update($validated);
        return $purchase;
    }

    public function destroy(Request $request, string $id)
    {
        $purchase = $request->user()->tenant->purchases()->findOrFail($id);
        $purchase->delete();
        return response()->json(['message' => 'Purchase deleted']);
    }
}
