import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import useAdminSession from '../../../hooks/useAdminSession';
import AdminLoginCard from './components/AdminLoginCard';
import EditorInicioLayout from './components/EditorInicioLayout';
import SectionSelector from './components/SectionSelector';
import SectionPlaceholder from './components/SectionPlaceholder';
import { EDITOR_INICIO_PATH, findSection } from './editorInicioSections';
import { SECTION_EDITORS } from './sectionEditors';

function SectionRoute({ token, onLogout }) {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const section = findSection(sectionId);
  if (!section) return <Navigate to={EDITOR_INICIO_PATH} replace />;
  const Editor = SECTION_EDITORS[section.id];
  if (Editor) return <Editor section={section} token={token} onBack={() => navigate(EDITOR_INICIO_PATH)} onLogout={onLogout} />;
  return (
    <EditorInicioLayout currentSection={section} onLogout={onLogout}>
      <SectionPlaceholder section={section} />
    </EditorInicioLayout>
  );
}

export default function EditorInicioAdmin() {
  const { token, signIn, signOut, sync } = useAdminSession();
  const { pathname } = useLocation();

  useEffect(() => { sync(); }, [pathname, sync]);

  if (!token) return <AdminLoginCard subtitle="Editor de Inicio" onAuthenticated={signIn} />;

  return (
    <Routes>
      <Route index element={<EditorInicioLayout onLogout={signOut}><SectionSelector /></EditorInicioLayout>} />
      <Route path=":sectionId" element={<SectionRoute token={token} onLogout={signOut} />} />
      <Route path="*" element={<Navigate to={EDITOR_INICIO_PATH} replace />} />
    </Routes>
  );
}
