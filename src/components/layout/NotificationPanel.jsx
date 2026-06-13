import { X, Bell, Check, CheckCheck } from 'lucide-react';
import useNotificationStore from '../../store/notificationStore';
import { useMarkRead, useMarkAllRead } from '../../api/notifications';
import { useEffect, useRef } from 'react';
import anime from 'animejs';

const NotificationPanel = () => {
  const { notifications, isOpen, closePanel, markAsRead, markAllAsRead } = useNotificationStore();
  const markReadMutation = useMarkRead();
  const markAllReadMutation = useMarkAllRead();
  const panelRef = useRef(null);

  useEffect(() => {
    if (isOpen && panelRef.current) {
      anime({
        targets: panelRef.current,
        translateX: ['100%', '0%'],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutExpo',
      });
    }
  }, [isOpen]);

  const handleMarkRead = (id) => {
    markAsRead(id);
    markReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    markAllReadMutation.mutate();
  };

  if (!isOpen) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'relay_claimed': return '🎉';
      case 'new_relay_nearby': return '🍽️';
      case 'account_verified': return '✅';
      case 'account_rejected': return '❌';
      default: return '🔔';
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={closePanel} />
      <div
        ref={panelRef}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-midnight-light border-l border-steel-20 z-50 flex flex-col"
        style={{ opacity: 0 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-steel-10">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-azure" />
            <h3 className="font-display font-bold text-white">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-azure hover:text-azure/80 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3 h-3" />
              Mark all read
            </button>
            <button
              onClick={closePanel}
              className="p-1 rounded-lg hover:bg-steel-10 text-steel hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Bell className="w-10 h-10 text-steel/30 mb-3" />
              <p className="text-steel text-sm">No notifications yet</p>
              <p className="text-steel/60 text-xs font-accent text-base mt-1">All quiet on the relay front</p>
            </div>
          ) : (
            <div className="divide-y divide-steel-10">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 hover:bg-steel-10/50 transition-colors ${
                    !notif.is_read ? 'bg-azure/5 border-l-2 border-l-azure' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{getNotificationIcon(notif.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{notif.title}</p>
                      <p className="text-xs text-steel mt-1">{notif.body}</p>
                      <p className="text-xs text-steel/60 mt-2">{formatTime(notif.created_at)}</p>
                    </div>
                    {!notif.is_read && (
                      <button
                        onClick={() => handleMarkRead(notif._id)}
                        className="p-1 rounded hover:bg-steel-10 text-steel hover:text-azure transition-colors cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
