# EN
# LTI - Talent Tracking System

This project is a full-stack application with a React frontend and an Express backend using Prisma as an ORM. The frontend is initiated with Create React App, and the backend is written in TypeScript.

## Directory and File Explanation

- `backend/`: Contains the server-side code written in Node.js.
  - `src/`: Contains the source code for the backend.
    - `index.ts`:  The entry point for the backend server.
  - `prisma/`: Contains the Prisma schema file for ORM.
  - `tsconfig.json`: TypeScript configuration file.
  - `.env`: Contains the environment variables.
- `frontend/`: Contains the client-side code written in React.
  - `src/`: Contains the source code for the frontend.
  - `public/`: Contains static files such as the HTML file and images.
  - `build/`: Contains the production-ready build of the frontend.
- `database/`: Contains database-related files.
  - `migrations/`: Contains SQL migration files for database schema.
  - `seeds/`: Contains seed data files for testing.
  - `docs/`: Contains database schema documentation.
- `docker-compose.yml`: Contains the Docker Compose configuration to manage your application's services.
- `setup-database.sh`: Automated script to set up the database (migrations, seeds, Prisma client).
- `README.md`: This file contains information about the project and instructions on how to run it.

## Project Structure

The project is divided into two main directories: `frontend` and `backend`.

### Frontend

The frontend is a React application, and its main files are located in the `src` directory. The `public` directory contains static assets, and the build directory contains the production `build` of the application.

### Backend

El backend es una aplicación Express escrita en TypeScript.
- The `src` directory contains the source code
- The `prisma` directory contains the Prisma schema.

## First steps

To get started with this project, follow these steps:

