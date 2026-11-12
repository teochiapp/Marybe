import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import axios from 'axios';
import EditorInicioAdmin from './EditorInicioAdmin';
import SectionSelector from './components/SectionSelector';
import { EDITOR_INICIO_PATH, EDITOR_INICIO_SECTIONS, findSection, sectionPath } from './editorInicioSections';
import { hasSectionEditor } from './sectionEditors';
import { SESSION_EXPIRED_EVENT } from '../../../utils/sessionManager';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
  Navigate: () => null,
  Routes: ({ children }) => <>{children}</>,
  Route: ({ index, element }) => (index ? element : null),
  useLocation: () => ({ pathname: '/editor-inicio-admin' }),
  useNavigate: () => jest.fn(),
  useParams: () => ({}),
}), { virtual: true });

const EXPECTED_TITLES = [
  'Menú Header / Mega Menú',
  'Banners',
  'Sección Destacada',
  'Categorías',
  'Categoría Destacada (1)',
  'Ofertas',
  'Descuentos',
  'Categoría Destacada (2)',
  'Beneficios',
  'Gift Card',
  'Próximos Eventos',
];

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  const { ORDEN_INICIO } = require('../../inicio/composicionInicio');
  axios.get.mockResolvedValue({ data: { data: { version:'v1', areas: Object.fromEntries(['perfumeria','hogar'].map(area=>[area,{ published:{orden:ORDEN_INICIO[area],ocultos:[]},draft:null }])) } } });
});

describe('configuración de secciones', () => {
  test('define las diez secciones en el orden esperado con identificadores únicos', () => {
    expect(EDITOR_INICIO_SECTIONS.map(section => section.title)).toEqual(EXPECTED_TITLES);
    const ids = EDITOR_INICIO_SECTIONS.map(section => section.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach(id => expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/));
    expect(findSection('categoria-destacada-1')).not.toBe(findSection('categoria-destacada-2'));
    expect(sectionPath('ofertas')).toBe(`${EDITOR_INICIO_PATH}/ofertas`);
  });

  test('respeta el orden original de Perfumeria en la composicion', () => {
    const { ORDEN_INICIO } = require('../../inicio/composicionInicio');
    expect(ORDEN_INICIO.perfumeria).toEqual([...EDITOR_INICIO_SECTIONS.filter(section => section.landingComponent).map(section => section.id), 'descubri-mas']);
  });

  test('las secciones con editor real están registradas', () => {
    expect(EDITOR_INICIO_SECTIONS.filter(section => hasSectionEditor(section.id)).map(section => section.id)).toEqual(['menu-header', 'banners', 'seccion-destacada', 'categorias', 'categoria-destacada-1', 'ofertas', 'descuentos', 'categoria-destacada-2', 'beneficios', 'gift-card', 'proximos-eventos']);
  });
});

describe('selector de secciones', () => {
  test('permite cambiar el orden antes de guardar y oculta controles removidos', async () => {
    render(<SectionSelector token="test" />);
    expect(await screen.findByRole('button', { name: 'Publicar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Guardar' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Vista previa|Descartar borrador|Guardar borrador/ })).toBeNull();
    const button = await screen.findByRole('button', { name:'Bajar Banners' });
    fireEvent.click(button);
    const rows = document.querySelectorAll('[data-composition-id]');
    expect(rows[1]).toHaveAttribute('data-composition-id','banners');
  });
});

describe('autenticación del editor de inicio', () => {
  test('sin sesión muestra el login y no las secciones', () => {
    render(<EditorInicioAdmin />);
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeDisabled();
    expect(screen.queryByText('¿Qué querés modificar hoy?')).toBeNull();
  });

  test('usa el login administrativo existente y comparte el token admin_jwt', async () => {
    axios.post.mockResolvedValue({ data: { jwt: 'admin-token' } });
    render(<EditorInicioAdmin />);
    fireEvent.change(screen.getByLabelText('Email administrador'), { target: { value: 'admin@marybe.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secreto' } });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await screen.findByText('Organizar Inicio');
    expect(axios.post).toHaveBeenCalledWith(expect.stringMatching(/\/api\/importacion-admin\/login$/), { identifier: 'admin@marybe.com', password: 'secreto' });
    expect(localStorage.getItem('admin_jwt')).toBe('admin-token');
  });

  test('muestra el error del servidor cuando las credenciales son inválidas', async () => {
    axios.post.mockRejectedValue({ response: { status: 400, data: { error: { message: 'Credenciales inválidas' } } } });
    render(<EditorInicioAdmin />);
    fireEvent.change(screen.getByLabelText('Email administrador'), { target: { value: 'x@marybe.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'mal' } });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas');
    expect(localStorage.getItem('admin_jwt')).toBeNull();
  });

  test('reutiliza una sesión existente y el cierre de sesión la elimina', () => {
    localStorage.setItem('admin_jwt', 'fixture-token');
    render(<EditorInicioAdmin />);
    expect(screen.getByText('Organizar Inicio')).toBeInTheDocument();
    const viewWebLink = screen.getByRole('link', { name: 'Ver web' });
    expect(viewWebLink).toHaveAttribute('href', '/');
    expect(viewWebLink).toHaveAttribute('target', '_blank');
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(localStorage.getItem('admin_jwt')).toBeNull();
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });

  test('descarta tokens vencidos y reacciona a la expiración de la sesión', async () => {
    const encode = value => btoa(JSON.stringify(value)).replace(/=+$/, '');
    localStorage.setItem('admin_jwt', `${encode({ alg: 'HS256' })}.${encode({ exp: 1 })}.firma`);
    const { unmount } = render(<EditorInicioAdmin />);
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(localStorage.getItem('admin_jwt')).toBeNull();
    unmount();

    localStorage.setItem('admin_jwt', 'fixture-token');
    render(<EditorInicioAdmin />);
    expect(screen.getByText('Organizar Inicio')).toBeInTheDocument();
    act(() => { window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { scope: 'admin' } })); });
    expect(await screen.findByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });
});
