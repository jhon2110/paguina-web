// ==========================================
// ARCHIVO: admin_nuevo.js (PANEL DE CONTROL LIMPIO)
// ==========================================

function cargarSubMenu(seccion) {
    document.getElementById('admin-main-view').style.display = 'none';
    const subView = document.getElementById('admin-sub-view');
    subView.style.display = 'block';

    if (seccion === 'productos') {
        subView.innerHTML = `
            <div class="admin-section-header">📦 GESTIÓN DE PRODUCTOS</div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; background: white; padding: 15px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                <button class="btn-crear" onclick="mostrarFormularioProducto()" style="background: #009ee3; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;">➕ Crear Nuevo</button>
                <button onclick="abrirGestorAtributos()" style="background: #6f42c1; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;">🏷️ Gestionar Atributos</button>
                <button onclick="dispararSubidaExcel()" style="background: #28a745; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;">📊 Subir Excel</button>
                <button onclick="descargarExcelProductos()" style="background: #17a2b8; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;">📥 Descargar Inventario</button>
                <button id="btn-borrar-masivo" onclick="eliminarProductosMasivo()" style="background: #dc3545; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; display: none;">🗑️ Eliminar Seleccionados</button>
            </div>

            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <input type="text" id="filtro-texto" placeholder="🔍 Buscar modelo o marca..." onkeyup="filtrarTablaAdmin()" style="padding: 10px; border-radius: 5px; border: 1px solid #ccc; flex-grow: 1;">
                <select id="filtro-categoria" onchange="filtrarTablaAdmin()" style="padding: 10px; border-radius: 5px; border: 1px solid #ccc; font-weight: bold;">
                    <option value="">Todas las Categorías</option>
                    <optgroup label="🔋 BATERÍAS">
                        <option value="bateria-interna">Baterías Internas (Teléfono)</option>
                        <option value="bateria-externa">Baterías Externas (Teléfono)</option>
                        <option value="bateria-tablet">Baterías para Tablet</option>
                        <option value="bateria-reloj">Baterías para Reloj</option>
                    </optgroup>
                    <optgroup label="🔌 CARGADORES">
                        <option value="cargador-telefono">Cargadores para Teléfonos</option>
                        <option value="cargador-reloj">Cargador de Reloj</option>
                        <option value="cargador-portatil">Cargador Portátil</option>
                        <option value="cargador-cigarrera">Cargador de Cigarrera</option>
                    </optgroup>
                    <optgroup label="📸 OTROS ACCESORIOS">
                        <option value="camaras">Cámaras</option>
                        <option value="cables">Cables</option>
                        <option value="adaptador-audio">Adaptadores de Audio</option>
                        <option value="adaptador-usb">Adaptadores de USB</option>
                        <option value="pc">Productos de PC</option>
                    </optgroup>
                </select>
            </div>

            <div id="admin-lista-productos" style="width: 100%; margin-top: 20px;">
                <p>Cargando inventario...</p>
            </div>
            <div style="margin-top: 20px; text-align: right;">
                <button onclick="cargarSeccion('admin')" class="btn-volver" style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Cerrar panel X</button>
            </div>
        `;
        obtenerProductosAdmin();
    }
    else if (seccion === 'anuncios') {
        subView.innerHTML = `
            <div class="admin-section-header">ANUNCIOS</div>
            <button class="btn-crear" onclick="mostrarFormularioAnuncio()">CREAR</button>
            <div class="admin-grid-anuncios" id="admin-lista-anuncios">
                <p style="text-align:center; width:100%;">Cargando anuncios...</p>
            </div>
            <button onclick="cargarSeccion('admin')" class="btn-volver">Volver al menú</button>
        `;
        obtenerAnunciosAdmin();
    }
    else if (seccion === 'usuarios') {
        subView.innerHTML = `
            <div class="admin-section-header">USUARIOS</div>
            <button class="btn-crear" onclick="mostrarFormularioUsuario()">CREAR</button>
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Permisos</th>
                            <th>Usuario</th>
                            <th>Fecha creación</th>
                            <th>Estado</th>
                            <th>Contraseña</th>
                            <th>Ajuste</th>
                        </tr>
                    </thead>
                    <tbody id="admin-lista-usuarios">
                        <tr><td colspan="6">Cargando usuarios...</td></tr>
                    </tbody>
                </table>
            </div>
            <button onclick="cargarSeccion('admin')" class="btn-volver">Volver al menú</button>
        `;
        obtenerUsuariosAdmin();
    }
    else if (seccion === 'pedidos') {
        renderizarAdminPedidos();
    }
}

// ==========================================
// 🌟 CEREBRO CENTRAL DE ATRIBUTOS (NUEVO)
// ==========================================
function getAtributosSira() {
    let config = JSON.parse(localStorage.getItem('sira_atributos'));
    if (!config || !config.categorias_avanzadas) {
        config = {
            categorias_avanzadas: {
                'Baterías': ['Interna', 'Externa', 'Para Tablet', 'Para Reloj'],
                'Cargadores': ['De Pared', 'De Auto', 'Inalámbrico'],
                'Pantallas': ['OLED', 'LCD', 'Táctil Glass'],
                'Cables': ['Tipo C', 'Lightning', 'Micro USB'],
                'General': ['General']
            },
            marcas: config?.marcas || ['Samsung', 'Apple', 'Xiaomi', 'Huawei', 'Motorola', 'LDNIO', 'Siramad'],
            calidades: config?.calidades || ['Original', 'Núcleo', 'Genérico', 'AAA']
        };
        saveAtributosSira(config);
    }
    return config;
}

function saveAtributosSira(config) {
    localStorage.setItem('sira_atributos', JSON.stringify(config));
}

