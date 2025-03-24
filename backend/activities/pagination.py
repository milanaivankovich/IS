from rest_framework.pagination import CursorPagination

class ActivitiesPagination(CursorPagination):
    # Three records will be shown per page
    page_size = 10
    # Ordering the records 
    ordering = '-date'