<!-- scope: sifen-frontend | relevant for: landing, login, companies, tenant, diagnostic, config -->

# Frontend SIFEN Flow

## Purpose

Cerrar el frontend minimo SaaS del modulo SIFEN dentro de Codexa-WEB usando el backend ya disponible para autenticacion, companias, plan, admin de compania y diagnostico FE.

## Data model

- `AuthService`
- `SifenPlatformService`
- `SessionUser`
- `SifenCompanySummary`
- `SifenCompanyDetail`
- `SifenDiagnosticResult`

## API / endpoints

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/platform/companies`
- `POST /api/platform/companies`
- `GET /api/platform/companies/{tenantId}`
- `PUT /api/platform/companies/{tenantId}/plan`
- `POST /api/platform/companies/{tenantId}/admins`
- `GET /api/fe/diagnostic/{tenantId}`

## Business rules

- El acceso parte desde la landing de Codexa.
- La landing mantiene TramiYa y expone SIFEN como modulo activo.
- El CTA `Entrar a SIFEN` navega a `/sifen/login`.
- El login SIFEN usa JWT con `POST /api/auth/login`.
- Luego consulta `GET /api/auth/me`.
- Solo `SuperAdmin` puede entrar al arbol `/sifen/admin/*`.
- Si no hay token, las rutas SIFEN protegidas redirigen a `/sifen/login`.
- Si el usuario autenticado no es `SuperAdmin`, no accede a la administracion de companias.
- La ruta principal del modulo es `/sifen/admin/companies`.
- El listado muestra companias, estado, plan y acceso al detalle.
- La creacion de compania usa defaults comerciales:
  - `150` facturas por mes
  - `5` usuarios
- El detalle de compania permite:
  - editar plan
  - crear admin
  - ir a configuracion SIFEN
  - ver diagnostico
- La pantalla de configuracion SIFEN existe como vista real, pero no persiste si no hay endpoint publico completo.
- El diagnostico consume el endpoint real y muestra:
  - listo o no listo
  - faltantes
  - advertencias
  - ultimo error

## Constraints

- No tocar TramiYa.
- No hacer refactor global.
- No inventar guardado falso para configuracion SIFEN.
- Mantener estilo Codexa con identidad SIFEN propia en gradiente azul cielo.

## Edge cases

- Si `auth/me` falla luego del login, se limpia sesion y se muestra error.
- Si el rol llega con formato distinto, el frontend normaliza variantes comunes para detectar `SuperAdmin`.
- Si el backend responde errores de contrato, el frontend muestra mensaje corto sin romper la vista.
- Si configuracion SIFEN aun no tiene endpoint publico, el usuario ve la pantalla preparada con TODO tecnico explicito.

## Flujo por pantalla

### 1. Entrada desde landing

- Ruta: `/landing`
- Accion: boton `Entrar a SIFEN`
- Resultado: navegacion a `/sifen/login`

### 2. Login

- Ruta: `/sifen/login`
- Usuario sugerido: `admin@sifen.local`
- Flujo:
  - login JWT
  - consulta de perfil
  - redireccion a `/sifen/admin/companies` si es SuperAdmin

### 3. Pantalla companias

- Ruta: `/sifen/admin/companies`
- Permite:
  - listar companias
  - ver estado
  - ver plan
  - entrar al detalle
  - ir a crear compania

### 4. Creacion de compania

- Ruta: `/sifen/admin/companies/new`
- Campos:
  - slug
  - nombre comercial
  - limite facturas mes
  - limite usuarios

### 5. Detalle de compania

- Ruta: `/sifen/admin/companies/{tenantId}`
- Acciones:
  - editar plan
  - crear admin
  - abrir configuracion SIFEN
  - abrir diagnostico

### 6. Configuracion

- Ruta: `/sifen/admin/companies/{tenantId}/sifen-config`
- Estado:
  - interfaz lista
  - sin persistencia simulada
  - TODO tecnico visible para endpoint faltante

### 7. Diagnostico

- Ruta: `/sifen/admin/companies/{tenantId}/diagnostic`
- Fuente: `GET /api/fe/diagnostic/{tenantId}`

## Que falta para emision real

- Endpoint publico para guardar configuracion SIFEN por tenant.
- Integrar esa configuracion con flujo de emision real FE.
- Reconectar modulo de emision/listado FE antiguo al tenant configurado cuando el onboarding administrativo quede cerrado.
