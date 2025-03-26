import os
import random
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from faker import Faker
from accounts.models import Client  # Zamijenite 'your_app' sa imenom vaše aplikacije
from datetime import datetime, timedelta

fake = Faker()

class Command(BaseCommand):
    help = 'Generates fake users with realistic data'

    def handle(self, *args, **options):
        self.stdout.write("Generating users...")
        
        # Gender distribution (70% Male, 20% Female, 10% Other/Prefer not to say)
        GENDER_CHOICES = ['M', 'F', 'O', 'N']
        gender_weights = [0.7, 0.2, 0.05, 0.05]  # Težine za random.choices
        

        num_users = 100  # Broj korisnika koje želite generisati
        
        for _ in range(num_users):
            # Osnovni podaci
            gender = random.choices(GENDER_CHOICES, weights=gender_weights)[0]
            
            if gender == 'M':
                first_name = fake.first_name_male()
            elif gender == 'F':
                first_name = fake.first_name_female()
            else:
                first_name = fake.first_name()
            
            last_name = fake.last_name()
            username = f"{first_name.lower()}{last_name.lower()}{random.randint(10, 99)}"
            email = f"{username}@example.com"
            
            # Starost (50% između 18-30 godina)
            if random.random() < 0.5:
                age = random.randint(18, 30)
            else:
                age = random.randint(31, 65)
            
            # Datum rođenja (izračunat iz starosti)
            birth_year = datetime.now().year - age
            date_of_birth = fake.date_between_dates(
                date_start=datetime(birth_year, 1, 1),
                date_end=datetime(birth_year, 12, 31)
            )
            
            # Kreiranje korisnika
            user = Client.objects.create(
                username=username,
                first_name=first_name,
                last_name=last_name,
                email=email,
                password=make_password('testpassword123'),  # Standardna lozinka za sve test korisnike
                phone=fake.phone_number()[:15],
                date_of_birth=date_of_birth,
                age=age,
                gender=gender,
                
            )
            
            self.stdout.write(f"Created user: {username}")

        self.stdout.write(self.style.SUCCESS(f"Successfully generated {num_users} users"))