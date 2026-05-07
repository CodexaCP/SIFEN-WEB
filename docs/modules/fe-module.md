<!-- scope: frontend-fe | relevant for: angular, fe-module, api, landing -->

# FE Module

## Purpose

Crear un modulo Angular FE con listado, emision y detalle integrado al backend FE simple.

## Data model

- `FeInvoiceApiService`
- `FeInvoiceListItem`
- `FeInvoiceDetail`
- `FeCreateInvoiceResult`

## API / endpoints

- Ruta demo publica disponible en `/fe`.
- Alias de acceso comercial disponible en `/sifen` y `/sifen/login`.
- `POST /api/fe/invoices`
- `GET /api/fe/invoices/status/{cdc}`
- `GET /api/fe/invoices/{id}/xml`
- `GET /api/fe/invoices/{id}/kude`
- `GET /invoice/`
- `GET /invoice/{id}`
- `GET /api/fe/plan/{tenantId}`

## Business rules

- El landing principal de Codexa funciona como hub y arranca por defecto en `/landing`.
- La seccion `companies` muestra dos modulos activos:
  - `TramiYa`
  - `SIFEN`
- Cada card activa tiene CTA directo:
  - `Entrar a TramiYa`
  - `Entrar a SIFEN`
- `Entrar a SIFEN` navega a `/sifen/login`.
- `/sifen/login` usa autenticacion basica reutilizando el `AuthService` compartido.
- Si el login es correcto, el usuario entra al listado FE en `/sifen`.
- Las rutas operativas de `/sifen` quedan protegidas con guard simple de sesion.
- El listado FE expone:
  - fecha
  - cliente
  - monto
  - estado
  - CDC
- Los estados se muestran con color operativo:
  - `aprobado = verde`
  - `rechazado = rojo`
  - `pendiente = amarillo`
  - `error = gris`
- El listado y detalle muestran un mensaje corto visible por estado.
- El listado FE incluye acciones reales de:
  - ver detalle
  - descargar XML
  - descargar KuDE
- La pantalla `Emitir factura` usa formulario FE simple con:
  - cliente
  - RUC
  - items dinamicos
  - total calculado en UI
- La emision usa el endpoint simple FE y luego consulta estado por CDC.
- El detalle consulta el backend y permite descargar XML/KuDE.
- El boton `Reintentar` solo aparece para errores tecnicos retry-safe.
- No aparece para `aprobado` ni para `rechazado`.
- El listado puede mostrar plan actual del tenant usando `?tenantId=<guid>` en la URL.
- Si el limite mensual fue alcanzado, el panel muestra alerta visible.
- El uso real de usuarios no existe aun en este modulo; se muestra `TODO` controlado.
- Si el tenant esta inactivo, FE queda en modo solo lectura y muestra `Plan vencido`.
- En ese estado se bloquean emision y retry desde frontend.
- Mientras no exista configuracion FE por tenant desde frontend, la emision usa defaults temporales:
  - `environment = Test`
  - `establishmentCode = 001`
  - `expeditionPointCode = 001`
  - `currency = PYG`
  - `vatType = Vat10`
  - `emisorDireccion = TODO`

## Constraints

- No toca el landing global.
- No implementa configuracion FE por tenant en esta fase.

## Edge cases

- detalle abierto con `id` inexistente.
- backend sin contexto tenant retorna error operativo visible.
- KuDE puede devolver placeholder controlado.
