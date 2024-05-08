import { UserAuth } from "@/components/auth";

interface PageHeaderProps {
  title: string;
}

export default function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-black px-4 py-4 text-2xl min-h-20">
      {title}
      <UserAuth />
    </header>
  );
}
