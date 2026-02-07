import { useState, useRef, type DragEvent } from "react";

interface DropZoneProps {
  files: File[];
  onFiles: (files: File[]) => void;
}

export function DropZone({ files, onFiles }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) onFiles(dropped);
  }

  function handleClick() {
    inputRef.current?.click();
  }

  function handleInput() {
    const selected = inputRef.current?.files;
    if (selected?.length) onFiles(Array.from(selected));
  }

  function handleRemove(index: number) {
    onFiles(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div
        className={`dropzone ${dragging ? "dropzone-active" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleInput}
          hidden
        />
        <p className="dropzone-text">
          {dragging
            ? "Drop files here"
            : "Drag & drop files here, or click to browse"}
        </p>
      </div>
      {files.length > 0 && (
        <ul className="file-list">
          {files.map((f, i) => (
            <li key={i}>
              <span>{f.name}</span>
              <span className="file-size">
                {(f.size / 1024).toFixed(1)} KB
              </span>
              <button className="btn-remove" onClick={() => handleRemove(i)}>
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
