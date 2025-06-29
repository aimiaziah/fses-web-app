from django.urls import path
from .views import *

from . import views

urlpatterns = [
    path('csrf/', get_csrf),
    path('login/', login_view),
    path('logout/', logout_view),
    path('user/', current_user),
]
