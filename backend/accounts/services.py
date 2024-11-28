from .models import BusinessSubject, StandardUser, Client

class BusinessSubjectService:
    def create_business_subject(self, user, name, contact_phone, location, category_name, contact_email, short_description, long_description, links):
        return BusinessSubject.objects.create(user=user, name=name, contact_phone=contact_phone, location=location, category_name=category_name, contact_email=contact_email, short_description=short_description, long_description=long_description, links=links)

class StandardUserService:
    def create_standard_user(self, user, name, phone):
        return StandardUser.objects.create(user=user, name=name, phone=phone)

class ClientService:
    def create_client(self, user, name, address):
        return Client.objects.create(user=user, name=name, address=address)

class FounderService:
    def create_founder(self, business_subject, name, role, profile_image):
        return Client.objects.create(business_subject=business_subject, name=name, role=role, profile_image=profile_image)
