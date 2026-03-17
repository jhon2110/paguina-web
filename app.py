from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
from werkzeug.utils import secure_filename

import google.generativeai as genai
import pandas as pd

app = Flask(__name__)

# OJO: Por seguridad, recuerda cambiar esta llave pronto en Google AI Studio
genai.configure(api_key="AIzaSyDT2VJB_WXyAg2SOQPqg3WFC_oMiDMHXIw")

nombre_modelo = 'gemini-2.5-flash' 
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            nombre_modelo = m.name.replace('models/', '')
            print(f"¡Cerebro conectado exitosamente! Usando: {nombre_modelo}")
            break
except Exception as e:
    print("No se pudo listar los modelos:", e)

modelo_ia = genai.GenerativeModel(nombre_modelo)

# Configuración 
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tienda.db'
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['SECRET_KEY'] = 'sira_secret_key_2026'
db = SQLAlchemy(app)

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# --- MODELOS ---
class Producto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    modelo = db.Column(db.String(100), nullable=False)
    marca = db.Column(db.String(50), default='Otros')
    especificaciones = db.Column(db.Text)
    disponibilidad = db.Column(db.String(50), default='en_stock')
    estado = db.Column(db.String(20), default='normal')
    imagen_url = db.Column(db.String(200))
    precio_3a = db.Column(db.Float, nullable=True)
    precio_nucleo = db.Column(db.Float, nullable=True)
    precio_original = db.Column(db.Float, nullable=True)
    precio_diagnostico = db.Column(db.Float, nullable=True)

class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    es_admin = db.Column(db.Boolean, default=False)
    rol = db.Column(db.String(50), default='cliente') # owner, empleado, cliente
    fecha_creacion = db.Column(db.String(50), default='26 Feb 2026')
    estado = db.Column(db.String(20), default='activo')
    # 🔥 NUEVOS CAMPOS DEL PLAN MAESTRO:
    tipo_cliente = db.Column(db.String(20), default='minorista') # minorista o mayorista
    puntos = db.Column(db.Integer, default=0)

# 🔥 NUEVA TABLA PARA GUARDAR LAS COMPRAS
class Pedido(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, nullable=False) # De quién es el pedido
    detalles_json = db.Column(db.Text, nullable=False) # Qué compró
    total = db.Column(db.Float, nullable=False)
    estado = db.Column(db.String(50), default='Enviado') # Enviado, En proceso de verificacion, Aprobado
    fecha = db.Column(db.String(50))

class Anuncio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100))
    vigencia = db.Column(db.String(50))
    posicion = db.Column(db.String(50))
    estado = db.Column(db.String(20), default='activo')
    imagen_url = db.Column(db.String(200))

with app.app_context():
    db.create_all()

# --- RUTAS PRINCIPALES ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/login', methods=['POST'])
def login():
    datos = request.json
    user = Usuario.query.filter_by(username=datos.get('username')).first()
    
    # 🔥 ESCUDO ANTI-ERRORES: Buscamos si la contraseña llega como 'password' o como 'pass'
    clave_recibida = datos.get('password') or datos.get('pass')
    
    # Nos aseguramos de que el usuario exista y de que 'clave_recibida' no esté vacía antes de verificarla
    if user and clave_recibida and check_password_hash(user.password_hash, clave_recibida):
        return jsonify({
            "success": True,
            "id": user.id,
            "username": user.username,
            "es_admin": user.es_admin,
            "rol": user.rol,
            "tipo_cliente": user.tipo_cliente,
            "puntos": user.puntos
        })
    return jsonify({"success": False, "mensaje": "Usuario o contraseña incorrectos"}), 401

