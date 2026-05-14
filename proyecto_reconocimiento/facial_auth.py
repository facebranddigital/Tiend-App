import cv2
import numpy as np
from deepface import DeepFace

def generar_vector_rostro(ruta_imagen):
    """
    Lee la foto del perfil del usuario y extrae su 'embedding' (vector numérico).
    Este vector es lo que guardarás en tu base de datos (puedes usar PostgreSQL con pgvector o MongoDB).
    """
    try:
        # Extrae las características usando el modelo FaceNet (muy preciso y ligero)
        embedding_objs = DeepFace.represent(img_path=ruta_imagen, model_name="Facenet")
        # Obtenemos el vector numérico del primer rostro detectado
        embedding = embedding_objs[0]["embedding"]
        return embedding
    except Exception as e:
        print(f"Error al procesar el rostro: {e}")
        return None

def verificar_usuario(ruta_foto_captura, vector_guardado_db):
    """
    Compara una captura en vivo enviada por el frontend contra el vector de la Base de Datos.
    """
    try:
        # Extrae el vector de la foto instantánea actual
        actual_embedding_objs = DeepFace.represent(img_path=ruta_foto_captura, model_name="Facenet")
        actual_embedding = actual_embedding_objs[0]["embedding"]
        
        # Convierte las listas a arrays de numpy para calcular la distancia matemática
        v1 = np.array(vector_guardado_db)
        v2 = np.array(actual_embedding)
        
        # Distancia del coseno: mide qué tan idénticos son dos vectores
        distancia = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
        
        # En FaceNet, una similitud del coseno cercana a 1 (o distancia muy baja) significa que es la misma persona
        # Un umbral seguro para FaceNet suele ser >= 0.60 para confirmar identidad
        es_valido = distancia >= 0.65 
        
        return {"autenticado": bool(es_valido), "score_similitud": float(distancia)}
    except Exception as e:
        print(f"Error en la verificación: {e}")
        return {"autenticado": False, "error": str(e)}
