// Diccionario de palabras clave - AMPLIADO
const keywordVariations = {
    'playa': ['playa', 'playas', 'beach', 'beaches', 'sea', 'shore', 'coast'],
    'templo': ['templo', 'templos', 'temple', 'temples', 'shrine', 'sanctuary'],
    'australia': ['australia', 'australiano', 'australian', 'sydney', 'oz'],
    'japon': ['japon', 'japones', 'japanese', 'tokyo', 'kyoto'],
    'mexico': ['mexico', 'mexicano', 'cancun', 'mexican'],
    'cambodia': ['cambodia', 'camboyano', 'angkor'],
    'indonesia': ['indonesia', 'indonesio', 'borobudur', 'bali']
};

// Configuración inicial cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM completamente cargado');
    
    // Configurar eventos
    setupEventListeners();
    
    // Configurar clases de página
    setPageClass();
    
    // Configurar navegación activa
    setActiveNavigation();
});

// Nueva función para establecer navegación activa
function setActiveNavigation() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Configura todos los event listeners necesarios
function setupEventListeners() {
    // Botón de búsqueda
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        console.log('Configurando listener para botón de búsqueda');
        searchBtn.addEventListener('click', handleSearch);
        
        // También permitir búsqueda con Enter
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleSearch();
                }
            });
        }
    }
    
    // Botón de limpieza - MEJORADO
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        console.log('Configurando listener para botón de limpieza');
        resetBtn.addEventListener('click', function() {
            console.log('Botón Clear presionado');
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.value = '';
            
            const resultsContainer = document.getElementById('recommendation-results');
            if (resultsContainer) {
                resultsContainer.innerHTML = '';
                resultsContainer.style.display = 'none'; // Ocultar sección
            }
        });
    }
    
    // Botón BOOK NOW
    const bookBtn = document.querySelector('.book-btn');
    if (bookBtn) {
        bookBtn.addEventListener('click', function() {
            alert('Redirigiendo a página de reservas (simulación)');
        });
    }
    
    // Formulario de contacto
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactForm();
        });
    }
    
    // Botones BOOK NOW en resultados
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-book')) {
            alert('Redirigiendo a página de reservas (simulación)');
        }
    });
}

// Configura la clase del body según la página - MEJORADO
function setPageClass() {
    const path = window.location.pathname;
    console.log('Ruta actual:', path);
    
    // Remover todas las clases de página primero
    document.body.classList.remove('home-page', 'about-page', 'contact-page');
    
    if (path.includes('about.html')) {
        document.body.classList.add('about-page');
        console.log('Clase about-page añadida');
    } else if (path.includes('contact.html')) {
        document.body.classList.add('contact-page');
        console.log('Clase contact-page añadida');
    } else {
        document.body.classList.add('home-page');
        console.log('Clase home-page añadida');
    }
}

// Resto del código se mantiene igual hasta...

// Función principal de búsqueda - CORREGIDA
async function handleSearch() {
    console.log('Función handleSearch ejecutada');
    const searchInput = document.getElementById('search-input');
    if (!searchInput) {
        console.error('No se encontró el campo de búsqueda');
        return;
    }
    
    const searchTerm = searchInput.value.trim().toLowerCase();
    console.log('Término de búsqueda:', searchTerm);
    
    if (!searchTerm) {
        alert('Por favor ingresa un término de búsqueda');
        return;
    }
    
    try {
        console.log('Intentando cargar recommendations...');
        // CORRECCIÓN IMPORTANTE: Cambiar el nombre del archivo JSON
        const response = await fetch('wander_sphere_api.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Datos cargados:', data);
        
        const results = filterRecommendations(data, searchTerm);
        displayRecommendations(results);
        
    } catch (error) {
        console.error('Error en la búsqueda:', error);
        displayRecommendations(null, true);
    }
}