// ==========================================
// 1. LÓGICA DE PRODUCTOS (CORREGIDA PARA MULTI-FOTOS)
// ==========================================
let idProductoEditando = null; 

async function obtenerProductosAdmin() {
    try {
        const res = await fetch('/api/productos/buscar');
        const productos = await res.json();
        const contenedor = document.getElementById('admin-lista-productos');
        
        if (productos.length === 0) {
            contenedor.innerHTML = '<p style="text-align:center; padding: 20px;">No hay productos registrados.</p>';
            return;
        }
        
        let html = `
            <div style="overflow-x: auto; background: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                <table style="width: 100%; border-collapse: collapse; text-align: left;" id="tabla-productos-admin">
                    <thead>
                        <tr style="background: #232f3e; color: white;">
                            <th style="padding: 15px; width: 40px; text-align: center;">
                                <input type="checkbox" id="check-todos" onclick="seleccionarTodosProductos(this)" style="transform: scale(1.5); cursor: pointer;">
                            </th>
                            <th style="padding: 15px;">Foto</th>
                            <th style="padding: 15px;">Modelo y Marca</th>
                            <th style="padding: 15px;">Categoría</th>
                            <th style="padding: 15px;">Precio Base</th>
                            <th style="padding: 15px; text-align: center;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        productos.forEach(p => {
            // 🔥 MAGIA: Separamos las fotos por comas y sacamos SOLO LA PRIMERA [0]
            let stringFotos = p.imagen_url || p.imagen || '';
            let primeraFoto = stringFotos.split(',')[0] || '/static/uploads/sin-foto.png';

            html += `
                <tr style="border-bottom: 1px solid #eee;" class="fila-producto">
                    <td style="padding: 15px; text-align: center;">
                        <input type="checkbox" class="check-producto" value="${p.id}" onclick="verificarSeleccionMasiva()" style="transform: scale(1.5); cursor: pointer;">
                    </td>
                    <td style="padding: 15px;">
                        <img src="${primeraFoto}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;" onerror="this.src='/static/uploads/sin-foto.png'">
                    </td>
                    <td style="padding: 15px;">
                        <b style="color: #333; font-size: 1.1rem;" class="texto-modelo">${p.modelo}</b><br>
                        <span style="font-size: 0.85rem; color: #666;" class="texto-marca">Marca: ${p.marca}</span>
                    </td>
                    <td style="padding: 15px;">
                        <span style="background: #e1f5fe; color: #009ee3; padding: 5px 10px; border-radius: 15px; font-size: 0.8rem; font-weight: bold;" class="texto-categoria">${p.categoria || 'General'}</span>
                    </td>
                    <td style="padding: 15px; font-weight: bold; color: #d35400; font-size: 1.1rem;">
                        S/ ${p.precio.toFixed(2)}
                    </td>
                    <td style="padding: 15px; text-align: center;">
                        <button onclick="editarProductoAdmin(${p.id})" style="background: #ffc107; color: #333; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-weight: bold; margin-right: 5px;">✏️ Editar</button>
                    </td>
                </tr>
            `;
        });
        html += `</tbody></table></div>`;
        contenedor.innerHTML = html;

    } catch (error) { 
        document.getElementById('admin-lista-productos').innerHTML = '<p style="color:red; text-align:center;">Error al cargar el inventario.</p>';
    }
}

async function eliminarProducto(id) {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return;
    try {
        const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert('Producto eliminado de la base de datos.');
            obtenerProductosAdmin();
        }
    } catch (error) { alert('Error al eliminar el producto.'); }
}

// ==========================================
// 2. FORMULARIO FLOTANTE (CORREGIDO PARA RELLENAR FOTOS)
// ==========================================
async function editarProductoAdmin(id) {
    try {
        const res = await fetch('/api/productos/buscar');
        const productos = await res.json();
        const prod = productos.find(p => p.id === id);
        if(prod) mostrarFormularioProducto(prod);
    } catch(e) { alert('Error al buscar el producto'); }
}

function mostrarFormularioProducto(prod = null) {
    let config = getAtributosSira(); 
    let diccCategorias = config.categorias_avanzadas;
    let listaPadres = Object.keys(diccCategorias);
    let listaMarcas = config.marcas;

    const modal = document.createElement('div');
    modal.id = "modal-producto";
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center; z-index:9999;";
    
    let p_espec = prod ? (prod.especificaciones || '') : '';
    let p_espec_val = p_espec;
    
    let catPadreActual = listaPadres[0];
    let catHijoActual = diccCategorias[catPadreActual][0];

    if (p_espec.includes(' | ')) {
        let partes = p_espec.split(' | ');
        let categoriaCompleta = partes[0].trim();
        p_espec_val = partes[1].trim();

        if (categoriaCompleta.includes(' > ')) {
            let catPartes = categoriaCompleta.split(' > ');
            catPadreActual = catPartes[0].trim();
            catHijoActual = catPartes[1].trim();
            if (!diccCategorias[catPadreActual]) {
                diccCategorias[catPadreActual] = [catHijoActual];
                listaPadres.push(catPadreActual);
            }
        } else {
            catPadreActual = categoriaCompleta;
            catHijoActual = 'General';
            if (!diccCategorias[catPadreActual]) {
                diccCategorias[catPadreActual] = [catHijoActual];
                listaPadres.push(catPadreActual);
            }
        }
    }

    // 🔥 MAGIA 2: Extraemos las fotos sin importar cómo las llame la base de datos
    let strFotos = prod ? (prod.imagen_url || prod.imagen || '') : '';
    let imgs = strFotos.split(',');
    
    let htmlFotos = '';
    for(let i=1; i<=3; i++) {
        // Asignamos cada foto a su cajita correspondiente
        let urlVieja = (imgs[i-1] && !imgs[i-1].includes('/static/uploads/')) ? imgs[i-1].trim() : '';
        htmlFotos += `
            <div style="background:#f1f1f1; padding:10px; border-radius:5px; margin-bottom:8px; border: 1px solid #ddd;">
                <label style="font-size:0.85rem; font-weight:bold; color:#333;">🖼️ Imagen ${i} ${i===1? '(Principal)' : ''}</label>
                <div style="display:flex; gap:10px; margin-top:5px;">
                    <input type="file" id="form-img-file-${i}" accept="image/*" style="flex:1; font-size:0.8rem;">
                    <input type="text" id="form-img-url-${i}" value="${urlVieja}" placeholder="O pega el Link (URL)..." style="flex:1; padding:6px; border-radius:3px; border:1px solid #ccc; font-size:0.8rem;">
                </div>
            </div>
        `;
    }

    modal.innerHTML = `
        <div style="background:white; padding:30px; border-radius:10px; width:600px; max-height:90vh; overflow-y:auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <h2 style="margin-top:0; color:#232f3e; border-bottom:2px solid #eee; padding-bottom:10px;">
                ${prod ? '✏️ Editar Repuesto' : '➕ Nuevo Repuesto'}
            </h2>
            <input type="hidden" id="form-id" value="${prod ? prod.id : ''}">

            <div style="display:flex; gap:10px;">
                <div style="flex:1;">
                    <label style="font-weight:bold;">Categoría Principal:</label>
                    <select id="form-cat-padre" style="width:100%; padding:10px; margin-bottom:15px; border-radius:5px; border:1px solid #ccc;">
                        ${listaPadres.map(p => `<option value="${p}" ${p === catPadreActual ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                </div>
                <div style="flex:1;">
                    <label style="font-weight:bold;">Sub-Categoría:</label>
                    <select id="form-cat-hijo" style="width:100%; padding:10px; margin-bottom:15px; border-radius:5px; border:1px solid #ccc; background:#f8f9fa;"></select>
                </div>
            </div>

            <div style="display:flex; gap:10px;">
                <div style="flex:2;">
                    <label style="font-weight:bold;">Modelo del Producto:</label>
                    <input type="text" id="form-modelo" value="${prod ? prod.modelo : ''}" placeholder="Ej: Batería Note 13 Pro" style="width:100%; padding:10px; margin-bottom:15px; border-radius:5px; border:1px solid #ccc;">
                </div>
                <div style="flex:1;">
                    <label style="font-weight:bold;">Marca:</label>
                    <select id="form-marca" style="width:100%; padding:10px; margin-bottom:15px; border-radius:5px; border:1px solid #ccc;">
                        ${listaMarcas.map(m => `<option value="${m}" ${prod && prod.marca === m ? 'selected' : ''}>${m}</option>`).join('')}
                    </select>
                </div>
            </div>

            <label style="font-weight:bold;">Especificaciones Técnicas:</label>
            <input type="text" id="form-especificaciones" value="${p_espec_val}" placeholder="Ej: 4000mAh, Carga rápida..." style="width:100%; padding:10px; margin-bottom:15px; border-radius:5px; border:1px solid #ccc;">

            <div style="background:#f8f9fa; padding:15px; border-radius:8px; border:1px solid #e9ecef; margin-bottom:15px;">
                <label style="font-weight:bold; color:#009ee3;">💰 Precios (S/):</label>
                <div style="display:flex; gap:10px; margin-top:10px; margin-bottom:10px;">
                    <div style="flex:1;"><small>Original</small><input type="number" id="form-precio-orig" value="${prod ? (prod.precio_original||'') : ''}" style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc;"></div>
                    <div style="flex:1;"><small>Núcleo</small><input type="number" id="form-precio-nuc" value="${prod ? (prod.precio_nucleo||'') : ''}" style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc;"></div>
                </div>
                <div style="display:flex; gap:10px;">
                    <div style="flex:1;"><small>Calidad AAA</small><input type="number" id="form-precio-3a" value="${prod ? (prod.precio_3a||'') : ''}" style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc;"></div>
                    <div style="flex:1;"><small>Diagnóstico</small><input type="number" id="form-precio-diag" value="${prod ? (prod.precio_diagnostico||'') : ''}" style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc;"></div>
                </div>
            </div>

            <div style="display:flex; gap:10px;">
                <div style="flex:1;">
                    <label style="font-weight:bold;">Disponibilidad:</label>
                    <select id="form-disponibilidad" style="width:100%; padding:10px; margin-bottom:15px; border-radius:5px; border:1px solid #ccc;">
                        <option value="en_stock" ${prod && prod.disponibilidad === 'en_stock' ? 'selected' : ''}>🟢 En Stock</option>
                        <option value="agotado" ${prod && prod.disponibilidad === 'agotado' ? 'selected' : ''}>🔴 Agotado</option>
                    </select>
                </div>
                <div style="flex:1;">
                    <label style="font-weight:bold;">Estado Promocional:</label>
                    <select id="form-estado" style="width:100%; padding:10px; margin-bottom:15px; border-radius:5px; border:1px solid #ccc;">
                        <option value="normal" ${prod && prod.estado === 'normal' ? 'selected' : ''}>⚪ Normal</option>
                        <option value="oferta" ${prod && prod.estado === 'oferta' ? 'selected' : ''}>🔥 En Oferta</option>
                    </select>
                </div>
            </div>

            <label style="font-weight:bold; color:#d35400;">📸 Fotos (Máximo 3):</label>
            ${htmlFotos}

            <div style="text-align:right; margin-top:20px;">
                <button onclick="document.getElementById('modal-producto').remove()" style="padding:10px 20px; background:#ccc; border:none; border-radius:5px; cursor:pointer; font-weight:bold; margin-right:10px;">Cancelar</button>
                <button id="btn-guardar-prod" onclick="guardarProductoAdmin()" style="padding:10px 20px; background:#009ee3; color:white; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">💾 Guardar Producto</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const selectPadre = document.getElementById('form-cat-padre');
    const selectHijo = document.getElementById('form-cat-hijo');

    function actualizarHijos() {
        const padreElegido = selectPadre.value;
        const hijos = diccCategorias[padreElegido] || ['General'];
        selectHijo.innerHTML = hijos.map(h => `<option value="${h}">${h}</option>`).join('');
    }

    selectPadre.addEventListener('change', actualizarHijos);
    actualizarHijos();
    if (catHijoActual && diccCategorias[catPadreActual] && diccCategorias[catPadreActual].includes(catHijoActual)) {
        selectHijo.value = catHijoActual;
    }
}

async function guardarProductoAdmin() {
    const btn = document.getElementById('btn-guardar-prod');
    btn.innerText = "⏳ Subiendo...";
    btn.disabled = true;

    const id = document.getElementById('form-id').value;
    const formData = new FormData();
    
    formData.append('modelo', document.getElementById('form-modelo').value);
    formData.append('marca', document.getElementById('form-marca').value);
    
    const catPadre = document.getElementById('form-cat-padre').value;
    const catHijo = document.getElementById('form-cat-hijo').value;
    formData.append('categoria', catPadre + ' > ' + catHijo);
    
    formData.append('especificaciones', document.getElementById('form-especificaciones').value);
    formData.append('estado', document.getElementById('form-estado').value);
    formData.append('disponibilidad', document.getElementById('form-disponibilidad').value);
    
    formData.append('precio_original', document.getElementById('form-precio-orig').value);
    formData.append('precio_nucleo', document.getElementById('form-precio-nuc').value);
    formData.append('precio_3a', document.getElementById('form-precio-3a').value);
    formData.append('precio_diagnostico', document.getElementById('form-precio-diag').value);

    for(let i=1; i<=3; i++) {
        let file = document.getElementById(`form-img-file-${i}`).files[0];
        let url = document.getElementById(`form-img-url-${i}`).value;
        if (file) formData.append(`imagen_file_${i}`, file);
        if (url) formData.append(`imagen_url_${i}`, url);
    }

    const url = id ? '/api/productos/' + id : '/api/productos';

    try {
        const res = await fetch(url, { method: 'POST', body: formData });
        if(res.ok) {
            document.getElementById('modal-producto').remove();
            obtenerProductosAdmin(); 
            alert("✅ Producto guardado correctamente.");
        } else {
            alert("Error al guardar: Revisa los datos.");
            btn.innerText = "💾 Guardar Producto";
            btn.disabled = false;
        }
    } catch(e) { 
        alert("Error de conexión al guardar."); 
        btn.innerText = "💾 Guardar Producto";
        btn.disabled = false;
    }
}

// ==========================================
// 3. GESTOR DE ATRIBUTOS (SISTEMA CARPETAS) CONECTADO AL CEREBRO
// ==========================================
function abrirGestorAtributos() {
    let config = getAtributosSira(); 

    let htmlJerarquia = '';
    for (let padre in config.categorias_avanzadas) {
        let idLimpio = padre.replace(/[^a-zA-Z0-9]/g, ''); 
        
        let hijosHtml = config.categorias_avanzadas[padre].map(h => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px dashed #ddd; font-size:0.85rem; padding-left:15px; color:#555;">
                <span>↳ ${h}</span>
                <button onclick="eliminarHijoAvanzado('${padre}', '${h}')" style="background:#dc3545; color:white; border:none; padding:2px 6px; border-radius:3px; cursor:pointer; font-size:0.7rem;">🗑️</button>
            </div>
        `).join('');

        htmlJerarquia += `
            <div style="margin-bottom: 15px; background: white; border: 1px solid #cce5ff; border-radius: 5px; overflow: hidden;">
                <div style="background: #e6f2ff; padding: 10px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #cce5ff;">
                    <span style="color: #0056b3;">📁 ${padre}</span>
                    <button onclick="eliminarPadreAvanzado('${padre}')" style="background:#dc3545; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; font-size:0.8rem;">🗑️ Borrar</button>
                </div>
                <div style="padding: 10px; background: #fafafa;">
                    ${hijosHtml}
                    <div style="display:flex; gap:5px; margin-top: 10px;">
                        <input type="text" id="nuevo-hijo-${idLimpio}" placeholder="Añadir sub-categoría..." style="flex:1; padding:6px; border:1px solid #ccc; border-radius:3px; font-size:0.8rem;">
                        <button onclick="agregarHijoAvanzado('${padre}', 'nuevo-hijo-${idLimpio}')" style="background:#28a745; color:white; border:none; padding:6px 10px; border-radius:3px; font-weight:bold; cursor:pointer; font-size:0.8rem;">➕ Agregar</button>
                    </div>
                </div>
            </div>
        `;
    }

    let htmlMarcas = config.marcas.map(m => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee; font-size:0.9rem;">
            <span>${m}</span>
            <button onclick="eliminarAtrSira('marcas', '${m}')" style="background:#dc3545; color:white; border:none; padding:5px 8px; border-radius:3px; cursor:pointer;">🗑️</button>
        </div>
    `).join('');

    let htmlCalidades = (config.calidades || []).map(c => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee; font-size:0.9rem;">
            <span>${c}</span>
            <button onclick="eliminarAtrSira('calidades', '${c}')" style="background:#dc3545; color:white; border:none; padding:5px 8px; border-radius:3px; cursor:pointer;">🗑️</button>
        </div>
    `).join('');

    const vista = document.getElementById('admin-sub-view');
    vista.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <div style="background:#232f3e; color:white; padding:15px; border-radius:8px; text-align:center; font-weight:bold; font-size:1.1rem; flex:1;">
                🏷️ GESTOR DE ATRIBUTOS (SISTEMA DE CARPETAS)
            </div>
            <button onclick="cargarSubMenu('productos')" style="margin-left:15px; background: #009ee3; color: white; border: none; padding: 15px 20px; border-radius: 8px; cursor: pointer; font-weight:bold;">⬅️ Volver a Productos</button>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px; align-items: start;">
            <div style="background:white; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1); overflow:hidden;">
                <div style="background:#343a40; color:white; padding:15px; text-align:center; font-weight:bold;">📦 Categorías (Padre e Hijo)</div>
                <div style="padding:15px; background:#fff3cd; border-bottom:2px solid #ffeeba; display:flex; gap:5px;">
                    <input type="text" id="nuevo-padre" placeholder="Nueva Categoría Padre..." style="flex:1; padding:8px; border:1px solid #ccc; border-radius:4px;">
                    <button onclick="agregarPadreAvanzado()" style="background:#ffc107; color:#212529; border:none; padding:8px 15px; border-radius:4px; font-weight:bold; cursor:pointer;">➕ Crear</button>
                </div>
                <div style="max-height:500px; overflow-y:auto; padding:10px;">${htmlJerarquia}</div>
            </div>

            <div style="background:white; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1); overflow:hidden;">
                <div style="background:#343a40; color:white; padding:15px; text-align:center; font-weight:bold;">⭐ Marcas</div>
                <div style="padding:15px; background:#f8f9fa; border-bottom:2px solid #eee; display:flex; gap:5px;">
                    <input type="text" id="nueva-marca" placeholder="Nueva marca..." style="flex:1; padding:8px; border:1px solid #ccc; border-radius:4px;">
                    <button onclick="agregarAtrSira('marcas', 'nueva-marca')" style="background:#28a745; color:white; border:none; padding:8px 15px; border-radius:4px; font-weight:bold; cursor:pointer;">➕</button>
                </div>
                <div style="max-height:500px; overflow-y:auto;">${htmlMarcas}</div>
            </div>

            <div style="background:white; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1); overflow:hidden;">
                <div style="background:#343a40; color:white; padding:15px; text-align:center; font-weight:bold;">💎 Calidades</div>
                <div style="padding:15px; background:#f8f9fa; border-bottom:2px solid #eee; display:flex; gap:5px;">
                    <input type="text" id="nueva-calidad" placeholder="Nueva calidad..." style="flex:1; padding:8px; border:1px solid #ccc; border-radius:4px;">
                    <button onclick="agregarAtrSira('calidades', 'nueva-calidad')" style="background:#28a745; color:white; border:none; padding:8px 15px; border-radius:4px; font-weight:bold; cursor:pointer;">➕</button>
                </div>
                <div style="max-height:500px; overflow-y:auto;">${htmlCalidades}</div>
            </div>
        </div>
    `;
}

function agregarPadreAvanzado() {
    let padre = document.getElementById('nuevo-padre').value.trim();
    if(!padre) return alert("Escribe el nombre de la Categoría Padre.");
    let config = getAtributosSira(); 
    if(!config.categorias_avanzadas[padre]) {
        config.categorias_avanzadas[padre] = []; 
        saveAtributosSira(config); 
        abrirGestorAtributos();
    } else alert("Esa Categoría Principal ya existe.");
}

function agregarHijoAvanzado(padre, inputId) {
    let hijo = document.getElementById(inputId).value.trim();
    if(!hijo) return alert("Escribe el nombre de la Sub-categoría.");
    let config = getAtributosSira();
    if(!config.categorias_avanzadas[padre].includes(hijo)) {
        config.categorias_avanzadas[padre].push(hijo);
        saveAtributosSira(config);
        abrirGestorAtributos();
    } else alert("Esta sub-categoría ya existe.");
}

function eliminarPadreAvanzado(padre) {
    if(!confirm(`¿Eliminar la categoría '${padre}' y TODAS sus subcategorías?`)) return;
    let config = getAtributosSira();
    delete config.categorias_avanzadas[padre];
    saveAtributosSira(config);
    abrirGestorAtributos();
}

function eliminarHijoAvanzado(padre, hijo) {
    if(!confirm(`¿Eliminar la sub-categoría '${hijo}'?`)) return;
    let config = getAtributosSira();
    config.categorias_avanzadas[padre] = config.categorias_avanzadas[padre].filter(h => h !== hijo);
    saveAtributosSira(config);
    abrirGestorAtributos();
}

function agregarAtrSira(tipo, inputId) {
    let valor = document.getElementById(inputId).value.trim();
    if(!valor) return;
    let config = getAtributosSira();
    if(!config[tipo].includes(valor)) {
        config[tipo].push(valor);
        saveAtributosSira(config);
        abrirGestorAtributos();
    } else alert("Este atributo ya existe.");
}

function eliminarAtrSira(tipo, valor) {
    if(!confirm(`¿Eliminar permanentemente: ${valor}?`)) return;
    let config = getAtributosSira();
    config[tipo] = config[tipo].filter(v => v !== valor);
    saveAtributosSira(config);
    abrirGestorAtributos();
}

// ==========================================
// 4. LÓGICA DE ANUNCIOS, USUARIOS Y PEDIDOS
// ==========================================
let idAnuncioEditando = null;

async function obtenerAnunciosAdmin() {
    try {
        const res = await fetch('/api/anuncios');
        const anuncios = await res.json();
        const contenedor = document.getElementById('admin-lista-anuncios');
        if (anuncios.length === 0) {
            contenedor.innerHTML = '<p style="text-align:center; width:100%;">No hay anuncios creados.</p>';
            return;
        }
        contenedor.innerHTML = anuncios.map(a => `
            <div class="admin-card-anuncio">
                <div class="anuncio-img-container">
                    <img src="${a.imagen}" style="width:100%; height:100%; object-fit:cover;">
                </div>
                <div class="anuncio-info">
                    <p><strong>Nombre:</strong> ${a.nombre}</p>
                    <p><strong>Vigencia:</strong> ${a.vigencia} días</p>
                    <p><strong>Posición:</strong> ${a.posicion}</p>
                    <div style="margin-top: 10px;">
                        <button onclick="prepararEdicionAnuncio(${a.id}, '${a.nombre}', '${a.vigencia}', '${a.posicion}')" style="background: #ffc107; color: #000; border: none; padding: 5px 15px; border-radius: 5px; cursor: pointer; margin-right: 5px; font-weight: bold;">Editar ✏️</button>
                        <button onclick="eliminarAnuncio(${a.id})" style="background: #dc3545; color: white; border: none; padding: 5px 15px; border-radius: 5px; cursor: pointer;">Eliminar 🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) { console.error(error); }
}

