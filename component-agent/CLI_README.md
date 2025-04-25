# Component Agent CLI

Este documento proporciona instrucciones detalladas sobre cómo usar la interfaz de línea de comandos (CLI) del Component Agent.

## Requisitos previos

Antes de usar el CLI, asegúrate de:

1. Tener Python 3.8 o superior instalado
2. Haber instalado las dependencias requeridas:
   ```bash
   pip install -r requirements.txt
   ```
3. Haber configurado tu API key de Google en el archivo `.env`:
   ```
   GOOGLE_API_KEY=tu_api_key_aquí
   ```

## Uso básico

Puedes ejecutar el CLI de dos maneras:

1. Usando Python directamente:
   ```bash
   python cli.py [comando] [opciones]
   ```

2. Usando el archivo batch en Windows:
   ```bash
   component-agent.bat [comando] [opciones]
   ```

Si ejecutas el CLI sin ningún comando, se mostrará la ayuda con todos los comandos y opciones disponibles.

## Comandos disponibles

El CLI proporciona tres comandos principales:

### 1. Analizar un componente

```bash
python cli.py analyze [ruta_al_componente] [opciones]
```

Opciones:
- `--accessibility`: Analizar problemas de accesibilidad
- `--performance`: Analizar problemas de rendimiento
- `--best-practices`: Analizar adherencia a mejores prácticas
- `--output`, `-o`: Ruta para guardar los resultados del análisis

Ejemplo:
```bash
python cli.py analyze src/components/Button.tsx --accessibility --best-practices -o analysis.json
```

### 2. Generar un componente

```bash
python cli.py generate [ruta_a_especificación] [opciones]
```

Opciones:
- `--output`, `-o`: Ruta para guardar el componente generado
- `--style`: Estilo del componente (functional o class)
- `--typescript`: Usar TypeScript
- `--jsdoc`: Incluir comentarios JSDoc
- `--shadcn`: Usar componentes de shadcn/ui
- `--tailwind`: Usar Tailwind CSS

Ejemplo:
```bash
python cli.py generate examples/specs/button.json --typescript --tailwind -o src/components/PrimaryButton.tsx
```

### 3. Modificar un componente

```bash
python cli.py modify [ruta_al_componente] [ruta_a_modificaciones] [opciones]
```

Opciones:
- `--output`, `-o`: Ruta para guardar el componente modificado
- `--quick-edit`: Usar QuickEdit para modificaciones pequeñas

Ejemplo:
```bash
python cli.py modify src/components/Button.tsx examples/specs/button-modifications.json -o src/components/ImprovedButton.tsx
```

## Ejemplos de archivos

En el directorio `examples/specs` encontrarás ejemplos de archivos de especificación y modificación que puedes usar como referencia:

- `button.json`: Ejemplo de especificación para generar un componente de botón
- `button-modifications.json`: Ejemplo de modificaciones para mejorar un componente de botón

## Solución de problemas

Si encuentras algún problema al usar el CLI:

1. Asegúrate de que tu API key de Google es válida y está correctamente configurada en el archivo `.env`
2. Verifica que has instalado todas las dependencias requeridas
3. Revisa los mensajes de error y el traceback para identificar el problema
4. Si el problema persiste, consulta la documentación de Google Gen AI o abre un issue en el repositorio

## Notas adicionales

- El CLI está diseñado para funcionar con componentes de React/Next.js
- Los componentes generados y modificados seguirán las mejores prácticas de React, Next.js y accesibilidad
- Puedes personalizar las plantillas y prompts en el código fuente para adaptarlos a tus necesidades específicas
