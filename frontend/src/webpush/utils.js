// Utils functions:

import { fetchCurrentUserData } from "../utils"
import API, { VAPID_PUBLIC_KEY } from "../variables"
import { toast } from "react-toastify"

function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4)
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/')

    var rawData = window.atob(base64)
    var outputArray = new Uint8Array(rawData.length)

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray;
}

var applicationServerKey = VAPID_PUBLIC_KEY;

export async function subscribeUser() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register("/navigatorPush.service.js");
            navigator.serviceWorker.ready.then(function (reg) {
                reg.pushManager
                    .subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(
                            applicationServerKey
                        ),
                    })
                    .then(function (sub) {
                        var registration_id = sub.endpoint;
                        var data = {
                            registration_id: registration_id,
                            p256dh: btoa(
                                String.fromCharCode.apply(
                                    null,
                                    new Uint8Array(sub.getKey('p256dh'))
                                )
                            ),
                            auth: btoa(
                                String.fromCharCode.apply(
                                    null,
                                    new Uint8Array(sub.getKey('auth'))
                                )
                            ),
                            browser: navigator.userAgent, //added
                        }
                        requestPOSTToServer(data)
                    })
                    .catch(function (e) {
                        if (Notification.permission === 'denied') {
                            console.warn('Permission for notifications was denied')
                        } else {
                            console.error('Unable to subscribe to push', e)
                        }
                    })
            })
        } catch (error) {
            console.error("SubscribeUser: " + error);
        }
    }
}

// Send the subscription data to your server
async function requestPOSTToServer(data) {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    const requestOptions = {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    };

    const userData = await fetchCurrentUserData();

    return (
        fetch(
            `${API}/api/notifications/webpush/subscribe/${userData?.username}/`,
            requestOptions
        )
    ).then((response) => response.json())
        .catch((error) => console.error(error));
}

export default subscribeUser;


function getBrowserName() {
    const userAgent = navigator.userAgent;

    if (userAgent.indexOf("Chrome") > -1) {
        if (userAgent.indexOf("Edg") > -1) {
            return "Edge"; // Edge browser
        }
        return "Chrome"; // Chrome browser
    }
    if (userAgent.indexOf("Safari") > -1) {
        return "Apple Safari"; // Safari browser
    }
    if (userAgent.indexOf("Firefox") > -1) {
        return "Firefox"; // Firefox browser
    }
    if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
        return "Opera"; // Opera browser
    }
    if (userAgent.indexOf("Trident") > -1) {
        return "Internet Explorer"; // IE browser
    }
    return "Unknown Browser"; // If the browser is not recognized
}

export async function resetPushSubscription() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
        console.log("Unsubscribing from existing push subscription...");
        await subscription.unsubscribe();
    }

    console.log("Subscribing with the new application server key...");
    return subscribeUser();
}

export const webpushPremission =
    Notification.requestPermission().then(permission => {
        if (permission !== "granted") {
            console.error("Push notifications denied.");
            toast.warning("Molimo omogućite notifikacije u pregledniku za obavještenja o nadolazećim događajima")
        } else if (permission === "granted") {
            subscribeUser();
        }
    });