function mostrarFormularioAnuncio() {
    idAnuncioEditando = null;
    dibujarFormularioAnuncio("CREAR NUEVO ANUNCIO", "Guardar Anuncio");
}

function prepararEdicionAnuncio(id, nombre, vigencia, posicion) {
    idAnuncioEditando = id;
    dibujarFormularioAnuncio("EDITAR ANUNCIO", "Actualizar Anuncio");
    document.getElementById('anun-nombre').value = nombre;
    document.getElementById('anun-vigencia').value = vigencia;
    document.getElementById('anun-posicion').value = posicion;
}

function dibujarFormularioAnuncio(titulo, textoBoton) {
    document.getElementById('admin-sub-view').innerHTML = `
        <div class="admin-section-header">${titulo}</div>
        <form class="auth-card" style="margin: 0 auto; max-width: 500px;" onsubmit="guardarAnuncio(event)">
            <input type="text" id="anun-nombre" placeholder="Nombre (Ej: Promo Verano)" required>
            <input type="number" id="anun-vigencia" placeholder="Días de vigencia" required>
            <select id="anun-posicion" style="width: 100%; padding: 15px; margin-bottom: 20px; border-radius: 50px; border: 1px solid #ddd;">
                <option value="carrusel">Carrusel Principal</option>
                <option value="lateral">Banner Lateral</option>
            </select>
            <p style="font-size: 0.8rem; color: #666; text-align: left; margin-bottom: 5px;">* Sube una foto solo si quieres cambiarla:</p>
            <input type="file" id="anun-imagen" accept="image/*" style="margin-bottom: 20px;">
            <button type="submit" class="btn-crear" style="width: 100%; background-color: #009ee3;">${textoBoton}</button>
            <button type="button" onclick="cargarSubMenu('anuncios')" class="btn-volver" style="width: 100%; margin-top: 10px;">Cancelar</button>
        </form>
    `;
}

