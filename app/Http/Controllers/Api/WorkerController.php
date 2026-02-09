<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class WorkerController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->tenant->workers;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'image' => 'nullable|string',
            'email' => 'nullable|email',
            'mobile' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        return $request->user()->tenant->workers()->create($validated);
    }

    public function show(Request $request, string $id)
    {
        return $request->user()->tenant->workers()->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $worker = $request->user()->tenant->workers()->findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string',
            'image' => 'nullable|string',
            'email' => 'nullable|email',
            'mobile' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $worker->update($validated);
        return $worker;
    }

    public function destroy(Request $request, string $id)
    {
        $worker = $request->user()->tenant->workers()->findOrFail($id);
        $worker->delete();
        return response()->json(['message' => 'Worker deleted']);
    }
}
