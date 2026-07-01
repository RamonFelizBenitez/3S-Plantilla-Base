async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/generar-nomina/procesar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        EmpresaID: '1',
        CodigoPeriodo: 2026,
        NominaNumero: 1,
        TipoNominaId: 'F'
      })
    });
    const data = await res.json();
    console.log("Success:");
    console.dir(data, {depth: null});
  } catch (err) {
    console.log("Error:");
    console.dir(err, {depth: null});
  }
}
test();
