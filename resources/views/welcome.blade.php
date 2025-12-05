<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>Product Inventory Manager</title>

    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">

    <!-- Compiled CSS -->
    @if (file_exists(public_path('css/app.css')))
        <link rel="stylesheet" href="{{ mix('css/app.css') }}">
    @endif
</head>
<body>
    <nav style="background:#0d6efd;color:#fff;padding:12px 20px;">
        <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;">
            <div style="font-weight:700">Product Inventory Manager</div>
            <div>
            </div>
        </div>
    </nav>

    <main style="max-width:1100px;margin:24px auto;padding:0 16px;">
        <section>
            <div id="app" style="padding:20px;background:#fff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.08)"></div>

            <noscript>
                <div style="margin-top:12px;padding:12px;background:#fff3cd;border-radius:6px;border:1px solid #ffeeba;color:#856404">
                    JavaScript is required to run the interactive UI. Enable JavaScript and reload the page.
                </div>
            </noscript>
        </section>
    </main>

    <!-- Compiled JS -->
    @if (file_exists(public_path('js/app.js')))
        <script src="{{ mix('js/app.js') }}"></script>
    @endif
</body>
</html>
