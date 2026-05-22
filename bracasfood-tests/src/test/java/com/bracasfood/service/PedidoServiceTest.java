package com.bracasfood.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class PedidoServiceTest {

    @Test
    public void testProgresoEnCamino() {
        PedidoService servicio = new PedidoService();
        int resultado = servicio.obtenerPorcentajeProgreso("on_the_way");
        
        // Verifica que devuelva exactamente el 66% para activar el mapa
        assertEquals(66, resultado, "El estado 'on_the_way' debe retornar 66%");
    }

    @Test
    public void testEstadoInvalido() {
        PedidoService servicio = new PedidoService();
        int resultado = servicio.obtenerPorcentajeProgreso("estado_fantasma");
        
        // Si mandan basura, debe retornar 0% por seguridad
        assertEquals(0, resultado);
    }
}
