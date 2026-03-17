// ==========================================
// 1. OBJETO DE SECCIONES (VISTAS HTML)
// ==========================================
const secciones = {
    inicio: `
        <div class="carousel" id="main-carousel">
            <div id="carousel-inner">
                <p style="text-align:center; padding: 50px;">Cargando ofertas...</p>
            </div>
            <button class="carousel-control prev" onclick="moveCarousel(-1)">❮</button>
            <button class="carousel-control next" onclick="moveCarousel(1)">❯</button>
        </div>
        
        <div class="main-wrapper">
            <h2 style="color: #232f3e; margin-bottom: 20px;">🔥 Más Vendidos</h2>
            <div class="grid-productos" id="contenedor-inicio"></div>
        </div>
    `,
    
    tienda: `
        <div class="tienda-layout" style="display: flex; gap: 20px; padding: 20px;">
            <aside class="sidebar" style="width: 200px;">
                <h3>Filtros</h3>
                <ul style="list-style: none; padding: 0; cursor: pointer;">
                    <li onclick="renderizarProductos('?estado=oferta', 'contenedor-tienda')" style="margin-bottom: 10px;">🔥 Ofertas</li>
                    <li onclick="renderizarProductos('?estado=mas_vendido', 'contenedor-tienda')" style="margin-bottom: 10px;">⭐ Más Vendidos</li>
                    <li onclick="renderizarProductos('', 'contenedor-tienda')" style="margin-bottom: 10px;">📦 Todos</li>
                </ul>
            </aside>
            <section class="productos-area" style="flex: 1;">
                <div class="grid-productos" id="contenedor-tienda"></div>
            </section>
        </div>
    `,
    
    ofertas: `
        <div class="main-wrapper">
            <h2 class="page-header">🔥 Ofertas Especiales</h2>
            <div class="grid-productos" id="contenedor-ofertas"></div>
        </div>
    `,
    
    carrito: `
        <div class="main-wrapper">
            <h2 class="page-header">🛒 Tu Carrito</h2>
            
            <div id="items-carrito" style="margin-bottom: 20px; background: #fff; padding: 20px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                <p>Aún no has añadido productos.</p>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            
            <div style="display: flex; gap: 15px; justify-content: flex-end;">
                <button onclick="cargarSeccion('tienda')" style="background-color: #6c757d; color: white; padding: 15px 30px; border: none; border-radius: 50px; cursor: pointer; font-weight: bold;">Seguir Comprando</button>
                <button onclick="enviarPedidoWhatsApp(event)" style="background-color: #25D366; color: white; padding: 15px 30px; border: none; border-radius: 50px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 10px;">
                    📱 Enviar Pedido por WhatsApp
                </button>
            </div>
        </div>
    `,
    mis_pedidos: `
        <div class="main-wrapper">
            <h2 class="page-header">📦 Mis Pedidos</h2>
            <div id="contenedor-pedidos" style="display: flex; flex-direction: column; gap: 15px;">
                <p style="text-align:center; color:#666;">Cargando tus compras...</p>
            </div>
        </div>
    `,
    
    login: `
        <div class="main-wrapper auth-container">
            <div class="auth-card">
                <h2>Iniciar Sesión</h2>
                <form onsubmit="login(event)" id="login-form">
                    <input type="text" id="username" placeholder="Usuario" required>
                    <input type="password" id="password" placeholder="Contraseña" required>
                    <button type="submit">Entrar</button>
                </form>
            </div>
        </div>
    `,
    
    admin: `
        <div class="main-wrapper admin-menu-container" id="admin-main-view">
            <h1>Panel de Control</h1>
            <div class="admin-menu-grid">
                <div class="admin-menu-card" onclick="cargarSubMenu('pedidos')">
                    <div class="admin-icon-area">🧾</div>
                    <div class="admin-card-title">Pedidos</div>
                </div>
                <div class="admin-menu-card" onclick="cargarSubMenu('anuncios')">
                    <div class="admin-icon-area">📢</div>
                    <div class="admin-card-title">Anuncios</div>
                </div>
                <div class="admin-menu-card" onclick="cargarSubMenu('productos')">
                    <div class="admin-icon-area">📦</div>
                    <div class="admin-card-title">Productos</div>
                </div>
                <div class="admin-menu-card" onclick="cargarSubMenu('usuarios')">
                    <div class="admin-icon-area">👤</div>
                    <div class="admin-card-title">Usuarios</div>
                </div>
            </div>
        </div>
        <div class="main-wrapper" id="admin-sub-view" style="display: none; padding-top: 30px;"></div>
    `
};

