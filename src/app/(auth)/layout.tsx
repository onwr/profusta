export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#f7f7f3] px-4 py-5">
      {children}
    </div>
  );
}
