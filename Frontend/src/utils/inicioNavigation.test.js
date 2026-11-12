import { inicioTarget, navigateToInicioSection } from './inicioNavigation';

afterEach(() => { document.body.innerHTML = ''; });

test('resuelve anclas de Hogar y destinos de secciones ocultas', () => {
  expect(inicioTarget('seccion-eventos', 'hogar').anchor).toBe('seccion-eventos-hogar');
  document.body.innerHTML = '<main data-inicio-area="hogar" data-inicio-ready="true" data-inicio-hidden="proximos-eventos,seccion-destacada,gift-card"></main>';
  const navigate = jest.fn();
  navigateToInicioSection('seccion-eventos', 'HOGAR', navigate);
  expect(navigate).toHaveBeenLastCalledWith('/contacto');
  navigateToInicioSection('seccion-gift-card', 'HOGAR', navigate);
  expect(navigate).toHaveBeenLastCalledWith('/gift-card');
  navigateToInicioSection('seccion-destacados', 'HOGAR', navigate);
  expect(navigate).toHaveBeenLastCalledWith('/tienda?orden=createdAt%3Adesc&seccion=Hogar');
});

test('espera la carga de Inicio mediante una URL con área y ancla, sin reintentos temporizados', () => {
  const navigate = jest.fn();
  navigateToInicioSection('seccion-eventos', 'HOGAR', navigate);
  expect(navigate).toHaveBeenCalledWith('/inicio?seccion=hogar#seccion-eventos-hogar');
});

test('una sección visible se desplaza directamente sin navegar', () => {
  document.body.innerHTML = '<main data-inicio-area="perfumeria" data-inicio-ready="true"><div id="seccion-destacados"></div></main>';
  const element = document.getElementById('seccion-destacados');
  element.scrollIntoView = jest.fn();
  const navigate = jest.fn();
  navigateToInicioSection('seccion-destacados', 'PERFUMERIA', navigate);
  expect(element.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  expect(navigate).not.toHaveBeenCalled();
});
