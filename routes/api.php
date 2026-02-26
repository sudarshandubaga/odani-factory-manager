<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\WorkerController;
use App\Http\Controllers\Api\WorkTypeController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\WorkOrderController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\VoucherController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);

    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('workers', WorkerController::class);
    Route::apiResource('work-types', WorkTypeController::class);
    Route::get('purchases/trash', [PurchaseController::class, 'trash']);
    Route::post('purchases/{id}/restore', [PurchaseController::class, 'restore']);
    Route::delete('purchases/{id}/force', [PurchaseController::class, 'forceDelete']);
    Route::post('purchases/bulk-delete', [PurchaseController::class, 'bulkDelete']);
    Route::post('purchases/bulk-restore', [PurchaseController::class, 'bulkRestore']);
    Route::post('purchases/bulk-force-delete', [PurchaseController::class, 'bulkForceDelete']);
    Route::apiResource('purchases', PurchaseController::class);

    Route::get('work-orders/trash', [WorkOrderController::class, 'trash']);
    Route::post('work-orders/{id}/restore', [WorkOrderController::class, 'restore']);
    Route::delete('work-orders/{id}/force', [WorkOrderController::class, 'forceDelete']);
    Route::post('work-orders/bulk-delete', [WorkOrderController::class, 'bulkDelete']);
    Route::post('work-orders/bulk-restore', [WorkOrderController::class, 'bulkRestore']);
    Route::post('work-orders/bulk-force-delete', [WorkOrderController::class, 'bulkForceDelete']);
    Route::apiResource('work-orders', WorkOrderController::class);

    Route::get('vouchers/trash', [VoucherController::class, 'trash']);
    Route::post('vouchers/{id}/restore', [VoucherController::class, 'restore']);
    Route::delete('vouchers/{id}/force', [VoucherController::class, 'forceDelete']);
    Route::post('vouchers/bulk-delete', [VoucherController::class, 'bulkDelete']);
    Route::post('vouchers/bulk-restore', [VoucherController::class, 'bulkRestore']);
    Route::post('vouchers/bulk-force-delete', [VoucherController::class, 'bulkForceDelete']);
    Route::apiResource('vouchers', VoucherController::class);

    Route::get('payment-vouchers/trash', [\App\Http\Controllers\Api\PaymentVoucherController::class, 'trash']);
    Route::post('payment-vouchers/{id}/restore', [\App\Http\Controllers\Api\PaymentVoucherController::class, 'restore']);
    Route::delete('payment-vouchers/{id}/force', [\App\Http\Controllers\Api\PaymentVoucherController::class, 'forceDelete']);
    Route::post('payment-vouchers/bulk-delete', [\App\Http\Controllers\Api\PaymentVoucherController::class, 'bulkDelete']);
    Route::post('payment-vouchers/bulk-restore', [\App\Http\Controllers\Api\PaymentVoucherController::class, 'bulkRestore']);
    Route::post('payment-vouchers/bulk-force-delete', [\App\Http\Controllers\Api\PaymentVoucherController::class, 'bulkForceDelete']);
    Route::apiResource('payment-vouchers', \App\Http\Controllers\Api\PaymentVoucherController::class);
});
