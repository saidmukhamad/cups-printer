import { useState, useEffect } from "react";

interface PrintJob {
  id: string;
  jobNumber: number;
  printer: string;
  user: string;
  size: number;
  date: string;
}

export function JobQueue() {
  const [jobs, setJobs] = useState<PrintJob[]>([]);

  function fetchJobs() {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((data: PrintJob[]) => setJobs(data))
      .catch(() => {});
  }

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  async function handleCancel(id: string) {
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    fetchJobs();
  }

  if (!jobs.length) {
    return <p className="muted">No active print jobs</p>;
  }

  return (
    <table className="job-table">
      <thead>
        <tr>
          <th>Job</th>
          <th>Printer</th>
          <th>Size</th>
          <th>Date</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {jobs.map((job) => (
          <tr key={job.id}>
            <td>#{job.jobNumber}</td>
            <td>{job.printer}</td>
            <td>{formatSize(job.size)}</td>
            <td>{job.date}</td>
            <td>
              <button
                className="btn-cancel"
                onClick={() => handleCancel(job.id)}
                title="Cancel job"
              >
                &times;
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
