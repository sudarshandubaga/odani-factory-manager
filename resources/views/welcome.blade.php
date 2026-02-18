<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laravel + React App</title>
</head>

<body>
    <div id="root"></div> <!-- React will mount here -->
    @viteReactRefresh
    @vite('resources/js/index.tsx') <!-- Vite loads React app -->
</body>

</html>