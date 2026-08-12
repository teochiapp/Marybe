'use strict';

const fs   = require('fs');
const path = require('path');
const jwt  = require('jsonwebtoken');

function verificarAdminImportacion(ctx) {
  const authHeader = ctx.request.header.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return false;

  try {
    const secret = strapi.config.get('plugin.users-permissions.jwtSecret') || 'custom-secret-key';
    const payload = jwt.verify(token, secret);
    return payload.isAdminImport === true;
  } catch (err) {
    return false;
  }
}

/**
 * Controller de Importación Admin
 *
 * Endpoints:
 *  POST /api/importacion-admin/upload  → recibe .xlsx, valida rol, importa
 *  GET  /api/importacion-admin/status  → última importación
 */
module.exports = {
  /**
   * POST /api/importacion-admin/login
   * Bypass de DB. Login basado en variables de entorno.
   */
  async login(ctx) {
    const { identifier, password } = ctx.request.body;
    const adminEmail = process.env.IMPORT_ADMIN_EMAIL || 'admin@marybe.com';
    const adminPassword = process.env.IMPORT_ADMIN_PASSWORD;

    if (!adminPassword) {
      return ctx.internalServerError('Error del servidor: IMPORT_ADMIN_PASSWORD no configurado en entorno.');
    }

    if (identifier === adminEmail && password === adminPassword) {
      const secret = strapi.config.get('plugin.users-permissions.jwtSecret') || 'custom-secret-key';
      const token = jwt.sign({ isAdminImport: true, email: adminEmail }, secret, { expiresIn: '1d' });
      return ctx.send({ jwt: token });
    }

    // Devolvemos el mismo error de Strapi para mantener la compatibilidad con el front
    return ctx.badRequest('Invalid identifier or password');
  },

  /**
   * POST /api/importacion-admin/upload
   * Requiere: JWT Custom en el header Authorization.
   */
  async upload(ctx) {
    // ── 1. Verificar JWT Custom ─────────────────────────
    if (!verificarAdminImportacion(ctx)) {
      return ctx.unauthorized('No autenticado o sesión expirada. Debés iniciar sesión como administrador.');
    }

    // ── 2. Verificar que llegó un archivo ─────────────────────────────────────
    const files = ctx.request.files;
    if (!files || !files.archivo) {
      return ctx.badRequest('No se recibió ningún archivo. Enviá el campo "archivo" como multipart.');
    }

    const archivo = files.archivo;
    const ext = path.extname(archivo.name || archivo.originalFilename || '').toLowerCase();
    if (ext !== '.xlsx') {
      return ctx.badRequest('El archivo debe ser un .xlsx válido (Plantilla_Marybe).');
    }

    let rutaTemporal = null;

    try {
      // ── 3. Guardar el archivo temporalmente ──────────────────────────────────
      // koa-body guarda el archivo en un path temporal (archivo.path)
      rutaTemporal = archivo.path || archivo.filepath;

      if (!rutaTemporal || !fs.existsSync(rutaTemporal)) {
        return ctx.badRequest('No se pudo acceder al archivo subido.');
      }

      strapi.log.info(`[ImportAdmin] Archivo recibido: ${archivo.name} (${archivo.size} bytes) → ${rutaTemporal}`);

      // ── 4. Ejecutar la importación (upsert) ──────────────────────────────────
      const servicio = strapi.service('api::importacion-admin.importacion-admin');
      const resultado = await servicio.procesarImportacion(strapi, rutaTemporal);

      // ── 4b. MODO ALTA: si hay IDs duplicados, devolver 409 Conflict ──────────
      if (resultado.errorModoAlta) {
        return ctx.send(
          {
            ok:            false,
            errorModoAlta: true,
            mensaje:       `MODO ALTA: ${resultado.duplicados.length} ID(s) ya existen en el catálogo. No se importó ningún producto.`,
            duplicados:    resultado.duplicados, // [{ id_original, nombre }]
            log:           resultado.log,
          },
          409
        );
      }

      return ctx.send({
        ok: true,
        mensaje: `Importación completada en ${resultado.tiempoSegundos}s`,
        datos: {
          totalProductos:          resultado.totalProductos,
          productosSinId:          resultado.productosSinId,
          variantesOmitidasSinPadre: resultado.variantesOmitidasSinPadre,
          variantesOmitidasSinId:  resultado.variantesOmitidasSinId,
          creados:                 resultado.creados,
          actualizados:            resultado.actualizados,
          sinCambios:              resultado.sinCambios || 0,
          errores:                 resultado.errores,
          erroresList:             resultado.erroresList,
          tiempoSegundos:          resultado.tiempoSegundos,
          log:                     resultado.log,
        },
      });
    } catch (err) {
      strapi.log.error(`[ImportAdmin] Error durante importación: ${err.message}`);
      return ctx.internalServerError(`Error al importar: ${err.message}`);
    } finally {
      // Limpiar archivo temporal si sigue existiendo
      if (rutaTemporal && fs.existsSync(rutaTemporal)) {
        try { fs.unlinkSync(rutaTemporal); } catch (_) {}
      }
    }
  },


  async status(ctx) {
    if (!verificarAdminImportacion(ctx)) {
      return ctx.unauthorized('No autenticado.');
    }

    const servicio = strapi.service('api::importacion-admin.importacion-admin');
    const ultima = servicio.obtenerUltimaImportacion();

    if (!ultima) {
      return ctx.send({ ok: true, mensaje: 'No se ha realizado ninguna importación aún.', datos: null });
    }

    return ctx.send({ ok: true, datos: ultima });
  },

  /**
   * GET /api/importacion-admin/verificar-precios
   * Revisa la integridad de precios de todos los productos y comprueba
   * que se exportarán correctamente sin discrepancias.
   */
  async verificarPrecios(ctx) {
    if (!verificarAdminImportacion(ctx)) {
      return ctx.unauthorized('No autenticado.');
    }
    
    try {
      const servicio = strapi.service('api::importacion-admin.importacion-admin');
      const resultado = await servicio.verificarPreciosIntegridad(strapi);
      return ctx.send({ ok: true, ...resultado });
    } catch (err) {
      strapi.log.error(`[ImportAdmin] Error verificando precios: ${err.message}`);
      return ctx.internalServerError(`Error al verificar: ${err.message}`);
    }
  },

  /**
   * GET /api/importacion-admin/taxonomia-vacia
   * Detecta Categorías, Subcategorías y Tipos sin ningún producto asignado.
   */
  async taxonomiaVacia(ctx) {
    if (!verificarAdminImportacion(ctx)) {
      return ctx.unauthorized('No autenticado.');
    }

    try {
      // 1. Cargar todas las categorías con sus subcategorías/tipos y el conteo de productos
      const categorias = await strapi.entityService.findMany('api::categoria.categoria', {
        populate: {
          subcategorias: {
            populate: { tipos: true },
          },
          productos: { fields: ['id', 'subcategoria', 'tipo'] },
        },
        pagination: { pageSize: 500 },
      });

      const categoriasVacias = [];
      const subcategoriasVacias = [];
      const tiposVacios = [];

      for (const cat of categorias) {
        const productos = cat.productos || [];
        const totalProductos = productos.length;

        // ── Categoría vacía ──────────────────────────────────────────────────────
        if (totalProductos === 0) {
          categoriasVacias.push({
            id: cat.id,
            nombre: cat.nombre,
            seccion: cat.seccion || '—',
          });
          // Si la categoría está vacía no tiene sentido revisar sus subcats
          continue;
        }

        // ── Subcategorías y tipos vacíos ─────────────────────────────────────────
        const subcats = cat.subcategorias || [];
        for (const sub of subcats) {
          // Productos que referencian este nombre de subcategoría dentro de esta categoría
          const prodsEnSubcat = productos.filter(
            (p) => p.subcategoria === sub.nombre
          );

          if (prodsEnSubcat.length === 0) {
            subcategoriasVacias.push({
              id: sub.id,
              nombre: sub.nombre,
              categoriaId: cat.id,
              categoriaNombre: cat.nombre,
            });
            // Si la subcategoría está vacía, sus tipos también lo están
            continue;
          }

          // ── Tipos vacíos dentro de esta subcategoría ──────────────────────────
          const tipos = sub.tipos || [];
          for (const tipo of tipos) {
            const prodsEnTipo = prodsEnSubcat.filter(
              (p) => p.tipo === tipo.nombre
            );
            if (prodsEnTipo.length === 0) {
              tiposVacios.push({
                id: tipo.id,
                nombre: tipo.nombre,
                subcatId: sub.id,
                subcatNombre: sub.nombre,
                categoriaId: cat.id,
                categoriaNombre: cat.nombre,
              });
            }
          }
        }
      }

      return ctx.send({
        ok: true,
        total: categoriasVacias.length + subcategoriasVacias.length + tiposVacios.length,
        categorias: categoriasVacias,
        subcategorias: subcategoriasVacias,
        tipos: tiposVacios,
      });
    } catch (err) {
      strapi.log.error(`[ImportAdmin] Error detectando taxonomía vacía: ${err.message}`);
      return ctx.internalServerError(`Error al detectar taxonomía vacía: ${err.message}`);
    }
  },

  /**
   * DELETE /api/importacion-admin/categoria/:id
   * Elimina una categoría que no tiene productos asignados.
   */
  async eliminarCategoria(ctx) {
    if (!verificarAdminImportacion(ctx)) {
      return ctx.unauthorized('No autenticado.');
    }

    const { id } = ctx.params;

    try {
      // Verificar que realmente no tiene productos antes de borrar
      const cat = await strapi.entityService.findOne('api::categoria.categoria', id, {
        populate: { productos: { fields: ['id'] } },
      });

      if (!cat) return ctx.notFound('Categoría no encontrada.');

      if (cat.productos && cat.productos.length > 0) {
        return ctx.badRequest(`La categoría "${cat.nombre}" tiene ${cat.productos.length} productos asignados y no puede eliminarse.`);
      }

      await strapi.entityService.delete('api::categoria.categoria', id);

      strapi.log.info(`[ImportAdmin] Categoría eliminada: ID=${id}, nombre="${cat.nombre}"`);
      return ctx.send({ ok: true, mensaje: `Categoría "${cat.nombre}" eliminada correctamente.` });
    } catch (err) {
      strapi.log.error(`[ImportAdmin] Error eliminando categoría ${id}: ${err.message}`);
      return ctx.internalServerError(`Error al eliminar categoría: ${err.message}`);
    }
  },

  /**
   * DELETE /api/importacion-admin/subcategoria/:categoriaId/:subcatId
   * Elimina una subcategoría (componente) de su categoría padre.
   */
  async eliminarSubcategoria(ctx) {
    if (!verificarAdminImportacion(ctx)) {
      return ctx.unauthorized('No autenticado.');
    }

    const { categoriaId, subcatId } = ctx.params;
    const subcatIdNum = parseInt(subcatId, 10);

    try {
      const cat = await strapi.entityService.findOne('api::categoria.categoria', categoriaId, {
        populate: {
          subcategorias: { populate: { tipos: true } },
          productos: { fields: ['id', 'subcategoria'] },
        },
      });

      if (!cat) return ctx.notFound('Categoría no encontrada.');

      const subcat = cat.subcategorias?.find((s) => s.id === subcatIdNum);
      if (!subcat) return ctx.notFound('Subcategoría no encontrada.');

      // Verificar que no tiene productos
      const prods = (cat.productos || []).filter((p) => p.subcategoria === subcat.nombre);
      if (prods.length > 0) {
        return ctx.badRequest(
          `La subcategoría "${subcat.nombre}" tiene ${prods.length} productos y no puede eliminarse.`
        );
      }

      // Reconstruir subcategorías sin la eliminada
      const nuevasSubcats = cat.subcategorias
        .filter((s) => s.id !== subcatIdNum)
        .map((s) => ({
          id: s.id,
          nombre: s.nombre,
          tipos: (s.tipos || []).map((t) => ({ id: t.id, nombre: t.nombre })),
        }));

      await strapi.entityService.update('api::categoria.categoria', categoriaId, {
        data: { subcategorias: nuevasSubcats },
      });

      strapi.log.info(`[ImportAdmin] Subcategoría eliminada: ID=${subcatId}, nombre="${subcat.nombre}" de categoría ID=${categoriaId}`);
      return ctx.send({ ok: true, mensaje: `Subcategoría "${subcat.nombre}" eliminada correctamente.` });
    } catch (err) {
      strapi.log.error(`[ImportAdmin] Error eliminando subcategoría ${subcatId}: ${err.message}`);
      return ctx.internalServerError(`Error al eliminar subcategoría: ${err.message}`);
    }
  },

  /**
   * DELETE /api/importacion-admin/tipo/:categoriaId/:subcatId/:tipoId
   * Elimina un tipo (componente) de su subcategoría padre.
   */
  async eliminarTipo(ctx) {
    if (!verificarAdminImportacion(ctx)) {
      return ctx.unauthorized('No autenticado.');
    }

    const { categoriaId, subcatId, tipoId } = ctx.params;
    const subcatIdNum = parseInt(subcatId, 10);
    const tipoIdNum  = parseInt(tipoId, 10);

    try {
      const cat = await strapi.entityService.findOne('api::categoria.categoria', categoriaId, {
        populate: {
          subcategorias: { populate: { tipos: true } },
          productos: { fields: ['id', 'subcategoria', 'tipo'] },
        },
      });

      if (!cat) return ctx.notFound('Categoría no encontrada.');

      const subcat = cat.subcategorias?.find((s) => s.id === subcatIdNum);
      if (!subcat) return ctx.notFound('Subcategoría no encontrada.');

      const tipo = subcat.tipos?.find((t) => t.id === tipoIdNum);
      if (!tipo) return ctx.notFound('Tipo no encontrado.');

      // Verificar que no tiene productos
      const prods = (cat.productos || []).filter(
        (p) => p.subcategoria === subcat.nombre && p.tipo === tipo.nombre
      );
      if (prods.length > 0) {
        return ctx.badRequest(
          `El tipo "${tipo.nombre}" tiene ${prods.length} productos y no puede eliminarse.`
        );
      }

      // Reconstruir subcategorías conservando todo menos el tipo eliminado
      const nuevasSubcats = cat.subcategorias.map((s) => {
        if (s.id !== subcatIdNum) {
          return {
            id: s.id,
            nombre: s.nombre,
            tipos: (s.tipos || []).map((t) => ({ id: t.id, nombre: t.nombre })),
          };
        }
        return {
          id: s.id,
          nombre: s.nombre,
          tipos: (s.tipos || [])
            .filter((t) => t.id !== tipoIdNum)
            .map((t) => ({ id: t.id, nombre: t.nombre })),
        };
      });

      await strapi.entityService.update('api::categoria.categoria', categoriaId, {
        data: { subcategorias: nuevasSubcats },
      });

      strapi.log.info(`[ImportAdmin] Tipo eliminado: ID=${tipoId}, nombre="${tipo.nombre}" de subcategoría ID=${subcatId}`);
      return ctx.send({ ok: true, mensaje: `Tipo "${tipo.nombre}" eliminado correctamente.` });
    } catch (err) {
      strapi.log.error(`[ImportAdmin] Error eliminando tipo ${tipoId}: ${err.message}`);
      return ctx.internalServerError(`Error al eliminar tipo: ${err.message}`);
    }
  },
};