1. Clone the repo
2. Install the dependencies for frontend and backend
```sh
cd frontend
npm install

cd ../backend
npm install
```
3. Set up the database (see [Database Setup](#database-setup) section for details)
```bash
./setup-database.sh
```
4. Build the backend server
```
cd backend
npm run build
````
5. Run the backend server
```
cd backend
npm run dev 
```

6. In a new terminal window, build the frontend server:
```
cd frontend
npm run build
```
7. Start the frontend server
```
cd frontend
npm start
```

The backend server will be running at http://localhost:3010, and the frontend will be available at http://localhost:3000.

## Database Setup

This project uses PostgreSQL as the database. The database schema includes tables for candidates, education, work experience, documents, and users.

### Quick Setup (Recommended)

The easiest way to set up the database is using the automated setup script:

```bash
./setup-database.sh
```

This script will:
1. Check if Docker is running and start the database container if needed
2. Run database migrations to create all tables
3. Optionally load seed data (sample candidates with related data)
4. Generate the Prisma client
5. Verify the setup

**Note:** The script will prompt you to confirm loading seed data. Type `y` to load sample data for testing, or `n` to skip.

### Manual Setup

If you prefer to set up the database manually, follow these steps:

#### Step 1: Start the Database

Start the PostgreSQL database using Docker:

```bash
./docker-compose.sh up -d
# OR
docker-compose up -d
```

#### Step 2: Run Migrations

Run the database migration to create all tables:

```bash
# Using Docker
docker-compose exec db psql -U LTIdbUser -d LTIdb -f /path/to/database/migrations/001_create_candidates_schema.up.sql

# OR using psql directly (if PostgreSQL is installed locally)
psql -U LTIdbUser -d LTIdb -f database/migrations/001_create_candidates_schema.up.sql
```

#### Step 3: Load Seed Data (Optional)

Load sample data for testing:

```bash
# Using Docker
docker-compose exec db psql -U LTIdbUser -d LTIdb -f /path/to/database/seeds/sample_data.sql

# OR using psql directly
psql -U LTIdbUser -d LTIdb -f database/seeds/sample_data.sql
```

#### Step 4: Generate Prisma Client

Generate the Prisma client to match the database schema:

```bash
cd backend
npm run prisma:generate
```

### Database Schema

The database includes the following tables:

- **users** - Recruiter/user information for audit trail
- **candidates** - Main candidate information and application tracking
- **education** - Education history (one-to-many with candidates)
- **work_experience** - Work experience history (one-to-many with candidates)
- **documents** - Documents associated with candidates (one-to-many)

For detailed schema documentation, see `database/docs/schema_documentation.md`.

### Verify Database Setup

To verify that the database is set up correctly, you can check the tables:

```bash
# Using Docker
docker-compose exec db psql -U LTIdbUser -d LTIdb -c "\dt"

# OR using psql directly
psql -U LTIdbUser -d LTIdb -c "\dt"
```

You should see: `candidates`, `education`, `work_experience`, `documents`, and `users`.

## Docker y PostgreSQL

This project uses Docker to run a PostgreSQL database. Here's how to get it up and running:

Install Docker on your machine if you haven't done so already. You can download it here.

**Note:** This project is configured to use a remote Docker host at `tcp://10.211.55.2:2375`. Use the provided `docker-compose.sh` script instead of `docker-compose` directly to ensure the correct Docker host is used.

Navigate to the root directory of the project in your terminal.
Run the following command to start the Docker container:
```
./docker-compose.sh up -d
```
This will start a PostgreSQL database in a Docker container. The -d flag runs the container in detached mode, meaning it runs in the background.

To access the PostgreSQL database, you can use any PostgreSQL client with the following connection details:
 - Host: localhost
 - Port: 5432
 - User: LTIdbUser
 - Password: D1ymf8wyQEGthFR1E9xhCq
 - Database: LTIdb

**Note:** These are the default credentials from `docker-compose.yml`. For production, use environment variables and secure credentials.

To stop the Docker container, run the following command:
```
./docker-compose.sh down
```

Alternatively, you can set the `DOCKER_HOST` environment variable manually:
```bash
export DOCKER_HOST=tcp://10.211.55.2:2375
docker-compose up -d
```
# ES
# LTI - Sistema de Seguimiento de Talento

Este proyecto es una aplicación full-stack con un frontend en React y un backend en Express usando Prisma como ORM. El frontend se inicia con Create React App y el backend está escrito en TypeScript.

## Explicación de Directorios y Archivos

- `backend/`: Contiene el código del lado del servidor escrito en Node.js.
  - `src/`: Contiene el código fuente para el backend.
    - `index.ts`: El punto de entrada para el servidor backend.
  - `prisma/`: Contiene el archivo de esquema de Prisma para ORM.
  - `tsconfig.json`: Archivo de configuración de TypeScript.
  - `.env`: Contiene las variables de entorno.
- `frontend/`: Contiene el código del lado del cliente escrito en React.
  - `src/`: Contiene el código fuente para el frontend.
  - `public/`: Contiene archivos estáticos como el archivo HTML e imágenes.
  - `build/`: Contiene la construcción lista para producción del frontend.
- `database/`: Contiene archivos relacionados con la base de datos.
  - `migrations/`: Contiene archivos de migración SQL para el esquema de la base de datos.
  - `seeds/`: Contiene archivos de datos de ejemplo para pruebas.
  - `docs/`: Contiene documentación del esquema de la base de datos.
- `docker-compose.yml`: Contiene la configuración de Docker Compose para gestionar los servicios de tu aplicación.
- `setup-database.sh`: Script automatizado para configurar la base de datos (migraciones, datos de ejemplo, cliente de Prisma).
- `README.md`: Este archivo contiene información sobre el proyecto e instrucciones sobre cómo ejecutarlo.

## Estructura del Proyecto

El proyecto está dividido en dos directorios principales: `frontend` y `backend`.

### Frontend

El frontend es una aplicación React y sus archivos principales están ubicados en el directorio `src`. El directorio `public` contiene activos estáticos y el directorio `build` contiene la construcción de producción de la aplicación.

### Backend

El backend es una aplicación Express escrita en TypeScript.
- El directorio `src` contiene el código fuente
- El directorio `prisma` contiene el esquema de Prisma.

## Primeros Pasos

Para comenzar con este proyecto, sigue estos pasos:

1. Clona el repositorio.
2. Instala las dependencias para el frontend y el backend:
```sh
cd frontend
npm install

cd ../backend
npm install
```
3. Configura la base de datos (consulta la sección [Configuración de la Base de Datos](#configuración-de-la-base-de-datos) para más detalles)
```bash
./setup-database.sh
```
4. Construye el servidor backend:
```
cd backend
npm run build
````
5. Inicia el servidor backend:
```
cd backend
npm run dev 
```

6. En una nueva ventana de terminal, construye el servidor frontend:
```
cd frontend
npm run build
```
7. Inicia el servidor frontend:
```
cd frontend
npm start
```

El servidor backend estará corriendo en http://localhost:3010 y el frontend estará disponible en http://localhost:3000.

## Configuración de la Base de Datos

Este proyecto usa PostgreSQL como base de datos. El esquema de la base de datos incluye tablas para candidatos, educación, experiencia laboral, documentos y usuarios.

### Configuración Rápida (Recomendado)

La forma más fácil de configurar la base de datos es usando el script automatizado:

```bash
./setup-database.sh
```

Este script realizará:
1. Verificar si Docker está corriendo y iniciar el contenedor de base de datos si es necesario
2. Ejecutar las migraciones de base de datos para crear todas las tablas
3. Opcionalmente cargar datos de ejemplo (candidatos de muestra con datos relacionados)
4. Generar el cliente de Prisma
5. Verificar la configuración

**Nota:** El script te pedirá confirmación para cargar datos de ejemplo. Escribe `y` para cargar datos de muestra para pruebas, o `n` para omitir.

### Configuración Manual

Si prefieres configurar la base de datos manualmente, sigue estos pasos:

#### Paso 1: Iniciar la Base de Datos

Inicia la base de datos PostgreSQL usando Docker:

```bash
./docker-compose.sh up -d
# O
docker-compose up -d
```

#### Paso 2: Ejecutar Migraciones

Ejecuta la migración de base de datos para crear todas las tablas:

```bash
# Usando Docker
docker-compose exec db psql -U LTIdbUser -d LTIdb -f /ruta/a/database/migrations/001_create_candidates_schema.up.sql

# O usando psql directamente (si PostgreSQL está instalado localmente)
psql -U LTIdbUser -d LTIdb -f database/migrations/001_create_candidates_schema.up.sql
```

#### Paso 3: Cargar Datos de Ejemplo (Opcional)

Carga datos de muestra para pruebas:

```bash
# Usando Docker
docker-compose exec db psql -U LTIdbUser -d LTIdb -f /ruta/a/database/seeds/sample_data.sql

# O usando psql directamente
psql -U LTIdbUser -d LTIdb -f database/seeds/sample_data.sql
```

#### Paso 4: Generar Cliente de Prisma

Genera el cliente de Prisma para que coincida con el esquema de la base de datos:

```bash
cd backend
npm run prisma:generate
```

### Esquema de la Base de Datos

La base de datos incluye las siguientes tablas:

- **users** - Información de reclutadores/usuarios para auditoría
- **candidates** - Información principal de candidatos y seguimiento de aplicaciones
- **education** - Historial educativo (uno-a-muchos con candidatos)
- **work_experience** - Historial de experiencia laboral (uno-a-muchos con candidatos)
- **documents** - Documentos asociados con candidatos (uno-a-muchos)

Para documentación detallada del esquema, consulta `database/docs/schema_documentation.md`.

### Verificar Configuración de la Base de Datos

Para verificar que la base de datos está configurada correctamente, puedes verificar las tablas:

```bash
# Usando Docker
docker-compose exec db psql -U LTIdbUser -d LTIdb -c "\dt"

# O usando psql directamente
psql -U LTIdbUser -d LTIdb -c "\dt"
```

Deberías ver: `candidates`, `education`, `work_experience`, `documents`, y `users`.

## Docker y PostgreSQL

Este proyecto usa Docker para ejecutar una base de datos PostgreSQL. Así es cómo ponerlo en marcha:

Instala Docker en tu máquina si aún no lo has hecho. Puedes descargarlo desde aquí.

**Nota:** Este proyecto está configurado para usar un host Docker remoto en `tcp://10.211.55.2:2375`. Usa el script `docker-compose.sh` proporcionado en lugar de `docker-compose` directamente para asegurar que se use el host Docker correcto.

Navega al directorio raíz del proyecto en tu terminal.
Ejecuta el siguiente comando para iniciar el contenedor Docker:
```
./docker-compose.sh up -d
```
Esto iniciará una base de datos PostgreSQL en un contenedor Docker. La bandera -d corre el contenedor en modo separado, lo que significa que se ejecuta en segundo plano.

Para acceder a la base de datos PostgreSQL, puedes usar cualquier cliente PostgreSQL con los siguientes detalles de conexión:
 - Host: localhost
 - Port: 5432
 - User: LTIdbUser
 - Password: D1ymf8wyQEGthFR1E9xhCq
 - Database: LTIdb

**Nota:** Estas son las credenciales por defecto de `docker-compose.yml`. Para producción, usa variables de entorno y credenciales seguras.

Para detener el contenedor Docker, ejecuta el siguiente comando:
```
./docker-compose.sh down
```

Alternativamente, puedes establecer la variable de entorno `DOCKER_HOST` manualmente:
```bash
export DOCKER_HOST=tcp://10.211.55.2:2375
docker-compose up -d
```
