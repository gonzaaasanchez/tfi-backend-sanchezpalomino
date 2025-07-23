# Configuraciones del Sistema

Este documento describe el sistema de configuraciones del backend que permite gestionar parámetros del sistema de forma dinámica.

## Descripción General

El sistema de configuraciones permite almacenar y gestionar parámetros del sistema que pueden ser modificados sin necesidad de reiniciar el servidor. Todas las configuraciones se manejan desde el backend y no se pueden agregar ni eliminar desde el frontend.

## Modelo de Datos

### Config

```typescript
interface IConfig {
  key: string;           // Clave única de la configuración
  value: any;           // Valor de la configuración
  type: 'number' | 'string' | 'boolean' | 'object';  // Tipo de dato
  description: string;   // Descripción de la configuración
  isSystem: boolean;     // Indica si es una configuración del sistema
  createdAt: Date;       // Fecha de creación
  updatedAt: Date;       // Fecha de última actualización
}
```

## Endpoints

### GET /api/config

Obtiene todas las configuraciones del sistema.

**Permisos requeridos:** `config.read`

**Respuesta:**
```json
{
  "success": true,
  "message": "Configuraciones obtenidas exitosamente",
  "data": [
    {
      "id": "config_id",
      "key": "system_commission",
      "value": 6,
      "type": "number",
      "description": "Comisión del sistema en porcentaje (ej: 6 = 6%)",
      "isSystem": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### PUT /api/config

Actualiza todas las configuraciones del sistema a la vez.

**Permisos requeridos:** `config.update`

**Body:**
```json
{
  "configs": [
    {
      "key": "system_commission",
      "value": 8,
      "type": "number",
      "description": "Comisión del sistema en porcentaje (ej: 8 = 8%)"
    }
  ]
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Configuraciones actualizadas exitosamente",
  "data": [
    {
      "id": "config_id",
      "key": "system_commission",
      "value": 8,
      "type": "number",
      "description": "Comisión del sistema en porcentaje (ej: 8 = 8%)",
      "isSystem": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/config/template

Obtiene un template de todas las configuraciones con valores nulos para facilitar la edición.

**Permisos requeridos:** `config.read`

**Respuesta:**
```json
{
  "success": true,
  "message": "Template de configuraciones obtenido exitosamente",
  "data": [
    {
      "key": "system_commission",
      "value": null,
      "type": "number",
      "description": "Comisión del sistema en porcentaje (ej: 6 = 6%)"
    }
  ]
}
```

## Configuraciones del Sistema

### system_commission
- **Tipo:** `number`
- **Descripción:** Comisión del sistema en porcentaje (ej: 6 = 6%)
- **Valor por defecto:** 6
- **Uso:** Se utiliza para calcular la comisión que se cobra en las reservas

## Permisos

Los permisos para configuraciones se manejan a través del sistema de roles:

- `config.read`: Permite leer las configuraciones
- `config.update`: Permite actualizar las configuraciones

### Roles con permisos de configuración:

- **Superadmin:** Tiene acceso completo a leer y actualizar configuraciones
- **User:** No tiene acceso a configuraciones

## Auditoría

Todas las modificaciones a las configuraciones se registran en el sistema de auditoría con:

- Usuario que realizó el cambio
- Fecha y hora del cambio
- Configuración modificada
- Valores anteriores y nuevos

## Scripts de Inicialización

### createConfigs.ts

Script para crear o actualizar las configuraciones del sistema:

```bash
npm run ts-node scripts/createConfigs.ts
```

Este script:
- Crea las configuraciones iniciales del sistema
- Actualiza configuraciones existentes si es necesario
- Muestra todas las configuraciones al finalizar

## Validaciones

### Validación de Tipos

El sistema valida que el tipo declarado coincida con el valor proporcionado:

- `number`: Debe ser un número válido
- `string`: Debe ser una cadena de texto
- `boolean`: Debe ser true o false
- `object`: Debe ser un objeto válido (no null)

### Validación de Estructura

- Cada configuración debe tener una clave única
- El valor no puede ser null o undefined
- La descripción es obligatoria
- Solo se pueden actualizar configuraciones existentes

## Ejemplos de Uso

### Obtener la comisión del sistema

```javascript
const response = await fetch('/api/config');
const configs = response.data;
const commission = configs.find(c => c.key === 'system_commission').value;
```

### Actualizar la comisión del sistema

```javascript
const response = await fetch('/api/config/template');
const template = response.data;

// Modificar el valor deseado
template.find(c => c.key === 'system_commission').value = 8;

// Enviar actualización
await fetch('/api/config', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ configs: template })
});
```

## Consideraciones de Seguridad

- Solo usuarios con permisos `config.update` pueden modificar configuraciones
- Todas las modificaciones se registran en auditoría
- Las configuraciones del sistema no se pueden eliminar
- Se valida el tipo de datos antes de guardar 