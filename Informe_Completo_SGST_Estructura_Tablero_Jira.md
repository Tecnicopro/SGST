# Informe Definitivo: Estructura del Índice y Tablero Jira SGST

**Proyecto:** Sistema de Gestión de Soporte Técnico (SGST)  
**Código Jira:** SGST  
**Fecha:** 22 de noviembre de 2026  
**Estado:** Proyecto creado en Jira, tablero pendiente de configurar

---

## 1. Índice Estructural del Proyecto (Sistema de Archivos)

### Raíz del proyecto: `/opt/lampp/htdocs/sistema_gestion_soporte_tecnico`

| Ruta | Tipo | Descripción |
|------|------|-------------|
| `index.html` | Archivo | Punto de entrada. SPA de una sola página con vistas: Resumen, Solicitudes, Nueva solicitud, Procedimientos ALOJAMIENTOS. Incluye datos JSON embebidos del manual ALOJAMIENTOS. |
| `CSS/TI.css` | Archivo | Hojas de estilo del sistema. Variables de color, diseño del sidebar, tarjetas, formularios, tabla de tickets, modal de edición. |
| `JavaScript/app.js` | Archivo | Lógica frontend: llamadas a la API REST, renderizado de tablas, filtros, búsqueda, modal de edición, notificaciones toast. |
| `JavaScript/config.js` | Archivo | Configuración de la aplicación (rutas, constantes). |
| `api/db.php` | Archivo | Conexión PDO a MySQL (soporte_tecnico). Manejo de errores de conexión. |
| `api/env.php` | Archivo | Variables de entorno de base de datos (host, nombre, usuario, contraseña). |
| `api/response.php` | Archivo | Función helper `respond()` para enviar respuestas JSON con código HTTP. |
| `api/tickets.php` | Archivo | Endpoint REST de tickets. GET (listar), POST (crear), PUT (editar). Códigos ST-YYMMDD-XX. |
| `api/ticket-delete.php` | Archivo | Endpoint para eliminar tickets (DELETE). |
| `api/ticket-status.php` | Archivo | Endpoint para cambiar estado de tickets (PATCH/PUT). |
| `api/test_db.php` | Archivo | Script de prueba de conexión a la base de datos. |
| `database/schema.sql` | Archivo | Esquema SQL: base de datos `soporte_tecnico` y tabla `tickets`. |
| `IMG/TI.webp` | Imagen | Imagen/logo del sistema SoporteTI. |
| `alojamientos_datos.json` | Archivo | Datos JSON del manual de procedimientos ALOJAMIENTOS (fases, etapas, pasos, herramientas, verificaciones). |
| `ALOJAMIENTOS_Pasos.md` | Documento | Documentación de pasos del módulo ALOJAMIENTOS. |
| `ALOJAMIENTOS_Resumen.md` | Documento | Resumen del módulo ALOJAMIENTOS. |
| `alojamientos.html` | Archivo | Página independiente de procedimientos ALOJAMIENTOS. |
| `.gitignore` | Archivo | Archivos y carpetas ignorados por Git. |
| `.git/` | Carpeta | Repositorio Git del proyecto. |
| `Informe_Tablero_Jira_Reconstruccion.docx.md` | Archivo | Informe previo de reconstrucción del tablero Jira (este documento lo complementa y reemplaza). |

---

## 2. Esquema de Base de Datos

**Base de datos:** `soporte_tecnico`  
**Tabla:** `tickets`

| Campo | Tipo | Nulo | Valor por defecto | Descripción |
|-------|------|------|-------------------|-------------|
| `id` | INT UNSIGNED | NO | AUTO_INCREMENT | Clave primaria |
| `code` | VARCHAR(30) | NO | ÚNICO | Código del ticket (formato ST-YYMMDD-XX) |
| `requester` | VARCHAR(100) | NO | — | Nombre del solicitante |
| `email` | VARCHAR(150) | NO | — | Correo del solicitante |
| `subject` | VARCHAR(150) | NO | — | Asunto de la solicitud |
| `category` | VARCHAR(60) | NO | — | Categoría (Hardware, Software, Redes, Accesos, Otro) |
| `priority` | ENUM | NO | 'Media' | Baja, Media, Alta, Crítica |
| `description` | TEXT | NO | — | Descripción del problema |
| `status` | ENUM | NO | 'Pendiente' | Pendiente, En proceso, Resuelta |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP ON UPDATE | Fecha de última modificación |

