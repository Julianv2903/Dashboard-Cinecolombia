const apiKey = '322bdfd45a7b758ea76db36b66249233';
const apiBaseUrl = 'https://api.themoviedb.org/3';
const imgBaseUrl = 'https://image.tmdb.org/t/p/w500';

document.addEventListener('DOMContentLoaded', () => {
  mostrarSeccion('inicio');
  cargarPeliculas();

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const seccion = btn.getAttribute('data-seccion');
      mostrarSeccion(seccion);
    });
  });

  document.getElementById('buscador').addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length > 0) {
      buscarPeliculas(query);
    } else {
      cargarPeliculas(); // recargar cartelera
    }
  });
});

function mostrarSeccion(id) {
  document.querySelectorAll('.seccion').forEach(sec => sec.classList.add('oculto'));
  document.getElementById(id).classList.remove('oculto');
}

// Cargar películas en cartelera (estrenos)
async function cargarPeliculas() {
  const res = await fetch(`${apiBaseUrl}/movie/now_playing?api_key=${apiKey}&language=es-ES`);
  const data = await res.json();
  mostrarPeliculas(data.results);
}

// Buscar películas
async function buscarPeliculas(query) {
  const res = await fetch(`${apiBaseUrl}/search/movie?api_key=${apiKey}&language=es-ES&query=${encodeURIComponent(query)}`);
  const data = await res.json();
  mostrarPeliculas(data.results);
}

// Mostrar lista de películas
function mostrarPeliculas(peliculas) {
  const contenedor = document.getElementById('cartelera-lista');
  contenedor.innerHTML = '';

  if (!peliculas || peliculas.length === 0) {
    contenedor.innerHTML = '<p>No se encontraron películas.</p>';
    return;
  }

  peliculas.forEach(pelicula => {
    const card = document.createElement('article');
    card.classList.add('pelicula');

    const imagen = pelicula.poster_path
      ? `<img src="${imgBaseUrl + pelicula.poster_path}" alt="${pelicula.title}" />`
      : `<div style="background:#ccc;width:100%;height:300px;text-align:center;padding-top:120px;">Sin imagen</div>`;

    card.innerHTML = `
      ${imagen}
      <h4>${pelicula.title}</h4>
      <p>${pelicula.overview || 'Sin descripción disponible.'}</p>
    `;

    contenedor.appendChild(card);
  });
}
