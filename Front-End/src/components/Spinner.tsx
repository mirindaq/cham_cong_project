import { AdminLayout } from "@/components/admin-layout";
import { EmployeeLayout } from "@/components/employee-layout";

interface SpinnerProps {
  layout?: "admin" | "employee";
}

export default function Spinner({ layout = "admin" }: SpinnerProps) {
  const Layout = layout === "employee" ? EmployeeLayout : AdminLayout;
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    </Layout>
  );
}
