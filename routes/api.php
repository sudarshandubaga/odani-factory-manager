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

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);

    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('workers', WorkerController::class);
    Route::apiResource('work-types', WorkTypeController::class);
    Route::apiResource('purchases', PurchaseController::class);
    Route::apiResource('work-orders', WorkOrderController::class);
});
