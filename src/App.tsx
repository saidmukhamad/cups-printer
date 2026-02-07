import { useState } from "react";
import { DropZone } from "./components/DropZone.tsx";
import { PrinterSelect } from "./components/PrinterSelect.tsx";
import { JobQueue } from "./components/JobQueue.tsx";

type NotificationType = "success" | "error";

interface Notification {
  type: NotificationType;
  message: string;
}

export function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [printer, setPrinter] = useState("");
  const [copies, setCopies] = useState(1);
  const [printing, setPrinting] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  function notify(type: NotificationType, message: string) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }

  async function handlePrint() {
    if (!files.length) return;
    if (!printer) {
      notify("error", "Select a printer first");
      return;
    }

    setPrinting(true);
    try {
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        form.append("printer", printer);
        form.append("copies", String(copies));

        const res = await fetch("/api/print", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Print failed");
      }
      notify(
        "success",
        `Sent ${files.length} file${files.length > 1 ? "s" : ""} to ${printer}`
      );
      setFiles([]);
      setCopies(1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Print failed";
      notify("error", message);
    } finally {
      setPrinting(false);
    }
  }

  return (
    <div className="container">
      <header>
        <h1>Print Manager</h1>
      </header>

      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      <section className="print-section">
        <DropZone files={files} onFiles={setFiles} />

        <div className="print-controls">
          <div className="control-row">
            <label>Printer</label>
            <PrinterSelect selected={printer} onSelect={setPrinter} />
          </div>
          <div className="control-row">
            <label>Copies</label>
            <input
              type="number"
              className="copies-input"
              min={1}
              max={99}
              value={copies}
              onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
          <button
            className="btn-print"
            onClick={handlePrint}
            disabled={!files.length || printing}
          >
            {printing ? "Printing..." : "Print"}
          </button>
        </div>
      </section>

      <section className="queue-section">
        <h2>Print Queue</h2>
        <JobQueue />
      </section>
    </div>
  );
}
