# Guía de Contribución

¡Gracias por tu interés en contribuir a Clinical Dashboard App!

## Flujo de trabajo
1. **Crea un fork** del repositorio y clona tu copia local.
2. **Crea una nueva rama** descriptiva para tu cambio:
   ```bash
   git checkout -b feature/nombre-cambio
   ```
3. Realiza tus cambios siguiendo los [Estándares de Código](./CODING_STANDARDS.md).
4. Asegúrate de que el código pase las pruebas y el lint:
   ```bash
   make lint
   make test
   ```
5. Haz commit siguiendo la convención:
   - Mensajes claros y concisos (ejemplo: `feat: agrega autenticación de usuarios`).
6. Sube tu rama y abre un Pull Request (PR) hacia `main`.
7. Espera la revisión de código y realiza ajustes si es necesario.

## Requisitos para contribuciones
- Todo el código debe estar documentado.
- Ejecuta pruebas y lint antes de enviar PR.
- Describe claramente el propósito del PR.
- Respeta las revisiones y sugerencias del equipo.

## Código de conducta
Por favor, mantén un ambiente colaborativo y profesional. Cualquier comportamiento ofensivo resultará en la expulsión de la comunidad.
