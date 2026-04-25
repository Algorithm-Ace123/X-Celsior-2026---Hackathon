let notificationPermission = 'default';
let lastNotificationTime = {
    hunger: 0,
    energy: 0
};

const COOLDOWN = 1000 * 60 * 10; // 10 minutes cooldown between notifications of the same type

export function initNotifications() {
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notification");
        return;
    }

    if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            notificationPermission = permission;
            if (permission === 'granted') {
                console.log("Notification permission granted.");
            }
        });
    } else {
        notificationPermission = Notification.permission;
    }
}

export function sendNotification(type, message) {
    if (notificationPermission !== 'granted') return;

    const now = Date.now();
    if (now - lastNotificationTime[type] < COOLDOWN) return;

    lastNotificationTime[type] = now;
    
    new Notification("Digital Pet Companion", {
        body: message,
        icon: '/favicon.ico' // Or a pet icon if available
    });
}
