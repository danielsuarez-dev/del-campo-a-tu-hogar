<div align="center">

<h1><img src="./LOGO.jpg" width="45" style="vertical-align: middle;" /> Del Campo a tu Hogar</h1>

<p><strong>Plataforma de comercio justo para la venta directa de productos lácteos artesanales en la provincia de Ubaté.</strong></p>

<p>
  <img src="https://img.shields.io/badge/Estado-En%20Desarrollo-brightgreen" alt="Estado" />
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB" alt="Frontend" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2F%20NestJS-339933" alt="Backend" />
  <img src="https://img.shields.io/badge/Base%20de%20Datos-PostgreSQL%20%2F%20Supabase-4169E1" alt="Database" />
</p>

</div>

---

##  Acerca del Proyecto

**Del Campo a tu Hogar** es una solución tecnológica diseñada para dinamizar la economía local del municipio de Ubaté y sus alrededores. La plataforma reduce intermediarios en la cadena de distribución, permitiendo que los productores de leche, yogurt, arequipe y queso artesanal vendan sus productos directamente al consumidor final con precios transparentes y competitivos.

Este proyecto se desarrolla como propuesta dentro de la **Universidad de Cundinamarca (Seccional Ubaté)** para el programa de Ingeniería de Sistemas y Computación.

##  Características Principales

*   **Sistema de Roles Estricto:** Accesos y permisos diferenciados exclusivamente para el perfil de **Consumidor Final** (exploración de catálogo, carrito, historial de compras) y **Productor Campesino** (gestión de inventario y pedidos).
*   **Gestión de Catálogo Directo:** Operaciones CRUD para la publicación autónoma de productos lácteos por parte de los ganaderos locales.
*   **Arquitectura Escalable:** Diseño basado en componentes y microservicios, garantizando la integridad referencial (3FN) y prevención de sobreventa.
*   **Diseño Responsivo:** Interfaz asíncrona e intuitiva adaptada a las condiciones de conectividad y niveles de alfabetización digital en zonas rurales.

##  Stack Tecnológico y Justificación Técnica

| Tecnología | Componente | ¿Por qué la elegimos? |
| :--- | :--- | :--- |
| **React + Vite** (TypeScript) | Frontend | Permite construir una interfaz modular reactiva y fuertemente tipada. Vite ofrece tiempos de compilación ultrarrápidos. |
| **Tailwind CSS** | Estilos | Agiliza el diseño adaptativo mediante clases utilitarias, manteniendo un sistema de diseño limpio sin CSS duplicado. |
| **NestJS** (TypeScript) | Backend | Proporciona una arquitectura modular de servidor escalable y estructurada, separando controladores de la lógica de negocio. |
| **PostgreSQL / Supabase** | Base de Datos | Asegura integridad relacional nativa (3FN) para vincular productores, productos y órdenes, con soporte en la nube. |

##  Estructura del Repositorio (Monorepo)

El proyecto utiliza una arquitectura de monorepositorio para mantener sincronizada la interfaz y la API web:

```text
del-campo-a-tu-hogar/
├── backend/                  # Servidor API REST y lógica de negocio (NestJS)
│   ├── src/
│   │   ├── auth/             # Controladores y servicios de autenticación JWT
│   │   ├── products/         # Endpoints para la gestión del catálogo lácteo
│   │   └── orders/           # Procesamiento de pedidos y validación de stock
│   ├── package.json
│   └── .env.example          # Variables de entorno requeridas
├── frontend/                 # Aplicación del cliente (React)
│   ├── src/
│   │   ├── components/       # Componentes UI reutilizables (Botones, Tarjetas)
│   │   ├── pages/            # Vistas (Catálogo, Dashboard Productor, Login)
│   │   └── services/         # Conexiones HTTP hacia el backend
│   ├── index.html
│   └── package.json
└── README.md                 # Documentación técnica del proyecto
```

##  Guía de Ejecución Rápida

### Requisitos Previos
*   Node.js v18.0 o superior
*   npm v9.0 o superior
*   Instancia de base de datos en Supabase (PostgreSQL)

### 1. Clonar el repositorio
```bash
git clone [https://github.com/danielsuarez-dev/del-campo-a-tu-hogar.git](https://github.com/danielsuarez-dev/del-campo-a-tu-hogar.git)
cd del-campo-a-tu-hogar
```

### 2. Ejecutar el Backend (NestJS)
```bash
cd backend
npm install
# Configurar el archivo .env basándose en .env.example
npm run start:dev
```

### 3. Ejecutar el Frontend (React + Vite)
```bash
cd ../frontend
npm install
npm run dev
```

##  Credenciales de Prueba

Para evaluar los flujos de la primera iteración funcional, utilice los siguientes usuarios pre-configurados:

| Rol | Correo Electrónico | Contraseña |
| :--- | :--- | :--- |
| **Productor / Campesino** | `productor@delcampo.co` | `campesino123` |
| **Cliente / Consumidor** | `cliente@delcampo.co` | `cliente123` |

##  Políticas de Control de Versiones

Este proyecto sigue la metodología ágil **Scrum** y adopta el estándar de **Conventional Commits** para mantener un historial de cambios limpio y trazable. Al contribuir al repositorio, los mensajes de los commits deben iniciar con los siguientes prefijos:

*   `feat:` Para nuevas características o funcionalidades (ej. `feat: agregar endpoint de login`).
*   `fix:` Para corrección de errores (ej. `fix: error de conexión a la base de datos`).
*   `docs:` Para actualizaciones en la documentación o en este README.
*   `refactor:` Para reestructuración de código que no añade funcionalidades ni corrige errores.

##  Equipo de Desarrollo

*   **Andres Santiago Gomez Castiblanco** - *Full-Stack Developer & Scrum Master*
*   **Daniel Santiago Suarez Alarcón** - *Full-Stack Developer & Product Owner*
