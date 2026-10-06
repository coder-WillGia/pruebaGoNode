# Registro de Decisiones de Arquitectura (ADRs)

## ADR 01: Arquitectura Hexagonal y Screaming Architecture
- **Decisión**: Organizar ambos microservicios por Vertical Slices de dominio (`matrix_processing`, `matrix-analytics`, `auth`, `matrix_catalog`) en lugar de capas técnicas.
- **Razón**: Máxima cohesión, modularidad y facilidad de mantenimiento.

## ADR 02: Desacoplamiento de Base de Datos (Node.js Stateless)
- **Decisión**: La base de datos PostgreSQL (`matrix_challenge_db`) es administrada exclusivamente por la API de Go. Node.js es 100% Stateless.
- **Razón**: Cumplir estrictamente con el patrón Microservicios / Single Source of Truth y escalabilidad horizontal de analíticas.

## ADR 03: Frontend React + Vite con Auth Wall Obligatorio
- **Decisión**: Construir el frontend en React 18 con Vite, Tailwind CSS y Lucide Icons usando `pnpm`, con pantalla de login obligatoria antes de mostrar el dashboard.
- **Razón**: Cumplir los requisitos visuales de nivel corporativo para Interseguro y auditar qué evaluador realiza cada cálculo.

## ADR 04: Auto-Migración Idempotente en el Arranque de Go
- **Decisión**: Go ejecuta `AutoMigrate` en el inicio conectándose a PostgreSQL.
- **Razón**: Cero fricción al desplegar en nuevos entornos; si la BD está vacía se crean tablas y semillas sin requerir scripts manuales.
