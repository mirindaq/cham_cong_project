import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface EditorProps {
  readOnly?: boolean;
  value?: string; // ✅ Controlled content
  onTextChange?: (...args: any[]) => void;
  onSelectionChange?: (...args: any[]) => void;
}

const Editor = forwardRef<Quill | null, EditorProps>(
  ({ readOnly = false, value, onTextChange, onSelectionChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    const toolbarOptions = [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      ["link", "image", "video", "formula"],
      [{ header: 1 }, { header: 2 }],
      [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ size: ["small", false, "large", "huge"] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ["clean"],
    ];

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });

    useEffect(() => {
      if (!containerRef.current) return;

      const container = containerRef.current;

      const style = document.createElement("style");
      style.textContent = `
        .ql-editor {
          min-height: 200px;
          font-size: 14px;
          line-height: 1.6;
        }
        .ql-editor img {
          display: block;
          margin: 10px auto;
          max-width: 100%;
          height: auto;
        }
        .ql-editor p {
          margin-bottom: 8px;
        }
        .ql-editor h1, .ql-editor h2, .ql-editor h3, .ql-editor h4, .ql-editor h5, .ql-editor h6 {
          margin-top: 16px;
          margin-bottom: 8px;
        }
        .ql-editor ul, .ql-editor ol {
          padding-left: 20px;
        }
        .ql-editor blockquote {
          border-left: 4px solid #ccc;
          margin: 16px 0;
          padding-left: 16px;
          font-style: italic;
        }
        .ql-toolbar {
          border-top: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-bottom: none;
          border-radius: 4px 4px 0 0;
        }
        .ql-container {
          border: 1px solid #ccc;
          border-top: none;
          border-radius: 0 0 4px 4px;
        }
        .ql-editor:focus {
          outline: none;
        }
      `;
      document.head.appendChild(style);

      const toolbarContainer = document.createElement("div");
      container.appendChild(toolbarContainer);

      const editorContainer = document.createElement("div");
      container.appendChild(editorContainer);

      const quill = new Quill(editorContainer, {
        theme: "snow",
        modules: {
          toolbar: toolbarOptions,
        },
        readOnly,
      });

      quillRef.current = quill;

      if (ref) {
        if (typeof ref === "function") {
          ref(quill);
        } else {
          ref.current = quill;
        }
      }

      quill.on(Quill.events.TEXT_CHANGE, (...args) => {
        onTextChangeRef.current?.(...args);
      });

      quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
        onSelectionChangeRef.current?.(...args);
      });

      return () => {
        if (ref) {
          if (typeof ref === "function") {
            ref(null);
          } else {
            ref.current = null;
          }
        }
        quillRef.current = null;
        container.innerHTML = "";
        document.head.removeChild(style);
      };
    }, [ref]);

    // ✅ Update content when `value` changes
    useEffect(() => {
      if (quillRef.current && typeof value === "string") {
        const currentHtml = quillRef.current.root.innerHTML;
        if (value !== currentHtml) {
          quillRef.current.root.innerHTML = value;
        }
      }
    }, [value]);

    // ✅ Enable/disable editor on `readOnly` change
    useEffect(() => {
      quillRef.current?.enable(!readOnly);
    }, [readOnly]);

    return <div ref={containerRef} />;
  }
);

Editor.displayName = "Editor";
export default Editor;
