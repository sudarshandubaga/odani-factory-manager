<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class WorkTypeController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->tenant->workTypes;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
        ]);

        return $request->user()->tenant->workTypes()->create($validated);
    }

    public function show(Request $request, string $id)
    {
        return $request->user()->tenant->workTypes()->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $workType = $request->user()->tenant->workTypes()->findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string',
        ]);

        $workType->update($validated);
        return $workType;
    }

    public function destroy(Request $request, string $id)
    {
        $workType = $request->user()->tenant->workTypes()->findOrFail($id);
        $workType->delete();
        return response()->json(['message' => 'Work type deleted']);
    }
}
