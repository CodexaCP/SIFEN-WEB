<!-- scope: sifen-visual | relevant for: sifen, frontend, ui, dashboard, invoices, wizard, kude -->

# SIFEN Visual Redesign

## Purpose

Definir la identidad visual propia de SIFEN dentro de Codexa-WEB sin cambiar rutas, guards, servicios ni contratos backend.

## Data model

- `SifenPlatformService` para rol, tenant activo, companias, diagnostico, configuracion y plantilla KuDE.
- `FeInvoiceApiService` para listado, emision, detalle, XML, KuDE y resumen de plan.
- `SessionUser` para saludo y permisos visuales por rol.

## API / endpoints

- No agrega endpoints nuevos.
- Reutiliza:
  - `GET /api/platform/companies`
  - `GET /api/platform/companies/{tenantId}`
  - `GET /api/fe/diagnostic/{tenantId}`
  - `GET /api/fe/plan/{tenantId}`
  - `POST /api/fe/invoices`
  - `GET /api/fe/invoices/status/{cdc}`
  - `GET /api/fe/invoices/{id}/xml`
  - `GET /api/fe/invoices/{id}/kude`
  - `GET /invoice/`
  - `GET /invoice/{id}`

## Business rules

- Desde `/sifen/*` la experiencia debe verse como una app SaaS clara y separada de TramiYa.
- `Codexa` sigue siendo la plataforma madre y puede aparecer como `Powered by Codexa`.
- El shell SIFEN usa:
  - sidebar blanco
  - topbar con gradiente turquesa, azul y violeta
  - cards blancas con sombras suaves
- Los menus visibles respetan rol actual:
  - `SuperAdmin`: dashboard y administracion global
  - `TenantAdmin`: dashboard, facturas, configuracion y diagnostico
  - `Operator`: emision y facturas
- El dashboard usa datos reales disponibles para:
  - metricas de facturas
  - limite mensual
  - ultimas facturas
  - diagnostico rapido
- La emision mantiene la logica existente y solo agrega:
  - wizard visual
  - bloqueo claro por configuracion incompleta
  - preview KuDE de prueba
- La tabla de facturas aplica filtros locales en frontend sin cambiar el backend.
- El detalle de factura muestra mensajes humanos y evita exponer trazas crudas.

## Constraints

- No tocar TramiYa funcionalmente.
- No cambiar rutas existentes.
- No romper guards, servicios ni endpoints.
- No simular aprobaciones reales.
- No llamar SIFEN real desde la UI.
- Si falta dato backend, mostrar `No disponible todavia`.

## Edge cases

- Usuario sin tenant activo ve fallback operativo en dashboard, integracion y emision.
- `SuperAdmin` sin compania seleccionada ve administracion global sin forzar datos falsos.
- Diagnostico incompleto bloquea confirmacion visual de emision.
- El preview KuDE de wizard y configuracion sigue marcado como prueba y no comprobante valido.
