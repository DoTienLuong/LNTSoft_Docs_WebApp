import React, { useEffect, useRef } from 'react';

// Lightweight wrapper for CKEditor 4 loaded from CDN
export default function EditorCK4({ value, onChange, config = {}, height = 420 }) {
  const textareaRef = useRef(null);
  const editorRef = useRef(null);
  const CKFINDER_BASE = import.meta.env.VITE_CKFINDER_BASE_PATH;

  useEffect(() => {
    let cancelled = false;

    const ensureScript = (src) => new Promise((resolve, reject) => {
      if (window.CKEDITOR) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = reject;
      document.body.appendChild(s);
    });

    const ensureCKFinder = (basePath) => new Promise((resolve) => {
      if (window.CKFinder) return resolve();
      const base = typeof basePath === 'string' ? basePath : '/ckfinder';
      const s = document.createElement('script');
      // Primary attempt based on provided basePath
      s.src = base.replace(/\/$/, '') + '/ckfinder.js';
      s.onload = () => resolve();
      s.onerror = () => {
        // Fallback: try alternate common location
        const alt = base === '/' ? '/ckfinder/ckfinder.js' : '/ckfinder.js';
        const s2 = document.createElement('script');
        s2.src = alt;
        s2.onload = () => resolve();
        s2.onerror = () => resolve();
        document.body.appendChild(s2);
      };
      document.body.appendChild(s);
    });

    const init = async () => {
      try {
        await ensureScript('https://cdn.ckeditor.com/4.22.1/full-all/ckeditor.js');
        const base = CKFINDER_BASE || config.ckfinderBasePath || '/ckfinder';
        await ensureCKFinder(base);
        if (cancelled || !textareaRef.current) return;

        // Disable CKEditor version check banner globally if available
        try {
          if (window.CKEDITOR && window.CKEDITOR.config) {
            window.CKEDITOR.config.versionCheck = false;
          }
        } catch {}

        const cfg = {
          height,

          filebrowserBrowseUrl: `${(CKFINDER_BASE || '/ckfinder').replace(/\/$/, '')}/ckfinder.html`,
          filebrowserImageBrowseUrl: `${(CKFINDER_BASE || '/ckfinder').replace(/\/$/, '')}/ckfinder.html?type=Images`,
          removePlugins: 'update',
          versionCheck: false,
        };


        if (cfg.removePlugins) {
          const parts = String(cfg.removePlugins)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          if (!parts.includes('update')) parts.push('update');
          cfg.removePlugins = parts.join(',');
        } else {
          cfg.removePlugins = 'update';
        }
        editorRef.current = window.CKEDITOR.replace(textareaRef.current, cfg);

        // Setup CKFinder integration when ready
        editorRef.current.on('instanceReady', () => {
          const base = (CKFINDER_BASE || '/ckfinder').replace(/\/$/, '') + '/';
          if (window.CKFinder && window.CKFinder.setupCKEditor) {
            try {
              window.CKFinder.setupCKEditor(editorRef.current, base);
            } catch {}
          }
          // Set initial value
          if (typeof value === 'string') editorRef.current.setData(value);
        });

        editorRef.current.on('change', () => {
          const data = editorRef.current.getData();
          onChange && onChange(data);
        });
      } catch (e) {
        console.error('CKEditor init failed', e);
      }
    };

    init();

    return () => {
      cancelled = true;
      try {
        const ed = editorRef.current;
        if (ed) {
          ed.removeAllListeners && ed.removeAllListeners();
          ed.destroy && ed.destroy();
        }
      } catch {}
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    const ed = editorRef.current;
    if (ed && typeof value === 'string' && value !== ed.getData()) {
      ed.setData(value);
    }
  }, [value]);

  return (
    <textarea ref={textareaRef} defaultValue={value || ''} />
  );
}
