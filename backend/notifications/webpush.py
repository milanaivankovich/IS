from pywebpush import WebPushException, webpush

from push_notifications.models import WebPushDevice
from django.conf import settings
from push_notifications.webpush import webpush_send_message


#zvanicno
import json
from push_notifications.models import WebPushDevice
def official_send_push_notification(wp_reg_id, title, message): #nakaciti device objekat na klijenta lista kako bi se poslalo ili samo reg id
	device = WebPushDevice.objects.filter(registration_id=wp_reg_id).first() #paziti da se ne subscribuje vise puta isti todo

	data = json.dumps({"title": title, "message": message})

	device.send_message(data)

from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework import status
from push_notifications.api.rest_framework import WebPushDeviceSerializer

#nezVANICNO
def subscribe_webpush(request):
        data = json.loads(request.body.decode('utf-8'))
        # Ensure the required fields are present
        required_fields = ['registration_id', 'p256dh', 'auth', 'browser']
        if not all(field in data for field in required_fields):
            return JsonResponse(
                {"error": "Missing required fields."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the WebPushDevice object
        try:
            device = WebPushDevice.objects.create(
                registration_id=data['registration_id'],
                p256dh=data['p256dh'],
                auth=data['auth'],
                browser=data['browser']
            )
            official_send_push_notification(device.registration_id, "Notification service", "You subscribed to web push service")
            return JsonResponse({
                "message": "Device successfully subscribed!",
                "device_id": device.id
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
