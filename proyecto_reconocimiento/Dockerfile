# Imagen base oficial limpia
FROM python:3.10-slim

# Instalar librerías gráficas esenciales para OpenCV
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglx-mesa0 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Actualizar el gestor de paquetes básico
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Instalar el ecosistema web y utilidades administrativas de Firebase
RUN pip install --no-cache-dir fastapi==0.100.0 uvicorn python-multipart firebase-admin

# SOLUCIÓN CRÍTICA: Bloquear Keras y TensorFlow en la versión 2.15.0 homologada
# Esto evita que DeepFace fuerce la descarga de versiones rotas
RUN pip install --no-cache-dir tensorflow-cpu==2.15.0 tf-keras==2.15.0
RUN pip install --no-cache-dir deepface==0.0.93

# Copiar el código fuente
COPY . /app

EXPOSE 8080

# Iniciar la aplicación web en la interfaz correcta exigida por Google Cloud Run
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
