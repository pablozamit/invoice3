# Invoice Processor

Aplicación React para subir facturas en PDF o imagen, extraer los datos principales y guardarlos en Google Sheets y Drive.

## Instalación

```bash
npm install
```

Copia `.env.example` a `.env` y completa las credenciales de Google.
Algunas configuraciones, como los IDs de Google Sheet y Drive Folder, también se pueden gestionar desde la interfaz de la aplicación después del inicio.
Consulta la guía de configuración dentro de la aplicación para más detalles.

## Uso

```
npm run dev
```

Abre la aplicación y conecta con Google. Desde la sección **Configuración de integración** podrás establecer manualmente el tipo de cambio USD → EUR. Cuando se procese una factura en dólares se aplicará este valor.