@app.route('/api/registro', methods=['POST'])
def registro_cliente():
    datos = request.json
    if Usuario.query.filter_by(username=datos.get('username')).first():
        return jsonify({"success": False, "mensaje": "Ese nombre de usuario ya existe."}), 400
    
    import datetime
    nuevo_user = Usuario(
        username=datos.get('username'),
        password_hash=generate_password_hash(datos.get('password')),
        rol='cliente',
        tipo_cliente='minorista',
        puntos=0,
        fecha_creacion=datetime.datetime.now().strftime("%d %b %Y")
    )
    db.session.add(nuevo_user)
    db.session.commit()
    return jsonify({"success": True, "mensaje": "¡Cuenta creada con éxito! Ya puedes iniciar sesión."})

# --- RUTAS DE PRODUCTOS ---
def limpiar_precio(valor):
    try: return float(valor)
    except: return None

@app.route('/api/productos', methods=['POST'])
def crear_producto():
    # 1. Procesar hasta 3 imágenes (Pueden ser archivos de PC o links de internet)
    imagenes_guardadas = []
    for i in range(1, 4):
        file = request.files.get(f'imagen_file_{i}')
        url = request.form.get(f'imagen_url_{i}')
        
        if file and file.filename != '':
            filename = secure_filename(file.filename)
            ruta_guardado = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(ruta_guardado)
            imagenes_guardadas.append(f"/{ruta_guardado}")
        elif url and url.strip() != '':
            imagenes_guardadas.append(url.strip())

    # Unimos las fotos con comas (Ej: "foto1.jpg,link2.com"). Si no hay, ponemos la de por defecto.
    filepath = ",".join(imagenes_guardadas) if len(imagenes_guardadas) > 0 else "/static/uploads/sin-foto.jpeg"

    # 2. Juntamos la categoría con las especificaciones para no romper tu base de datos
    categoria = request.form.get('categoria', 'General')
    detalles = request.form.get('especificaciones', '')
    especificaciones_finales = f"{categoria} | {detalles}"

    nuevo_p = Producto(
        modelo=request.form.get('modelo', 'Sin modelo'),
        marca=request.form.get('marca', 'Otros'),
        especificaciones=especificaciones_finales,
        disponibilidad=request.form.get('disponibilidad', 'en_stock'),
        estado=request.form.get('estado', 'normal'),
        precio_3a=limpiar_precio(request.form.get('precio_3a')),
        precio_nucleo=limpiar_precio(request.form.get('precio_nucleo')),
        precio_original=limpiar_precio(request.form.get('precio_original')),
        precio_diagnostico=limpiar_precio(request.form.get('precio_diagnostico')),
        imagen_url=filepath
    )
    db.session.add(nuevo_p)
    db.session.commit()
    return jsonify({"mensaje": "Producto creado con éxito"}), 201

@app.route('/api/productos/<int:id>', methods=['POST'])
def actualizar_producto(id):
    producto = Producto.query.get(id)
    if not producto: return jsonify({'success': False}), 404
    
    # Actualizamos textos
    producto.modelo = request.form.get('modelo', producto.modelo)
    producto.marca = request.form.get('marca', producto.marca)
    producto.disponibilidad = request.form.get('disponibilidad', producto.disponibilidad)
    producto.estado = request.form.get('estado', producto.estado)
    
    categoria = request.form.get('categoria', 'General')
    detalles = request.form.get('especificaciones', '')
    producto.especificaciones = f"{categoria} | {detalles}"
    
    producto.precio_3a = limpiar_precio(request.form.get('precio_3a'))
    producto.precio_nucleo = limpiar_precio(request.form.get('precio_nucleo'))
    producto.precio_original = limpiar_precio(request.form.get('precio_original'))
    producto.precio_diagnostico = limpiar_precio(request.form.get('precio_diagnostico'))
    
    # Procesar imágenes nuevas
    imagenes_guardadas = []
    for i in range(1, 4):
        file = request.files.get(f'imagen_file_{i}')
        url = request.form.get(f'imagen_url_{i}')
        
        if file and file.filename != '':
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            imagenes_guardadas.append(f"/{filepath}")
        elif url and url.strip() != '':
            imagenes_guardadas.append(url.strip())
            
    # Solo cambiamos las fotos si el usuario subió alguna nueva en el formulario
    if len(imagenes_guardadas) > 0:
        producto.imagen_url = ",".join(imagenes_guardadas)
        
    db.session.commit()
    return jsonify({'success': True, 'mensaje': 'Producto actualizado'})


