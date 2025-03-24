from django.core.management.base import BaseCommand
from faker import Faker
import random
from random import choice, uniform
from fields.models import Sport, Field

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