async function guardarAnuncio(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('nombre', document.getElementById('anun-nombre').value);
    formData.append('vigencia', document.getElementById('anun-vigencia').value);
    formData.append('posicion', document.getElementById('anun-posicion').value);
    const fileInput = document.getElementById('anun-imagen');
    if (fileInput.files.length > 0) formData.append('imagen', fileInput.files[0]);

    const url = idAnuncioEditando ? `/api/anuncios/${idAnuncioEditando}` : '/api/anuncios';
    try {
        const res = await fetch(url, { method: 'POST', body: formData });
        if (res.ok) {
            alert(idAnuncioEditando ? '¡Anuncio actualizado!' : '¡Anuncio creado!');
            cargarSubMenu('anuncios');
        }
    } catch (error) { alert('Error al guardar.'); }
}

async function eliminarAnuncio(id) {
    if (!confirm("¿Estás seguro de que quieres eliminar este anuncio?")) return;
    try {
        const res = await fetch(`/api/anuncios/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert('Anuncio eliminado.');
            obtenerAnunciosAdmin(); 
        }
    } catch (error) { alert('Error al eliminar.'); }
}

let idUsuarioEditando = null;

async function obtenerUsuariosAdmin() {
    try {
        const res = await fetch('/api/usuarios');
        const usuarios = await res.json();
        const tbody = document.getElementById('admin-lista-usuarios');
        if (usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No hay usuarios.</td></tr>';
            return;
        }
        tbody.innerHTML = usuarios.map(u => `
            <tr>
                <td>${u.rol}</td>
                <td><input type="text" value="${u.username}" disabled class="input-usuario"></td>
                <td>${u.fecha_creacion}</td>
                <td><span class="${u.estado === 'activo' ? 'status-activo' : 'status-inactivo'}">${u.estado} ˅</span></td>
                <td>********</td>
                <td>
                    <button class="btn-editar" style="background-color: #ffc107; color: black;" onclick="prepararEdicionUsuario(${u.id}, '${u.username}', '${u.rol}')">Editar</button>
                    <button class="btn-editar" style="background-color: #dc3545;" onclick="eliminarUsuario(${u.id})">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } catch (error) { console.error(error); }
}

function mostrarFormularioUsuario() {
    idUsuarioEditando = null;
    dibujarFormularioUsuario("CREAR NUEVO USUARIO", "Crear Usuario", false);
}

function prepararEdicionUsuario(id, username, rol) {
    idUsuarioEditando = id;
    dibujarFormularioUsuario("EDITAR USUARIO", "Actualizar Usuario", true);
    document.getElementById('usu-nombre').value = username;
    document.getElementById('usu-rol').value = rol;
}

function dibujarFormularioUsuario(titulo, textoBoton, esEdicion) {
    document.getElementById('admin-sub-view').innerHTML = `
        <div class="admin-section-header">${titulo}</div>
        <form class="auth-card" style="margin: 0 auto; max-width: 500px;" onsubmit="guardarUsuario(event)">
            <input type="text" id="usu-nombre" placeholder="Nombre de usuario" required>
            <p style="font-size: 0.8rem; color: #666; text-align: left; margin-bottom: 5px;">${esEdicion ? '* Deja en blanco si no quieres cambiar la clave:' : '*'}</p>
            <input type="password" id="usu-pass" placeholder="Contraseña secreta" ${esEdicion ? '' : 'required'}>
            <select id="usu-rol" style="width: 100%; padding: 15px; margin-bottom: 20px; border-radius: 50px; border: 1px solid #ddd;">
                <option value="trabajador">Trabajador</option>
                <option value="cliente">Cliente</option>
                <option value="owner">Dueño (Owner)</option>
            </select>
            <button type="submit" class="btn-crear" style="width: 100%; background-color: #009ee3;">${textoBoton}</button>
            <button type="button" onclick="cargarSubMenu('usuarios')" class="btn-volver" style="width: 100%; margin-top: 10px;">Cancelar</button>
        </form>
    `;
}

async function guardarUsuario(event) {
    event.preventDefault();
    const datosUsuario = {
        username: document.getElementById('usu-nombre').value,
        pass: document.getElementById('usu-pass').value,
        rol: document.getElementById('usu-rol').value
    };
    
    const url = idUsuarioEditando ? `/api/usuarios/${idUsuarioEditando}` : '/api/usuarios';
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosUsuario)
        });
        if (res.ok) {
            alert(idUsuarioEditando ? '¡Usuario actualizado!' : '¡Usuario creado!');
            cargarSubMenu('usuarios');
        }
    } catch (error) { alert('Error al guardar el usuario.'); }
}

