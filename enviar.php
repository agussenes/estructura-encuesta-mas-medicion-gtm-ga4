<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $url = "https://script.google.com/macros/s/AKfycbwmMx6xBCUqbWjeVNs9j4gE5EEUY15HXkVVj8SD8bU-ed_5w0uE5EfSzn2a8tS6uaBJ/exec";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    // Intentamos decodificar la respuesta
    $decoded = json_decode($response, true);

  if ($httpCode == 200 && strpos($response, '"success":true') !== false) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error al conectar con Google Sheets',
        'debug' => $response ?: $curlError
    ]);
}

}
