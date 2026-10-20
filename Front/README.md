# Frontend — Leñas y Sabores

React + TypeScript + Vite. Consultar el [README del proyecto](../README.md) para la distribución de ramas.

```bash
npm ci
npm run dev
```

- `npm run typecheck`: comprobar TypeScript.
- `npm run lint`: analizar el código con Oxlint.
- `npm run build`: comprobar tipos y compilar.
- `npm run preview`: servir la compilación.

Requiere Node.js 22.12 o superior. Esta rama desarrolla las interfaces de acceso y Mi cuenta.


## Interfaces de feature/login

- `/iniciar-sesion`: login, mostrar/ocultar contraseña, recordarme y acceso visual de Google.
- `/registrarse`: registro con validación de datos, celular por país, confirmación de contraseña y términos.
- `/recuperar-contrasena`: solicitud visual de recuperación; no envía correos.
- `/mi-cuenta`: resumen del perfil de ejemplo.
- `/mi-cuenta/datos`: datos, fotografía, información adicional y diálogo de contraseña.
- `/mi-cuenta/direcciones`: agregar, editar, eliminar y marcar una dirección predeterminada.
- `/mi-cuenta/metodos-pago`: referencias de tarjeta y preferencia de efectivo, Yape o Plin.
- `/mi-cuenta/notificaciones`: estado vacío y preferencias.
- `/mi-cuenta/favoritos` y `/mi-cuenta/pedidos`: estados vacíos para futura integración con catálogo y pedidos.
- `/mi-cuenta/cerrar-sesion`: confirmación de salida de la vista previa.

Usar «Ver Mi cuenta» para recorrer las interfaces sin iniciar sesión. Los formularios son una vista previa: no crean cuentas ni sesiones, no guardan contraseñas, no llaman a una API y no envían correos ni pagos. Los datos de ejemplo se mantienen únicamente en memoria y se restablecen al recargar. Los adaptadores `authService.ts` y `registrationService.ts` quedan preparados para conectar Spring Boot después.

Se reutilizan el diseño de `PaginaWebLYS` (`feature/prototipo-visual`, commit `ada4a837750b83e6ec6c3ebaada6e9690c00555b`), sus fuentes y sus imágenes. El login conserva la composición original, con fotografías equivalentes servidas localmente. Las páginas públicas del encabezado muestran un aviso mientras se integran sus módulos. El backend permanece sin cambios.
