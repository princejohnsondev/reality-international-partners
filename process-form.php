<?php
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: contact.html");
    exit;
}

$name = trim($_POST["name"] ?? "");
$email = trim($_POST["email"] ?? "");
$organisation = trim($_POST["organisation"] ?? "");
$phone = trim($_POST["phone"] ?? "");
$subject = trim($_POST["subject"] ?? "General enquiry");
$message = trim($_POST["message"] ?? "");

$valid = $name !== "" && $message !== "" && filter_var($email, FILTER_VALIDATE_EMAIL);
if (!$valid) {
    http_response_code(422);
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode(["ok" => false]);
    exit;
}

$to = "info@realityinternationalandpartners.com";
$clean = function ($value) {
    return str_replace(["\r", "\n"], " ", $value);
};

$body = "Name: {$name}\nEmail: {$email}\nOrganisation: {$organisation}\nPhone: {$phone}\nSubject: {$subject}\n\n{$message}\n";
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "From: Reality International & Partners <info@realityinternationalandpartners.com>\r\n";
$headers .= "Reply-To: " . $clean($email) . "\r\n";

$sent = mail($to, "Website enquiry: " . $clean($subject), $body, $headers);

header("Content-Type: application/json; charset=UTF-8");
if ($sent) {
    echo json_encode(["ok" => true]);
    exit;
}

http_response_code(500);
echo json_encode(["ok" => false]);
