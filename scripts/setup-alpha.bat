@echo off
echo Setting up Alpha environment...

REM Define paths
set ROOT_DIR=%~dp0..
set PRISMA_DIR=%ROOT_DIR%\prisma
set SCHEMA_PATH=%PRISMA_DIR%\schema.prisma
set ALPHA_SCHEMA_PATH=%ROOT_DIR%\schema.prisma.alpha

REM Create prisma directory if it doesn't exist
if not exist "%PRISMA_DIR%" (
    echo Creating prisma directory...
    mkdir "%PRISMA_DIR%"
)

REM Copy schema.prisma.alpha to prisma/schema.prisma
if exist "%ALPHA_SCHEMA_PATH%" (
    echo Copying schema.prisma.alpha to prisma/schema.prisma...
    copy /Y "%ALPHA_SCHEMA_PATH%" "%SCHEMA_PATH%"
    echo Schema copied successfully.
) else (
    echo Error: schema.prisma.alpha not found.
    exit /b 1
)

REM Generate Prisma client
echo Generating Prisma client...
set NODE_ENV=alpha
npx prisma generate --schema="%SCHEMA_PATH%"

if %ERRORLEVEL% EQU 0 (
    echo Prisma client generated successfully.
) else (
    echo Error generating Prisma client.
    exit /b 1
)

echo Alpha environment setup completed successfully.