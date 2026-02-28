<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->tenant->purchases()->withCount('items')->with(['worker', 'items', 'vouchers', 'paymentVouchers'])->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'worker_id' => 'required|exists:workers,id',
            'invoice_no' => 'required|string',
            'date' => 'required|date',
            'pat_size' => 'required|numeric',
            'items' => 'nullable|array',
            'items.*.s_no' => 'nullable|integer',
            'items.*.size_meters' => 'nullable|numeric',
            'items.*.pat_raw' => 'nullable|numeric',
            'items.*.pat_round' => 'nullable|integer',
            'items.*.pieces_raw' => 'nullable|numeric',
            'items.*.pieces_round' => 'nullable|integer',
            'item_type' => 'nullable|string',
            'total_pieces' => 'nullable|numeric',
        ]);

        $totalPieces = 0;
        if ($validated['item_type'] == 'lot') {
            foreach ($validated['items'] as $item) {
                $totalPieces += $item['pieces_raw'];
            }
        } else {
            $totalPieces = $validated['total_pieces'];
        }

        $purchase = $request->user()->tenant->purchases()->create([
            'worker_id' => $validated['worker_id'],
            'invoice_no' => $validated['invoice_no'],
            'date' => $validated['date'],
            'pat_size' => $validated['pat_size'],
            'item_type' => $validated['item_type'],
            'total_pieces' => $totalPieces,
        ]);

        foreach ($validated['items'] as $item) {
            $purchase->items()->create(array_merge($item, [
                'tenant_id' => $request->user()->tenant_id,
            ]));
        }

        return $purchase->load('items', 'worker', 'vouchers', 'paymentVouchers');
    }

    public function show(Request $request, string $id)
    {
        return $request->user()->tenant->purchases()->with('items', 'worker', 'vouchers', 'paymentVouchers')->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $purchase = $request->user()->tenant->purchases()->findOrFail($id);

        $validated = $request->validate([
            'worker_id' => 'required|exists:workers,id',
            'invoice_no' => 'required|string',
            'date' => 'required|date',
            'pat_size' => 'required|numeric',
            'items' => 'nullable|array',
            'items.*.s_no' => 'nullable|integer',
            'items.*.size_meters' => 'nullable|numeric',
            'items.*.pat_raw' => 'nullable|numeric',
            'items.*.pat_round' => 'nullable|integer',
            'items.*.pieces_raw' => 'nullable|numeric',
            'items.*.pieces_round' => 'nullable|integer',
            'item_type' => 'nullable|string',
            'total_pieces' => 'nullable|numeric',
        ]);

        $totalPieces = 0;
        if (($validated['item_type'] ?? $purchase->item_type) == 'lot') {
            foreach ($validated['items'] as $item) {
                $totalPieces += $item['pieces_round'];
            }
        } else {
            $totalPieces = $validated['total_pieces'];
        }

        $purchase->update([
            'worker_id' => $validated['worker_id'],
            'invoice_no' => $validated['invoice_no'],
            'date' => $validated['date'],
            'pat_size' => $validated['pat_size'],
            'item_type' => $validated['item_type'] ?? $purchase->item_type,
            'total_pieces' => $totalPieces,
        ]);

        if (isset($validated['items'])) {
            // Delete old items and create new ones (simplest way to sync)
            $purchase->items()->delete();
            foreach ($validated['items'] as $item) {
                $purchase->items()->create(array_merge($item, [
                    'tenant_id' => $request->user()->tenant_id,
                ]));
            }
        }

        return $purchase->load('items', 'worker', 'vouchers', 'paymentVouchers');
    }

    public function trash(Request $request)
    {
        return $request->user()->tenant->purchases()->onlyTrashed()->withCount('items')->with(['worker', 'items', 'vouchers', 'paymentVouchers'])->latest()->get();
    }

    public function restore(Request $request, string $id)
    {
        $purchase = $request->user()->tenant->purchases()->onlyTrashed()->findOrFail($id);
        $purchase->restore();
        return response()->json(['message' => 'Purchase restored']);
    }

    public function forceDelete(Request $request, string $id)
    {
        $purchase = $request->user()->tenant->purchases()->withTrashed()->findOrFail($id);
        $purchase->items()->delete(); // Permanent delete items
        $purchase->forceDelete();
        return response()->json(['message' => 'Purchase permanently deleted']);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        $request->user()->tenant->purchases()->whereIn('id', $request->ids)->delete();
        return response()->json(['message' => 'Purchases deleted']);
    }

    public function bulkRestore(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        $request->user()->tenant->purchases()->onlyTrashed()->whereIn('id', $request->ids)->restore();
        return response()->json(['message' => 'Purchases restored']);
    }

    public function bulkForceDelete(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        $purchases = $request->user()->tenant->purchases()->withTrashed()->whereIn('id', $request->ids)->get();
        foreach ($purchases as $p) {
            $p->items()->delete();
            $p->forceDelete();
        }
        return response()->json(['message' => 'Purchases permanently deleted']);
    }

    public function destroy(Request $request, string $id)
    {
        $purchase = $request->user()->tenant->purchases()->findOrFail($id);
        $purchase->delete();
        return response()->json(['message' => 'Purchase moved to trash']);
    }
}
