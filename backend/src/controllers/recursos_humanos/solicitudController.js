const { sql, connectDB } = require('../../config/db');

exports.getSolicitudes = async (req, res) => {
  try {
    const { empresaId } = req.query;
    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    const result = await pool.request()
      .input('empresaId', sql.VarChar, empresaId)
      .query('SELECT * FROM RHSolicitud WHERE EmpresaID = @empresaId ORDER BY FechaSolicitud DESC');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSolicitud = async (req, res) => {
  try {
    const data = req.body;
    const pool = await connectDB();

    // Verificar Cédula Única por Empresa
    const checkCedula = await pool.request()
      .input('Cedula', sql.VarChar, data.Cedula)
      .input('EmpresaID', sql.VarChar, data.EmpresaID)
      .query('SELECT 1 FROM RHSolicitud WHERE Cedula = @Cedula AND EmpresaID = @EmpresaID');
    
    if (checkCedula.recordset.length > 0) {
      return res.status(400).json({ message: 'Ya existe una solicitud con esta Cédula en la empresa.' });
    }

    const result = await pool.request()
      .input('EmpresaID', sql.VarChar, data.EmpresaID)
      .input('FechaSolicitud', sql.DateTime, data.FechaSolicitud || new Date())
      .input('Empleadoid', sql.VarChar, data.Empleadoid || '')
      .input('Cedula', sql.VarChar, data.Cedula)
      .input('Tratamiento', sql.VarChar, data.Tratamiento || '')
      .input('TituloAcademicoID', sql.TinyInt, data.TituloAcademicoID || 0)
      .input('Nombre', sql.VarChar, data.Nombre)
      .input('Nombre1', sql.VarChar, data.Nombre1 || '')
      .input('Nombre2', sql.VarChar, data.Nombre2 || '')
      .input('Apellido1', sql.VarChar, data.Apellido1 || '')
      .input('Apellido2', sql.VarChar, data.Apellido2 || '')
      .input('Alias', sql.VarChar, data.Alias || '')
      .input('TipoID', sql.VarChar, data.TipoID || '')
      .input('Apodo', sql.VarChar, data.Apodo || '')
      .input('Telefono', sql.VarChar, data.Telefono || '')
      .input('Celular', sql.VarChar, data.Celular || '')
      .input('Beeper', sql.VarChar, data.Beeper || '')
      .input('Email', sql.VarChar, data.Email || '')
      .input('EstadoCivil', sql.Int, data.EstadoCivil || 0)
      .input('TipoSangreID', sql.TinyInt, data.TipoSangreID || 0)
      .input('LicenciaConducir', sql.VarChar, data.LicenciaConducir || '')
      .input('Pasaporte', sql.VarChar, data.Pasaporte || '')
      .input('CodigoPostal', sql.VarChar, data.CodigoPostal || '')
      .input('Telefono1', sql.VarChar, data.Telefono1 || '')
      .input('Telefono2', sql.VarChar, data.Telefono2 || '')
      .input('TelefonoExtensionEmp', sql.VarChar, data.TelefonoExtensionEmp || '')
      .input('Beeper1', sql.VarChar, data.Beeper1 || '')
      .input('Fax', sql.VarChar, data.Fax || '')
      .input('URL', sql.VarChar, data.URL || '')
      .input('TipoSangre', sql.Int, data.TipoSangre || 0)
      .input('Sexo', sql.Int, data.Sexo || 0)
      .input('FechaDisponible', sql.DateTime, data.FechaDisponible || new Date())
      .input('FechaNacimiento', sql.DateTime, data.FechaNacimiento || new Date())
      .input('MunicipioIDNacieminto', sql.VarChar, data.MunicipioIDNacieminto || '')
      .input('ProvinciaIDNacimiento', sql.VarChar, data.ProvinciaIDNacimiento || '')
      .input('PaisIDNacimiento', sql.VarChar, data.PaisIDNacimiento || '')
      .input('MunicipioID', sql.VarChar, data.MunicipioID || '')
      .input('ProvinciaID', sql.VarChar, data.ProvinciaID || '')
      .input('PaisID', sql.VarChar, data.PaisID || '')
      .input('CargoID', sql.VarChar, data.CargoID || '')
      .input('Sueldo', sql.Decimal, data.Sueldo || 0)
      .input('Prioridad', sql.Bit, data.Prioridad ? 1 : 0)
      .input('Traslado', sql.Bit, data.Traslado ? 1 : 0)
      .input('Nombrado', sql.Bit, data.Nombrado ? 1 : 0)
      .input('Viajar', sql.Bit, data.Viajar ? 1 : 0)
      .input('Direccion', sql.VarChar, data.Direccion || '')
      .input('Referencia', sql.VarChar, data.Referencia || '')
      .input('Sector', sql.VarChar, data.Sector || '')
      .input('DepartamentoId', sql.VarChar, data.DepartamentoId || '')
      .input('DependenciaID', sql.VarChar, data.DependenciaID || '')
      .input('SeccionID', sql.VarChar, data.SeccionID || '')
      .input('DivisionID', sql.VarChar, data.DivisionID || '')
      .input('CentroCostoId', sql.VarChar, data.CentroCostoId || '')
      .input('PropositoId', sql.VarChar, data.PropositoId || '')
      .input('PerfilInternacional', sql.Bit, data.PerfilInternacional ? 1 : 0)
      .input('CedeID', sql.Int, data.CedeID || null)
      .input('GrupoOcupacionalID', sql.Int, data.GrupoOcupacionalID || null)
      .input('CreadoPor', sql.VarChar, data.CreadoPor || '')
      .input('ModificadoPor', sql.VarChar, data.CreadoPor || '')
      .query(`
        INSERT INTO RHSolicitud (
          EmpresaID, FechaSolicitud, Empleadoid, Cedula, Tratamiento, TituloAcademicoID, Nombre, Nombre1, Nombre2, 
          Apellido1, Apellido2, Alias, TipoID, Apodo, Telefono, Celular, Beeper, Email, EstadoCivil, 
          TipoSangreID, LicenciaConducir, Pasaporte, CodigoPostal, Telefono1, Telefono2, TelefonoExtensionEmp, 
          Beeper1, Fax, URL, TipoSangre, Sexo, FechaDisponible, FechaNacimiento, MunicipioIDNacieminto, 
          ProvinciaIDNacimiento, PaisIDNacimiento, MunicipioID, ProvinciaID, PaisID, CargoID, Sueldo, 
          Prioridad, Traslado, Nombrado, Viajar, Direccion, Referencia, Sector, DepartamentoId, 
          DependenciaID, SeccionID, DivisionID, CentroCostoId, PropositoId, PerfilInternacional, 
          CedeID, GrupoOcupacionalID, CreadoPor, ModificadoPor
        ) OUTPUT inserted.SolicitudID VALUES (
          @EmpresaID, @FechaSolicitud, @Empleadoid, @Cedula, @Tratamiento, @TituloAcademicoID, @Nombre, @Nombre1, @Nombre2, 
          @Apellido1, @Apellido2, @Alias, @TipoID, @Apodo, @Telefono, @Celular, @Beeper, @Email, @EstadoCivil, 
          @TipoSangreID, @LicenciaConducir, @Pasaporte, @CodigoPostal, @Telefono1, @Telefono2, @TelefonoExtensionEmp, 
          @Beeper1, @Fax, @URL, @TipoSangre, @Sexo, @FechaDisponible, @FechaNacimiento, @MunicipioIDNacieminto, 
          @ProvinciaIDNacimiento, @PaisIDNacimiento, @MunicipioID, @ProvinciaID, @PaisID, @CargoID, @Sueldo, 
          @Prioridad, @Traslado, @Nombrado, @Viajar, @Direccion, @Referencia, @Sector, @DepartamentoId, 
          @DependenciaID, @SeccionID, @DivisionID, @CentroCostoId, @PropositoId, @PerfilInternacional, 
          @CedeID, @GrupoOcupacionalID, @CreadoPor, @ModificadoPor
        )
      `);
      
    res.status(201).json({ message: 'Solicitud creada exitosamente', id: result.recordset[0].SolicitudID });
  } catch (err) {
    if (err.message.includes('UQ_RHSolicitud_Cedula')) {
      return res.status(400).json({ message: 'Ya existe una solicitud con esta Cédula en la empresa.' });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.updateSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const pool = await connectDB();

    // Check if another record has the same Cedula
    const checkCedula = await pool.request()
      .input('Cedula', sql.VarChar, data.Cedula)
      .input('EmpresaID', sql.VarChar, data.EmpresaID)
      .input('SolicitudID', sql.Int, id)
      .query('SELECT 1 FROM RHSolicitud WHERE Cedula = @Cedula AND EmpresaID = @EmpresaID AND SolicitudID != @SolicitudID');
    
    if (checkCedula.recordset.length > 0) {
      return res.status(400).json({ message: 'Ya existe OTRA solicitud con esta Cédula en la empresa.' });
    }

    const result = await pool.request()
      .input('SolicitudID', sql.Int, id)
      .input('EmpresaID', sql.VarChar, data.EmpresaID)
      .input('Empleadoid', sql.VarChar, data.Empleadoid || '')
      .input('Cedula', sql.VarChar, data.Cedula)
      .input('Tratamiento', sql.VarChar, data.Tratamiento || '')
      .input('TituloAcademicoID', sql.TinyInt, data.TituloAcademicoID || 0)
      .input('Nombre', sql.VarChar, data.Nombre)
      .input('Nombre1', sql.VarChar, data.Nombre1 || '')
      .input('Nombre2', sql.VarChar, data.Nombre2 || '')
      .input('Apellido1', sql.VarChar, data.Apellido1 || '')
      .input('Apellido2', sql.VarChar, data.Apellido2 || '')
      .input('Alias', sql.VarChar, data.Alias || '')
      .input('Telefono', sql.VarChar, data.Telefono || '')
      .input('Celular', sql.VarChar, data.Celular || '')
      .input('Email', sql.VarChar, data.Email || '')
      .input('EstadoCivil', sql.Int, data.EstadoCivil || 0)
      .input('TipoSangre', sql.Int, data.TipoSangre || 0)
      .input('Sexo', sql.Int, data.Sexo || 0)
      .input('FechaNacimiento', sql.DateTime, data.FechaNacimiento || new Date())
      .input('MunicipioIDNacieminto', sql.VarChar, data.MunicipioIDNacieminto || '')
      .input('ProvinciaIDNacimiento', sql.VarChar, data.ProvinciaIDNacimiento || '')
      .input('PaisIDNacimiento', sql.VarChar, data.PaisIDNacimiento || '')
      .input('MunicipioID', sql.VarChar, data.MunicipioID || '')
      .input('ProvinciaID', sql.VarChar, data.ProvinciaID || '')
      .input('PaisID', sql.VarChar, data.PaisID || '')
      .input('CargoID', sql.VarChar, data.CargoID || '')
      .input('Sueldo', sql.Decimal, data.Sueldo || 0)
      .input('Traslado', sql.Bit, data.Traslado ? 1 : 0)
      .input('Viajar', sql.Bit, data.Viajar ? 1 : 0)
      .input('Direccion', sql.VarChar, data.Direccion || '')
      .input('PerfilInternacional', sql.Bit, data.PerfilInternacional ? 1 : 0)
      .input('CedeID', sql.Int, data.CedeID || null)
      .input('GrupoOcupacionalID', sql.Int, data.GrupoOcupacionalID || null)
      .input('ModificadoPor', sql.VarChar, data.ModificadoPor || '')
      .query(`
        UPDATE RHSolicitud SET 
          Empleadoid = @Empleadoid,
          Cedula = @Cedula, Tratamiento = @Tratamiento, TituloAcademicoID = @TituloAcademicoID, Nombre = @Nombre, 
          Nombre1 = @Nombre1, Nombre2 = @Nombre2, Apellido1 = @Apellido1, Apellido2 = @Apellido2, Alias = @Alias, 
          Telefono = @Telefono, Celular = @Celular, Email = @Email, EstadoCivil = @EstadoCivil, 
          TipoSangre = @TipoSangre, Sexo = @Sexo, FechaNacimiento = @FechaNacimiento, 
          MunicipioIDNacieminto = @MunicipioIDNacieminto, ProvinciaIDNacimiento = @ProvinciaIDNacimiento, 
          PaisIDNacimiento = @PaisIDNacimiento, MunicipioID = @MunicipioID, ProvinciaID = @ProvinciaID, 
          PaisID = @PaisID, CargoID = @CargoID, Sueldo = @Sueldo, Traslado = @Traslado, Viajar = @Viajar, 
          Direccion = @Direccion, PerfilInternacional = @PerfilInternacional, 
          CedeID = @CedeID, GrupoOcupacionalID = @GrupoOcupacionalID,
          ModificadoPor = @ModificadoPor, FechaModificado = GETDATE()
        WHERE SolicitudID = @SolicitudID AND EmpresaID = @EmpresaID
      `);
      
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    res.json({ message: 'Solicitud actualizada exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { empresaId } = req.query;

    const pool = await connectDB();
    const result = await pool.request()
      .input('SolicitudID', sql.Int, id)
      .input('EmpresaID', sql.VarChar, empresaId)
      .query('DELETE FROM RHSolicitud WHERE SolicitudID = @SolicitudID AND EmpresaID = @EmpresaID');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }
    
    // Opcional: Borrar documentos de RHSolicitudDocumentos aquí
    
    res.json({ message: 'Solicitud eliminada exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// Subida de Documentos (Files)
// ==========================================
exports.uploadDocumento = async (req, res) => {
  try {
    const { solicitudId } = req.params;
    const { empresaId } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No se subieron archivos' });
    }

    const pool = await connectDB();
    const subidos = [];

    for (const file of req.files) {
      const rutaArchivo = '/uploads/' + file.filename;
      const nombreArchivo = file.originalname;

      await pool.request()
        .input('SolicitudID', sql.Int, solicitudId)
        .input('EmpresaID', sql.VarChar, empresaId)
        .input('NombreArchivo', sql.VarChar, nombreArchivo)
        .input('RutaArchivo', sql.VarChar, rutaArchivo)
        .query(`
          INSERT INTO RHSolicitudDocumentos (SolicitudID, EmpresaID, NombreArchivo, RutaArchivo)
          VALUES (@SolicitudID, @EmpresaID, @NombreArchivo, @RutaArchivo)
        `);
        
      subidos.push({ nombre: nombreArchivo, ruta: rutaArchivo });
    }

    res.status(200).json({ message: 'Archivos subidos con éxito', archivos: subidos });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDocumentos = async (req, res) => {
  try {
    const { solicitudId } = req.params;
    const { empresaId } = req.query;

    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    const result = await pool.request()
      .input('SolicitudID', sql.Int, solicitudId)
      .input('EmpresaID', sql.VarChar, empresaId)
      .query('SELECT DocumentoID, NombreArchivo, RutaArchivo, FechaSubida FROM RHSolicitudDocumentos WHERE SolicitudID = @SolicitudID AND EmpresaID = @EmpresaID ORDER BY FechaSubida DESC');

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadFoto = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const pool = await connectDB();

    await pool.request()
      .input('id', sql.Int, id)
      .input('url', sql.VarChar, fileUrl)
      .query(`
        UPDATE RHSolicitud 
        SET URL = @url 
        WHERE SolicitudID = @id
      `);

    res.json({ message: 'Fotografía subida exitosamente', url: fileUrl });
  } catch (err) {
    console.error('Error al subir fotografía de solicitud:', err);
    res.status(500).json({ message: 'Error interno al subir la fotografía' });
  }
};
