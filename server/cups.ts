export interface Printer {
  name: string;
  status: string;
  enabled: boolean;
  isDefault: boolean;
}

export interface PrintJob {
  id: string;
  jobNumber: number;
  printer: string;
  user: string;
  size: number;
  date: string;
}

async function run(cmd: string, args: string[]): Promise<string> {
  const proc = Bun.spawn([cmd, ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const code = await proc.exited;
  if (code !== 0) {
    throw new Error(stderr.trim() || `${cmd} exited with code ${code}`);
  }
  return stdout;
}

export async function getPrinters(): Promise<Printer[]> {
  const output = await run("lpstat", ["-p", "-d"]);
  const lines = output.trim().split("\n").filter(Boolean);

  let defaultPrinter = "";
  const printers: Printer[] = [];

  for (const line of lines) {
    const defaultMatch = line.match(/^system default destination:\s*(.+)$/);
    if (defaultMatch) {
      defaultPrinter = defaultMatch[1]!.trim();
      continue;
    }

    const printerMatch = line.match(
      /^printer\s+(\S+)\s+is\s+(\S+)\.\s+(enabled|disabled)/
    );
    if (printerMatch) {
      printers.push({
        name: printerMatch[1]!,
        status: printerMatch[2]!,
        enabled: printerMatch[3] === "enabled",
        isDefault: false,
      });
    }
  }

  for (const p of printers) {
    p.isDefault = p.name === defaultPrinter;
  }

  return printers;
}

export async function getJobs(): Promise<PrintJob[]> {
  let output: string;
  try {
    output = await run("lpstat", ["-o"]);
  } catch {
    return [];
  }

  const lines = output.trim().split("\n").filter(Boolean);
  const jobs: PrintJob[] = [];

  for (const line of lines) {
    const match = line.match(/^(\S+)-(\d+)\s+(\S+)\s+(\d+)\s+(.+)$/);
    if (match) {
      jobs.push({
        id: `${match[1]}-${match[2]}`,
        jobNumber: parseInt(match[2]!, 10),
        printer: match[1]!,
        user: match[3]!,
        size: parseInt(match[4]!, 10),
        date: match[5]!,
      });
    }
  }

  return jobs;
}

export async function printFile(
  filePath: string,
  printer: string,
  copies: number = 1
): Promise<string> {
  const args = ["-d", printer];
  if (copies > 1) {
    args.push("-n", String(copies));
  }
  args.push(filePath);

  const output = await run("lp", args);
  const match = output.match(/request id is (\S+)/);
  return match?.[1] ?? output.trim();
}

export async function cancelJob(jobId: string): Promise<void> {
  await run("cancel", [jobId]);
}
