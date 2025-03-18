import random
from django.core.management.base import BaseCommand
from faker import Faker
from accounts.models import Client
from fields.models import Sport, Field
from activities.models import Activities, Comment
from django.utils.timezone import now, timedelta

fake = Faker()

class Command(BaseCommand):
    help = 'Generiše lažne podatke za aktivnosti i rekreativce'

    def handle(self, *args, **kwargs):
        # Prvo kreiraj sportove ako ih nema
        sport_names = ["Fudbal", "Košarka", "Tenis", "Odbojka", "Trčanje", "Plivanje"]
        for name in sport_names:
            Sport.objects.get_or_create(name=name)

        sports = list(Sport.objects.all())

        # Kreiraj testne korisnike (ako ih nema)
        for _ in range(50):  # Kreira 50 korisnika
            Client.objects.get_or_create(
                username=fake.user_name(),
                email=fake.email(),
                defaults={'password': 'test1234'}
            )

        clients = list(Client.objects.all())

        # Kreiraj terene ako ih nema
        for _ in range(10):
            Field.objects.get_or_create(
                name=fake.company(),
                location=fake.address(),
                is_suspended=random.choice([True, False])
            )

        fields = list(Field.objects.all())

        # Kreiraj aktivnosti
        for _ in range(100):  # 100 aktivnosti
            sport = random.choice(sports)
            field = random.choice(fields)
            organizer = random.choice(clients)
            num_participants = random.randint(5, 20)
            duration = random.randint(1, 3)  # 1 do 3 sata

            activity = Activities.objects.create(
                client=organizer,
                titel=f"{sport.name} turnir",
                description=fake.text(),
                date=now() + timedelta(days=random.randint(-30, 30)),  # Prošli ili budući datumi
                field=field,
                NumberOfParticipants=num_participants,
                sport=sport,
                duration_hours=duration
            )

            # Dodaj učesnike
            participants = random.sample(clients, min(num_participants, len(clients)))
            activity.participants.set(participants)

            # Dodaj komentare
            for _ in range(random.randint(0, 5)):
                comment = Comment.objects.create(client=random.choice(clients), text=fake.sentence())
                activity.comments.add(comment)

        self.stdout.write(self.style.SUCCESS('Uspješno generisano 100 aktivnosti!'))
