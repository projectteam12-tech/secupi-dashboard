from django.urls import path
from . import views

urlpatterns = [
    path('summary/', views.summary, name='dashboard-summary'),
    path('health/', views.health, name='health'),
]



