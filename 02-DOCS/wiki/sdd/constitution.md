# Constitution del Proyecto: Reto Técnico Interseguro (Go + Node.js)

## 1. Misión y Alcance
Desarrollar una solución distribuida en microservicios contenerizados para resolver el reto de factorización QR y análisis estadístico matricial:
- **API 1 (Go / Fiber)**: Valida matrices rectangulares, computa la Factorización QR ($M = Q \cdot R$) y despacha los resultados vía HTTP a la API 2.
- **API 2 (Node.js / Express)**: Analiza las matrices $Q$ y $R$, calculando métricas estadísticas (máximo, mínimo, promedio, suma) y validación de matriz diagonal.
- **Frontend Interactivo**: Interfaz web moderna para ingreso interactivo de matrices, visualización gráfica y de métricas en tiempo real.
- **Seguridad**: Autenticación Bearer JWT en los endpoints.
- **Testing**: Cobertura con pruebas unitarias tanto en Go (`go test`) como en Node.js (`jest`/`node:test`).
- **DevOps**: `Dockerfile` optimizados multi-stage y orquestación con `docker-compose.yml`.

## 2. Principios de Calidad y Arquitectura
1. **Separación de Responsabilidades**: Go maneja el cómputo matricial intensivo y Node.js procesa la analítica y el reporte.
2. **Determinismo y Precisión Numérica**: Tolerancia épsilon ($\epsilon = 10^{-6}$) para comparaciones de punto flotante y verificación de matriz diagonal / ortogonalidad ($Q^T Q = I$).
3. **Contratos Inmutables**: Schemas JSON estrictamente validados en ambas APIs.
4. **Resiliencia**: Manejo exhaustivo de errores (matrices inválidas, dimensiones inconsistentes, fallas de red entre servicios).
