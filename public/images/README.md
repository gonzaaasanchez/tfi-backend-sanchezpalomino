# 📸 Imágenes para Emails

Este directorio contiene las imágenes utilizadas en los templates de email.

## 🖼️ Archivos requeridos:

### `logo-pawpals.png`
- **Tamaño recomendado**: 200x200px
- **Formato**: PNG con transparencia
- **Uso**: Logo principal en el header de emails
- **Descripción**: Logo de PawPals para usar en emails de reseteo de contraseña

### `logo-pawpals-white.png` (opcional)
- **Tamaño recomendado**: 200x200px
- **Formato**: PNG con transparencia
- **Uso**: Versión blanca del logo para fondos oscuros

### `favicon.ico` (opcional)
- **Tamaño**: 32x32px
- **Formato**: ICO
- **Uso**: Favicon para emails

## 📋 Instrucciones:

1. Coloca tu logo en este directorio con el nombre `icon-pawpals.png`
2. Asegúrate de que la imagen tenga un fondo transparente
3. El tamaño recomendado es 200x200px para mejor compatibilidad
4. La imagen será accesible en: `http://localhost:3000/public/images/logo-pawpals.png`

## 🔧 Configuración:

La URL de la imagen se configura automáticamente usando la variable `BASE_URL` del archivo `.env`:

```env
BASE_URL=http://localhost:3000
```

En producción, cambia esta URL por tu dominio real. 