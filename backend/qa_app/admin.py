from django.contrib import admin

# Register your models here.
from .models import Question,Answer,Vote

admin.site.register(Question)
admin.site.register(Answer)
admin.site.register(Vote)