@app.route('/api/productos/excel', methods=['POST'])
def subir_excel():
    if 'documento' not in request.files:
        return jsonify({'success': False, 'mensaje': 'No se envió ningún archivo'})
    
    file = request.files['documento']
    if file.filename == '':
        return jsonify({'success': False, 'mensaje': 'Archivo vacío'})
    
    try:
        # 1. Leemos el Excel
        df = pd.read_excel(file)
        
        # 2. Convertimos los valores vacíos (NaN) a cadenas o números limpios
        df = df.fillna('')
        
        # 3. Guardamos producto por producto
        productos_creados = 0
        for index, row in df.iterrows():
            if str(row.get('modelo', '')).strip() == '':
                continue # Si no hay modelo, saltamos esa fila
                
            # 🔥 MAGIA: Unimos la Categoría y las Especificaciones como lo hace el formulario
            cat = str(row.get('categoria', 'General')).strip()
            esp = str(row.get('especificaciones', '')).strip()
            especificaciones_finales = f"{cat} | {esp}" if cat else esp

            nuevo_p = Producto(
                modelo=str(row.get('modelo', 'Sin modelo')),
                marca=str(row.get('marca', 'Otros')),
                especificaciones=especificaciones_finales,
                disponibilidad=str(row.get('disponibilidad', 'en_stock')),
                estado=str(row.get('estado', 'normal')),
                precio_3a=limpiar_precio(row.get('precio_3a')) if row.get('precio_3a') != '' else None,
                precio_nucleo=limpiar_precio(row.get('precio_nucleo')) if row.get('precio_nucleo') != '' else None,
                precio_original=limpiar_precio(row.get('precio_original')) if row.get('precio_original') != '' else None,
                precio_diagnostico=limpiar_precio(row.get('precio_diagnostico')) if row.get('precio_diagnostico') != '' else None,
                imagen_url="/static/uploads/sin-foto.png" # Imagen por defecto a todos
            )
            db.session.add(nuevo_p)
            productos_creados += 1
            
        db.session.commit()
        return jsonify({'success': True, 'mensaje': f'¡Se subieron {productos_creados} productos exitosamente!'})
    except Exception as e:
        print("Error en Excel:", e)
        return jsonify({'success': False, 'mensaje': 'Error al leer el Excel. Asegúrate de tener las columnas correctas.'})

# ==========================================
# HERRAMIENTA DE MANTENIMIENTO: REPARAR FOTOS
# ==========================================
@app.route('/api/mantenimiento/reparar-fotos', methods=['GET'])
def reparar_fotos():
    import os
    productos = Producto.query.all()
    reparados = 0
    foto_defecto = "/static/uploads/sin-foto.jpeg" # Asegúrate de que este archivo exista
    
    for p in productos:
        # Quitamos el '/' inicial para que Python busque en las carpetas de tu PC
        ruta_local = p.imagen_url.lstrip('/') if p.imagen_url else ''
        
        # Verificamos si la ruta está vacía o si el archivo NO existe realmente en la carpeta
        if not ruta_local or not os.path.exists(ruta_local):
            p.imagen_url = foto_defecto
            reparados += 1
            
    db.session.commit()
    return jsonify({'success': True, 'mensaje': f'¡Mantenimiento exitoso! Se detectaron y repararon {reparados} productos con imágenes rotas.'})

