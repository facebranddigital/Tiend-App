package com.bracasfood.service;

public class PedidoService {
    public int obtenerPorcentajeProgreso(String status) {
        if (status == null) return 0;
        switch (status) {
            case "received": return 0;
            case "preparing": return 33;
            case "on_the_way": return 99;
            case "delivered": return 100;
            default: return 0;
        }
    }
}
