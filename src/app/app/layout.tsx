export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8 md:px-8">{children}</div>
  );
}
