export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="dark px-6 py-6 xl:px-8">{children}</div>;
}
