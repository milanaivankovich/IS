from django.test import TestCase


from .models import BusinessSubject, Client

class BusinessSubjectModelTest(TestCase):
    def setUp(self):
        BusinessSubject.objects.create(name="Test Business")

    def test_business_subject_creation(self):
        business = BusinessSubject.objects.get(name="Test Business")
        self.assertEqual(business.name, "Test Business")

