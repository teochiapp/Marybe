import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Inicio from './Inicio';
import {
  INICIO_CACHE_TTL_MS,
  INICIO_STORAGE_KEYS,
  clearApiCache,
  invalidateInicioCache,
} from '../../utils/apiCache';

let mockSearch = '';
const mockNavigate = jest.fn();
const mockListeners = new Set();

const mockNotifySearchListeners = () => {
  mockListeners.forEach((fn) => fn());
};

jest.mock('react-router-dom', () => {
  const ReactActual = require('react');
  return {
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/', search: mockSearch ? `?${mockSearch}` : '', hash: '' }),
    useSearchParams: () => {
      const [, forceUpdate] = ReactActual.useReducer((x) => x + 1, 0);
      ReactActual.useEffect(() => {
        mockListeners.add(forceUpdate);
        return () => mockListeners.delete(forceUpdate);
      }, []);
      const setParams = (next) => {
        const params = typeof next === 'function' ? next(new URLSearchParams(mockSearch)) : next;
        mockSearch = new URLSearchParams(params).toString();
        mockNotifySearchListeners();
      };
      return [new URLSearchParams(mockSearch), setParams];
    },
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  };
}, { virtual: true });

function buildUnifiedSeccionPayload(overrides = {}) {
  return {
    data: {
      texto_toggle_perfumeria: 'Perfumería Premium',
      texto_toggle_hogar: 'Hogar Chic',
      composicion_inicio: {
        perfumeria: {
          orden: [
            'banners',
            'seccion-destacada',
            'categorias',
            'categoria-destacada-1',
            'ofertas',
            'descuentos',
            'categoria-destacada-2',
            'beneficios',
            'gift-card',
            'proximos-eventos',
            'descubri-mas',
          ],
          ocultos: [],
        },
        hogar: {
          orden: ['banners', 'seccion-destacada', 'descuentos', 'gift-card'],
          ocultos: [],
        },
      },
      diseno_secciones: {
        beneficios: { general: { titulo: 'Beneficios exclusivos' } },
        'gift-card': {
          perfumeria: { titulo_destacado: 'Regalá', titulo_complementario: 'belleza' },
          hogar: { titulo_destacado: 'Regalá', titulo_complementario: 'hogar' },
        },
        'proximos-eventos': { general: { titulo: 'Eventos VIP' } },
      },
      secciones: [],
      categorias_destacadas: [],
      descuento_perfumeria: { titulo_cursiva: 'Descuentos', titulo_normal: 'Imperdibles' },
      descuento_hogar: { titulo_cursiva: 'Descuentos', titulo_normal: 'de Hogar' },
      destacada_perfumeria: { titulo_cursiva: 'Elegidos', titulo_normal: 'del Mes' },
      destacada_hogar: { titulo_cursiva: 'Elegidos', titulo_normal: 'de Hogar' },
      categoria_especifica_perfumeria: null,
      categoria_especifica_hogar: null,
      ...overrides,
    },
  };
}

function createInicioFetchMock({ seccionOverrides = {}, promocionesDelayMs = 0 } = {}) {
  return jest.fn(async (url) => {
    const strUrl = String(url);
    if (strUrl.includes('/api/seccion-principal')) {
      return { ok: true, json: async () => buildUnifiedSeccionPayload(seccionOverrides) };
    }
    if (strUrl.includes('/api/banners-home')) {
      return { ok: true, json: async () => ({ data: {} }) };
    }
    if (strUrl.includes('/api/promociones-inicios')) {
      if (promocionesDelayMs > 0) {
        await new Promise((r) => setTimeout(r, promocionesDelayMs));
      }
      return {
        ok: true,
        json: async () => ({
          data: [
            {
              documentId: strUrl.includes('Hogar') ? 'promo-hogar' : 'promo-perf',
              Filas: [],
            },
          ],
        }),
      };
    }
    if (strUrl.includes('/api/configuracion-general')) {
      return { ok: true, json: async () => ({ data: { cuotas_cantidad: 6, envio_gratis_desde: 50000 } }) };
    }
    if (strUrl.includes('/api/promociones-bancarias')) {
      return {
        ok: true,
        json: async () => ({
          data: [{ id: 1, documentId: 'promo-bna', banco: 'Banco Nación', cuotas_cantidad: [6], activo: true }],
        }),
      };
    }
    if (strUrl.includes('/api/eventos')) {
      return {
        ok: true,
        json: async () => ({
          data: [{ id: 1, documentId: 'ev-1', titulo: 'Masterclass Beauty', fecha: '2026-12-01' }],
        }),
      };
    }
    if (strUrl.includes('/api/categorias')) {
      return { ok: true, json: async () => ({ data: [] }) };
    }
    if (strUrl.includes('/api/productos')) {
      return { ok: true, json: async () => ({ data: [] }) };
    }
    return { ok: true, json: async () => ({ data: [] }) };
  });
}

