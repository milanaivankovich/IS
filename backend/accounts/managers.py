from django.db import models

class BusinessSubjectManager(models.Manager):
    def create_business_subject(self, user, name, contact_phone, location, category_name, contact_email, short_description, long_description, links):
        return self.create(user=user, name=name, contact_phone=contact_phone, location=location, category_name=category_name, contact_email=contact_email, short_description=short_description, long_description=long_description, links=links)

class StandardUserManager(models.Manager):
    def create_standard_user(self, user, name, phone):
        return self.create(user=user, name=name, phone=phone)

class ClientManager(models.Manager):
    def create_client(self, user, password, name, surname, date_of_birth, profile_picture, bio):
        return self.create(user=user, password=password, name=name, surname=surname, date_of_birth=date_of_birth, profile_picture=profile_picture, bio=bio)

class FounderManager(models.Manager):
    def create_founder(self, business_subject, name, role, profile_image):
        return self.create(business_subject=business_subject, name=name, role=role, profile_image=profile_image)        
