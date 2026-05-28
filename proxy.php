<?php
/**
 * LUXN — TalorData Google Hotels proxy
 * Upload this file to your PHP server (e.g. luxn.co.uk/proxy.php)
 * The browser calls this file; this file calls TalorData server-side.
 */

// ── CORS ────────────────────────────────────────────────────────────────────
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── TALORDATA CONFIG ─────────────────────────────────────────────────────────
define('TALORDATA_KEY', 'd3f0553493deb4ae2ad3d49f5d0eb4d3');
define('TALORDATA_URL', 'https://serpapi.talordata.net/serp/v1/request');

// ── READ PARAMS FROM GET or POST ─────────────────────────────────────────────
$input = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    if ($raw) {
        // Accept JSON body
        $decoded = json_decode($raw, true);
        $input = is_array($decoded) ? $decoded : [];
    }
    // Also merge $_POST (form-encoded)
    $input = array_merge($_POST, $input);
} else {
    $input = $_GET;
}

// ── BUILD PAYLOAD ─────────────────────────────────────────────────────────────
$defaults = [
    'engine'   => 'google_hotels',
    'json'     => '2',
    'hl'       => 'en',
    'gl'       => 'us',
    'currency' => 'EUR',
];
$data = array_merge($defaults, $input);

// Required: q (search query)
if (empty($data['q'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required param: q']);
    exit;
}

// ── CALL TALORDATA ───────────────────────────────────────────────────────────
$ch = curl_init(TALORDATA_URL);
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 20,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . TALORDATA_KEY,
        'Content-Type: application/x-www-form-urlencoded',
    ],
    CURLOPT_POSTFIELDS => http_build_query($data),
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
curl_close($ch);

if ($curlErr) {
    http_response_code(502);
    echo json_encode(['error' => 'cURL error: ' . $curlErr]);
    exit;
}

http_response_code($httpCode ?: 200);
echo $response;
