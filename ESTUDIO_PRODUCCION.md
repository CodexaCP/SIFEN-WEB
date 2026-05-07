# ESTUDIO PRODUCCION - ServiciosYa

Ultima revision: 2026-04-23

Objetivo estimado por Tony:
- Horizonte inicial: 3 meses.
- Concurrencia maxima esperada: 50 usuarios a la vez.
- Almacenamiento esperado: 100 GB a 200 GB entre comprobantes, adjuntos, backups y logs.
- Prioridad: barato, seguro, simple de operar y sin romper el sistema actual.

## Resumen ejecutivo

La forma mas barata y razonable para salir a produccion sin reescribir todo es:

- Dominio y DNS: Cloudflare.
- Front web Angular: Cloudflare Pages gratis o el mismo VPS si se quiere todo junto.
- Backend ASP.NET Core: VPS Windows o Linux.
- Base de datos: SQL Server Express al inicio solo si la data real de BD queda bajo 10 GB.
- Archivos: sacar comprobantes/adjuntos del disco local y llevarlos a Object Storage S3-compatible.
- SSL: Cloudflare + certificado valido en API.
- Backups: SQL backup diario + copia a Object Storage.
- Notificaciones APK: mantener polling actual como fallback; migrar a Firebase Cloud Messaging cuando backend tenga eventos.

Recomendacion practica y barata:
- Contabo Cloud VPS 20 o Cloud VPS 30.
- Contabo Object Storage 250 GB o DigitalOcean Spaces 250 GiB.
- Cloudflare Free para DNS, SSL, CDN y proteccion basica.
- Google Play Console solo si se publica en Play Store.

## Arquitectura recomendada inicial

```text
Usuario Web
   -> app.serviciosya.com
   -> Cloudflare Pages o Nginx/IIS
   -> api.serviciosya.com
   -> Backend ASP.NET Core
   -> SQL Server
   -> Object Storage para archivos

Usuario APK
   -> https://api.serviciosya.com
   -> Backend ASP.NET Core
   -> SQL Server + Object Storage
```

## Opcion mas barata viable

### Infraestructura

- Dominio: Cloudflare Registrar o Namecheap.
- DNS/SSL/CDN/WAF basico: Cloudflare Free.
- VPS: Contabo Cloud VPS 20.
- Storage: Contabo Object Storage 250 GB.
- Base de datos: SQL Server Express dentro del VPS.
- Front web: Cloudflare Pages Free.

Costo mensual aproximado:
- VPS Contabo Cloud VPS 20: EUR 7.00/mes.
- Windows Server si se usa Windows en Contabo: desde EUR 4.99/mes segun Contabo.
- Object Storage Contabo 250 GB: EUR 2.49/mes.
- Cloudflare Free: USD 0/mes.
- Front en Cloudflare Pages: USD 0/mes para estatico.

Total mensual aproximado si Windows:
- EUR 14.48/mes mas dominio anual.

Total mensual aproximado si Linux y SQL Server compatible:
- EUR 9.49/mes mas dominio anual.

Nota: si no se mueve archivos a Object Storage y se guardan localmente, usar minimo Cloud VPS 30 por 200 GB NVMe o 400 GB SSD. Es mas simple, pero menos robusto para backups y crecimiento.

## Opcion recomendada para menos dolor operativo

### Infraestructura

- Front web: Cloudflare Pages Free.
- API + SQL: VPS Windows Contabo Cloud VPS 30.
- Archivos: Object Storage 250 GB.
- DNS/SSL/CDN: Cloudflare Free.
- Backups: SQL backup diario hacia Object Storage.

Costo mensual aproximado:
- Contabo Cloud VPS 30: EUR 14.00/mes.
- Windows Server: desde EUR 4.99/mes.
- Object Storage 250 GB: EUR 2.49/mes.
- Cloudflare Free: USD 0/mes.

Total mensual aproximado:
- EUR 21.48/mes mas dominio anual.

Esta opcion da mas margen de RAM/CPU/disco para 50 usuarios concurrentes, SQL Server, API, logs y procesos de backup.

## Opcion mas estandar cloud

### Infraestructura

- DigitalOcean Droplet Basic 4 GB RAM / 2 vCPU / 80 GB SSD: USD 24/mes.
- DigitalOcean Spaces 250 GiB: USD 5/mes.
- Front web: Cloudflare Pages Free.
- DNS/SSL: Cloudflare Free.

