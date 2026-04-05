const { defineConfig } = require("cypress");
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const iconv = require('iconv-lite');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        scanSecurityData({ filePath, keywords }) {
          try {
            // Leemos el archivo usando iconv-lite para corregir la codificación de caracteres especiales
            const buffer = fs.readFileSync(filePath);
            const content = iconv.decode(buffer, 'win1252'); // Usamos 'win1252' (Latin1) por los caracteres mostrados en head

            const records = parse(content, {
              columns: true,
              skip_empty_lines: true,
              trim: true
            });

            // Filtramos las filas que contengan CUALQUIERA de los keywords en CUALQUIER columna
            const findings = records.filter(row => {
              const rowString = JSON.stringify(row).toLowerCase();
              return keywords.some(keyword => rowString.includes(keyword.toLowerCase()));
            });

            return {
              totalProcessed: records.length,
              findingsCount: findings.length,
              findings: findings.slice(0, 1000) // Limitamos a 1000 para no saturar el reporte inicial
            };
          } catch (error) {
            console.error('Error al procesar el CSV:', error);
            throw error;
          }
        }
      });
      return config;
    },
    supportFile: false
  },
});