let currentBannerIndex = 0;
let banners = [];

async function cargarBanners() {
    try {
        const res = await fetch('/api/anuncios');
        banners = await res.json();
        const carouselInner = document.getElementById('carousel-inner');
        
        if (carouselInner && banners.length > 0) {
            const bannersCarrusel = banners.filter(b => b.posicion === 'carrusel' || b.posicion === 'carrucel');
            
            carouselInner.innerHTML = bannersCarrusel.map((b, index) => `
                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                    <img src="${b.imagen}" alt="${b.nombre}">
                    <div class="carousel-caption">
                        <h2>${b.nombre}</h2>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error("Error cargando banners:", error);
    }
}

function showCarouselItem(index) {
    const items = document.querySelectorAll('.carousel-item');
    if (items.length === 0) return;

    items.forEach(item => item.classList.remove('active'));
    currentBannerIndex = (index + items.length) % items.length;
    items[currentBannerIndex].classList.add('active');
}

function moveCarousel(direction) {
    showCarouselItem(currentBannerIndex + direction);
}

setInterval(() => {
    if (document.querySelectorAll('.carousel-item').length > 1) {
        moveCarousel(1);
    }
}, 5000);

// ==========================================
// 3. TIENDA Y CARRITO DE COMPRAS
// ==========================================
async function renderizarProductos(params = '', idContenedor = 'contenedor-tienda') {
    try {
        const res = await fetch('/api/productos/buscar');
        let productos = await res.json();
        
        if (params.includes('estado=oferta')) {
            productos = productos.filter(p => p.estado.toLowerCase() === 'oferta');
        } 
        else if (params.includes('estado=mas_vendido')) {
            productos = productos.filter(p => p.disponibilidad === 'en_stock').slice(0, 8);
        }

        const contenedor = document.getElementById(idContenedor);
        
        if (contenedor) {
            if (productos.length === 0) {
                contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center; font-weight: bold; color: #666; font-size: 1.2rem; padding: 40px;">No hay repuestos en esta categoría.</p>';
                return;
            }
            
            contenedor.innerHTML = productos.map(p => {
                let stringFotos = p.imagen_url || p.imagen || '';
                let primeraFoto = stringFotos.split(',')[0].trim() || '/static/uploads/sin-foto.png';
                
                let esOferta = p.estado.toLowerCase() === 'oferta';
                let colorBadge = esOferta ? '#ff0000' : '#1a1a1a';
                let colorTextoBadge = esOferta ? '#ffffff' : '#ffd700'; 
                
                return `
                    <div class="card" style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); background: white; text-align: center;">
                        <div style="text-align: left;">
                            <span class="badge" style="background: ${colorBadge}; color: ${colorTextoBadge}; padding: 5px 12px; border-radius: 3px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; box-shadow: 1px 1px 3px rgba(0,0,0,0.3);">
                                ${esOferta ? '🔥 ' : ''} ${p.estado}
                            </span>
                        </div>
                        
                        <img src="${primeraFoto}" style="width:100%; border-radius: 5px; margin-top: 15px; height: 180px; object-fit: cover;" onerror="this.onerror=null; this.src='/static/uploads/sin-foto.png'">
                        
                        <h4 style="margin: 15px 0 5px 0; color: #1a1a1a;">${p.modelo}</h4>
                        <p style="font-size: 0.85rem; color: #666; margin-bottom: 10px;">Marca: ${p.marca}</p>
                        <p style="font-weight: bold; color: #cc0000; font-size: 1.2rem; margin-bottom: 15px;">Desde S/ ${p.precio.toFixed(2)}</p>
                        
                        <button onclick="abrirModalProducto(${p.id})" style="background: linear-gradient(to bottom, #333333, #111111); color: #ffd700; border: 2px solid #1a1a1a; padding: 12px; width: 100%; border-radius: 0px; cursor: pointer; font-weight: bold; text-transform: uppercase; transition: 0.3s;">
                            Ver opciones
                        </button>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

// ==========================================
// 4. AUTENTICACIÓN Y SEGURIDAD DE MENÚ (BLINDADO)
// ==========================================
function actualizarMenuSegunRol() {
    let user = null;
    try {
        let guardado = localStorage.getItem('usuario');
        if (guardado && guardado !== "undefined") {
            user = JSON.parse(guardado);
        } else {
            localStorage.removeItem('usuario'); 
        }
    } catch(e) { localStorage.removeItem('usuario'); }

    const navList = document.getElementById('nav-list');
    const loginLink = document.getElementById('login-link');
    
    const adminBtnAntiguo = document.getElementById('admin-btn');
    if (adminBtnAntiguo) adminBtnAntiguo.remove();

    if (user && loginLink) {
        loginLink.innerHTML = `
            <div style="position: relative; display: inline-block;">
                <a href="#" onclick="toggleUserMenu(event)" style="background: #1a1a1a; padding: 5px 15px; border-radius: 5px; color: #ffd700; font-weight: bold; border: 1px solid #ffd700;">
                    👤 ${user.username} <span style="font-size: 0.8rem; color: #ccc;">⭐ ${user.puntos} pts</span>
                </a>
                
                <div id="user-dropdown" style="display: none; position: absolute; right: 0; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-radius: 10px; padding: 15px; margin-top: 10px; min-width: 180px; z-index: 1000; border: 1px solid #eee;">
                    <div style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px; text-align: center;">
                        <div style="font-size: 2rem;">💳</div>
                        <h4 style="margin: 5px 0 0 0; color: #333;">${user.username}</h4>
                        <p style="margin: 0; font-size: 0.8rem; color: #888;">Cliente ${user.tipo_cliente === 'mayorista' ? '🌟 Mayorista' : 'Minorista'}</p>
                    </div>
                    <a href="#" onclick="cargarSeccion('mis_pedidos')" style="display: block; color: #333; margin-bottom: 15px; text-decoration: none; font-weight: bold;">📦 Mis Pedidos</a>
                    <a href="#" onclick="logout()" style="display: block; color: #dc3545; text-decoration: none; font-weight: bold;">🚪 Cerrar Sesión</a>
                </div>
            </div>
        `;
        
        if (user.es_admin || user.rol === 'owner' || user.rol === 'empleado') {
            const adminLi = document.createElement('li');
            adminLi.id = 'admin-btn';
            adminLi.innerHTML = `<a href="#" onclick="cargarSeccion('admin')" style="color:#ffd700; font-weight:bold;">⚙️ Panel Interno</a>`;
            navList.insertBefore(adminLi, loginLink);
        }
    } else if (!user && loginLink) {
        loginLink.innerHTML = `<a href="#" onclick="cargarSeccion('login')">Entrar</a>`;
    }
}

function toggleUserMenu(event) {
    event.preventDefault();
    const dropdown = document.getElementById('user-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

function logout() {
    localStorage.removeItem('usuario');
    location.reload();
}

// ==========================================
// 2. NAVEGACIÓN Y PROTECCIÓN DE RUTAS (BLINDADO)
// ==========================================
function cargarSeccion(nombre) {
    let user = null;
    try {
        let guardado = localStorage.getItem('usuario');
        if (guardado && guardado !== "undefined") user = JSON.parse(guardado);
    } catch(e) {}

    if (nombre === 'admin') {
        if (!user || (user.rol !== 'owner' && user.rol !== 'empleado' && !user.es_admin)) {
            alert("⛔ Acceso denegado. Esta zona es exclusiva para el equipo de SiraStore.");
            cargarSeccion('inicio'); 
            return;
        }
    }

    const contenedor = document.getElementById('app-content');
    if (!secciones[nombre]) {
        contenedor.innerHTML = '<h2 style="text-align:center; padding:50px;">🛠️ Página en construcción...</h2>';
        return;
    }

    contenedor.innerHTML = secciones[nombre];

    if (nombre === 'inicio') {
        renderizarProductos('?estado=mas_vendido', 'contenedor-inicio');
        cargarBanners(); 
    }
    if (nombre === 'tienda') renderizarProductos('', 'contenedor-tienda');
    if (nombre === 'ofertas') renderizarProductos('?estado=oferta', 'contenedor-ofertas');
    if (nombre === 'carrito') renderizarCarrito();
    if (nombre === 'mis_pedidos') renderizarMisPedidos();
}

// ==========================================
// LÓGICA DEL CARRITO (Con Memoria Permanente)
// ==========================================
let carrito = JSON.parse(localStorage.getItem('sira_carrito')) || [];

function guardarCarritoEnMemoria() {
    localStorage.setItem('sira_carrito', JSON.stringify(carrito)); 
    const contador = document.getElementById('cart-count');
    if (contador) {
        contador.innerText = carrito.reduce((sum, p) => sum + p.cantidad, 0);
    }
}

function agregarDesdeModal() {
    if (!productoModalActual) return;
    
    const opcionesDiv = document.getElementById('modal-opciones-calidad');
    const tieneCalidades = opcionesDiv.innerHTML.includes('btn-calidad');
    
    if (tieneCalidades && !calidadSeleccionada) {
        alert("⚠️ Por favor, selecciona una calidad antes de añadir al carrito.");
        return;
    }

    const nombreCalidad = calidadSeleccionada ? calidadSeleccionada : 'Estándar';
    const precioFinal = precioModalSeleccionado;

    const itemExistente = carrito.find(p => p.id === productoModalActual.id && p.calidad === nombreCalidad);
    
    if (itemExistente) {
        itemExistente.cantidad += cantidadModal; 
    } else {
        carrito.push({
            id: productoModalActual.id,
            modelo: productoModalActual.modelo,
            imagen: productoModalActual.imagen,
            cantidad: cantidadModal,
            calidad: nombreCalidad,
            precio: precioFinal
        });
    }

    guardarCarritoEnMemoria(); 
    cerrarModalProducto(); 
    cargarSeccion('carrito'); 
}

function cambiarCantidadCarrito(index, cambio) {
    carrito[index].cantidad += cambio;
    
    if (carrito[index].cantidad < 1) {
        const confirmar = confirm("¿Deseas quitar este repuesto de tu carrito?");
        if (confirmar) {
            eliminarDelCarrito(index);
            return; 
        } else {
            carrito[index].cantidad = 1; 
        }
    }
    
    guardarCarritoEnMemoria(); 
    renderizarCarrito(); 
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1); 
    guardarCarritoEnMemoria(); 
    renderizarCarrito(); 
}

async function renderizarCarrito() {
    const contenedor = document.getElementById('items-carrito');
    if (!contenedor) return;

    if (carrito.length === 0) {
        contenedor.innerHTML = '<p style="text-align: center; color: #666;">Tu carrito está vacío. ¡Ve a la tienda a buscar repuestos!</p>';
        return;
    }

    let html = '';
    let total = 0;

    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        let fotoCarrito = (item.imagen || '').split(',')[0].trim() || '/static/uploads/sin-foto.png';
        
        html += `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f0f0f0;"> 
                <img src="${fotoCarrito}" style="width: 60px; height: 60px; border-radius: 5px; object-fit: cover;" onerror="this.onerror=null; this.src='/static/uploads/sin-foto.png'">
                
                <div style="flex-grow: 1; padding: 0 15px;">
                    <h4 style="margin: 0; color: #333;">${item.modelo}</h4>
                    <p style="margin: 0; color: #2d5668; font-size: 0.85rem; font-weight: bold;">Calidad: ${item.calidad}</p>
                    
                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 8px;">
                        <button onclick="cambiarCantidadCarrito(${index}, -1)" style="padding: 2px 10px; font-weight: bold; border: 1px solid #ddd; border-radius: 5px; background: white; cursor: pointer; color: #333;">-</button>
                        <span style="font-weight: bold; color: #555; font-size: 1.1rem;">${item.cantidad}</span>
                        <button onclick="cambiarCantidadCarrito(${index}, 1)" style="padding: 2px 10px; font-weight: bold; border: 1px solid #ddd; border-radius: 5px; background: white; cursor: pointer; color: #333;">+</button>
                    </div>
                </div>
                
                <div style="font-weight: bold; color: #d35400; font-size: 1.1rem; min-width: 90px; text-align: right;">
                    S/ ${subtotal.toFixed(2)}
                </div>
                
                <button onclick="eliminarDelCarrito(${index})" title="Quitar producto" style="background: #dc3545; color: white; border: none; width: 35px; height: 35px; border-radius: 5px; cursor: pointer; margin-left: 15px; font-weight: bold; display: flex; align-items: center; justify-content: center;">X</button>
            </div>
        `;
    });

    html += `
        <div style="text-align: right; padding-top: 20px; font-size: 1.4rem;">
            Total a Pagar: <strong style="color: #d35400;">S/ ${total.toFixed(2)}</strong>
        </div>
    `;
    contenedor.innerHTML = html;
}

// ==========================================
// 6. BUSCADOR DE PRODUCTOS (LUPA)
// ==========================================
async function buscar() {
    const input = document.getElementById('main-search');
    const query = input ? input.value.toLowerCase().trim() : '';
    
    cargarSeccion('tienda');
    const contenedor = document.getElementById('contenedor-tienda');
    
    if (!contenedor) return;
    contenedor.innerHTML = '<p style="text-align: center; width: 100%; grid-column: 1/-1;">Buscando en el almacén...</p>';

    try {
        const res = await fetch('/api/productos/buscar');
        let productos = await res.json();

        if (query !== '') {
            productos = productos.filter(p => p.modelo.toLowerCase().includes(query));
        }

        if (productos.length === 0) {
            contenedor.innerHTML = `
                <div style="text-align: center; grid-column: 1/-1; padding: 40px;">
                    <h3 style="color: #666;">No encontramos resultados para "<b>${query}</b>" 😢</h3>
                    <p>Intenta buscar con otras palabras o revisa las categorías.</p>
                </div>`;
            return;
        }

        contenedor.innerHTML = productos.map(p => {
            let stringFotos = p.imagen_url || p.imagen || '';
            let primeraFoto = stringFotos.split(',')[0].trim() || '/static/uploads/sin-foto.png';
            return `
            <div class="card">
                <span class="badge" style="background: var(--primary); color: white; padding: 5px 10px; border-radius: 10px; font-size: 0.8rem;">${p.estado}</span>
                <img src="${primeraFoto}" style="width:100%; border-radius: 10px; margin-top: 10px;" onerror="this.onerror=null; this.src='/static/uploads/sin-foto.png'">
                <h4 style="margin: 10px 0;">${p.modelo}</h4>
                <p style="font-weight: bold; color: #d35400;">S/ ${p.precio.toFixed(2)}</p>
                <button onclick="abrirModalProducto(${p.id})" style="background: var(--primary); color: white; border: none; padding: 10px; width: 100%; border-radius: 5px; cursor: pointer; margin-top: 10px;">Ver Opciones</button>
            </div>
        `}).join('');
        
    } catch (error) {
        contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Error al realizar la búsqueda.</p>';
    }
}

// ==========================================
// 5. INICIALIZACIÓN AL ABRIR LA PÁGINA
// ==========================================
window.onload = () => {
    actualizarMenuSegunRol();
    cargarSeccion('inicio');
    guardarCarritoEnMemoria(); 
    
    const inputBusqueda = document.getElementById('main-search');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); 
                buscar(); 
            }
        });
    }
};

