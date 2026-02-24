<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VoucherController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return $request->user()->tenant->vouchers()
            ->with(['workOrder.workType', 'khilai.worker'])
            ->latest()
            ->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'type' => 'required|in:khilai,work-order',
            'work_order_id' => 'nullable|exists:work_orders,id',
            'khilai_id' => 'nullable|exists:purchases,id',
            'total_received' => 'required|numeric',
            'total_due' => 'required|numeric',
            'balance' => 'required|numeric',
            'description' => 'nullable|string',
            'image' => 'nullable',
        ]);

        $voucherNo = 'VCH-' . strtoupper(Str::random(8));

        $data = $validated;
        $data['voucher_no'] = $voucherNo;

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('vouchers', 'public');
            $data['image'] = $path;
        }

        $voucher = $request->user()->tenant->vouchers()->create($data);

        return response()->json($voucher->load(['workOrder.workType', 'khilai.worker']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        return $request->user()->tenant->vouchers()->with(['workOrder.workType', 'khilai.worker'])->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $voucher = $request->user()->tenant->vouchers()->findOrFail($id);

        $validated = $request->validate([
            'date' => 'sometimes|date',
            'description' => 'nullable|string',
            'total_received' => 'sometimes|numeric',
            'total_due' => 'sometimes|numeric',
            'balance' => 'sometimes|numeric',
            'image' => 'nullable',
        ]);

        $data = $validated;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('vouchers', 'public');
            $data['image'] = $path;
        }

        $voucher->update($data);

        return $voucher->load(['workOrder.workType', 'khilai.worker']);
    }

    public function trash(Request $request)
    {
        return $request->user()->tenant->vouchers()
            ->onlyTrashed()
            ->with(['workOrder.workType', 'khilai.worker'])
            ->latest()
            ->get();
    }

    public function restore(Request $request, string $id)
    {
        $voucher = $request->user()->tenant->vouchers()->onlyTrashed()->findOrFail($id);
        $voucher->restore();
        return response()->json(['message' => 'Voucher restored']);
    }

    public function forceDelete(Request $request, string $id)
    {
        $voucher = $request->user()->tenant->vouchers()->withTrashed()->findOrFail($id);
        $voucher->forceDelete();
        return response()->json(['message' => 'Voucher permanently deleted']);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        $request->user()->tenant->vouchers()->whereIn('id', $request->ids)->delete();
        return response()->json(['message' => 'Vouchers deleted']);
    }

    public function bulkRestore(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        $request->user()->tenant->vouchers()->onlyTrashed()->whereIn('id', $request->ids)->restore();
        return response()->json(['message' => 'Vouchers restored']);
    }

    public function bulkForceDelete(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        $request->user()->tenant->vouchers()->withTrashed()->whereIn('id', $request->ids)->forceDelete();
        return response()->json(['message' => 'Vouchers permanently deleted']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $voucher = $request->user()->tenant->vouchers()->findOrFail($id);
        $voucher->delete();
        return response()->json(['message' => 'Voucher moved to trash']);
    }
}
