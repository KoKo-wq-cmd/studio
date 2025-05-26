// This layout ensures that admin pages might have specific wrappers if needed in future,
// but for now, it just passes children through, relying on the root layout for common structure.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
