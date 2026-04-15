<?php
require 'e:/alhiqma/dwam_All/dawamPakend/vendor/autoload.php';
$app = require_once 'e:/alhiqma/dwam_All/dawamPakend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$res = DB::select("SHOW CREATE FUNCTION getMinutePrice");
print_r($res);
