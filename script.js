// Esperar que el DOM esté cargado antes de ejecutar funciones
document.addEventListener('DOMContentLoaded', () => {
  // Mostrar sección según el botón clicado
  window.mostrarSeccion = function(id) {
    const secciones = document.querySelectorAll('.seccion');
    secciones.forEach(seccion => {
      if (seccion.id === id) {
        seccion.classList.remove('oculto');
      } else {
        seccion.classList.add('oculto');
      }
    });
  };

  // Supabase (descomenta si estás usando Supabase)
  // const supabase = supabase.createClient('https://tu-url.supabase.co', 'tu-clave');

  async function registrarUsuario(nombre, email, contraseña) {
    // Simulación de registro (si no estás conectado a Supabase aún)
    alert(`Registrado:\nNombre: ${nombre}\nEmail: ${email}`);
    mostrarSeccion('inicio');
  }

  document.getElementById('registro-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const contraseña = document.getElementById('contraseña').value;
    await registrarUsuario(nombre, email, contraseña);
  });
});
