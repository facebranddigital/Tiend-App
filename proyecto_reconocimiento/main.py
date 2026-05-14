import os
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from facial_auth import verificar_usuario, generar_vector_rostro

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# VARIABLE GLOBAL TEMPORAL: Guardará tu vector real cuando te registres
VECTOR_REGISTRADO_EN_MEMORIA = None

# Ruta nueva para abrir la aplicación de la cámara directamente desde el servidor
@app.get("/", response_class=HTMLResponse)
async def obtener_interfaz():
    ruta_html = os.path.join(os.path.dirname(__file__), "index.html")
    if os.path.exists(ruta_html):
        with open(ruta_html, "r", encoding="utf-8") as archivo:
            return archivo.read()
    return "<h1>Error: No se encontró el archivo index.html en la carpeta</h1>"

# Endpoint 1: Registrar tu rostro por primera vez
@app.post("/api/user/register-face")
async def registrar_rostro(file: UploadFile = File(...)):
    global VECTOR_REGISTRADO_EN_MEMORIA
    ruta_temporal = "/tmp/registro_rostro.jpg"
    os.makedirs("/tmp", exist_ok=True)
    
    with open(ruta_temporal, "wb") as buffer:
        buffer.write(await file.read())
        
    vector = generar_vector_rostro(ruta_temporal)
    
    if os.path.exists(ruta_temporal):
        os.remove(ruta_temporal)
        
    if vector is not None:
        VECTOR_REGISTRADO_EN_MEMORIA = vector
        return {"status": "success", "message": "Rostro registrado correctamente"}
        
    raise HTTPException(status_code=400, detail="No se detectó un rostro claro en la imagen.")

# Endpoint 2: Verificar tu identidad contra el rostro registrado
@app.post("/api/user/verify-face")
async def verificar_perfil(file: UploadFile = File(...)):
    global VECTOR_REGISTRADO_EN_MEMORIA
    if VECTOR_REGISTRADO_EN_MEMORIA == None:
        raise HTTPException(status_code=400, detail="Primero debes registrar tu rostro.")
        
    ruta_temporal = "/tmp/verificacion_rostro.jpg"
    os.makedirs("/tmp", exist_ok=True)
    
    with open(ruta_temporal, "wb") as buffer:
        buffer.write(await file.read())
        
    resultado = verificar_usuario(ruta_temporal, VECTOR_REGISTRADO_EN_MEMORIA)
    
    if os.path.exists(ruta_temporal):
        os.remove(ruta_temporal)
        
    if resultado.get("autenticado"):
        return {"status": "success", "message": "Acceso concedido"}
        
    raise HTTPException(status_code=401, detail="El rostro no coincide con el registrado.")
