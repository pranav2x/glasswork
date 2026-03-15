export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="px-6 py-6 xl:px-8">{children}</div>;
}