async function eliminarUsuario(id) {
    if (!confirm("¿Estás seguro de que quieres eliminar a este usuario?")) return;
    try {
        const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
            alert('Usuario eliminado.');
            obtenerUsuariosAdmin();
        } else {
            alert(data.mensaje);
        }
    } catch (error) { alert('Error al eliminar.'); }
}

async function renderizarAdminPedidos() {
    const subView = document.getElementById('admin-sub-view');
    subView.innerHTML = '<p style="text-align:center;">Cargando base de datos de pedidos...</p>';
    
    try {
        const res = await fetch('/api/admin/pedidos');
        const pedidos = await res.json();

        if (pedidos.length === 0) {
            subView.innerHTML = `
                <div style="text-align: right; margin-bottom: 20px;">
                    <button onclick="document.getElementById('admin-sub-view').style.display='none'" style="padding: 10px 20px; border-radius: 5px; background: #dc3545; color: white; border: none; cursor: pointer; font-weight: bold;">Cerrar panel X</button>
                </div>
                <p style="text-align:center; padding: 50px; background: white; border-radius: 10px;">Aún no hay pedidos en la tienda.</p>
            `;
            return;
        }

        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #333; margin: 0;">🧾 Gestión Central de Pedidos</h2>
                <button onclick="document.getElementById('admin-sub-view').style.display='none'" style="padding: 10px 20px; border-radius: 5px; background: #dc3545; color: white; border: none; cursor: pointer; font-weight: bold;">Cerrar panel X</button>
            </div>
            
            <div style="overflow-x: auto; background: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="background: #232f3e; color: white;">
                            <th style="padding: 15px;">Pedido</th>
                            <th style="padding: 15px;">Cliente</th>
                            <th style="padding: 15px;">Detalles</th>
                            <th style="padding: 15px;">Total</th>
                            <th style="padding: 15px;">Estado</th>
                            <th style="padding: 15px; text-align: center;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        pedidos.forEach(p => {
            let bgEstado = p.estado === 'Aprobado' ? '#28a745' : (p.estado === 'Entregado' ? '#6f42c1' : (p.estado === 'Cancelado' ? '#dc3545' : '#009ee3'));
            let iconEstado = p.estado === 'Aprobado' ? '✅' : (p.estado === 'Entregado' ? '📦' : (p.estado === 'Cancelado' ? '❌' : '⏳'));
            
            html += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 15px;">
                        <b style="color: #333; font-size: 1.1rem;">#${p.id}</b><br>
                        <span style="font-size:0.8rem; color:#888;">${p.fecha}</span>
                    </td>
                    <td style="padding: 15px; font-weight: bold; color: #2d5668;">👤 ${p.cliente}</td>
                    <td style="padding: 15px; font-size: 0.9rem; white-space: pre-line; color: #555;">${p.detalles}</td>
                    <td style="padding: 15px; font-weight: bold; color: #d35400; font-size: 1.1rem;">S/ ${p.total.toFixed(2)}</td>
                    <td style="padding: 15px;">
                        <span style="background: ${bgEstado}; color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; display: inline-block;">
                            ${iconEstado} ${p.estado}
                        </span>
                    </td>
                    <td style="padding: 15px; text-align: center; display: flex; flex-direction: column; gap: 8px;">
                        <select onchange="cambiarEstadoPedido(${p.id}, this.value)" style="padding: 5px; border-radius: 5px; border: 1px solid #ccc; font-weight: bold; cursor: pointer; background: #f9f9f9;">
                            <option value="">Cambiar a...</option>
                            <option value="Enviado">⏳ Enviado (Pendiente)</option>
                            <option value="Aprobado">✅ Aprobado (Pagado)</option>
                            <option value="Entregado">📦 Entregado</option>
                            <option value="Cancelado">❌ Cancelado</option>
                        </select>
                        <button onclick="eliminarPedidoAdmin(${p.id})" style="background: #dc3545; color: white; border: none; padding: 6px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 0.85rem;">
                            🗑️ Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table></div>`;
        subView.innerHTML = html;

    } catch (error) {
        subView.innerHTML = '<p style="color:red; text-align:center;">Error al cargar la base de datos de pedidos.</p>';
    }
}

async function cambiarEstadoPedido(id, nuevoEstado) {
    if (!nuevoEstado) return; 
    const confirmar = confirm(`¿Estás seguro de cambiar el pedido #${id} a estado: ${nuevoEstado}?`);
    if (!confirmar) {
        renderizarAdminPedidos(); 
        return;
    }
    try {
        const res = await fetch('/api/admin/pedidos/estado/' + id, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        const data = await res.json();
        if (data.success) {
            renderizarAdminPedidos(); 
        } else {
            alert("Error al actualizar: " + data.mensaje);
        }
    } catch (error) {
        alert("Error de conexión con el servidor.");
    }
}

async function eliminarPedidoAdmin(id) {
    const confirmar = confirm(`⚠️ PELIGRO: ¿Estás COMPLETAMENTE SEGURO de querer eliminar el pedido #${id}?\n\nEsta acción borrará el pedido para siempre y el cliente ya no lo verá.`);
    if (!confirmar) return;
    try {
        const res = await fetch('/api/admin/pedidos/' + id, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            alert("🗑️ Pedido eliminado correctamente.");
            renderizarAdminPedidos(); 
        } else {
            alert("Error al eliminar: " + data.mensaje);
        }
    } catch (error) {
        alert("Error de conexión al intentar eliminar.");
    }
}

// ==========================================
// 5. SUPER FUNCIONES: EXCEL, FILTROS Y BORRADO MASIVO
// ==========================================
function dispararSubidaExcel() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls'; 
    
    input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('documento', file);

        alert("Subiendo archivo... por favor espera unos segundos.");
        try {
            const res = await fetch('/api/productos/excel', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                alert(data.mensaje);
                obtenerProductosAdmin(); 
            } else {
                alert("Error: " + data.mensaje);
            }
        } catch (error) {
            alert("Error de conexión al subir el Excel.");
        }
    };
    input.click();
}

