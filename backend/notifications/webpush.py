from pywebpush import WebPushException, webpush

from push_notifications.models import WebPushDevice
from django.conf import settings
from push_notifications.webpush import webpush_send_message
from .models import WebPushInfo

def send_push_notification_to_all_user_devices(user, title, message, tag):
     user_info = WebPushInfo.objects.filter(user=user) #ako postoji info poslace notifikaciju
     for data in user_info:
        official_send_push_notification(data.device.registration_id, title, message, tag)


#zvanicno
import json
from push_notifications.models import WebPushDevice

def official_send_push_notification(wp_reg_id, title, message, tag): #nakaciti device objekat na klijenta lista kako bi se poslalo ili samo reg id
	device = WebPushDevice.objects.filter(registration_id=wp_reg_id).first() #paziti da se ne subscribuje vise puta isti todo

	data = json.dumps({"title": title, "message": message, "tag": tag})

	device.send_message(data)

from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework import status
from push_notifications.api.rest_framework import WebPushDeviceSerializer

#nezVANICNO
def subscribe_webpush(request, user):
        data = json.loads(request.body.decode('utf-8'))
        # Ensure the required fields are present
        required_fields = ['registration_id', 'p256dh', 'auth', 'browser']
        if not all(field in data for field in required_fields):
            return JsonResponse(
                {"error": "Missing required fields."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        #check if already subscribed
        existing_device = WebPushDevice.objects.filter(registration_id=data["registration_id"])
        for device in existing_device:
            existing_webPushInfo = WebPushInfo.objects.filter(device=device, user=user).first()
            if existing_webPushInfo:
            # Return error if already subscribed
                return JsonResponse({"message": "User already subscribed with this registration ID."}, status=status.HTTP_200_OK)
        # Create the WebPushDevice object
        
        try:
            device = WebPushDevice.objects.create(
                registration_id=data['registration_id'],
                p256dh=data['p256dh'],
                auth=data['auth'],
                browser=data['browser']
            )
            WebPushInfo.objects.create(
                user=user,
                device= device
                )
            official_send_push_notification(device.registration_id, "Notifikacioni servis", "Uspješno ste se registrovali na notifikacioni sistem", "SubscriptionSuccess")
            return JsonResponse({
                "message": "Device successfully subscribed!",
                "device_id": device.id
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
