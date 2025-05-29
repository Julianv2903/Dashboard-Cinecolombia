const supabaseUrl = 'https://rjnzophzvzoiayiqsvsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqbnpvcGh6dnpvaWF5aXFzdnN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NzU0MTIsImV4cCI6MjA2NDA1MTQxMn0.SYkuDZ2fDx-OUIsAvihlgPGi35ZvlJSLQQ60WdkBASk'; // No uses la secreta
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const userStatus = document.getElementById('user-status');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert('Error al iniciar sesión: ' + error.message);
  } else {
    alert('Inicio de sesión exitoso');
    loginForm.reset();
    showUser();
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    alert('Error al registrarse: ' + error.message);
  } else {
    alert('Registro exitoso. Revisa tu correo para confirmar.');
    registerForm.reset();
  }
});

async function showUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    userStatus.textContent = `Bienvenido, ${user.email}`;
  } else {
    userStatus.textContent = 'Iniciar sesión';
  }
}

showUser();

const loginBtn = document.getElementById('login-btn');
const authModal = document.getElementById('auth-modal');

// Toggle del modal
loginBtn.addEventListener('click', () => {
  if (authModal.style.display === 'none') {
    authModal.style.display = 'block';
  } else {
    authModal.style.display = 'none';
  }
});