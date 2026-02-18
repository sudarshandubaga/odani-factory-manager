<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class WorkOrderController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->tenant->workOrders()
            ->with(['purchase', 'worker', 'workType', 'items', 'parentOrder', 'childOrders'])
            ->latest()
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'work_type_id' => 'required|exists:work_types,id',
            'purchase_id' => 'required_without:parent_order_id|nullable|exists:purchases,id',
            'parent_order_id' => 'required_without:purchase_id|nullable|exists:work_orders,id',
            'worker_id' => 'required|exists:workers,id',
            'item_ids' => 'required|array',
            'item_ids.*' => 'required|exists:purchase_items,id',
            'deadline' => 'required|date',
            'image' => 'nullable|string',
        ]);

        $purchaseId = $validated['purchase_id'] ?? null;
        if (!empty($validated['parent_order_id'])) {
            $parentOrder = \App\Models\WorkOrder::findOrFail($validated['parent_order_id']);
            $purchaseId = $parentOrder->purchase_id;
        }

        $imagePath = null;
        if (!empty($validated['image'])) {
            $imageData = $validated['image'];
            if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $type)) {
                $imageData = substr($imageData, strpos($imageData, ',') + 1);
                $type = strtolower($type[1]); // jpg, png, gif

                if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
                    throw new \Exception('invalid image type');
                }
                $imageData = base64_decode($imageData);

                if ($imageData === false) {
                    throw new \Exception('base64_decode failed');
                }

                $fileName = 'wo_' . time() . '_' . uniqid() . '.' . $type;
                $imagePath = 'work-orders/' . $fileName;
                \Illuminate\Support\Facades\Storage::disk('public')->put($imagePath, $imageData);
                $imagePath = 'storage/' . $imagePath;
            }
        }

        $workOrder = $request->user()->tenant->workOrders()->create([
            'purchase_id' => $purchaseId,
            'parent_order_id' => $validated['parent_order_id'] ?? null,
            'worker_id' => $validated['worker_id'],
            'work_type_id' => $validated['work_type_id'],
            'deadline' => $validated['deadline'],
            'image' => $imagePath,
            'status' => 'active',
        ]);

        $workOrder->items()->attach($validated['item_ids']);

        // Update items status - Note: This might be tricky if one item is in multiple work orders 
        // but typically an item progresses from one work order to next.
        // For now keep the logic as is.
        \App\Models\PurchaseItem::whereIn('id', $validated['item_ids'])->update(['status' => 'assigned']);

        return $workOrder->load(['purchase', 'worker', 'workType', 'items', 'parentOrder']);
    }

    public function show(Request $request, string $id)
    {
        return $request->user()->tenant->workOrders()
            ->with(['purchase', 'worker', 'workType', 'items', 'parentOrder'])
            ->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $workOrder = $request->user()->tenant->workOrders()->findOrFail($id);

        // Check if child jobs exist
        if ($workOrder->childOrders()->exists()) {
            return response()->json([
                'message' => 'Cannot change status of a job that has child job orders.'
            ], 422);
        }

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