// Filtra las recomendaciones según el término de búsqueda - MEJORADO
function filterRecommendations(data, searchTerm) {
    console.log('Filtrando recomendaciones para:', searchTerm);
    const results = [];
    const addedItems = new Set(); // Para evitar duplicados
    
    // Buscar playas
    if (keywordVariations['playa'].some(v => searchTerm.includes(v))) {
        console.log('Encontradas playas');
        data.beaches.forEach(beach => {
            if (!addedItems.has(beach.name)) {
                results.push(beach);
                addedItems.add(beach.name);
            }
        });
    }
    
    // Buscar templos
    if (keywordVariations['templo'].some(v => searchTerm.includes(v))) {
        console.log('Encontrados templos');
        data.temples.forEach(temple => {
            if (!addedItems.has(temple.name)) {
                results.push(temple);
                addedItems.add(temple.name);
            }
        });
    }
    
    // Buscar países y ciudades
    data.countries.forEach(country => {
        // Buscar por nombre de país
        const countryName = country.name.toLowerCase();
        const countryMatch = keywordVariations[countryName]?.some(v => searchTerm.includes(v)) || 
                            countryName.includes(searchTerm);
        
        if (countryMatch) {
            console.log(`Encontrado país: ${country.name}`);
            country.cities.forEach(city => {
                if (!addedItems.has(city.name)) {
                    results.push(city);
                    addedItems.add(city.name);
                }
            });
        }
        
        // Buscar por nombre de ciudad
        country.cities.forEach(city => {
            const cityName = city.name.toLowerCase();
            if (cityName.includes(searchTerm) && !addedItems.has(city.name)) {
                console.log(`Encontrada ciudad: ${city.name}`);
                results.push(city);
                addedItems.add(city.name);
            }
        });
    });
    
    console.log('Resultados encontrados:', results.length);
    return results.length > 0 ? results : null;
}

// Muestra las recomendaciones en la página - MEJORADA
function displayRecommendations(recommendations, isError = false) {
    console.log('Mostrando recomendaciones...');
    const resultsContainer = document.getElementById('recommendation-results');
    if (!resultsContainer) {
        console.error('No se encontró el contenedor de resultados');
        return;
    }
    
    resultsContainer.innerHTML = '';
    resultsContainer.style.display = 'block'; // Mostrar la sección
    
    if (isError) {
        console.log('Mostrando mensaje de error');
        resultsContainer.innerHTML = '<p class="error">Error al cargar recomendaciones. Intenta nuevamente.</p>';
        return;
    }
    
    if (!recommendations) {
        console.log('No hay recomendaciones');
        resultsContainer.innerHTML = '<p class="no-results">No encontramos resultados para tu búsqueda.</p>';
        return;
    }
    
    console.log('Creando elementos de resultados');
    const title = document.createElement('h2');
    title.textContent = 'Recomendaciones para ti';
    title.style.textAlign = 'center';
    title.style.color = '#ff6b6b';
    title.style.marginBottom = '20px';
    resultsContainer.appendChild(title);
    
    recommendations.forEach(item => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        
        card.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}" onerror="this.onerror=null; this.src='images/default.jpg'">
            <div class="card-content">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <button class="btn-book">BOOK NOW</button>
            </div>
        `;
        
        resultsContainer.appendChild(card);
    });
    
    console.log('Recomendaciones mostradas correctamente');
}


// Función para obtener la URL base
function getBaseUrl() {
    return window.location.origin;
}

// Muestra las recomendaciones en la página - CORREGIDA
function displayRecommendations(recommendations, isError = false) {
    console.log('Mostrando recomendaciones...');
    const resultsContainer = document.getElementById('recommendation-results');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = '';
    resultsContainer.style.display = 'block';
    
    if (isError) {
        resultsContainer.innerHTML = '<p class="error">Error al cargar recomendaciones. Intenta nuevamente.</p>';
        return;
    }
    
    if (!recommendations) {
        resultsContainer.innerHTML = '<p class="no-results">No encontramos resultados para tu búsqueda.</p>';
        return;
    }
    
    const title = document.createElement('h2');
    title.textContent = 'Recomendaciones para ti';
    title.style.textAlign = 'center';
    title.style.color = '#ff6b6b';
    title.style.marginBottom = '20px';
    resultsContainer.appendChild(title);
    
    recommendations.forEach(item => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        
        // Convertir ruta relativa a absoluta
        const absoluteImageUrl = item.imageUrl.startsWith('http') ? 
            item.imageUrl : 
            `${getBaseUrl()}/${item.imageUrl}`;
        
        card.innerHTML = `
            <img src="${absoluteImageUrl}" alt="${item.name}" 
                 onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=Imagen+no+disponible'">
            <div class="card-content">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <button class="btn-book">BOOK NOW</button>
            </div>
        `;
        
        resultsContainer.appendChild(card);
    });
}

// Función principal de búsqueda - ACTUALIZADA
async function handleSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (!searchTerm) {
        alert('Por favor ingresa un término de búsqueda');
        return;
    }
    
    try {
        // Usar ruta absoluta para el JSON
        const response = await fetch(`${getBaseUrl()}/wander_sphere_api.json`);
        if (!response.ok) throw new Error('Error cargando datos');
        
        const data = await response.json();
        const results = filterRecommendations(data, searchTerm);
        displayRecommendations(results);
        
    } catch (error) {
        console.error('Error en la búsqueda:', error);
        displayRecommendations(null, true);
    }
}