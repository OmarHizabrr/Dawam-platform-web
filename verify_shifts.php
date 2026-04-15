<?php
// Adjust paths to reach the Laravel app from dawamWeb
$laravelPath = __DIR__ . '/../../dwam_All/dawamPakend';

if (!file_exists($laravelPath . '/vendor/autoload.php')) {
    die("Cannot find Laravel autoload at $laravelPath/vendor/autoload.php");
}

require $laravelPath . '/vendor/autoload.php';
$app = require_once $laravelPath . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

// ID of the user to check (Mansour mentioned in previous prompts or just a random one)
// Let's list a few users and their assigned duration types
echo "--- Users and their Duration Types ---\n";
$users = \App\User::where('fingerprint_type', '22') // Assuming '22' is the type meant for strict attendance
            ->limit(5)
            ->get();

foreach ($users as $user) {
    echo "User: {$user->name} (ID: {$user->user_id}) - DurationTypeID: {$user->durationtype_id}\n";
    
    // Check calculated start time for a specific date
    $date = '2026-01-25'; // Use a recent date
    
    // 1. Direct DB lookup in durations table
    $duration = \DB::table('durations')
                ->where('durationtype_id', $user->durationtype_id)
                ->whereRaw("'{$date}' BETWEEN startDate AND endDate")
                ->first();
                
    echo "  -> Manual Lookup in 'durations' table for $date: ";
    if ($duration) {
        echo "Start: {$duration->startTime}, End: {$duration->endTime}\n";
    } else {
        echo "NO DURATION FOUND in table!\n";
    }
    
    // 2. Check via Stored Function (if available) - This is what calculate logic uses
    try {
        $funcResult = \DB::select("SELECT getDurationStart(?, ?) as start_time", [$date, $user->user_id]);
        echo "  -> DB Function 'getDurationStart' returns: " . ($funcResult[0]->start_time ?? 'NULL') . "\n";
        
         $funcResult2 = \DB::select("SELECT getDurationEnd(?, ?) as end_time", [$date, $user->user_id]);
        echo "  -> DB Function 'getDurationEnd' returns: " . ($funcResult2[0]->end_time ?? 'NULL') . "\n";
        
    } catch (\Exception $e) {
        echo "  -> DB Function check failed: " . $e->getMessage() . "\n";
    }
    echo "------------------------------------------------\n";
}
?>
