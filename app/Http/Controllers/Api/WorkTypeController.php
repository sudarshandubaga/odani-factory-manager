<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class WorkTypeController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->tenant->workTypes()->with('parent')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'parent_id' => 'nullable|exists:work_types,id',
        ]);

        return $request->user()->tenant->workTypes()->create($validated);
    }

    public function show(Request $request, string $id)
    {
        return $request->user()->tenant->workTypes()->with('parent')->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $workType = $request->user()->tenant->workTypes()->findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string',
            'parent_id' => 'nullable|exists:work_types,id',
        ]);

        $workType->update($validated);
        return $workType->load('parent');
    }

    public function destroy(Request $request, string $id)
    {
        $workType = $request->user()->tenant->workTypes()->findOrFail($id);
        $workType->delete();
        return response()->json(['message' => 'Work type deleted']);
    }
}
