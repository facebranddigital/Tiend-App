import os
import uuid
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import firebase_admin
from firebase_admin import credentials, firestore
from facial_auth import verificar_usuario, generar_vector_rostro

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ruta_credenciales = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")

if not firebase_admin._apps:
    if os.path.exists(ruta_credenciales):
        cred = credentials.Certificate(ruta_credenciales)
        firebase_admin.initialize_app(cred)
    else:
        firebase_admin.initialize_app()

db = firestore.client()
COLECCION_USUARIOS = "usuarios_biometria"
RUTA_TMP = "/tmp/facial_auth"
os.makedirs(RUTA_TMP, exist_ok=True)

MIME_PERMITIDOS = {"image/jpeg", "image/png"}

def validar_imagen(file: UploadFile):
    if file.content_type not in MIME_PERMITIDOS:
        raise HTTPException(
            status_code=400, 
            detail=f"Tipo de archivo no permitido: {file.content_type}. Use JPG o PNG."
        )

@app.get("/", response_class=HTMLResponse)
async def obtener_interfaz():
    ruta_html = os.path.join(os.path.dirname(__file__), "index.html")
    if os.path.exists(ruta_html):
        with open(ruta_html, "r", encoding="utf-8") as archivo:
            return HTMLResponse(content=archivo.read(), status_code=200)
    raise HTTPException(status_code=404, detail="Archivo index.html no encontrado.")

@app.post("/api/user/register-face")
async def registrar_rostro(usuario_id: str = Form(...), file: UploadFile = File(...)):
    validar_imagen(file)
    id_unico = uuid.uuid4().hex
    ruta_temporal = os.path.join(RUTA_TMP, f"reg_{id_unico}.jpg")
    
    try:
        with open(ruta_temporal, "wb") as buffer:
            buffer.write(await file.read())
            
        vector = generar_vector_rostro(ruta_temporal)
        if vector is not None:
            doc_ref = db.collection(COLECCION_USUARIOS).document(usuario_id)
            doc_ref.set({
                "usuario_id": usuario_id,
                "vector_facial": vector 
            })
            return {"status": "success", "message": f"Rostro registrado para: {usuario_id}"}
        raise HTTPException(status_code=400, detail="No se detectó un rostro claro.")
    finally:
        if os.path.exists(ruta_temporal):
            os.remove(ruta_temporal)

@app.post("/api/user/verify-face")
async def verificar_perfil(usuario_id: str = Form(...), file: UploadFile = File(...)):
    validar_imagen(file)
    
    doc_ref = db.collection(COLECCION_USUARIOS).document(usuario_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="El usuario no está registrado biométricamente.")
        
    vector_guardado_db = doc.to_dict().get("vector_facial")
    id_unico = uuid.uuid4().hex
    ruta_temporal = os.path.join(RUTA_TMP, f"ver_{id_unico}.jpg")
    
    try:
        with open(ruta_temporal, "wb") as buffer:
            buffer.write(await file.read())
            
        resultado = verificar_usuario(ruta_temporal, vector_guardado_db)
        if resultado and resultado.get("autenticado"):
            return {"status": "success", "message": "Acceso concedido", "score": resultado.get("score_similitud")}
        raise HTTPException(status_code=401, detail="El rostro no coincide.")
    finally:
        if os.path.exists(ruta_temporal):
            os.remove(ruta_temporal)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
