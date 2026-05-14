# 🚕 TuTaxi Platform

Plataforma profesional de reservas de taxi tipo Uber/Cabify.

## Stack Tecnológico

- **Backend:** NestJS, TypeScript, Prisma, PostgreSQL, JWT, Swagger
- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, Zustand, React Query
- **Mobile:** React Native, Expo, Expo Router
- **DevOps:** Docker, Docker Compose, GitHub Actions, Turborepo

## Inicio Rápido

### Con Docker (recomendado)

```bash
docker-compose up
```

Accesos:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Swagger Docs: http://localhost:3001/api/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Levantar servicios (postgres + redis)
docker-compose up postgres redis -d

# Generar cliente Prisma
cd apps/backend && npx prisma generate && npx prisma migrate dev

# Ejecutar en modo desarrollo
npm run dev
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia todos los servicios en modo desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | Ejecuta linter en todos los packages |
| `npm run format` | Formatea código con Prettier |
| `npm run docker:up` | Levanta Docker Compose |
| `npm run docker:down` | Detiene Docker Compose |

## Estructura

```
taxi-platform/
├── apps/
│   ├── backend/      # NestJS API
│   ├── frontend/     # Next.js Web
│   └── mobile/       # Expo React Native
├── packages/
│   ├── types/        # Tipos compartidos
│   ├── config/       # Configuración compartida
│   ├── ui/           # Componentes UI compartidos
│   └── eslint-config/# ESLint config compartida
├── docker/           # Dockerfiles
├── .github/          # GitHub Actions
└── docker-compose.yml
```