Total mensual aproximado:
- USD 29/mes mas dominio anual.

Ventaja: proveedor simple y documentado.
Desventaja: mas caro que Contabo y hay que resolver SQL Server con cuidado.

## Dominio

Recomendacion:
- Comprar dominio en Cloudflare si el dominio esta disponible y el TLD sirve.
- Alternativa: Namecheap si hay promo de primer ano.

Estimacion:
- Cloudflare vende dominios a costo, sin markup, con DNS y SSL integrados.
- Namecheap muestra precios promocionales bajos para primer ano, pero la renovacion puede ser mas alta.

Para marca:
- `serviciosya.com` si esta disponible.
- Alternativas: `serviciosya.com.py`, `serviciosya.app`, `serviciosya.online`.

Subdominios recomendados:
- `app.serviciosya.com` para front web.
- `api.serviciosya.com` para backend.
- `cdn.serviciosya.com` o bucket publico firmado para archivos, si aplica.

## Base de datos

El sistema actual usa SQL Server. Para salir rapido:
- SQL Server Express puede servir al inicio si la base real no supera 10 GB.
- No guardar archivos binarios dentro de SQL.
- Guardar solo rutas/metadatos de archivos.
- Monitorear tamano de MDF semanalmente.

Riesgo:
- SQL Server Express tiene limite de 10 GB por base de datos. Si crece el modulo o se agregan mas tenants, habra que migrar a SQL Server Standard/Web, Azure SQL, o cambiar estrategia de base administrada.

## Archivos y storage

No recomiendo guardar 100 GB o 200 GB de comprobantes en el mismo disco de la API como estrategia final.

Recomendado:
- Object Storage S3-compatible.
- Guardar en SQL solo:
  - requestId
  - nombreArchivo
  - ruta/URL
  - tamanoBytes
  - contentType
  - fechaSubida
  - usuario
  - tenant

Opciones:
- Contabo Object Storage 250 GB: EUR 2.49/mes.
- DigitalOcean Spaces 250 GiB: USD 5/mes e incluye 1 TiB transferencia.

## Seguridad minima antes de publicar

- HTTPS real en `api.serviciosya.com`.
- JWT con `Issuer`, `Audience`, `Key` seguros desde variables de entorno.
- CORS cerrado solo a `app.serviciosya.com`.
- Rate limiting en login/register.
- Password hash fuerte.
- Backups automaticos.
- Logs sin passwords ni tokens.
- Usuario SQL con permisos minimos, no usar `sa`.
- Firewall: abrir solo 80/443/RDP si es Windows; RDP restringido por IP si se puede.
- Cloudflare proxy activo para web.
- Para API, usar Cloudflare si no rompe WebSockets/payloads, o al menos DNS + SSL.

## Pasos desde cero

1. Comprar dominio.
2. Pasar DNS a Cloudflare.
3. Crear registros:
   - `app` -> Cloudflare Pages o IP del VPS.
   - `api` -> IP del VPS.
4. Crear VPS.
5. Instalar runtime:
   - .NET 8 Hosting Bundle si Windows/IIS.
   - SQL Server Express o instancia SQL seleccionada.
6. Crear base de datos `EncomiendasDB`.
7. Restaurar backup de produccion inicial.
8. Configurar variables de entorno del backend:
   - ConnectionStrings
   - Jwt Key/Issuer/Audience
   - Storage provider
   - CORS origins
9. Publicar backend en IIS o servicio Windows.
10. Configurar SSL.
11. Publicar front Angular con `environment.prod.ts` apuntando a `https://api.serviciosya.com/api`.
12. Compilar APK release apuntando a `https://api.serviciosya.com/`.
13. Probar flujos:
   - login
   - registro
   - crear solicitud
   - subir comprobante
   - subir adjunto
   - validar pago
   - cambiar estado
   - notificacion en APK
14. Configurar backups diarios.
15. Configurar monitoreo basico.

## APK en produccion

Antes de distribuir:
- Quitar IP LAN.
- Usar API publica HTTPS.
- No permitir certificados inseguros en release.
- Firmar APK/AAB con keystore de produccion.
- Guardar keystore fuera del repo.
- Subir versionCode en cada build.
- Si se publica en Google Play, crear cuenta Play Console y completar verificacion.

## Notificaciones

