@echo off
echo Instalando dependencias para Component Agent...
pip install -r requirements.txt
echo.
echo Dependencias instaladas correctamente.
echo.
echo Para usar el Component Agent, ejecuta:
echo python cli.py [comando] [opciones]
echo.
echo o simplemente:
echo component-agent.bat [comando] [opciones]
echo.
echo Presiona Enter para continuar...
pause > nul
