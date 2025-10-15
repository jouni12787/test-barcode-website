<script>
  if (sessionStorage.getItem('authenticated') === 'true') {
    window.location.replace('app/index.html');
  }

  const FORM = document.getElementById('loginForm');
  const PASSWORD_FIELD = document.getElementById('password');
  const ERROR = document.getElementById('error');
  const SUBMIT_BTN = document.getElementById('submitBtn');

  function setLoading(state) {
    SUBMIT_BTN.disabled = state;
    SUBMIT_BTN.textContent = state ? 'Checking…' : 'Enter Workspace';
  }

  FORM.addEventListener('submit', async (event) => {
    event.preventDefault();
    ERROR.classList.remove('visible');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: PASSWORD_FIELD.value.trim() })
      });

      if (res.ok) {
        sessionStorage.setItem('authenticated', 'true');
        window.location.href = 'app/index.html';
      } else {
        ERROR.classList.add('visible'); // shows "Incorrect password..."
        PASSWORD_FIELD.value = '';
        PASSWORD_FIELD.focus();
      }
    } catch (e) {
      ERROR.textContent = 'Server error. Please try again.';
      ERROR.classList.add('visible');
    } finally {
      setLoading(false);
    }
  });

  PASSWORD_FIELD.addEventListener('input', () => ERROR.classList.remove('visible'));
</script>
