# shared-expenses.front

Planilla de gastos compartidos con reparto proporcional al aporte de cada persona.
Angular 17 (standalone) + Tailwind CSS + Chart.js. Consume la API de `shared-expenses.service`.

## Ejecutar

Requiere la API corriendo (por defecto en `http://localhost:5080`, ver `shared-expenses.service`).

```bash
npm install
npm start          # http://localhost:4200
npm run build      # dist/shared-expenses/browser
npm test
```

La URL de la API depende del entorno:

| Archivo | Se usa en | URL |
|---|---|---|
| `src/environments/environment.development.ts` | `npm start` / `ng serve` | `http://localhost:5080/` |
| `src/environments/environment.ts` | `npm run build` (producción) | `https://shared-expenses-service.onrender.com/` |

La API debe tener el origen del front en `Cors:AllowedOrigins`.

## Despliegue (Render, gratis)

El repo incluye `render.yaml`: en Render, **New → Blueprint** y elegir este repo. Crea un Static Site
que compila con `npm run build`, publica `dist/shared-expenses/browser` y redirige todas las rutas a
`index.html`.

Si Render asigna a la API una URL distinta de `shared-expenses-service.onrender.com` (por ejemplo, porque
el nombre ya estaba tomado), actualiza `src/environments/environment.ts` y haz push.

## Estructura

```
src/app
├── core
│   ├── http/          Un servicio por recurso de la API: people, settings (+ categorías), months,
│   │                  expenses, backup. Todos async con lastValueFrom.
│   ├── interceptors/  authInterceptor (Bearer token)
│   ├── interfaces/    requests/ y responses/ (contratos de la API) + tipos de UI
│   ├── pipes/         pesoChileno, nombreMes, fechaCorta, categoriaColor
│   ├── state/         PlanillaStore: estado de la planilla (signals) y acciones
│   └── utils/         Errores de la API, vista previa de repartos, fechas, toast, confirmación, colores
├── modulos
│   └── planilla-gastos/   Página principal + componentes (KPIs, gráfico, tabla, modales)
└── shared/            header, toast, confirm-dialog
```

## Qué calcula cada lado

Los repartos por persona, los totales del mes, el porcentaje pagado, las categorías y los planes de
cuotas los calcula la API (`/months/{mes}/summary` y `split` en cada gasto). El front solo calcula una
**vista previa** en los modales antes de guardar (`RepartoService`, misma regla que la API).

La planilla soporta cualquier cantidad de personas: hay una tarjeta y una columna por persona activa.
Las personas se gestionan en Configuración (agregar, cambiar nombre/aporte, quitar).

Los errores de la API (ProblemDetails) se muestran en el toast con el primer mensaje de validación.
