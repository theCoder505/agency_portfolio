<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>503 - Service Unavailable | CodeVenture Tech</title>
    <link rel="preconnect" href="https://api.fontshare.com">
    <link href="https://api.fontshare.com/v2/css?f[]=satoshi@900,800,700,600,500,400&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Satoshi', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    <style>
        body {
            font-family: 'Satoshi', sans-serif;
            background-color: #020617;
            color: #f8fafc;
        }
        @keyframes cv-pulse {
            0%, 100% { transform: scale(1); opacity: 0.2; }
            50% { transform: scale(1.1); opacity: 0.35; }
        }
        .animate-cv-pulse {
            animation: cv-pulse 6s ease-in-out infinite;
        }
    </style>
</head>
<body class="min-h-screen flex flex-col justify-between relative overflow-x-hidden selection:bg-purple-500 selection:text-slate-950">

    <!-- Ambient glowing backdrop -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[550px] rounded-full blur-[140px] bg-purple-500/20 animate-cv-pulse"></div>
        <div class="absolute -bottom-32 right-1/4 w-[550px] h-[450px] rounded-full blur-[140px] bg-indigo-600/20"></div>
        <div class="absolute inset-0 opacity-[0.03]" style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 48px 48px;"></div>
    </div>

    <!-- Header -->
    <header class="relative z-20 w-full px-6 py-4 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-purple-500/20">
                    CV
                </div>
                <span class="font-extrabold text-lg tracking-tight text-white">CodeVenture Tech</span>
            </a>
            <div class="px-3 py-1 rounded-full border border-slate-800 bg-slate-900/90 text-xs font-semibold text-slate-300">
                🔧 Infrastructure Maintenance
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 flex-grow flex flex-col items-center justify-center px-4 py-16 text-center">
        <div class="w-full max-w-3xl mx-auto flex flex-col items-center">
            
            <!-- Status Badge -->
            <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-slate-800 bg-slate-900/80 backdrop-blur-md mb-6">
                <span class="flex h-2.5 w-2.5 relative">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
                </span>
                <span class="text-xs font-mono font-bold tracking-wider uppercase text-slate-300">
                    HTTP 503 // SERVICE UPGRADE ACTIVE
                </span>
            </div>

            <!-- Number -->
            <div class="relative select-none my-2">
                <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[140px] sm:text-[220px] font-black tracking-tighter text-purple-500/15 blur-md">
                    503
                </span>
                <h1 class="text-[90px] sm:text-[160px] font-black tracking-tight leading-none bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-500 bg-clip-text text-transparent">
                    503
                </h1>
            </div>

            <h2 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                System Maintenance in Progress
            </h2>
            <p class="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-8">
                We are applying scheduled architectural upgrades. All services will resume full speed in a few moments.
            </p>

            <!-- Action buttons -->
            <div class="w-full max-w-xl bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                <div class="flex flex-wrap items-center justify-center gap-3.5">
                    <button onclick="window.location.reload()" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all">
                        Refresh Page
                    </button>
                    <a href="/" class="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-700 bg-slate-800/70 hover:bg-slate-700/80 text-slate-200 hover:text-white font-semibold text-sm transition-all">
                        Back to Home
                    </a>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="relative z-20 w-full py-4 border-t border-slate-900/80 bg-slate-950/60 text-center text-xs text-slate-600">
        <p>© {{ date('Y') }} CodeVenture Tech. All rights reserved.</p>
    </footer>

</body>
</html>