// ==========================================
// 7. LÓGICA DEL CHATBOT (SIRABOT)
// ==========================================
async function enviarMensajeChat() {
    const input = document.getElementById('chatbot-input');
    const mensaje = input.value.trim();
    if (!mensaje) return;

    const messagesDiv = document.getElementById('chatbot-messages');
    messagesDiv.innerHTML += `<div class="user-msg" style="background: #e1f5fe; padding: 8px; border-radius: 10px; margin: 5px 0; text-align: right;">${mensaje}</div>`;
    input.value = '';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje })
        });
        const data = await res.json();
        
        if (data.success) {
            messagesDiv.innerHTML += `<div class="bot-msg" style="background: #f1f1f1; padding: 8px; border-radius: 10px; margin: 5px 0;">${data.respuesta}</div>`;
            if (data.filtrar_id) {
                cargarSeccion('tienda'); 
                mostrarProductoExclusivo(data.filtrar_id); 
            }
        } else {
            messagesDiv.innerHTML += `<div class="bot-msg" style="color:red;">Ups, error de conexión.</div>`;
        }
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } catch (error) {
        console.error("Error en el chat:", error);
    }
}

async function mostrarProductoExclusivo(idProducto) {
    try {
        const res = await fetch('/api/productos/buscar');
        const productos = await res.json();
        const p = productos.find(x => x.id === idProducto);
        
        if (p) {
            const contenedor = document.getElementById('contenedor-tienda') || document.getElementById('app-content');
            let primeraFoto = (p.imagen_url || p.imagen || '').split(',')[0].trim() || '/static/uploads/sin-foto.png';
            
            contenedor.innerHTML = `
                <div style="width: 100%; display: flex; flex-direction: column; align-items: center; padding: 20px;">
                    <h2 style="color: #009ee3; margin-bottom: 20px;">✨ ¡Aquí tienes lo que buscabas! ✨</h2>
                    <div class="card" style="width: 100%; max-width: 300px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin: 0 auto;">
                        <span class="badge" style="background: var(--primary); color: white; padding: 5px 10px; border-radius: 10px; font-size: 0.8rem; font-weight: bold;">${p.estado.replace('_', ' ').toUpperCase()}</span>
                        <img src="${primeraFoto}" onerror="this.onerror=null; this.src='/static/uploads/sin-foto.png'" alt="${p.modelo}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-top: 10px;">
                        <h3 style="margin: 10px 0 5px 0;">${p.modelo}</h3>
                        <p style="color: #666; font-size: 0.9rem; margin: 0 0 10px 0;">Marca: ${p.marca}</p>
                        <p class="precio" style="color: #d35400; font-weight: bold; font-size: 1.2rem; margin-bottom: 15px;">Desde S/ ${p.precio.toFixed(2)}</p>
                        <button onclick="abrirModalProducto(${p.id})" style="background: var(--primary); color: white; border: none; padding: 10px; border-radius: 5px; width: 100%; cursor: pointer; font-weight: bold;">Ver opciones de calidad</button>
                        <button onclick="cargarSeccion('tienda')" style="background: #fff; color: var(--primary); border: 1px solid var(--primary); padding: 10px; border-radius: 5px; width: 100%; cursor: pointer; font-weight: bold; margin-top: 10px;">Volver a ver todos</button>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error aislando producto:", error);
    }
}

let productoModalActual = null;
let cantidadModal = 1;
let calidadSeleccionada = null;
let precioModalSeleccionado = 0;

async function abrirModalProducto(id) {
    try {
        const res = await fetch('/api/productos/buscar');
        const productos = await res.json();
        const p = productos.find(x => x.id === id);
        if (!p) { alert("Producto no encontrado"); return; }

        productoModalActual = p;
        cantidadModal = 1;
        calidadSeleccionada = null;
        precioModalSeleccionado = p.precio; 

        document.getElementById('modal-img').src = (p.imagen_url || p.imagen || '').split(',')[0].trim() || '/static/uploads/sin-foto.png';
        document.getElementById('modal-titulo').innerText = p.modelo;
        document.getElementById('modal-marca').innerText = "Marca: " + p.marca;
        document.getElementById('modal-esp').innerText = p.especificaciones || 'Sin especificaciones adicionales.';
        document.getElementById('modal-cantidad').innerText = cantidadModal;
        
        const opcionesDiv = document.getElementById('modal-opciones-calidad');
        opcionesDiv.innerHTML = '';
        let tieneCalidades = false;
        
        if (p.precios['3a']) { opcionesDiv.innerHTML += `<button class="btn-calidad" onclick="seleccionarCalidad('3A', ${p.precios['3a']}, this)">3A (Verde)</button>`; tieneCalidades = true; }
        if (p.precios['nucleo']) { opcionesDiv.innerHTML += `<button class="btn-calidad" onclick="seleccionarCalidad('Núcleo', ${p.precios['nucleo']}, this)">Núcleo (Azul)</button>`; tieneCalidades = true; }
        if (p.precios['original']) { opcionesDiv.innerHTML += `<button class="btn-calidad" onclick="seleccionarCalidad('Original', ${p.precios['original']}, this)">Original (Dorado)</button>`; tieneCalidades = true; }
        if (p.precios['diagnostico']) { opcionesDiv.innerHTML += `<button class="btn-calidad" onclick="seleccionarCalidad('Diagnóstico', ${p.precios['diagnostico']}, this)">Diagnóstico</button>`; tieneCalidades = true; }

        if (!tieneCalidades) {
            opcionesDiv.innerHTML = '<p style="color:#666; font-size:0.9rem;">Calidad Única Estándar</p>';
            actualizarPrecioModal();
        } else {
            document.getElementById('modal-precio-final').innerText = 'Selecciona una calidad 👆';
        }
        document.getElementById('modal-producto').style.display = 'flex';
    } catch(error) {}
}

function seleccionarCalidad(nombre, precio, btnElement) {
    calidadSeleccionada = nombre;
    precioModalSeleccionado = precio;
    const botones = document.querySelectorAll('.btn-calidad');
    botones.forEach(b => b.classList.remove('seleccionada'));
    btnElement.classList.add('seleccionada');
    actualizarPrecioModal();
}

function cambiarCantidadModal(cambio) {
    cantidadModal += cambio;
    if (cantidadModal < 1) cantidadModal = 1; 
    document.getElementById('modal-cantidad').innerText = cantidadModal;
    actualizarPrecioModal();
}

function actualizarPrecioModal() {
    if (calidadSeleccionada || document.getElementById('modal-opciones-calidad').innerHTML.includes('Calidad Única')) {
        const total = precioModalSeleccionado * cantidadModal;
        document.getElementById('modal-precio-final').innerText = `S/ ${total.toFixed(2)}`;
    }
}

function cerrarModalProducto() {
    document.getElementById('modal-producto').style.display = 'none';
}

function toggleChat() {
    const ventanaChat = document.getElementById('chatbot-window');
    if (ventanaChat.style.display === 'none' || ventanaChat.style.display === '') {
        ventanaChat.style.display = 'flex'; 
    } else {
        ventanaChat.style.display = 'none'; 
    }
}

async function enviarPedidoWhatsApp(event) {
    if (carrito.length === 0) {
        alert("¡Tu carrito está vacío!");
        return;
    }
    const user = JSON.parse(localStorage.getItem('usuario'));
    if (!user) {
        alert("⚠️ Debes iniciar sesión (o registrarte) para procesar tu compra.");
        cargarSeccion('login');
        return;
    }

    const btn = event.currentTarget || document.querySelector('button[onclick="enviarPedidoWhatsApp(event)"]');
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = '⏳ Procesando pedido...';
    btn.disabled = true;

    try {
        const res = await fetch('/api/pedidos/nuevo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: user.id, carrito: carrito })
        });
        const data = await res.json();

        if (data.success) {
            carrito = []; 
            guardarCarritoEnMemoria();
            cargarSeccion('mis_pedidos'); 
            window.open(data.enlace_whatsapp, '_blank'); 
        } else {
            alert("Error al procesar el pedido.");
        }
    } catch(e) {
        alert("Error de conexión al servidor.");
    } finally {
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
    }
}

async function renderizarMisPedidos() {
    const user = JSON.parse(localStorage.getItem('usuario'));
    if (!user) return;
    try {
        const res = await fetch(`/api/pedidos/usuario/${user.id}`);
        const pedidos = await res.json();
        const contenedor = document.getElementById('contenedor-pedidos');
        
        if (pedidos.length === 0) {
            contenedor.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Aún no tienes pedidos registrados.</p>';
            return;
        }
        contenedor.innerHTML = pedidos.map(p => {
            let colorEstado = p.estado === 'Aprobado' ? '#28a745' : (p.estado === 'Enviado' ? '#009ee3' : '#ffc107');
            let iconEstado = p.estado === 'Aprobado' ? '✅' : (p.estado === 'Enviado' ? '📤' : '⏳');
            return `
            <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border-left: 5px solid ${colorEstado};">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
                    <h3 style="margin: 0; color: #333;">Pedido #${p.id} <span style="font-size: 0.9rem; color: #888; font-weight: normal;">(${p.fecha})</span></h3>
                    <span style="background: ${colorEstado}15; color: ${colorEstado}; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 0.9rem;">${iconEstado} ${p.estado}</span>
                </div>
                <p style="color: #555; font-size: 0.95rem; white-space: pre-line; line-height: 1.6;">${p.detalles}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 1px dashed #eee;">
                    <button onclick="window.open('https://wa.me/+51913698771?text=Hola, sobre mi pedido %23${p.id}...', '_blank')" style="background: white; color: #25D366; border: 1px solid #25D366; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;">💬 Consultar por WhatsApp</button>
                    <strong style="font-size: 1.3rem; color: #d35400;">Total: S/ ${p.total.toFixed(2)}</strong>
                </div>
            </div>
        `}).join('');
    } catch (error) {}
}

// ==========================================
// FUNCIÓN DE LOGIN (NIVEL DIOS - GLOBAL)
// ==========================================
window.login = async function(event) {
    event.preventDefault(); 
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const btn = event.target.querySelector('button');
    btn.innerText = '⏳ Conectando...';

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass }) 
        });
        const data = await res.json();

        if (data.success) {
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            window.location.reload(); 
        } else {
            alert("❌ " + (data.mensaje || 'Usuario o contraseña incorrectos'));
            btn.innerText = 'Entrar';
        }
    } catch(e) {
        console.error("Error en login:", e);
        alert('⚠️ Error de conexión. Revisa que tu terminal de Python esté encendida.');
        btn.innerText = 'Entrar';
    }
};