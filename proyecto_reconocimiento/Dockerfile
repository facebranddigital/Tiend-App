# Usamos una imagen ligera oficial de Python
FROM python:3.8-slim

# Instalar dependencias del sistema operativo que OpenCV necesita para funcionar
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Definir la carpeta de trabajo dentro del contenedor
WORKDIR /app

# Instalar primero procesamiento matemático e imágenes
RUN pip install --no-cache-dir numpy==1.24.3 pandas Pillow

# Instalar la versión ligera de TensorFlow para CPU de forma aislada
RUN pip install --no-cache-dir tensorflow-cpu==2.13.1

# Instalar las librerías de visión por computadora e inteligencia facial
# Permitimos que Pydantic se actualice a V2 para cumplir los requisitos de DeepFace
RUN pip install --no-cache-dir opencv-python-headless deepface --no-deps
RUN pip install --no-cache-dir retina-face==0.0.17 mtcnn lightphe lightdsa fire

# Instalar el servidor web FastAPI y herramientas de Firebase (sin forzar Pydantic V1)
RUN pip install --no-cache-dir fastapi==0.100.0 uvicorn python-multipart firebase-admin

# Copiar el resto de los archivos de código al contenedor
COPY . /app

# Crear la carpeta de caché para que DeepFace guarde los pesos de la IA internamente
RUN mkdir -p /root/.deepface/weights

# CORREGIDO: 'facenet' en minúsculas para la descarga correcta de pesos en la compilación
RUN python -c "from deepface import DeepFace; DeepFace.build_model('facenet')"

# Exponer el puerto por defecto de Cloud Run
EXPOSE 8080

# Comando para arrancar el servidor en producción apuntando al puerto correcto
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