function seleccionarTodosProductos(checkboxMaestro) {
    const checkboxes = document.querySelectorAll('.check-producto');
    checkboxes.forEach(cb => cb.checked = checkboxMaestro.checked);
    verificarSeleccionMasiva();
}

function verificarSeleccionMasiva() {
    const checkboxes = document.querySelectorAll('.check-producto:checked');
    const btnBorrar = document.getElementById('btn-borrar-masivo');
    btnBorrar.style.display = checkboxes.length > 0 ? 'inline-block' : 'none';
}

async function eliminarProductosMasivo() {
    const seleccionados = Array.from(document.querySelectorAll('.check-producto:checked')).map(cb => cb.value);
    if (seleccionados.length === 0) return;

    const confirmar = confirm(`⚠️ PELIGRO: Vas a eliminar ${seleccionados.length} repuestos al mismo tiempo. ¿Estás seguro? Esta acción no se puede deshacer.`);
    if (!confirmar) return;

    document.getElementById('btn-borrar-masivo').innerText = '⏳ Borrando...';
    
    let errores = 0;
    for (let id of seleccionados) {
        try {
            await fetch('/api/productos/' + id, { method: 'DELETE' });
        } catch (e) { errores++; }
    }

    alert(errores === 0 ? `✅ Se eliminaron ${seleccionados.length} productos correctamente.` : `⚠️ Terminó con ${errores} errores.`);
    obtenerProductosAdmin(); 
}

