async function test() {
  try {
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    const res = await fetch('http://localhost:3000/api/cargos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-empresa-id': '1'
      },
      body: JSON.stringify({
        CargoID: 'TESTY',
        EmpresaID: '1',
        Descripcion: 'Cargo de Prueba 2',
        CreadoPor: 'system'
      })
    });
    const data = await res.json();
    console.log('STATUS:', res.status);
    console.log('DATA:', data);
  } catch (err) {
    console.error('ERROR:', err);
  }
}
test();
