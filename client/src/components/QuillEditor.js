import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

/**
 * QuillEditor - A wrapper component for ReactQuill that properly handles refs
 * and fixes findDOMNode deprecation warnings
 */
const QuillEditor = forwardRef(({
  value,
  onChange,
  placeholder,
  readOnly = false,
  modules,
  style,
  className,
  theme = "snow",
  ...rest
}, ref) => {
  // Create a local ref to attach to ReactQuill
  const quillRef = useRef(null);
  
  // Expose the quill instance and editor element through the forwarded ref
  useImperativeHandle(ref, () => ({
    // The Quill instance itself
    getQuill: () => quillRef.current?.getEditor(),
    // The editor element
    getEditor: () => quillRef.current?.getEditingArea(),
  }));

  // Default modules configuration
  const defaultModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image', 'blockquote', 'code-block'],
      ['clean']
    ]
  };

  // Merge custom modules with defaults
  const mergedModules = modules ? { ...defaultModules, ...modules } : defaultModules;

  return (
    <div className={`quill-editor-container ${className || ''} ${readOnly ? 'quill-read-only' : ''}`} style={style}>
      <ReactQuill
        ref={quillRef}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        modules={mergedModules}
        theme={theme}
        {...rest}
      />
    </div>
  );
});

QuillEditor.displayName = 'QuillEditor';

export default QuillEditor;
