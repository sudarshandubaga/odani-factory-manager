<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentVoucher;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentVoucherController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return $request->user()->tenant->paymentVouchers()
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
            'price' => 'required|numeric',
            'total_due' => 'required|numeric',
            'description' => 'nullable|string',
        ]);

        $voucherNo = 'PVCH-' . strtoupper(Str::random(7));

        $data = $validated;
        $data['voucher_no'] = $voucherNo;

        $paymentVoucher = $request->user()->tenant->paymentVouchers()->create($data);

        return response()->json($paymentVoucher->load(['workOrder.workType', 'khilai.worker']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        return $request->user()->tenant->paymentVouchers()->with(['workOrder.workType', 'khilai.worker'])->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $paymentVoucher = $request->user()->tenant->paymentVouchers()->findOrFail($id);

        $validated = $request->validate([
            'date' => 'sometimes|date',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric',
            'total_due' => 'sometimes|numeric',
        ]);

        $paymentVoucher->update($validated);

        return $paymentVoucher->load(['workOrder.workType', 'khilai.worker']);
    }

    public function trash(Request $request)
    {
        return $request->user()->tenant->paymentVouchers()
            ->onlyTrashed()
            ->with(['workOrder.workType', 'khilai.worker'])
            ->latest()
            ->get();
    }

    public function restore(Request $request, string $id)
    {
        $paymentVoucher = $request->user()->tenant->paymentVouchers()->onlyTrashed()->findOrFail($id);
        $paymentVoucher->restore();
        return response()->json(['message' => 'Payment Voucher restored']);
    }

    public function forceDelete(Request $request, string $id)
    {
        $paymentVoucher = $request->user()->tenant->paymentVouchers()->withTrashed()->findOrFail($id);
        $paymentVoucher->forceDelete();
        return response()->json(['message' => 'Payment Voucher permanently deleted']);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        $request->user()->tenant->paymentVouchers()->whereIn('id', $request->ids)->delete();
        return response()->json(['message' => 'Payment Vouchers deleted']);
    }

    public function bulkRestore(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        $request->user()->tenant->paymentVouchers()->onlyTrashed()->whereIn('id', $request->ids)->restore();
        return response()->json(['message' => 'Payment Vouchers restored']);
    }

    public function bulkForceDelete(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        $request->user()->tenant->paymentVouchers()->withTrashed()->whereIn('id', $request->ids)->forceDelete();
        return response()->json(['message' => 'Payment Vouchers permanently deleted']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $paymentVoucher = $request->user()->tenant->paymentVouchers()->findOrFail($id);
        $paymentVoucher->delete();
        return response()->json(['message' => 'Payment Voucher moved to trash']);
    }
}
