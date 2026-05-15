type AuthShellProps = {
  children: React.ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl md:p-8 lg:max-w-lg">
      {children}
    </div>
  );
}
