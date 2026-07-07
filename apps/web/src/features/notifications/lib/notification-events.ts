import type { ApiFeedbackPayload, ErpNotification, ToastInput } from "./notification-types";

type NotificationEventMap = {
  "toast.show": ToastInput;
  "api.success": ApiFeedbackPayload;
  "api.error": ApiFeedbackPayload;
  "notification.created": ErpNotification;
};

type NotificationEventName = keyof NotificationEventMap;
type Listener<T extends NotificationEventName> = (payload: NotificationEventMap[T]) => void;

const listeners = new Map<NotificationEventName, Set<(payload: unknown) => void>>();

export const notificationEvents = {
  emit<T extends NotificationEventName>(event: T, payload: NotificationEventMap[T]) {
    listeners.get(event)?.forEach((listener) => listener(payload));
  },

  on<T extends NotificationEventName>(event: T, listener: Listener<T>) {
    const eventListeners = listeners.get(event) ?? new Set<(payload: unknown) => void>();
    eventListeners.add(listener as (payload: unknown) => void);
    listeners.set(event, eventListeners);

    return () => {
      eventListeners.delete(listener as (payload: unknown) => void);
    };
  },
};

export function showManagedToast(input: ToastInput) {
  notificationEvents.emit("toast.show", input);
}
