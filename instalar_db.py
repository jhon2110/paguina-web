from app import app, db, Usuario
from werkzeug.security import generate_password_hash
from datetime import datetime

def configurar_seguridad():
    # Nos conectamos a la aplicación principal
    with app.app_context():
        
        # 1. ESTO CREA LA BASE DE DATOS Y TODAS LAS TABLAS (si no existen)
        db.create_all()
        print("✅ Base de datos 'tienda.db' creada y verificada.")

        print("\n========================================")
        print("   🛡️ CREAR ADMINISTRADOR SEGURO 🛡️")
        print("========================================\n")
        
        username = input("👤 Ingresa tu nombre de usuario (Ej: admin_sira): ")
        
        # Revisamos que no exista para no duplicarlo
        if Usuario.query.filter_by(username=username).first():
            print(f"\n❌ Error: El usuario '{username}' ya existe.")
            return

        password = input("🔑 Ingresa tu contraseña secreta: ")
        
        # 2. AQUÍ OCURRE LA ENCRIPTACIÓN (Ciberseguridad básica)
        pass_encriptada = generate_password_hash(password)
        fecha_hoy = datetime.now().strftime("%d %b %Y")

        # 3. GUARDAMOS EN LA BASE DE DATOS
        nuevo_usuario = Usuario(
            username=username,
            password_hash=pass_encriptada, # Guardamos el texto mezclado, NUNCA la clave original
            es_admin=True,
            rol='owner',
            estado='activo',
            fecha_creacion=fecha_hoy
        )
        
        db.session.add(nuevo_usuario)
        db.session.commit()
        
        print(f"\n✅ ¡Éxito! El usuario '{username}' ha sido creado.")
        print("🔒 La contraseña ha sido encriptada y guardada de forma segura.")
        print("========================================\n")

if __name__ == '__main__':
    configurar_seguridad()