@app.route('/api/productos/buscar', methods=['GET'])
def buscar_productos():
    productos = Producto.query.all()
    resultado = []
    for p in productos:
        precios_validos = [pr for pr in [p.precio_3a, p.precio_nucleo, p.precio_original, p.precio_diagnostico] if pr is not None]
        precio_base = min(precios_validos) if precios_validos else 0.0
        
        resultado.append({
            "id": p.id, "modelo": p.modelo, "marca": p.marca,
            "disponibilidad": p.disponibilidad, "estado": p.estado,
            "especificaciones": p.especificaciones, "imagen": p.imagen_url,
            "precio": precio_base, 
            "precios": {
                "3a": p.precio_3a, "nucleo": p.precio_nucleo,
                "original": p.precio_original, "diagnostico": p.precio_diagnostico
            }
        })
    return jsonify(resultado)



@app.route('/api/productos/<int:id>', methods=['DELETE'])
def eliminar_producto(id):
    producto = Producto.query.get(id)
    if producto:
        db.session.delete(producto)
        db.session.commit()
        return jsonify({'success': True, 'mensaje': 'Producto eliminado'})
    return jsonify({'success': False, 'mensaje': 'Producto no encontrado'}), 404


# --- RUTAS DE ANUNCIOS ---
@app.route('/api/anuncios', methods=['GET', 'POST'])
def manejar_anuncios():
    if request.method == 'POST':
        nombre = request.form.get('nombre')
        vigencia = request.form.get('vigencia')
        posicion = request.form.get('posicion')
        file = request.files.get('imagen')
        
        filepath = ""
        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            filepath = f"/{filepath}"
            
        nuevo_anuncio = Anuncio(nombre=nombre, vigencia=vigencia, posicion=posicion, imagen_url=filepath)
        db.session.add(nuevo_anuncio)
        db.session.commit()
        return jsonify({'success': True, 'mensaje': 'Anuncio guardado'})
    
    else: 
        anuncios = Anuncio.query.all()
        return jsonify([{"id": a.id, "nombre": a.nombre, "vigencia": a.vigencia, "posicion": a.posicion, "estado": a.estado, "imagen": a.imagen_url} for a in anuncios])

@app.route('/api/anuncios/<int:id>', methods=['POST'])
def actualizar_anuncio(id):
    anuncio = Anuncio.query.get(id)
    if not anuncio: return jsonify({'success': False}), 404
    
    anuncio.nombre = request.form.get('nombre', anuncio.nombre)
    anuncio.vigencia = request.form.get('vigencia', anuncio.vigencia)
    anuncio.posicion = request.form.get('posicion', anuncio.posicion)
    
    file = request.files.get('imagen')
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        anuncio.imagen_url = f"/{filepath}"
        
    db.session.commit()
    return jsonify({'success': True, 'mensaje': 'Anuncio actualizado'})

@app.route('/api/anuncios/<int:id>', methods=['DELETE'])
def eliminar_anuncio(id):
    anuncio = Anuncio.query.get(id)
    if anuncio:
        db.session.delete(anuncio)
        db.session.commit()
        return jsonify({'success': True, 'mensaje': 'Anuncio eliminado'})
    return jsonify({'success': False, 'mensaje': 'Anuncio no encontrado'}), 404


# --- RUTAS DE USUARIOS ---
@app.route('/api/usuarios', methods=['GET', 'POST'])
def manejar_usuarios():
    if request.method == 'POST':
        datos = request.json
        nuevo_user = Usuario(
            username=datos.get('username'),
            password_hash=datos.get('pass'), 
            rol=datos.get('rol'),
            es_admin=True if datos.get('rol') == 'owner' else False
        )
        db.session.add(nuevo_user)
        db.session.commit()
        return jsonify({'success': True, 'mensaje': 'Usuario creado'})
    
    else: 
        usuarios = Usuario.query.all()
        return jsonify([{
            'id': u.id,  
            'username': u.username, 
            'rol': u.rol, 
            'estado': u.estado, 
            'fecha_creacion': u.fecha_creacion
        } for u in usuarios])
    
