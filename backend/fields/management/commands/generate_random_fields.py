from django.core.management.base import BaseCommand
from faker import Faker
import random
from random import choice, uniform
from fields.models import Sport, Field

fake = Faker()

class Command(BaseCommand):
    help = 'Generates random fields and sports'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating sports...')
        create_sports()
        self.stdout.write('Creating fields...')
        create_fields()
        self.stdout.write(self.style.SUCCESS('Successfully generated random fields and sports.'))

def create_sports():
    # Učitavanje sportova iz baze
    sports = Sport.objects.all()  # Ovo učitava sve sportove iz baze
    if not sports:
        # Ako nema sportova u bazi, dodaj osnovne sportove
        sports_data = ["fudbal", "kosarka", "tenis", "odbojka"]
        for sport_name in sports_data:
            Sport.objects.create(name=sport_name)
        sports = Sport.objects.all()  # Ponovno učitavamo sportove nakon dodavanja

    # Ovdje se koristi lista sportova učitanih iz baze
    for sport in sports:
        print(f'Created sport: {sport.name}')

def create_fields(num_fields=10):
    sports = list(Sport.objects.all())  # Učitavanje svih sportova iz baze
    for _ in range(num_fields):
        location = fake.city()
        precise_location = fake.address()
        latitude = round(random.uniform(44.77, 44.82), 5)  
        longitude = round(random.uniform(17.12, 17.20), 5)
        is_suspended = choice([True, False])
        image = None

        field = Field.objects.create(
            location=location,
            precise_location=precise_location,
            latitude=latitude,
            longitude=longitude,
            is_suspended=is_suspended,
            image=image
        )
        num_sports = choice([1, 2, 3])
        selected_sports = random.sample(sports, num_sports)  # Biranje slučajnih sportova
        field.sports.set(selected_sports)  # Postavljanje sportova na teren
        field.save()
