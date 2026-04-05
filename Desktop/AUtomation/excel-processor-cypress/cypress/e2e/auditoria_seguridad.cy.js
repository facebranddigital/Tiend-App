describe('Auditoría de Seguridad - Extracción de Integraciones', () => {
    
    it('Debe escanear el log de auditoría en busca de tokens y accesos de Copado/Salesforce', () => {
      const keywords = [
        'Bracas_food', 
        'eversozinho', 
        'Copado', 
        'API', 
        'permissions', 
        'Id', 
        'senha', 
        'token', 
        'SSO', 
        '2AF', 
        'MFA',
        'facebranddigital@salesforce.com'
      ];

      cy.task('scanSecurityData', { 
        filePath: '/home/yohon/Desktop/audiFBD.csv', 
        keywords 
      }).then((result) => {
        cy.log(`Registros totales procesados: ${result.totalProcessed}`);
        cy.log(`Hallazgos encontrados: ${result.findingsCount}`);

        // Verificamos si hay resultados
        expect(result.findingsCount).to.be.greaterThan(0);

        // Imprimimos un resumen en la consola de Cypress
        result.findings.forEach((finding, index) => {
           // Filtramos un poco para que sea legible en el log
           const summary = `${finding.Fecha} | ${finding.Usuario} | ${finding.Acción}`;
           cy.log(`[${index + 1}] ${summary}`);
        });

        // Guardamos los hallazgos en un archivo local para el usuario en la carpeta de resultados de Cypress
        cy.writeFile('cypress/results/hallazgos_seguridad.json', result.findings);
        cy.log('✅ Hallazgos exportados a cypress/results/hallazgos_seguridad.json');
      });
    });

});
