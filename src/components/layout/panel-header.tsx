import { NotificationBell } from "@/components/notifications/notification-bell";

export function PanelHeader({ title }: { title?: string }) {
  return (
    <div className="mb-6 flex items-center justify-end gap-4">
      {title ? (
        <h1 className="mr-auto text-2xl font-black text-[#083228]">{title}</h1>
      ) : null}
      <NotificationBell />
    </div>
  );
}