**Índices:** `idx_status(status)`, `idx_created_at(created_at)`

---

## 3. Estados de Tickets y Flujo

| Estado | Significado | Color sugerido Jira | Flujo |
|--------|-------------|---------------------|-------|
| Pendiente | Ticket recién creado, sin asignar | Gris / Azul | Backlog → To Do |
| En proceso | Agente atendiendo el ticket | Amarillo / Naranja | In Progress |
| Resuelta | Ticket resuelto y cerrado | Verde | Done / Resolved |

**Transiciones recomendadas en Jira:**
- Pendiente → En proceso (agente toma el ticket)
- En proceso → Resuelta (solución entregada y confirmada)

---

## 4. Prioridades del Sistema

| Prioridad | Nivel | Tiempo de respuesta | Tiempo de resolución |
|-----------|-------|---------------------|----------------------|
| Crítica | P1 | 1 hora | 4 horas |
| Alta | P2 | 4 horas | 1 día |
| Media | P3 | 1 día | 3 días |
| Baja | P4 | 2 días | 5 días |

---

## 5. Categorías de Tickets

| Categoría | Descripción |
|-----------|-------------|
| Hardware | Problemas de equipos físicos, impresoras, periféricos |
| Software | Problemas de aplicaciones, sistemas operativos, licencias |
| Redes | Conectividad, Wi-Fi, VPN, acceso a internet |
| Accesos | Contraseñas, permisos, cuentas de usuario |
| Otro | Cualquier otro tipo de solicitud no clasificada |

---

## 6. Endpoints de la API

| Método | Ruta | Descripción | Parámetros |
|--------|------|-------------|------------|
| GET | `/api/tickets.php` | Listar todos los tickets | — |
| POST | `/api/tickets.php` | Crear nuevo ticket | requester, email, subject, category, priority, description |
| PUT | `/api/tickets.php?id=X` | Editar ticket existente | id, requester, email, subject, category, priority, description |
| DELETE | `/api/ticket-delete.php` | Eliminar ticket | id |
| PATCH/PUT | `/api/ticket-status.php` | Cambiar estado de ticket | id, status |
| GET | `/api/test_db.php` | Probar conexión DB | — |

---

## 7. Vistas de la Interfaz (index.html)

| Vista | ID | Descripción |
|-------|-----|-------------|
| Resumen | `dashboard` | Panel de control con estadísticas (total, pendientes, en proceso, resueltas) y tabla de solicitudes recientes |
| Solicitudes | `tickets` | Listado completo de tickets con búsqueda, filtro por estado y acciones de edición |
| Nueva solicitud | `new-ticket` | Formulario para crear un ticket (solicitante, correo, asunto, categoría, prioridad, descripción) |
| ALOJAMIENTOS | `alojamientos` | Procedimientos del manual ALOJAMIENTOS con búsqueda por etapa o paso |

---

## 8. Configuración del Tablero Jira SGST

El proyecto **SGST** ya está creado en Jira. Ahora falta construir el tablero. Sigue estos pasos en la interfaz web de Jira:

### Paso 1: Crear el tablero (Board)
1. Ve a **Tableros → Ver todos los tableros → Crear tablero**
2. Selecciona **Kanban** (recomendado para soporte técnico)
3. Elige **Crear un nuevo tablero para un proyecto existente**
4. Selecciona el proyecto **SGST**
5. Nombre: `SGST - Soporte Técnico Kanban`

### Paso 2: Configurar columnas del tablero
1. Abre el tablero → **Configuración del tablero → Columnas**
2. Agrega las siguientes columnas y mápealas a los estados de Jira:

| Columna Jira | Estado mapeado | Descripción |
|--------------|----------------|-------------|
| Backlog | To Do | Tickets nuevos sin asignar |
| Seleccionado | Selected for Development | Tickets listos para trabajar |
| En curso | In Progress | Ticket siendo atendido por un agente |
| Revisión | In Review | Ticket resuelto, pendiente de validación |
| Resuelto | Resolved | Ticket cerrado por soporte |
| Cerrado | Done | Ticket confirmado por el cliente |

### Paso 3: Configurar límites WIP (opcional)
- En curso: máximo 2 tickets por agente
- Revisión: máximo 2 tickets

### Paso 4: Configurar el workflow
1. Ve a **Configuración del proyecto → Workflows**
2. Crea o edita el workflow para el proyecto SGST
3. Define las transiciones entre estados:
   - To Do → Selected for Development
   - Selected for Development → In Progress
   - In Progress → In Review
   - In Review → Resolved
   - Resolved → Done
4. Publica el workflow

### Paso 5: Configurar tipos de issue
1. Ve a **Configuración del proyecto → Tipos de issue**
2. Agrega los tipos necesarios para soporte técnico:
   - Incidente (fallo o interrupción del servicio)
   - Solicitud de Servicio (acceso, instalación, configuración)
   - Problema (causa raíz de incidentes)
   - Cambio (modificación planificada)
   - Tarea (trabajo interno)

### Paso 6: Configurar campos personalizados
1. Ve a **Configuración del proyecto → Campos**
2. Agrega campos si es necesario:
   - Categoría (Hardware, Software, Redes, Accesos, Otro)
   - Prioridad (Crítica, Alta, Media, Baja)
   - Versión afectada

### Paso 7: Configurar permisos y roles
| Rol | Permisos |
|-----|----------|
| Administrador de Jira | Configuración completa del proyecto y tablero |
| Agente de Soporte Nivel 1 | Crear, editar, asignar tickets |
| Agente de Soporte Nivel 2 | Escalamiento, resolución de tickets complejos |
| Usuario Final | Crear tickets, ver estado propio |

---

## 9. Mapeo: Sistema de tickets ↔ Tablero Jira

| Campo del sistema | Campo Jira equivalente | Notas |
|-------------------|------------------------|-------|
| `code` (ST-YYMMDD-XX) | Issue Key (SGST-XXX) | El código del sistema es diferente al key de Jira |
| `status` (Pendiente/En proceso/Resuelta) | Estado de Jira (To Do/In Progress/Done) | Mapeo directo de estados |
| `priority` (Baja/Media/Alta/Crítica) | Prioridad de Jira | Baja=P4, Media=P3, Alta=P2, Crítica=P1 |
| `category` | Campo personalizado o Label | Categoría como label o campo custom |
| `requester` | Reporter | Usuario que reporta el ticket |
| `subject` | Resumen/Summary | Título del issue |
| `description` | Descripción | Detalle del problema |

---

## 10. Checklist de Implementación del Tablero SGST

- [ ] Proyecto SGST creado en Jira (hecho)
- [ ] Tablero Kanban creado y vinculado a SGST
- [ ] Columnas configuradas (Backlog, Seleccionado, En curso, Revisión, Resuelto, Cerrado)
- [ ] Workflow publicado con transiciones entre estados
- [ ] Tipos de issue agregados (Incidente, Solicitud de Servicio, Problema, Cambio, Tarea)
- [ ] Campos personalizados configurados (Categoría, Prioridad)
- [ ] Límites WIP definidos (opcional)
- [ ] Permisos de roles asignados
- [ ] Tablero compartido con el equipo de soporte
- [ ] Tickets de prueba creados para validar el flujo

---

## 11. Notas Finales

- El sistema de código local (`index.html`, `api/`, `database/`) gestiona los tickets operativamente con estados Pendiente/En proceso/Resuelta.
- El tablero Jira SGST debe reflejar el mismo flujo de trabajo para dar visibilidad al equipo de soporte.
- Este informe sirve como referencia definitiva para la reconstrucción del tablero y la documentación del índice del proyecto.

---

**Fin del informe**
