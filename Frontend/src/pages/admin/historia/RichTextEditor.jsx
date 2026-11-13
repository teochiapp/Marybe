import React, { useEffect, useRef, useState } from 'react';
import {
  FiBold,
  FiCode,
  FiItalic,
  FiLink,
  FiList,
  FiUnderline,
} from 'react-icons/fi';

function normalizeEditorHtml(html) {
  const value = String(html || '').trim();
  if (!value || value === '<br>' || value === '<p><br></p>') return '';
  return value;
}

export default function RichTextEditor({ id, label, value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const [sourceMode, setSourceMode] = useState(false);

  useEffect(() => {
    const el = editorRef.current;
    if (!el || sourceMode) return;
    const incoming = value || '';
    if (el.innerHTML !== incoming && document.activeElement !== el) {
      el.innerHTML = incoming;
    }
  }, [value, sourceMode]);

  const emitChange = () => {
    if (!editorRef.current) return;
    onChange(normalizeEditorHtml(editorRef.current.innerHTML));
  };

  const applyCommand = (command, commandValue = null) => {
    if (sourceMode || !editorRef.current) return;
    editorRef.current.focus();
    if (typeof document.execCommand === 'function') {
      document.execCommand(command, false, commandValue);
    }
    emitChange();
  };

  const handleLink = () => {
    if (sourceMode) return;
    const url = window.prompt('Ingresá la URL del enlace (ej: https://... o /sucursales):');
    if (url && url.trim()) {
      applyCommand('createLink', url.trim());
    }
  };

  return (
    <div className="ha-field">
      {sourceMode ? (
        <label htmlFor={id}>{label}</label>
      ) : (
        <span
          id={`${id}-label`}
          className="ha-rte-label"
          onClick={() => editorRef.current?.focus()}
        >
          {label}
        </span>
      )}
      <div className="ha-rte">
        <div className="ha-rte-toolbar" role="toolbar" aria-label={`Formato de ${label}`}>
          <button
            type="button"
            className="ha-rte-tool"
            title="Negrita"
            aria-label="Negrita"
            disabled={sourceMode}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyCommand('bold')}
          >
            <FiBold />
          </button>
          <button
            type="button"
            className="ha-rte-tool"
            title="Cursiva"
            aria-label="Cursiva"
            disabled={sourceMode}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyCommand('italic')}
          >
            <FiItalic />
          </button>
          <button
            type="button"
            className="ha-rte-tool"
            title="Subrayado"
            aria-label="Subrayado"
            disabled={sourceMode}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyCommand('underline')}
          >
            <FiUnderline />
          </button>
          <span className="ha-rte-sep" aria-hidden="true" />
          <button
            type="button"
            className="ha-rte-tool"
            title="Lista con viñetas"
            aria-label="Lista con viñetas"
            disabled={sourceMode}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyCommand('insertUnorderedList')}
          >
            <FiList />
          </button>
          <button
            type="button"
            className="ha-rte-tool"
            title="Lista numerada"
            aria-label="Lista numerada"
            disabled={sourceMode}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyCommand('insertOrderedList')}
          >
            1.
          </button>
          <button
            type="button"
            className="ha-rte-tool"
            title="Insertar enlace"
            aria-label="Insertar enlace"
            disabled={sourceMode}
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleLink}
          >
            <FiLink />
          </button>
          <button
            type="button"
            className="ha-rte-tool"
            title="Quitar formato"
            aria-label="Quitar formato"
            disabled={sourceMode}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyCommand('removeFormat')}
          >
            Tx
          </button>
          <button
            type="button"
            className={`ha-rte-tool ha-rte-tool--code ${sourceMode ? 'ha-rte-tool--active' : ''}`}
            title={sourceMode ? 'Volver al editor visual' : 'Ver código HTML'}
            aria-label={sourceMode ? 'Volver al editor visual' : 'Ver código HTML'}
            onClick={() => setSourceMode((prev) => !prev)}
          >
            <FiCode /> {sourceMode ? 'Visual' : 'HTML'}
          </button>
        </div>

        {sourceMode ? (
          <textarea
            id={id}
            name={id}
            className="ha-rte-source"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
        ) : (
          <div
            id={id}
            ref={editorRef}
            className="ha-rte-editor"
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-labelledby={`${id}-label`}
            data-placeholder={placeholder || 'Escribí el contenido aquí...'}
            onInput={emitChange}
            onBlur={emitChange}
          />
        )}
      </div>
    </div>
  );
}
