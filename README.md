# Cuida lo que te mueve

Aplicación móvil hecha con Expo (React Native), Uniwind con Tailwind CSS y Supabase. Sirve para llevar el mantenimiento de vehículos como autos, motos, bicicletas y scooters.

La app calcula el estado del próximo servicio (al día, próximo o vencido) según el kilometraje y la fecha límite, y guarda el historial y el gasto total por vehículo.

## Requisitos

- Node.js 20 o superior
- Android Studio con un emulador configurado
- Una cuenta de Supabase

## Instalación

```
npm install
```

## Variables de entorno

Crea un archivo `.env` con tus datos de Supabase:

```
EXPO_PUBLIC_SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_clave_aqui
```

## Ejecutar

```
npx expo start --go
```

Primero prueba con Expo Go. Si necesitas un APK de prueba, usa el perfil `preview` de `eas.json`:

```
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform android --profile preview
```



