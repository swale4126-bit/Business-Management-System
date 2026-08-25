import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiBell, HiCheckCircle, HiExclamationTriangle, HiShoppingCart, HiUserPlus } from 'react-icons/hi2';
import toast from 'react-hot-toast';

import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import notificationService from '../../services/notificationService';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notificationsData = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getAll,
  });

  const notifications = Array.isArray(notificationsData)
    ? notificationsData
    : (notificationsData?.data || []);

  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  const notifIcon = (type) => {
    switch (type) {
      case 'LOW_STOCK':
        return <HiExclamationTriangle className="w-5 h-5 text-amber-500" />;
      case 'NEW_SALE':
        return <HiShoppingCart className="w-5 h-5 text-green-500" />;
      case 'NEW_EMPLOYEE':
      case 'NEW_CUSTOMER':
        return <HiUserPlus className="w-5 h-5 text-blue-500" />;
      default:
        return <HiBell className="w-5 h-5 text-primary-500" />;
    }
  };

  const badgeVariant = (type) => {
    switch (type) {
      case 'LOW_STOCK': return 'amber';
      case 'NEW_SALE': return 'green';
      case 'NEW_EMPLOYEE': return 'blue';
      case 'NEW_CUSTOMER': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <PageHeader 
        title="Notifications" 
        subtitle="Real-time system updates, low stock alerts, and transaction logs."
        actions={
          notifications.some(n => !n.isRead) && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<HiCheckCircle className="w-4 h-4" />}
              onClick={() => markAllReadMutation.mutate()}
              isLoading={markAllReadMutation.isPending}
            >
              Mark all as read
            </Button>
          )
        }
      />

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-6 space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <HiBell className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No notifications yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">You're all caught up! New alerts will appear here automatically.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              onClick={() => !notif.isRead && markAsReadMutation.mutate(notif.id)}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                !notif.isRead 
                  ? 'bg-blue-50/40 dark:bg-primary-950/20 hover:bg-blue-50/70 dark:hover:bg-primary-950/30' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                {notifIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-semibold ${!notif.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {notif.title}
                    </h4>
                    {notif.type && (
                      <Badge variant={badgeVariant(notif.type)}>
                        {notif.type?.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {new Date(notif.createdAt || notif.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {notif.message}
                </p>
              </div>
              {!notif.isRead && (
                <span className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0 self-center" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
