# InCleanHome Frontend - Vite + Vue.js

Frontend en **Vue.js sin TypeScript**, organizado por bounded contexts y tomando como prioridad las vistas más completas del primer ZIP.

## Tecnologías

- Vite
- Vue 3
- JavaScript
- Vue Router
- Pinia
- Axios
- Tailwind CSS

## Ejecutar

```bash
npm install
npm run dev
```

## Configurar backend

Edita `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Si tu backend corre en otro puerto, cambia esa URL.

## Rutas principales del frontend

### IAM

- `/login`
- `/register`
- `/upload-documents`

### Cliente

- `/client/search`
- `/client/worker/:id`
- `/client/worker/:id/book`
- `/client/bookings`
- `/client/payments`
- `/client/messages`
- `/client/profile`

### Trabajadora

- `/worker/dashboard`
- `/worker/profile`
- `/worker/availability`
- `/worker/requests`
- `/worker/reviews`
- `/worker/messages`

## Endpoints esperados del backend

```txt
POST   /api/auth/login
POST   /api/auth/register/client
POST   /api/auth/register/worker
POST   /api/auth/worker/upload-document

GET    /api/workers
GET    /api/workers/{id}
GET    /api/workers/me/profile
PUT    /api/workers/me/profile
GET    /api/workers/me/stats
GET    /api/workers/{id}/availability
PUT    /api/workers/{id}/availability

GET    /api/bookings
POST   /api/bookings
PATCH  /api/bookings/{id}/status

GET    /api/payments/methods
POST   /api/payments/methods
PATCH  /api/payments/methods/{id}/default
DELETE /api/payments/methods/{id}

POST   /api/reviews
GET    /api/reviews/worker/{workerId}

GET    /api/messages/conversations
GET    /api/messages/{userId}
POST   /api/messages/{userId}
```
