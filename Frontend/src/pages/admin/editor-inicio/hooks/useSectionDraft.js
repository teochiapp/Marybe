import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_STRAPI_URL || process.env.REACT_APP_API_URL || 'http://localhost:1337';
const HISTORY_LIMIT = 60;

const copy = value => JSON.parse(JSON.stringify(value));
const entryFor = serverArea => {
  const data = copy(serverArea.draft || serverArea.published);
  return { history: [data], index: 0, baseline: JSON.stringify(data) };
};
const currentData = entry => entry?.history[entry.index];
export const isDirtyEntry = entry => Boolean(entry) && JSON.stringify(currentData(entry)) !== entry.baseline;

/**
 * Estado común de los editores de sección del Editor de Inicio: carga desde la API administrativa,
 * trabajo local por área con deshacer/rehacer, borrador, publicación con control de versión y descarte.
 * El endpoint debe responder `{ version, areas: { [area]: { published, draft } } }`.
 */
export default function useSectionDraft({ token, endpoint, areaKeys, initialArea, onOverview }) {
  const auth = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);
  const [overview, setOverview] = useState(null);
  const [work, setWork] = useState({});
  const [areaKey, setAreaKey] = useState(initialArea || areaKeys[0]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const entry = work[areaKey];
  const data = currentData(entry);
  const dirty = isDirtyEntry(entry);
  const hasUnsaved = Object.values(work).some(isDirtyEntry);
  const serverArea = overview?.areas?.[areaKey];
  const hasDraft = Boolean(serverArea?.draft);

  const handleError = useCallback(requestError => {
    setError(requestError.response?.data?.error?.message || requestError.message || 'No se pudo completar la operación.');
  }, []);

  const applyOverview = useCallback((next, resetArea) => {
    setOverview(next);
    onOverview?.(next);
    setWork(previous => Object.fromEntries(areaKeys.map(key => [
      key,
      !previous[key] || resetArea === 'all' || key === resetArea || !isDirtyEntry(previous[key]) ? entryFor(next.areas[key]) : previous[key],
    ])));
    // areaKeys es una constante de cada editor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onOverview]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    axios.get(`${API}${endpoint}`, auth)
      .then(response => { if (active) applyOverview(response.data.data, 'all'); })
      .catch(requestError => { if (active) handleError(requestError); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [auth, endpoint, applyOverview, handleError]);

  useEffect(() => {
    const warn = event => { if (hasUnsaved) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasUnsaved]);

  const change = useCallback(mutator => {
    if (busy) return;
    setWork(previous => {
      const current = previous[areaKey];
      if (!current) return previous;
      const next = copy(currentData(current));
      mutator(next);
      const history = [...current.history.slice(0, current.index + 1), next].slice(-HISTORY_LIMIT);
      return { ...previous, [areaKey]: { ...current, history, index: history.length - 1 } };
    });
    setMessage('');
  }, [areaKey, busy]);

  const moveHistory = useCallback(step => setWork(previous => {
    const current = previous[areaKey];
    const index = current ? current.index + step : -1;
    if (index < 0 || index >= current.history.length) return previous;
    return { ...previous, [areaKey]: { ...current, index } };
  }), [areaKey]);

  const selectArea = useCallback(nextArea => {
    if (busy || nextArea === areaKey) return false;
    setAreaKey(nextArea);
    setError('');
    setMessage('');
    return true;
  }, [busy, areaKey]);

  const save = useCallback(async (publish, successMessage, errorPrefix = '') => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const response = await axios.put(`${API}${endpoint}/${areaKey}`, { version: overview.version, data, publish }, auth);
      applyOverview(response.data.data, areaKey);
      setMessage(successMessage);
      return true;
    } catch (requestError) {
      handleError(requestError);
      if (errorPrefix) setError(current => `${errorPrefix} ${current}`);
      return false;
    } finally {
      setBusy(false);
    }
  }, [endpoint, areaKey, overview, data, auth, applyOverview, handleError]);

  const discardDraft = useCallback(async label => {
    if (!window.confirm(`¿Descartar el borrador guardado de ${label}? Se recupera lo que está publicado.`)) return;
    setBusy(true);
    setError('');
    try {
      const response = await axios.delete(`${API}${endpoint}/${areaKey}/borrador`, { ...auth, params: { version: overview.version } });
      applyOverview(response.data.data, areaKey);
      setMessage('Borrador descartado.');
    } catch (requestError) {
      handleError(requestError);
    } finally {
      setBusy(false);
    }
  }, [endpoint, areaKey, overview, auth, applyOverview, handleError]);

  const revertToPublished = useCallback(() => change(draft => {
    Object.keys(draft).forEach(key => { delete draft[key]; });
    Object.assign(draft, copy(serverArea.published));
  }), [change, serverArea]);

  return {
    api: API,
    auth,
    overview,
    areaKey,
    selectArea,
    data,
    entry,
    dirty,
    hasDraft,
    hasUnsaved,
    serverArea,
    loading,
    busy,
    error,
    message,
    setError,
    setMessage,
    change,
    canUndo: Boolean(entry) && entry.index > 0,
    canRedo: Boolean(entry) && entry.index < entry.history.length - 1,
    undo: () => moveHistory(-1),
    redo: () => moveHistory(1),
    isAreaDirty: key => isDirtyEntry(work[key]),
    getAreaData: key => currentData(work[key]),
    save,
    discardDraft,
    revertToPublished,
  };
}
