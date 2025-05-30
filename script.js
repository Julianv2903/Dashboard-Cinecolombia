import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://rjnzophzvzoiayiqsvsv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqbnpvcGh6dnpvaWF5aXFzdnN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NzU0MTIsImV4cCI6MjA2NDA1MTQxMn0.SYkuDZ2fDx-OUIsAvihlgPGi35ZvlJSLQQ60WdkBASk'
const supabase = createClient(supabaseUrl, supabaseKey)

const apiKey = '322bdfd45a7b758ea76db36b66249233'
const urlApiTMDB = `https://api.themoviedb.org/3`
const imagenBaseURL = 'https://image.tmdb.org/t/p/w500'

let peliculas = []
let favoritos = []
let carrito = []
let usuario = null

const carteleraLista = document.getElementById('cartelera-lista')
const favoritosLista = document.getElementById('favoritos-lista')
const carritoLista = document.getElementById('carrito-lista')
const comprarBtn = document.getElementById('comprar-btn')
const mensajeLogin = document.getElementById('mensaje-login')

function mostrarSeccion(seccion) {
  document.querySelectorAll('.seccion').forEach(sec => sec.classList.add('oculto'))
  const s = document.getElementById(seccion)
  if (s) s.classList.remove('oculto')
}
window.mostrarSeccion = mostrarSeccion

async function cargarPeliculas() {
  try {
    const response = await fetch(`${urlApiTMDB}/movie/now_playing?api_key=${apiKey}&language=es-ES&page=1`)
    const data = await response.json()
    peliculas = data.results || []
    mostrarPeliculas(peliculas)
  } catch (error) {
    console.error('Error cargando películas:', error)
  }
}

function mostrarPeliculas(lista) {
  carteleraLista.innerHTML = ''
  if (lista.length === 0) {
    carteleraLista.innerHTML = '<p>No se encontraron películas.</p>'
    return
  }
  lista.forEach(pelicula => {
    const div = document.createElement('div')
    div.classList.add('pelicula')
    div.innerHTML = `
      <img src="${pelicula.poster_path ? imagenBaseURL + pelicula.poster_path : 'no-image.png'}" alt="${pelicula.title}" />
      <h4>${pelicula.title}</h4>
      <button class="btn-fav" data-id="${pelicula.id}">Agregar a Favoritos</button>
      <button class="btn-carrito" data-id="${pelicula.id}">Agregar al Carrito</button>
    `
    carteleraLista.appendChild(div)
  })
  document.querySelectorAll('.btn-fav').forEach(btn => btn.onclick = () => agregarAFavoritos(parseInt(btn.dataset.id)))
  document.querySelectorAll('.btn-carrito').forEach(btn => btn.onclick = () => agregarAlCarrito(parseInt(btn.dataset.id)))
}

window.buscarPelicula = function () {
  const filtro = document.getElementById('buscador').value.toLowerCase()
  const filtradas = peliculas.filter(p => p.title.toLowerCase().includes(filtro))
  mostrarPeliculas(filtradas)
}

async function agregarAFavoritos(id) {
  if (!usuario) {
    alert('Debes iniciar sesión para agregar a favoritos.')
    mostrarSeccion('registro')
    return
  }
  if (favoritos.some(f => f.id === id)) {
    alert('Esta película ya está en favoritos.')
    return
  }
  const peli = peliculas.find(p => p.id === id)
  if (!peli) return

  favoritos.push(peli)
  await guardarFavoritosEnSupabase()
  mostrarFavoritos()
}

async function guardarFavoritosEnSupabase() {
  const ids = favoritos.map(p => p.id)
  const { error } = await supabase.from('usuarios').update({ favoritos: ids }).eq('id', usuario.id)
  if (error) console.error('Error guardando favoritos:', error)
}

async function cargarFavoritosDesdeSupabase() {
  if (!usuario) return
  const { data, error } = await supabase.from('usuarios').select('favoritos').eq('id', usuario.id).single()
  if (error) {
    console.error('Error cargando favoritos:', error)
    favoritos = []
  } else {
    const ids = data?.favoritos || []
    favoritos = peliculas.filter(p => ids.includes(p.id))
    mostrarFavoritos()
  }
}

