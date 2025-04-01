import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../CSS/quill-custom.css';

/**
 * Enhanced QuillEditor component with improved read-only mode and better content rendering
 */
const QuillEditor = forwardRef(({
  value,
  onChange,
  placeholder = "Start writing...",
  readOnly = false,
  className = "",
  style = {},
  modules = {},
  formats = null,
}, ref) => {
  // Default Quill modules with better toolbar
  const defaultModules = {
    toolbar: readOnly ? false : [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'code-block'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  };

  // Default formats that Quill should allow
  const defaultFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'code-block'
  ];
  
  // Merge modules and formats with defaults
  const effectiveModules = { ...defaultModules, ...modules };
  const effectiveFormats = formats || defaultFormats;
  
  // Set up ref methods
  useImperativeHandle(ref, () => ({
    getEditor: () => ReactQuill.current?.getEditor(),
    focus: () => ReactQuill.current?.focus(),
    blur: () => ReactQuill.current?.blur(),
    getHTML: () => value,
    setHTML: (html) => onChange && onChange(html),
    clear: () => onChange && onChange('')
  }));
  
  // Pre-process code blocks on read mode
  useEffect(() => {
    if (readOnly && value) {
      // Handle code blocks display data-language attribute for the pre tag
      setTimeout(() => {
        const codeBlocks = document.querySelectorAll('.ql-editor pre');
        codeBlocks.forEach(pre => {
          // Find the code tag inside and try to determine language
          const codeTag = pre.querySelector('code');
          if (codeTag && codeTag.className) {
            const langMatch = codeTag.className.match(/language-(\w+)/);
            if (langMatch && langMatch[1]) {
              pre.setAttribute('data-language', langMatch[1]);
            } else {
              pre.setAttribute('data-language', 'code');
            }
          } else {
            pre.setAttribute('data-language', 'code');
          }
        });
      }, 100);
    }
  }, [readOnly, value]);
  
  return (
    <div className={`quill-editor-container ${readOnly ? 'quill-read-only' : ''} ${className}`}>
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        modules={effectiveModules}
        formats={effectiveFormats}
        className={readOnly ? 'read-only-editor' : ''}
        style={style}
      />
    </div>
  );
});

export default QuillEditor;