Estado actual:
- APK tiene notificaciones por polling controlado.
- Funciona mientras la app esta viva o vuelve al foreground.

Produccion ideal:
- Firebase Cloud Messaging.
- Backend guarda token de dispositivo por usuario.
- Backend envia push cuando cambia `ServiceRequests.Status` o `ServiceRequestPayments.Status`.
- Mantener polling como fallback.

Firebase Cloud Messaging figura como producto sin costo en la pagina de precios de Firebase.

## Costos estimados

### Minimo barato

| Concepto | Opcion | Costo |
|---|---:|---:|
| VPS | Contabo Cloud VPS 20 | EUR 7.00/mes |
| Windows | Licencia Contabo si aplica | desde EUR 4.99/mes |
| Object Storage | Contabo 250 GB | EUR 2.49/mes |
| DNS/SSL/CDN | Cloudflare Free | USD 0 |
| Front web | Cloudflare Pages Free | USD 0 |
| Dominio | Cloudflare/Namecheap | aprox USD 9-18/ano |

Total: aprox EUR 9.49 a EUR 14.48/mes + dominio.

### Recomendado para 50 concurrentes

| Concepto | Opcion | Costo |
|---|---:|---:|
| VPS | Contabo Cloud VPS 30 | EUR 14.00/mes |
| Windows | Licencia Contabo si aplica | desde EUR 4.99/mes |
| Object Storage | Contabo 250 GB | EUR 2.49/mes |
| DNS/SSL/CDN | Cloudflare Free | USD 0 |
| Front web | Cloudflare Pages Free | USD 0 |
| Dominio | Cloudflare/Namecheap | aprox USD 9-18/ano |

Total: aprox EUR 16.49 a EUR 21.48/mes + dominio.

### Alternativa DigitalOcean

| Concepto | Opcion | Costo |
|---|---:|---:|
| VPS | Droplet 4 GB / 2 vCPU / 80 GB | USD 24/mes |
| Object Storage | Spaces 250 GiB | USD 5/mes |
| DNS/SSL/CDN | Cloudflare Free | USD 0 |
| Front web | Cloudflare Pages Free | USD 0 |

Total: aprox USD 29/mes + dominio.

## Riesgos importantes

- SQL Server Express puede quedarse corto si la base crece mas de 10 GB.
- Guardar archivos en disco local complica backup y escalabilidad.
- Un solo VPS es barato pero no es alta disponibilidad.
- Si el dominio/API no tienen HTTPS real, Android release no debe usar bypass SSL.
- Si se deja CORS abierto, se baja seguridad.
- Si no hay backup probado, no hay produccion real.

## Roadmap recomendado

### Semana 1
- Dominio, DNS Cloudflare, VPS, SSL.
- Deploy backend y web.
- APK release contra API publica.
- Backup diario.

### Mes 1
- Object Storage para adjuntos.
- Rate limiting.
- Logs estructurados.
- Monitoreo uptime.

### Mes 2
- Firebase Cloud Messaging.
- Centro de notificaciones.
- Auditoria de seguridad.

### Mes 3
- Revisar crecimiento SQL.
- Decidir si seguir con SQL Express o migrar a SQL administrado/licenciado.
- Separar API y base si la carga sube.

## Fuentes consultadas

- Cloudflare Registrar: https://www.cloudflare.com/products/registrar/
- Cloudflare SSL/TLS Free: https://www.cloudflare.com/application-services/products/ssl/
- Cloudflare Pages limits: https://developers.cloudflare.com/pages/platform/limits/
- Namecheap domain prices: https://www.namecheap.com/domains/
- Contabo pricing: https://contabo.com/en/pricing/
- Contabo Windows license: https://contabo.com/en-us/windows-licenses/
- DigitalOcean Droplets pricing: https://www.digitalocean.com/pricing/droplets
- DigitalOcean Spaces pricing: https://docs.digitalocean.com/products/spaces/details/pricing/
- Azure SQL serverless overview: https://learn.microsoft.com/en-us/azure/azure-sql/database/serverless-tier-overview
- SQL Server Express 10 GB limit discussion: https://learn.microsoft.com/en-us/answers/questions/315117/sql-server-express-database-size-limit-total-or-us
- Firebase pricing / FCM no-cost: https://firebase.google.com/pricing
- Google Play Console registration guide: https://developer.android.com/developer-verification/guides/google-play-console