@app.route('/api/usuarios/<int:id>', methods=['POST'])
def actualizar_usuario(id):
    usuario = Usuario.query.get(id)
    if not usuario: 
        return jsonify({'success': False, 'mensaje': 'Usuario no encontrado'}), 404
    
    datos = request.json
    usuario.username = datos.get('username', usuario.username)
    usuario.rol = datos.get('rol', usuario.rol)
    usuario.es_admin = True if usuario.rol == 'owner' else False
    
    if datos.get('pass') and str(datos.get('pass')).strip() != '':
        usuario.password_hash = generate_password_hash(datos.get('pass'))
        
    db.session.commit()
    return jsonify({'success': True, 'mensaje': 'Usuario actualizado'})

@app.route('/api/usuarios/<int:id>', methods=['DELETE'])
def eliminar_usuario(id):
    usuario = Usuario.query.get(id)
    if usuario and usuario.username != 'admin_sira': 
        db.session.delete(usuario)
        db.session.commit()
        return jsonify({'success': True, 'mensaje': 'Usuario eliminado'})
    return jsonify({'success': False, 'mensaje': 'No se puede eliminar este usuario'}), 400

# ==========================================
# RUTAS DE PEDIDOS (NUEVO SISTEMA)
# ==========================================
@app.route('/api/pedidos/nuevo', methods=['POST'])
def nuevo_pedido():
    datos = request.json
    usuario_id = datos.get('usuario_id')
    carrito_cliente = datos.get('carrito')
    
    import datetime
    fecha_actual = datetime.datetime.now().strftime("%d %b %Y %H:%M")
    
    detalles_texto = ""
    total_pedido = 0.0
    
    # Armamos el "recibo" en texto y calculamos el total
    for item in carrito_cliente:
        sub = float(item['precio']) * int(item['cantidad'])
        total_pedido += sub
        detalles_texto += f"- {item['cantidad']}x {item['modelo']} (Calidad: {item['calidad']}) -> S/ {sub:.2f}\n"
        
    # Guardamos en la base de datos
    nuevo_p = Pedido(
        usuario_id=usuario_id,
        detalles_json=detalles_texto,
        total=total_pedido,
        estado='Enviado', # Estado inicial por defecto
        fecha=fecha_actual
    )
    db.session.add(nuevo_p)
    db.session.commit()
    
    # Generamos el enlace inteligente de WhatsApp
    texto_wa = f"Hola SiraStore, soy cliente y mi número de pedido es *#{nuevo_p.id}*%0A%0A"
    texto_wa += detalles_texto.replace('\n', '%0A')
    texto_wa += f"%0A💰 *TOTAL A PAGAR: S/ {total_pedido:.2f}*"
    texto_wa += f"%0A%0AQuedo atento. ¡Gracias!"
    
    numero_wa = "+51913698771" # Tu número
    enlace = f"https://wa.me/{numero_wa}?text={texto_wa}"
    
    return jsonify({'success': True, 'enlace_whatsapp': enlace})

@app.route('/api/admin/pedidos/<int:pedido_id>', methods=['DELETE'])
def eliminar_pedido_admin(pedido_id):
    # Buscamos el pedido
    pedido = Pedido.query.get(pedido_id)
    if pedido:
        db.session.delete(pedido) # Lo borramos de la base de datos
        db.session.commit()       # Guardamos los cambios
        return jsonify({'success': True})
    return jsonify({'success': False, 'mensaje': 'Pedido no encontrado'})

# ==========================================
# RUTAS DE ADMINISTRADOR PARA PEDIDOS
# ==========================================
@app.route('/api/admin/pedidos', methods=['GET'])
def obtener_todos_pedidos():
    # El admin necesita ver TODOS los pedidos, del más nuevo al más viejo
    pedidos = Pedido.query.order_by(Pedido.id.desc()).all()
    resultados = []
    
    for p in pedidos:
        # Buscamos quién es el dueño del pedido para mostrar su nombre
        usuario = Usuario.query.get(p.usuario_id)
        nombre_cliente = usuario.username if usuario else "Cliente Desconocido"
        
        resultados.append({
            'id': p.id,
            'cliente': nombre_cliente,
            'detalles': p.detalles_json,
            'total': p.total,
            'estado': p.estado,
            'fecha': p.fecha
        })
    return jsonify(resultados)