function filtrarTablaAdmin() {
    const textoBuscado = document.getElementById('filtro-texto').value.toLowerCase();
    const categoriaBuscada = document.getElementById('filtro-categoria').value.toLowerCase();
    const filas = document.querySelectorAll('.fila-producto');

    filas.forEach(fila => {
        const modelo = fila.querySelector('.texto-modelo').innerText.toLowerCase();
        const marca = fila.querySelector('.texto-marca').innerText.toLowerCase();
        const categoria = fila.querySelector('.texto-categoria').innerText.toLowerCase();

        const coincideTexto = modelo.includes(textoBuscado) || marca.includes(textoBuscado);
        const coincideCategoria = categoriaBuscada === "" || categoria.includes(categoriaBuscada);

        if (coincideTexto && coincideCategoria) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
}

async function descargarExcelProductos() {
    try {
        const res = await fetch('/api/productos/buscar');
        const productos = await res.json();
        
        if (productos.length === 0) {
            alert("El almacén está vacío, no hay nada que descargar.");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,ID,Categoria,Marca,Modelo,Precio,Stock,Estado\n";

        productos.forEach(p => {
            let modeloLimpio = p.modelo ? p.modelo.replace(/,/g, "") : "";
            let marcaLimpia = p.marca ? p.marca.replace(/,/g, "") : "";
            let categoriaLimpia = p.categoria ? p.categoria.replace(/,/g, "") : "General";
            let fila = `${p.id},${categoriaLimpia},${marcaLimpia},${modeloLimpio},${p.precio},${p.stock || 0},${p.estado}`;
            csvContent += fila + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Inventario_SiraStore.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        alert("Error al intentar generar el archivo Excel.");
    }
}