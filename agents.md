
# AGENTS.md

## 1. Objetivo
Optimizar el consumo de tokens, tiempo y herramientas.
Priorizar soluciones simples, seguras y mantenibles.

## 2. Comunicación
- Responder siempre en español.
- Respuestas breves, directas y técnicas.
- Máximo 3-5 líneas para tareas simples.
- Evitar introducciones, conclusiones y explicaciones obvias.
- No repetir la solicitud del usuario.
- No mostrar código completo salvo que se solicite.
- No enumerar cada paso realizado.
- Preguntar solo cuando falte información imprescindible.

## 3. Formato de respuesta
- Preferir JSON compacto para resultados de tareas.
- No envolver JSON en bloques Markdown si no es necesario.
- No incluir propiedades vacías o redundantes.
- Para consultas conceptuales, usar texto breve.

Formato habitual:
{
  "status": "ok",
  "changes": ["Cambio principal"],
  "tests": "passed"
}

Si ocurre un error:
{
  "status": "error",
  "reason": "Causa concreta",
  "next": "Acción recomendada"
}

Para tareas sin cambios:
{
  "status": "ok",
  "answer": "Respuesta breve"
}

## 4. Lectura de contexto
- Leer únicamente los archivos relevantes.
- Buscar primero por nombres, rutas o símbolos.
- Evitar recorrer todo el repositorio.
- No leer node_modules, dist, build, coverage o logs.
- Limitar la salida de búsquedas y comandos.
- No releer archivos sin motivo.
- Inspeccionar dependencias solo cuando sea necesario.
- Consultar documentación externa únicamente si aporta valor.
- Reutilizar el contexto disponible.

## 5. Modificaciones
- Realizar el menor cambio necesario.
- Respetar arquitectura, convenciones y estilo existentes.
- Evitar refactorizaciones no solicitadas.
- No instalar dependencias innecesarias.
- No crear archivos auxiliares sin necesidad.
- No modificar archivos ajenos a la tarea.
- No agregar comentarios para explicar código evidente.
- No duplicar funciones o lógica existente.
- Priorizar reutilizar componentes y utilidades.

## 6. Ejecución y validación
- No ejecutar builds completos por defecto.
- Ejecutar primero pruebas específicas del cambio.
- Ampliar validaciones si existe riesgo de regresión.
- No repetir comandos fallidos sin modificar la estrategia.
- No ejecutar comandos destructivos sin autorización.
- No afirmar que una prueba pasó si no fue ejecutada.
- Reportar únicamente errores o resultados relevantes.

## 7. Eficiencia
- Resolver tareas simples directamente.
- Evitar planes extensos para cambios triviales.
- Agrupar búsquedas relacionadas.
- Evitar mostrar logs extensos.
- No generar documentación salvo que se solicite.
- No ofrecer mejoras adicionales fuera del alcance.
- Priorizar precisión sobre brevedad cuando haya riesgos.
- No omitir validaciones de seguridad para ahorrar tokens.

## 8. Cierre
Al finalizar, responder con el JSON mínimo necesario.
Describir qué cambió y si fue validado.
No incluir resúmenes extensos ni sugerencias genéricas.
guardar reporte en "report": "[informe-mensual-Noviembre.md](C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/informe-mensual-Noviembre.md)",
