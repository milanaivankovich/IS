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
    sports = ["fudbal", "kosarka", "tenis", "odbojka"]
    for sport_name in sports:
        Sport.objects.create(name=sport_name)

def create_fields(num_fields=10):
    sports = list(Sport.objects.all())
    for _ in range(num_fields):
        location = fake.city()
        precise_location = fake.address()
        latitude = uniform(-90, 90)
        longitude = uniform(-180, 180)
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
        selected_sports = random.sample(sports, num_sports)
        field.sports.set(selected_sports)
        field.save()