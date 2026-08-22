import { useEffect, useState } from "react";
import { apiClient } from "../../api/client.js";
import BottomNav from "../../components/BottomNav.jsx";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    apiClient.get("/api/notifications").then(({ data }) => setNotifications(data)).catch(() => setNotifications([]));
  }, []);

  async function markRead(id) {
    try {
      await apiClient.patch(`/api/notifications/${id}/read`);
      setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch { /* silencieux : pas bloquant pour l'UX */ }
  }

  return (
    <div className="screen">
      <h2 className="text-center">Notifications</h2>
      {notifications.length === 0 && <p className="text-grisfonce text-center">Aucune notification.</p>}
      {notifications.map((n) => (
        <div key={n.id} onClick={() => markRead(n.id)}
          className={`py-3 border-b border-white/5 cursor-pointer ${n.isRead ? "opacity-60" : ""}`}>
          <p className="m-0">{n.message}</p>
          <p className="m-0 text-[11px] text-grisfonce">{new Date(n.createdAt).toLocaleString("fr-FR")}</p>
        </div>
      ))}
      <BottomNav />
    </div>
  );
}
