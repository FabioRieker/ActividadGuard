# Control de Acceso y Protección de Rutas con Ionic, Angular Standalone y Functional Guards

Proyecto desarrollado para el módulo de **Desarrollo de Interfaces (2º DAM)**.

## 🔗 Enlaces del Proyecto
- **Repositorio en GitHub**: [https://github.com/FabioRieker/ActividadGuard](https://github.com/FabioRieker/ActividadGuard)
- **Despliegue en Producción (Vercel)**: [https://actividad-guard-six.vercel.app](https://actividad-guard-six.vercel.app)

---

## 📌 Características Implementadas
- **Página de Inicio (`/`)**: Vista de bienvenida con "Hola Mundo", presentación y navegación adaptativa según el estado de la sesión.
- **Página de Login (`/login`)**:
  - Formularios reactivos para dos perfiles de usuario:
    - **Administrador**: `admin` / `123` -> Redirige a `/admin`
    - **Operador**: `operador` / `123` -> Redirige a `/user-dashboard`
  - Botones de acceso rápido (One-Click Login) para agilizar pruebas sin teclear credenciales.
  - Feedback visual mediante **Toasts de Ionic** ante acierto o fallo de autenticación.
- **Functional Guards (`CanActivateFn`)**:
  - `authGuard`: Valida que exista una sesión activa. Si es anónimo, cancela el enrutamiento y devuelve un `UrlTree` hacia `/login` preservando `returnUrl`.
  - `roleGuard(allowedRole)`: Factoría funcional de guards que valida el rol del usuario. Si un usuario con rol `user` intenta acceder directamente a `/admin`, la guarda deniega el acceso y redirige a `/user-dashboard`.
- **Persistencia de Sesión Sincronizada**:
  - Uso combinado de `sessionStorage` (especificación de la práctica) y `localStorage` para garantizar que si el usuario copia y pega la URL en una nueva pestaña o ventana del navegador, la sesión continúe iniciada.
- **Cierre de Sesión (`logout`)**: Destruye la sesión en memoria reactiva (Angular Signals) y en ambos almacenamientos locales, emitiendo un toast informativo y retornando a `/login`.

---

## 🌿 Estrategia de Ramas (Git Flow)
1. **`main`**: Producción / Escaparate con versiones cerradas y estables para la entrega y evaluación.
2. **`develop`**: Integración del equipo donde confluyen las funcionalidades validadas tras los pipelines.
3. **`tarea/control-acceso-guards`**: Rama de desarrollo temporal individual creada a partir de `develop`.

## 📝 Convención de Commits (Conventional Commits)
- `feat:` Nuevas funcionalidades (ej: `feat: implementado control de acceso con authGuard y roleGuard`)
- `fix:` Corrección de errores
- `docs:` Modificaciones en documentación

---

## 🚀 Ejecución en Local
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
ionic serve
```
