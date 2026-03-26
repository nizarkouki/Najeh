export function BackgroundShell({ children }) {

  return (
    <div
      className="px-4 py-10 relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_15%,#ffe7bf_0,#fff4e3_26%,#fff_55%),radial-gradient(circle_at_88%_20%,#c7f9e9_0,#ecfff8_28%,transparent_56%)] dark:bg-[radial-gradient(circle_at_12%_15%,#362715_0,#18120f_34%,#0f0f11_60%),radial-gradient(circle_at_88%_20%,#17322c_0,#101a17_33%,transparent_60%)]"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-300/25 blur-3xl dark:bg-amber-500/15" />
        <div className="absolute -right-24 top-56 h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/20" />
      </div>
      {children}
    </div>
  );
}
