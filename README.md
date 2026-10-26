# Control de Acceso y Protección de Rutas con Ionic, Angular Standalone y Functional Guards

Proyecto desarrollado para el módulo de **Desarrollo de Interfaces (2º DAM)**.

## 📌 Características Implementadas
- **Página de Inicio (`/`)**: Vista básica con "Hola Mundo", presentación y acceso directo según estado de sesión.
- **Página de Login (`/login`)**: Autenticación reactiva para dos tipos de roles:
  - Administrador: `admin` / `123` -> Redirige a `/admin`
  - Operador: `operador` / `123` -> Redirige a `/user-dashboard`
- **Functional Guards (`CanActivateFn`)**:
  - `authGuard`: Valida sesión activa y redirige a `/login` si no está autenticado.
  - `roleGuard(allowedRole)`: Factoría de guards que valida el rol requerido. Si un usuario con rol `user` intenta acceder a `/admin`, es bloqueado y redirigido a `/user-dashboard`.
- **Persistencia de Sesión Sincronizada (`sessionStorage` y `localStorage`)**:
  - La sesión persiste al recargar la página o al copiar y pegar la URL en una nueva pestaña o ventana del navegador.
- **Cierre de Sesión (`logout`)**: Limpieza inmediata de la memoria reactiva y almacenamiento local.

---

## 🌿 Estrategia de Ramas (Git Flow)
1. **`main`**: Producción / Escaparate con versiones cerradas y estables para la entrega y evaluación.
2. **`develop`**: Integración del equipo donde confluyen las funcionalidades validadas.
3. **`tarea/nombre-tarea`**: Ramas individuales temporales donde se desarrolla cada funcionalidad antes de hacer Pull Request hacia `develop`.

## 📝 Convención de Commits (Conventional Commits)
- `feat:` Nuevas funcionalidades (ej: `feat: implementado control de acceso con authGuard y roleGuard`)
- `fix:` Corrección de fallos (ej: `fix: corregido manejo de redireccion`)
- `docs:` Modificaciones en documentación (ej: `docs: anadido README con arquitectura y ramas`)

---

## 🚀 Ejecución en Desarrollo
```bash
# Instalar dependencias si es necesario
npm install

# Iniciar servidor de desarrollo
ionic serve
```
