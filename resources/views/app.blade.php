<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Favicon - será sobrescrito pelo JavaScript caso exista um personalizado -->
        <link id="favicon" rel="icon" type="image/png" href="{{ asset('favicon.ico') }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
        
        <!-- Script para definir o favicon dinâmico -->
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                // Verifica se existem dados de branding no window.__INITIAL_DATA__
                if (window.__INITIAL_DATA__ && window.__INITIAL_DATA__.props && window.__INITIAL_DATA__.props.branding && window.__INITIAL_DATA__.props.branding.favicon) {
                    const favicon = document.getElementById('favicon');
                    if (favicon) {
                        favicon.href = window.__INITIAL_DATA__.props.branding.favicon;
                    }
                }
            });
        </script>
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