@app.route('/api/admin/pedidos/estado/<int:pedido_id>', methods=['POST'])
def cambiar_estado_pedido(pedido_id):
    # Esta ruta recibe el clic del admin para cambiar el estado
    datos = request.json
    nuevo_estado = datos.get('estado')
    
    pedido = Pedido.query.get(pedido_id)
    if pedido:
        pedido.estado = nuevo_estado
        db.session.commit()
        return jsonify({'success': True})
    return jsonify({'success': False, 'mensaje': 'Pedido no encontrado'})

@app.route('/api/pedidos/usuario/<int:user_id>', methods=['GET'])
def obtener_pedidos_usuario(user_id):
    # Buscamos todos los pedidos de este cliente, ordenados del más nuevo al más viejo
    pedidos = Pedido.query.filter_by(usuario_id=user_id).order_by(Pedido.id.desc()).all()
    return jsonify([{
        'id': p.id,
        'detalles': p.detalles_json,
        'total': p.total,
        'estado': p.estado,
        'fecha': p.fecha
    } for p in pedidos])    

# ==========================================
# RUTA DEL CHATBOT CON INTELIGENCIA ARTIFICIAL
# ==========================================
@app.route('/api/chat', methods=['POST'])
def chat_ia():
    import re # Herramienta para buscar códigos secretos
    
    datos = request.json
    mensaje_cliente = datos.get('mensaje')

    productos_db = Producto.query.all()
    inventario = "INVENTARIO ACTUAL:\n"
    for p in productos_db:
        precios_validos = [pr for pr in [p.precio_3a, p.precio_nucleo, p.precio_original, p.precio_diagnostico] if pr is not None]
        precio_base = min(precios_validos) if precios_validos else 0.0
        inventario += f"- ID: {p.id} | Modelo: {p.modelo} | Precio desde: S/ {precio_base}\n"

    instrucciones = f"""
    Eres SiraBot, asistente de ventas de SiraStore.
    
    INVENTARIO:
    {inventario}
    
    REGLAS:
    1. Responde amable, corto y con emojis.
    2. Si el producto SÍ ESTÁ en el inventario, dile el precio y OBLIGATORIAMENTE escribe este código al final de tu mensaje: [FILTRAR_ID: NUMERO]
    (Reemplaza NUMERO por el ID real del producto).
    3. Si NO lo tenemos, solo discúlpate amablemente y no escribas el código.
    
    Mensaje del cliente: "{mensaje_cliente}"
    """

    try:
        respuesta = modelo_ia.generate_content(instrucciones)
        texto_ia = respuesta.text
        
        # 1. Buscamos si la IA puso la señal secreta
        match = re.search(r'\[FILTRAR_ID:\s*(\d+)\]', texto_ia)
        producto_id = None
        
        if match:
            producto_id = int(match.group(1)) # Guardamos el ID detectado
            # 2. Borramos el código del mensaje para que el cliente no lo vea
            texto_ia = re.sub(r'\[FILTRAR_ID:\s*\d+\]', '', texto_ia).strip()
            
        # Mandamos el mensaje limpio, y si hubo ID, también lo mandamos por separado
        return jsonify({'success': True, 'respuesta': texto_ia, 'filtrar_id': producto_id})
    except Exception as e:
        print("Error de IA:", e)
        return jsonify({'success': False, 'respuesta': 'Me quedé sin internet 🔌'})
    
    
# ==========================================
# ARRANQUE DEL SERVIDOR
# ==========================================
if __name__ == '__main__':
    app.run(debug=True, port=8080)
    