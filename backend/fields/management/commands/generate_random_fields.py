from django.core.management.base import BaseCommand
from faker import Faker
import random
from random import choice, uniform
from fields.models import Sport, Field
from accounts.models import Client
from activities.models import Activities  # Import aktivnosti
from django.utils.timezone import now, timedelta

def create_activities(num_activities=40):
    clients = list(Client.objects.all())  # Učitavanje svih korisnika
    fields = list(Field.objects.all())  # Učitavanje svih terena
    sports = list(Sport.objects.all())  # Učitavanje svih sportova

    if not clients or not fields or not sports:
        print("Nema dovoljno podataka u bazi. Provjeri da li postoje klijenti, tereni i sportovi.")
        return

    for _ in range(num_activities):
        title = fake.sentence(nb_words=3)
        description = fake.paragraph()
        date = now() + timedelta(days=random.randint(1, 30))  # Aktivnosti u narednih 30 dana
        duration_hours = random.randint(1, 3)  # Aktivnosti traju 1-3 sata
        field = random.choice(fields)
        sport = random.choice(sports)
        max_participants = random.randint(2, 20)  # Maksimalan broj učesnika od 5 do 20

        # **Neka aktivnosti ne budu popunjene do kraja**
        num_participants = random.randint(0, max_participants - 1)  
        is_deleted = random.choice([False, False, False, True])  # 75% šanse da nije obrisano
 
        activity = Activities.objects.create(
            titel=title,
            description=description,
            date=date,
            duration_hours=duration_hours,
            field=field,
            sport=sport,
            NumberOfParticipants=num_participants,
            is_deleted=is_deleted,
            client=random.choice(clients),
        )

        # Nasumično dodajemo učesnike
        selected_clients = random.sample(clients, min(num_participants, len(clients)))
        activity.participants.set(selected_clients)

        print(f"Created activity: {activity}")

# Lista stvarnih naselja u Banja Luci
neighborhoods = [
    "Ada", "Borik", "Starčevica", "Lazarevo", "Obilićevo",
    "Nova Varoš", "Kočićev Vijenac", "Petrićevac", "Lauš", "Paprikovac"
]

# Lista stvarnih preciznih lokacija (adresa)
addresses = [
    "Ulica Kralja Petra I Karađorđevića 1", 
    "Vidovdanska 12", 
    "Gundulićeva 14", 
    "Bulevar Srpske vojske 9", 
    "Kralja Tvrtka 5",
    "Nikole Pašića 20", 
    "Majke Jugovića 8", 
    "Aleja Svetog Save 15", 
    "Cara Lazara 6", 
    "Kneza Miloša 10"
]


fake = Faker()

class Command(BaseCommand):
    help = 'Generates random fields and sports'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating sports...')
        create_sports()
        self.stdout.write('Creating fields...')
        create_fields(num_fields=50)
        self.stdout.write('Creating activities...')
        create_activities(num_activities=100)
        self.stdout.write(self.style.SUCCESS('Successfully generated random fields.'))

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

def get_random_image():
        import os  # Pobrinite se da je os modul uključen
        
        # Putanja do direktorija sa slikama, tri nivoa iznad trenutnog direktorija
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))  # Izaći tri direktorijuma unazad
        media_dir = os.path.join(base_dir, 'media', 'media')  # Spajanje putanje do 'media/media'
        
        # Provera da li direktorij postoji
        if not os.path.exists(media_dir):
            print(f"Direktorij {media_dir} ne postoji.")
            return None
        
        # Pronađite sve slike unutar 'media/media'
        all_images = [f for f in os.listdir(media_dir) if f.endswith(('.jpg', '.png'))]
        
        if all_images:
            # Nasumično izaberite sliku
            return os.path.join('media', random.choice(all_images))
        else:
            print(f"Direktorij {media_dir} ne sadrži slike.")
            return None

def create_fields(num_fields=50):
    sports = list(Sport.objects.all())  # Učitavanje svih sportova iz baze
    for _ in range(num_fields):
        location = random.choice(neighborhoods)  
        precise_location = random.choice(addresses)
        latitude = round(random.uniform(44.77, 44.82), 5)  
        longitude = round(random.uniform(17.12, 17.20), 5)
        is_suspended = choice([True, False])
        image = get_random_image()

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