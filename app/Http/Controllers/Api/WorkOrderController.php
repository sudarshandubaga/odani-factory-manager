<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class WorkOrderController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->tenant->workOrders()
            ->with(['purchase', 'worker', 'workType', 'items', 'parentOrder', 'childOrders', 'vouchers', 'paymentVouchers'])
            ->latest()
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'work_type_id' => 'required|exists:work_types,id',
            'purchase_id' => 'nullable|exists:purchases,id',
            'parent_order_id' => 'nullable|exists:work_orders,id',
            'worker_id' => 'required|exists:workers,id',
            'item_ids' => 'nullable|array',
            'item_ids.*' => 'exists:purchase_items,id',
            'deadline' => 'required|date',
            'image' => 'nullable',
            'no_of_pieces' => 'nullable|integer',
            'price_per_pc' => 'nullable|numeric|min:0',
            'remarks' => 'nullable|string',
        ]);

        $purchaseId = $validated['purchase_id'] ?? null;
        if (!empty($validated['parent_order_id'])) {
            $parentOrder = \App\Models\WorkOrder::findOrFail($validated['parent_order_id']);
            $purchaseId = $parentOrder->purchase_id;
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('work-orders', 'public');
            $imagePath = 'storage/' . $imagePath;
        } elseif (!empty($validated['image']) && is_string($validated['image'])) {
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
            'no_of_pieces' => $validated['no_of_pieces'] ?? null,
            'price_per_pc' => $validated['price_per_pc'] ?? null,
            'remarks' => $validated['remarks'] ?? null,
        ]);

        if (!empty($validated['item_ids'])) {
            $workOrder->items()->attach($validated['item_ids']);
            \App\Models\PurchaseItem::whereIn('id', $validated['item_ids'])->update(['status' => 'assigned']);
        }

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

        $validated = $request->validate([
            'work_type_id' => 'nullable|exists:work_types,id',
            'purchase_id' => 'nullable|exists:purchases,id',
            'parent_order_id' => 'nullable|exists:work_orders,id',
            'worker_id' => 'nullable|exists:workers,id',
            'item_ids' => 'nullable|array',
            'item_ids.*' => 'exists:purchase_items,id',
            'deadline' => 'nullable|date',
            'image' => 'nullable',
            'no_of_pieces' => 'nullable|integer',
            'price_per_pc' => 'nullable|numeric|min:0',
            'remarks' => 'nullable|string',
            'status' => 'nullable|in:active,completed',
            'received_pcs' => 'nullable|integer',
            'notes' => 'nullable|string',
        ]);

        // If status or received pieces are changing, check child orders? 
        // For now let's focus on basic editing as requested.

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('work-orders', 'public');
            $imagePath = 'storage/' . $imagePath;
            $workOrder->image = $imagePath;
        }

        $updateData = [];
        $fields = ['work_type_id', 'purchase_id', 'parent_order_id', 'worker_id', 'deadline', 'no_of_pieces', 'price_per_pc', 'remarks', 'status', 'received_pcs', 'notes'];
        foreach ($fields as $field) {
            if ($request->has($field)) {
                $updateData[$field] = $validated[$field];
            }
        }

        if (!empty($validated['parent_order_id'])) {
            $parentOrder = \App\Models\WorkOrder::findOrFail($validated['parent_order_id']);
            $updateData['purchase_id'] = $parentOrder->purchase_id;
        }

        $workOrder->update($updateData);

        if (isset($validated['item_ids'])) {
            // Re-sync items: pending the old ones, assigning the new ones
            $workOrder->items()->update(['status' => 'pending']);
            $workOrder->items()->sync($validated['item_ids']);
            \App\Models\PurchaseItem::whereIn('id', $validated['item_ids'])->update(['status' => 'assigned']);
        }

        return $workOrder->load(['purchase', 'worker', 'workType', 'items', 'parentOrder', 'vouchers', 'paymentVouchers']);
    }

    public function trash(Request $request)
    {
        return $request->user()->tenant->workOrders()
            ->onlyTrashed()
            ->with(['purchase', 'worker', 'workType', 'items', 'parentOrder', 'childOrders', 'vouchers', 'paymentVouchers'])
            ->latest()
            ->get();
    }

    public function restore(Request $request, string $id)
    {
        $workOrder = $request->user()->tenant->workOrders()->onlyTrashed()->findOrFail($id);
        $workOrder->restore();
        return response()->json(['message' => 'Work order restored']);
    }

    public function forceDelete(Request $request, string $id)
    {
        $workOrder = $request->user()->tenant->workOrders()->withTrashed()->findOrFail($id);
        $workOrder->forceDelete();
        return response()->json(['message' => 'Work order permanently deleted']);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        $orders = $request->user()->tenant->workOrders()->whereIn('id', $request->ids)->get();
        foreach ($orders as $order) {
            $order->items()->update(['status' => 'pending']);
            $order->delete();
        }
        return response()->json(['message' => 'Work orders deleted']);
    }

    public function bulkRestore(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        $request->user()->tenant->workOrders()->onlyTrashed()->whereIn('id', $request->ids)->restore();
        return response()->json(['message' => 'Work orders restored']);
    }

    public function bulkForceDelete(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        $request->user()->tenant->workOrders()->withTrashed()->whereIn('id', $request->ids)->forceDelete();
        return response()->json(['message' => 'Work orders permanently deleted']);
    }

    public function destroy(Request $request, string $id)
    {
        $workOrder = $request->user()->tenant->workOrders()->findOrFail($id);
        // Reset item status before deleting
        $workOrder->items()->update(['status' => 'pending']);
        $workOrder->delete();
        return response()->json(['message' => 'Work order moved to trash']);
    }
}
