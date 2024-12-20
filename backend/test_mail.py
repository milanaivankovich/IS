import os
import django

# Set DJANGO_SETTINGS_MODULE to point to your Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

# Initialize Django
django.setup()



from accounts.views import send_email_via_gmail  # Make sure you import the function

if __name__ == "__main__":
    to_email = "anastasija.milenic@student.etf.unibl.org"  # Change to your email address
    subject = "Test Email"
    message = "This is a test email sent from Python!"
    send_email_via_gmail(to_email, subject, message)
