# shared-expenses.front

Planilla de gastos compartidos con reparto proporcional al aporte de cada persona.
Angular 17 (standalone) + Tailwind CSS + Chart.js. Consume la API de `shared-expenses.service` e inicia sesión
con `shared-expenses-auth-service`.

## Ejecutar

Requiere las dos APIs corriendo: `shared-expenses.service` en `http://localhost:5080` y
`shared-expenses-auth-service` en `http://localhost:5090`.

```bash
npm install
npm start          # http://localhost:4200
npm run build      # dist/shared-expenses/browser
npm test
```

El front llama a las APIs **por su mismo origen** (`/api/...`), nunca a otro dominio: así las cookies de sesión
son del propio sitio y no hace falta CORS. Quién reenvía cada ruta:

| Ruta | Desarrollo (`proxy.conf.json` de `ng serve`) | Producción (rewrites de `render.yaml`) |
|---|---|---|
| `/api/v1/auth/*` | `http://localhost:5090` | `https://shared-expenses-auth-service.onrender.com` |
| `/api/*` (el resto) | `http://localhost:5080` | `https://shared-expenses-service.onrender.com` |

## Sesión

- **Login** (`/login`): usuario y contraseña. Sin sesión, cualquier ruta lleva a `/login`; con sesión, `/login`
  lleva a la planilla. Si la sesión expira se vuelve aquí con un aviso. Si el servidor de Render estaba dormido,
  avisa que el primer ingreso puede tardar hasta un minuto.
- **Cerrar sesión** (*Salir*, en el header): pide confirmación, revoca la sesión en la API y recarga en `/login`.

`shared-expenses-auth-service` deja la sesión en dos cookies **HttpOnly**: `auth_token` (JWT, 15 min) y
`refresh_token` (7 días, solo viaja a `/api/v1/auth`). El JavaScript del front nunca ve los tokens; solo sabe
quién es el usuario por `GET /api/v1/auth/me` (`SesionStore`).

- `sesionGuard` / `anonimoGuard` (`core/guards`): al abrir la app consultan `/me` una vez; si el access token
  venció, renuevan con `/refresh` antes de decidir.
- `authInterceptor`: si la API de gastos responde 401, renueva la sesión con `/refresh` y reintenta la llamada
  una vez. Varias llamadas con 401 a la vez comparten un solo refresh. Si no se puede renovar (refresh vencido o
  revocado), manda al login. Antes de rendirse consulta `/me`, por si otra pestaña acababa de rotar las cookies.

## Mover un gasto al próximo mes

Al editar un gasto pendiente (no fijo ni arriendo) aparece *Mover al próximo mes*: pide confirmación y la API lo pasa
al mes siguiente con "(Gasto mes anterior pendiente)" en el nombre. Si el formulario tiene cambios sin guardar, el
botón queda desactivado hasta guardarlos o descartarlos (se mueve el gasto guardado).

## Despliegue (Render, gratis)

El repo incluye `render.yaml`: en Render, **New → Blueprint** y elegir este repo. Crea un Static Site
que compila con `npm run build`, publica `dist/shared-expenses/browser` y define, en este orden, los rewrites
`/api/v1/auth/*` → servicio de auth, `/api/*` → API de gastos y `/*` → `index.html`.

Si Render asigna a alguna API una URL distinta (por ejemplo, porque el nombre ya estaba tomado), actualiza su
rewrite en `render.yaml` y haz push.

## Estructura

```
src/app
├── core
│   ├── http/          Un servicio por recurso de la API: auth, people, categories, settings, months,
│   │                  expenses, backup. Todos async con lastValueFrom.
│   ├── guards/        sesionGuard y anonimoGuard (login)
│   ├── interceptors/  authInterceptor (401 → refresh de la sesión → reintento)
│   ├── interfaces/    requests/ y responses/ (contratos de la API) + tipos de UI
│   ├── pipes/         pesoChileno, nombreMes, fechaCorta
│   ├── state/         PlanillaStore (planilla, signals y acciones) y SesionStore (login, refresh, logout)
│   └── utils/         Errores de la API, vista previa de repartos, gasto por día, fechas, toast, confirmación, colores
├── modulos
│   ├── login/             Pantalla de inicio de sesión
│   └── planilla-gastos/   Página principal + componentes (KPIs, gasto por día, categorías, tabla, modales)
└── shared/            header, toast, confirm-dialog, categoria-badge (color de la API), minigrafico
```

## Qué calcula cada lado

Los repartos por persona, los totales del mes, el porcentaje pagado, las categorías y los planes de
cuotas los calcula la API (`/months/{mes}/summary` y `split` en cada gasto). El front solo calcula una
**vista previa** en los modales antes de guardar (`RepartoService`, misma regla que la API).

La planilla soporta cualquier cantidad de personas: hay una tarjeta y una columna por persona activa.
Las personas se gestionan en Configuración (agregar, cambiar nombre/aporte, quitar).

Los errores de la API (ProblemDetails) se muestran en el toast con el primer mensaje de validación.

## Diseño

Vidrio esmerilado sobre un fondo degradado propio (`body.fondo-app` en `styles.scss`), claro u oscuro según el tema
del sistema. Clases reutilizables: `vidrio` (tarjetas), `vidrio-fuerte` (barra superior, modales, toast),
`vidrio-sutil` (filas y chips), `boton-principal` (degradado índigo → violeta) y `boton-vidrio`. La tabla de gastos y
los campos de los formularios quedan sólidos para leerlos bien.

Animaciones solo con CSS: `entrada` (aparece en cascada según `--i`), `levantar` (hover), `crecer` y `crecer-ancho`
(barras) y `dibujar` (línea del minigráfico). Se apagan con "reducir movimiento". En el teléfono el desenfoque baja
a 10 px y todo control táctil mide al menos 44 px.
