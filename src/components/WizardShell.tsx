import type { ReactNode } from "react";

interface WizardShellProps {
  header: ReactNode;
  rail: ReactNode;
  logPanel: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

export function WizardShell({ header, rail, logPanel, footer, children }: WizardShellProps) {
  return (
    <div className="wizard-shell">
      {header}
      <div className="wizard-grid">
        <aside className="rail-region">{rail}</aside>
        <main className="content-region">{children}</main>
        <aside className="log-region">{logPanel}</aside>
      </div>
      {footer}
    </div>
  );
}