describe('Inicio caching & SWR', () => {
  const originalIntersectionObserver = global.IntersectionObserver;

  beforeEach(() => {
    clearApiCache();
    localStorage.clear();
    mockSearch = '';
    mockNavigate.mockClear();
    window.scrollTo = jest.fn();
    global.IntersectionObserver = class {
      constructor(cb) {
        this.cb = cb;
      }
      observe() {
        this.cb([{ isIntersecting: true }]);
      }
      unobserve() {}
      disconnect() {}
    };
  });

  afterEach(() => {
    global.IntersectionObserver = originalIntersectionObserver;
    jest.restoreAllMocks();
  });

  test('unifica /api/seccion-principal en una única petición para Inicio y sus secciones hijas', async () => {
    global.fetch = createInicioFetchMock();

    render(<Inicio />);

    await screen.findByText('Perfumería Premium');
    await screen.findByText(/Imperdibles/, {}, { timeout: 4000 });
    await screen.findByText(/Beneficios exclusivos/, {}, { timeout: 4000 });
    await screen.findAllByText(/belleza/, {}, { timeout: 4000 });
    await screen.findByText(/Eventos VIP/, {}, { timeout: 4000 });

    const seccionPrincipalCalls = global.fetch.mock.calls.filter(([url]) =>
      String(url).includes('/api/seccion-principal')
    );
    expect(seccionPrincipalCalls).toHaveLength(1);
    expect(seccionPrincipalCalls[0][0]).toContain('populate[secciones][populate]=*');
    expect(seccionPrincipalCalls[0][0]).toContain('populate[descuento_perfumeria][populate]=*');
    expect(localStorage.getItem(INICIO_STORAGE_KEYS.seccionPrincipal)).toBeTruthy();
    expect(localStorage.getItem(INICIO_STORAGE_KEYS.bannersHome)).toBeTruthy();
  });

  test('hidrata inmediatamente desde localStorage al recargar sin mostrar skeleton ni polling cada 60s', async () => {
    const intervalSpy = jest.spyOn(global, 'setInterval');
    global.fetch = createInicioFetchMock();

    const { unmount } = render(<Inicio />);
    await screen.findByText('Perfumería Premium');
    await screen.findByText('Lo nuevo');
    expect(localStorage.getItem(INICIO_STORAGE_KEYS.seccionPrincipal)).toBeTruthy();
    unmount();

    // Sin 60s setInterval en Inicio
    const sixtySecTimers = intervalSpy.mock.calls.filter(([, ms]) => ms === 60000);
    expect(sixtySecTimers).toHaveLength(0);

    // Simular recarga limpia en memoria pero con snapshots persistidos en localStorage y red lenta
    clearApiCache();
    global.fetch = jest.fn(() => new Promise(() => {}));

    render(<Inicio />);
    expect(screen.getByText('Perfumería Premium')).toBeInTheDocument();
    expect(screen.getByText('Lo nuevo')).toBeInTheDocument();

    // Disparó revalidación en segundo plano por venir de storage
    expect(
      global.fetch.mock.calls.some(([url]) => String(url).includes('/api/seccion-principal'))
    ).toBe(true);
    expect(
      global.fetch.mock.calls.some(([url]) => String(url).includes('/api/banners-home'))
    ).toBe(true);
  });

  test('respeta el TTL al volver el foco y reutiliza caché al alternar Perfumería ↔ Hogar y volver desde otra ruta', async () => {
    const nowSpy = jest.spyOn(Date, 'now');
    let now = 1_700_000_000_000;
    nowSpy.mockImplementation(() => now);
    global.fetch = createInicioFetchMock();

    const { unmount } = render(<Inicio />);
    await screen.findByText('Perfumería Premium');
    await screen.findByText('Lo nuevo');

    // Cambiar a Hogar y luego volver a Perfumería
    fireEvent.click(screen.getByText('Hogar Chic'));
    await waitFor(() => {
      expect(screen.queryByText('Lo nuevo')).not.toBeInTheDocument();
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    const promoHogarCallsAfterFirst = global.fetch.mock.calls.filter(([url]) =>
      String(url).includes('filters%5Bseccion%5D%5B%24eq%5D=Hogar')
    ).length;
    expect(promoHogarCallsAfterFirst).toBe(1);

    fireEvent.click(screen.getByText('Perfumería Premium'));
    await screen.findByText('Lo nuevo');

    // Volver a Hogar dentro del TTL no debe re-fetchear promociones de Hogar ni seccion-principal
    fireEvent.click(screen.getByText('Hogar Chic'));
    await waitFor(() => {
      expect(screen.queryByText('Lo nuevo')).not.toBeInTheDocument();
    });
    expect(
      global.fetch.mock.calls.filter(([url]) => String(url).includes('/api/seccion-principal'))
    ).toHaveLength(1);
    expect(
      global.fetch.mock.calls.filter(([url]) =>
        String(url).includes('filters%5Bseccion%5D%5B%24eq%5D=Hogar')
      )
    ).toHaveLength(1);

    // Focus antes del TTL no revalida
    fireEvent.focus(window);
    expect(
      global.fetch.mock.calls.filter(([url]) => String(url).includes('/api/seccion-principal'))
    ).toHaveLength(1);

    // Simular navegación a /tienda y regreso a Inicio dentro del TTL
    unmount();
    render(<Inicio />);
    expect(screen.getByText('Perfumería Premium')).toBeInTheDocument();
    expect(
      global.fetch.mock.calls.filter(([url]) => String(url).includes('/api/seccion-principal'))
    ).toHaveLength(1);

    // Expirar TTL y enfocar: revalida suavemente
    now += INICIO_CACHE_TTL_MS + 1000;
    fireEvent.focus(window);
    await waitFor(() => {
      expect(
        global.fetch.mock.calls.filter(([url]) => String(url).includes('/api/seccion-principal'))
      ).toHaveLength(2);
    });

    // Publicación desde admin: invalidateInicioCache limpia storage y fuerza recarga inmediata
    act(() => {
      invalidateInicioCache();
    });
    await waitFor(() => {
      expect(
        global.fetch.mock.calls.filter(([url]) => String(url).includes('/api/seccion-principal'))
      ).toHaveLength(3);
    });
  });
});
