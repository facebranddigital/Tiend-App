import numpy as np
from deepface import DeepFace

try:
    print("Cargando modelo FaceNet en memoria...")
    # Forzamos la inicialización limpia con el string nativo calibrado
    DeepFace.build_model("Facenet")
    print("¡Modelo FaceNet cargado con éxito!")
except Exception as e:
    print(f"Advertencia al precargar Facenet: {e}")

def generar_vector_rostro(ruta_imagen):
    """
    Extrae el embedding (vector numérico) del primer rostro detectado.
    """
    try:
        embedding_objs = DeepFace.represent(
            img_path=ruta_imagen, 
            model_name="Facenet", 
            enforce_detection=True
        )
        # CORREGIDO: Acceso seguro al índice del primer rostro mapeado
        return embedding_objs[0]["embedding"]
    except Exception as e:
        print(f"Error al procesar el rostro: {e}")
        return None

def verificar_usuario(ruta_foto_captura, vector_guardado_db):
    """
    Compara una captura en vivo contra el vector extraído de Firestore.
    """
    try:
        actual_embedding_objs = DeepFace.represent(
            img_path=ruta_foto_captura, 
            model_name="Facenet", 
            enforce_detection=True
        )
        # CORREGIDO: Acceso consistente al índice del primer rostro capturado
        actual_embedding = actual_embedding_objs[0]["embedding"]
        
        v1 = np.array(vector_guardado_db)
        v2 = np.array(actual_embedding)
        
        # Métrica de Similitud del Coseno estricta
        similitud = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
        
        # Umbral robusto de producción (>= 0.70 evita falsos positivos)
        es_valido = similitud >= 0.70
        
        return {
            "autenticado": bool(es_valido), 
            "score_similitud": float(similitud)
        }
    except Exception as e:
        print(f"Error en la verificación: {e}")
        return {"autenticado": False, "error": "No se detectó un rostro claro en la captura."}
