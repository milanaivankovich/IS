import API from "../variables";

async function subscribeToPush() {
    if ("serviceWorker" in navigator && "PushManager" in window) {
        try {
            const registration = await navigator.serviceWorker.register("/webpush.js");
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: "VAPID_PUBLIC_KEY",
            });

            // Send subscription to Django backend
            await fetch(`${API}/webpush/subscribe/mimi/`, {
                method: "POST",
                body: JSON.stringify(subscription),
                headers: {
                    "Content-Type": "application/json"
                },
            });

            console.log("Push Subscription successful!");
        } catch (error) {
            console.error("Push Subscription failed:", error);
        }
    }
}

//modal
function webpushPremission() {
    Notification.requestPermission().then(permission => {
        if (permission !== "granted") {
            console.error("Push notifications denied.");
        }
    });
}