function mostrarFavoritos() {
  favoritosLista.innerHTML = ''
  if (favoritos.length === 0) {
    favoritosLista.innerHTML = '<p>No tienes favoritos aún.</p>'
    return
  }
  favoritos.forEach(peli => {
    const div = document.createElement('div')
    div.classList.add('favorito-item')
    div.innerHTML = `<h4>${peli.title}</h4><button data-id="${peli.id}">Eliminar</button>`
    favoritosLista.appendChild(div)
  })
  favoritosLista.querySelectorAll('button').forEach(btn => {
    btn.onclick = async () => {
      const id = parseInt(btn.dataset.id)
      favoritos = favoritos.filter(f => f.id !== id)
      await guardarFavoritosEnSupabase()
      mostrarFavoritos()
    }
  })
}

function agregarAlCarrito(id) {
  if (!usuario) {
    alert('Debes iniciar sesión para agregar al carrito.')
    mostrarSeccion('registro')
    return
  }
  if (carrito.some(c => c.id === id)) {
    alert('Esta película ya está en el carrito.')
    return
  }
  const peli = peliculas.find(p => p.id === id)
  if (!peli) return
  carrito.push(peli)
  mostrarCarrito()
}

function mostrarCarrito() {
  carritoLista.innerHTML = ''
  if (carrito.length === 0) {
    carritoLista.innerHTML = '<p>Tu carrito está vacío.</p>'
    comprarBtn.disabled = true
    return
  }
  comprarBtn.disabled = false
  carrito.forEach(peli => {
    const div = document.createElement('div')
    div.classList.add('carrito-item')
    div.innerHTML = `<h4>${peli.title}</h4><button data-id="${peli.id}">Eliminar</button>`
    carritoLista.appendChild(div)
  })
  carritoLista.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
      const id = parseInt(btn.dataset.id)
      carrito = carrito.filter(c => c.id !== id)
      mostrarCarrito()
    }
  })
}

comprarBtn.onclick = async () => {
  if (!usuario) {
    alert('Debes iniciar sesión para comprar.')
    mostrarSeccion('registro')
    return
  }
  try {
    const entradas = carrito.map(p => p.id)
    const { error } = await supabase.from('compras').insert([{ usuario_id: usuario.id, peliculas: entradas, fecha: new Date().toISOString() }])
    if (error) throw error
    alert('Compra realizada con éxito')
    carrito = []
    mostrarCarrito()
  } catch (error) {
    alert('Error realizando la compra: ' + error.message)
  }
}

const formRegistro = document.getElementById('registro-form')
formRegistro.addEventListener('submit', async e => {
  e.preventDefault()
  const nombre = document.getElementById('nombre').value.trim()
  const email = document.getElementById('email').value.trim()
  const contraseña = document.getElementById('contraseña').value.trim()
  if (!nombre || !email || !contraseña) {
    alert('Por favor llena todos los campos.')
    return
  }
  try {
    const { data, error } = await supabase.auth.signUp({ email, password: contraseña })
    if (error) throw error
    const user = data?.user
    if (!user || !user.id) {
      alert("No se pudo obtener el ID del usuario luego del registro.")
      return
    }
    await supabase.from('usuarios').insert([{ id: user.id, nombre, email, favoritos: [] }])
    alert('Usuario registrado con éxito. Por favor inicia sesión.')
    mostrarSeccion('registro')
    formRegistro.reset()
  } catch (error) {
    alert('Error al registrar usuario: ' + error.message)
  }
})

const formLogin = document.getElementById('login-form')
formLogin.addEventListener('submit', async e => {
  e.preventDefault()
  const email = document.getElementById('login-email').value.trim()
  const contraseña = document.getElementById('login-contraseña').value.trim()
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: contraseña })
    if (error) throw error
    usuario = data.user
    mensajeLogin.textContent = ''
    alert(`Bienvenido ${usuario.email}`)
    mostrarSeccion('inicio')
    formLogin.reset()
    cargarFavoritosDesdeSupabase()
  } catch (error) {
    mensajeLogin.textContent = 'Correo o contraseña incorrectos'
  }
})

supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    usuario = session.user
    cargarFavoritosDesdeSupabase()
  } else {
    usuario = null
    favoritos = []
    mostrarFavoritos()
  }
})

mostrarSeccion('inicio')
cargarPeliculas()
