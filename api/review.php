<?php
// api/review.php — токен только на сервере
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Токены берём из окружения; fallback — на случай, если env не настроен
$TG_TOKEN   = getenv('TG_TOKEN')   ?: '8979084313:AAH5LtdHYApK1mO-VWrUQhkbAtniUHkED_Y';
$TG_CHAT_ID = getenv('TG_CHAT_ID') ?: '7310945290';

// Разрешаем только POST
//if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    //http_response_code(405);
    //echo '{"ok":false,"error":"method_not_allowed"}';
    //exit;
}

// Ограничение размера тела (защита от мусора)
$data = $_POST;

// Простой rate-limit: не более 3 отзывов с IP за 10 минут
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rlFile = sys_get_temp_dir() . '/review_rl_' . md5($ip);
$now = time();
$hits = [];
if (is_file($rlFile)) {
    $hits = json_decode((string)file_get_contents($rlFile), true) ?: [];
}
$hits = array_values(array_filter($hits, fn($t) => $now - $t < 600));
if (count($hits) >= 3) {
    http_response_code(429);
    echo '{"ok":false,"error":"rate_limited"}';
    exit;
}
$hits[] = $now;
@file_put_contents($rlFile, json_encode($hits), LOCK_EX);

// Валидация (не доверяем клиенту)
$name   = trim((string)($data['name']  ?? ''));
$phone  = trim((string)($data['phone'] ?? ''));
$text   = trim((string)($data['text']  ?? ''));
$rating = (int)($data['rating'] ?? 0);
$page   = trim((string)($data['page']  ?? ''));

if (mb_strlen($name) < 2 || mb_strlen($name) > 60
    || mb_strlen($text) < 10 || mb_strlen($text) > 1000
    || $rating < 1 || $rating > 5) {
    http_response_code(422);
    echo '{"ok":false,"error":"validation"}';
    exit;
}

if (mb_strlen($phone) > 30) { $phone = mb_substr($phone, 0, 30); }
if (mb_strlen($page)  > 300) { $page  = mb_substr($page, 0, 300); }

// Экранируем HTML-символы, чтобы Telegram не парсил разметку
$esc = fn($s) => htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

$stars = str_repeat('★', $rating) . str_repeat('☆', 5 - $rating);

$msg = "📝 Новый отзыв с сайта\n\n"
     . "👤 {$esc($name)}\n"
     . "⭐ {$stars} ({$rating}/5)\n"
     . ($phone !== '' ? "📞 {$esc($phone)}\n" : '')
     . "💬 {$esc($text)}\n\n"
     . "🔗 {$esc($page)}";

$payload = http_build_query([
    'chat_id' => $TG_CHAT_ID,
    'text'    => $msg,
    'disable_web_page_preview' => 'true',
]);

$ch = curl_init("https://api.telegram.org/bot{$TG_TOKEN}/sendMessage");
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 10,
    CURLOPT_CONNECTTIMEOUT => 5,
]);
$res  = curl_exec($ch);
$code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err  = curl_error($ch);
curl_close($ch);

if ($code === 200) {
    echo '{"ok":true}';
    exit;
}

error_log('[review.php] Telegram error: HTTP ' . $code . ' ' . $err);
http_response_code(502);
echo '{"ok":false,"error":"telegram"}';