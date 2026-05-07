# Codexa-WEB

## Resumen del proyecto
- Frontend Angular del hub Codexa con modulos activos como TramiYa y SIFEN.
- Usa autenticacion JWT contra backend existente.
- Mantiene landing comercial y flujos operativos por modulo.

## Cuando leer cada doc
- `docs/modules/fe-module.md`: contexto historico del modulo FE/SIFEN ya existente.
- `docs/sifen/FRONTEND-SIFEN-FLOW.md`: flujo actual del frontend SaaS SIFEN para SuperAdmin, companias, configuracion y diagnostico.

## Reglas base
- No tocar TramiYa salvo integracion visual compartida desde la landing.
- Mantener cambios chicos, compatibles y orientados a backend existente.
- Reutilizar `AuthService`, interceptor JWT y patrones PrimeNG actuales.
- Si falta endpoint publico, dejar pantalla preparada y documentar el TODO tecnico.

## No hacer
- No refactor global de layout ni auth.
- No inventar persistencia fake.
- No cambiar contratos backend existentes sin necesidad real.
