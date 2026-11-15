<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>لوحة التحكم | مكتبة قلم CH</title>

    <!-- Cairo Google Font for Arabic UI -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Cairo', system-ui, -apple-system, sans-serif;
        }

        body {
            background-color: #F8FAFC;
            color: #1E293B;
            direction: rtl;
            text-align: right;
            overflow-x: hidden;
        }
    </style>

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/admin/main.jsx'])
</head>

<body>
    <div id="admin-root"></div>
</body>

</html>