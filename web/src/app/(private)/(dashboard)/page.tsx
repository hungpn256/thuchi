import { Metadata } from "next";
import DashboardContent from "@/components/dashboard/DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard | Thu Chi Management",
  description: "Dashboard for managing income and expenses",
};

export default function DashboardPage() {
  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <DashboardContent />
    </main>
  );
}
