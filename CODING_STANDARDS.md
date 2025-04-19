# Estándares de Código

## Formato y estilo
- Usa espacios de indentación de 2 (TypeScript/JavaScript).
- Líneas de máximo 100 caracteres.
- Usa comillas simples ('') salvo en JSON.
- Punto y coma obligatorio al final de cada sentencia.
- Usa destructuración y funciones flecha cuando sea posible.
- Prefiere `const` sobre `let` y evita `var`.
- Documenta funciones públicas con JSDoc o TSDoc.

## Nomenclatura
- Variables y funciones: camelCase
- Clases y componentes: PascalCase
- Constantes: MAYÚSCULAS_CON_GUION_BAJO
- Archivos: kebab-case o camelCase

## Buenas prácticas
- Escribe funciones pequeñas y reutilizables.
- Evita duplicación de código.
- Maneja errores con try/catch o promesas.
- No dejes código comentado innecesario.
- Añade pruebas para nuevas funcionalidades.

## Seguridad
- Nunca subas secretos o contraseñas.
- Valida y sanitiza entradas del usuario.
- Maneja excepciones y errores de forma segura.
