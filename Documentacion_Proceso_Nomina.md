# Documentación del Proceso de Generación de Nómina

Este documento describe paso a paso la lógica implementada en el controlador `generarNominaController.js`. Te servirá como guía maestra para solicitar modificaciones futuras, ya que detalla exactamente en qué parte del código ocurre cada cálculo.

---

## 1. Fase de Preparación y Limpieza (Pasos 1 - 4)

Antes de calcular montos por empleado, el sistema prepara el entorno:

- **Validación de Periodos (Paso 1):** Revisa que el año (`CodigoPeriodo`) exista en Contabilidad (`CPPERIODOS`).
- **Limpieza (Paso 1.1):** Elimina cualquier registro previo en `NMNOMINALINEAS` y `NMSUELDOEMPLEADO` para el número de nómina actual, permitiendo recalcular desde cero.
- **Mapeo de Transacciones (Paso 1.2):** Lee la tabla `NMTIPOSTRANSACCIONES` buscando aquellas marcadas como `Salario`, `AFP`, `ARS`, `Dependiente`, e `ISR`. Al mismo tiempo, crea un mapa en memoria de todas las transacciones que tienen `EsIncentivo = 1`.
- **Topes de Ley (Paso 2):** Lee la tabla `NMAFPARS` para cargar los topes salariales (`TOPEAFP`, `TOPEARS`) y porcentajes vigentes.
- **Reglas de Nómina (Paso 3):** Carga la configuración de la nómina actual desde `NMTIPOSNOMINAS` (Ej: `PeriodoAFP`, `PeriodoISR`, `TipoPago`).

---

## 2. Ciclo Principal por Empleado (Pasos 5 y 6)

El sistema hace un bucle (loop) por cada empleado activo que pertenezca a esta nómina. Busca su salario bruto mensual histórico en `RHPERCEP` y comienza a procesar:

### Proceso 1: Histórico de Sueldo
Inserta un registro de control en la tabla `NMSUELDOEMPLEADO` con el salario bruto mensual real del empleado antes de cualquier división.

### Proceso 2: Dependientes
Consulta la tabla `NMDependiente`. Por cada dependiente activo:
- Busca el monto a pagar en `NMTIPOSNOMINAS.MontoDependiente`.
- Si la regla `PeriodoDependiente` es "Siempre" y la nómina es quincenal, el monto por dependiente **se divide entre 2**.
- Inserta una línea de descuento en `NMNOMINALINEAS`. Al mismo tiempo, acumula el total mensual completo que paga el empleado por dependientes (sin división) para usarlo más adelante en el ISR.

### Proceso 3: Salario Ordinario
Toma el salario bruto encontrado en `RHPERCEP`. 
- Si el tipo de pago de la nómina es "Quincenal", el salario base a pagar en esta nómina **se divide entre 2**.
- Se inserta la línea de ingreso como `SAL`.

### Proceso 4: Transacciones del Empleado (Fijas, Ocasionales, Recurrentes)
Lee la tabla `NMTRANSACCIONES` del empleado. Dependiendo del `TipoNovedad`:
- **0 (Fija):** Se aplica siempre.
- **1 (Ocasional):** Se valida que la `Fecha` esté dentro del periodo de la nómina y se respeta el `Intervalo` (1ra Quincena, 2da Quincena o Ambas).
- **2 (Recurrente / Préstamo):** Se respeta el `Intervalo` de aplicación.

> **Acumulador de Incentivos:** Si la transacción insertada tiene la bandera `EsIncentivo = 1`, su monto aplicado en esta nómina se suma a un acumulador interno `totalIncentivosMensuales` para ser reportado al cálculo del ISR.

### Proceso 5: Cálculo y Deducción de AFP
Valida la regla `PeriodoAFP` ("Siempre", "1era", "2da").
- Calcula el monto de la quincena actual usando el salario mensual dividido o ajustado al periodo.
- Se compara el salario base contra el `TOPEAFP`. Si lo excede, el descuento se calcula basado estrictamente en el tope máximo.
- Inserta la línea de deducción.

### Proceso 6: Cálculo y Deducción de ARS
Funciona exactamente bajo la misma lógica que el Proceso 5, utilizando la regla `PeriodoARS`, su porcentaje propio y su tope máximo (`TOPEARS`).

### Proceso 7: Cálculo y Deducción de ISR (Impuesto Sobre la Renta)
Este es el proceso más complejo, dividido por secuencias para aplicar la **Liquidación o True-Up**:

#### Si es la Primera Quincena (`Secuencia = 1`)
1. **Base Estimada:** `Salario Mensual` + `Incentivos cobrados en esta quincena` - `AFP (Mensual Completo)` - `ARS (Mensual Completo)` - `Dependientes (Mensual Completo)`.
2. Se consulta la tabla `NMISR` usando la Base Estimada.
3. El impuesto arrojado por la tabla **se divide entre 2** y se descuenta.

#### Si es la Segunda Quincena (`Secuencia = 2`)
1. **Consulta Histórica:** El código busca en la base de datos exactamente cuánto se le retuvo de ISR en la Primera Quincena, y cuánto cobró por incentivos en esa Primera Quincena.
2. **Base Real del Mes:** `Salario Mensual` + `Incentivos 1ra Quincena` + `Incentivos 2da Quincena` - `AFP (Mensual)` - `ARS (Mensual)` - `Dependientes (Mensual)`.
3. Se consulta la tabla `NMISR` usando la Base Real y Exacta del mes.
4. El impuesto arrojado por la tabla es el total definitivo del mes. A este impuesto total se le **resta lo que ya se le retuvo en la 1ra quincena**. El remanente es el descuento final insertado en la 2da quincena.

---

## 💡 ¿Cómo solicitar modificaciones futuras?

Si necesitas hacer un cambio, puedes indicarme directamente en qué proceso ocurre la regla, por ejemplo:
- *"Necesito que en el **Proceso 4**, las transacciones ocasionales sumen al salario ordinario en lugar de insertarse como líneas separadas."*
- *"En el **Proceso 7**, si el ISR de la 2da quincena da negativo (saldo a favor), quiero que insertes una línea de ingreso."*
- *"Crea un nuevo **Proceso 8** después del ISR para calcular un impuesto adicional de Infotep."*
