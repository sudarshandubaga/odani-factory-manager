<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class WorkOrderController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->tenant->workOrders()->with(['purchase', 'worker', 'workType', 'items'])->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'purchase_id' => 'required|exists:purchases,id',
            'worker_id' => 'required|exists:workers,id',
            'work_type_id' => 'required|exists:work_types,id',
            'item_ids' => 'required|array',
            'item_ids.*' => 'required|exists:purchase_items,id',
            'deadline' => 'required|date',
        ]);

        $workOrder = $request->user()->tenant->workOrders()->create([
            'purchase_id' => $validated['purchase_id'],
            'worker_id' => $validated['worker_id'],
            'work_type_id' => $validated['work_type_id'],
            'deadline' => $validated['deadline'],
            'status' => 'active',
        ]);

        $workOrder->items()->attach($validated['item_ids']);

        // Update items status
        \App\Models\PurchaseItem::whereIn('id', $validated['item_ids'])->update(['status' => 'assigned']);

        return $workOrder->load(['purchase', 'worker', 'workType', 'items']);
    }

    public function show(Request $request, string $id)
    {
        return $request->user()->tenant->workOrders()->with(['purchase', 'worker', 'workType', 'items'])->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $workOrder = $request->user()->tenant->workOrders()->findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:active,completed',
        ]);

        $workOrder->update($validated);

        if ($validated['status'] === 'completed') {
            $workOrder->items()->update(['status' => 'completed']);
        }

        return $workOrder->load(['purchase', 'worker', 'workType', 'items']);
    }

    public function destroy(Request $request, string $id)
    {
        $workOrder = $request->user()->tenant->workOrders()->findOrFail($id);
        // Reset item status before deleting
        $workOrder->items()->update(['status' => 'pending']);
        $workOrder->delete();
        return response()->json(['message' => 'Work order deleted']);
    }
}
