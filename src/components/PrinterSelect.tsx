import { useState, useEffect } from "react";

interface Printer {
  name: string;
  status: string;
  enabled: boolean;
  isDefault: boolean;
}

interface PrinterSelectProps {
  selected: string;
  onSelect: (name: string) => void;
}

export function PrinterSelect({ selected, onSelect }: PrinterSelectProps) {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/printers")
      .then((r) => r.json())
      .then((data: Printer[]) => {
        setPrinters(data);
        if (!selected) {
          const def = data.find((p) => p.isDefault);
          if (def) onSelect(def.name);
          else if (data[0]) onSelect(data[0].name);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted">Loading printers...</p>;
  if (!printers.length) return <p className="muted">No printers found</p>;

  return (
    <select
      className="printer-select"
      value={selected}
      onChange={(e) => onSelect(e.target.value)}
    >
      {printers.map((p) => (
        <option key={p.name} value={p.name} disabled={!p.enabled}>
          {p.name} ({p.status}){p.isDefault ? " — default" : ""}
        </option>
      ))}
    </select>
  );
}
