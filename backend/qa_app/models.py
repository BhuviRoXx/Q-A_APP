from django.db import models
from django.contrib.auth.models import User
from django.db.models import Q

# Question Query Set
class QuestionQuerySet(models.QuerySet):
    def search(self, query):
        return self.filter(
            Q(title__icontains = query) | Q(description__icontains = query)
        )

# Question Model Manager
class QuestionManager(models.Manager):
    def get_queryset(self):
        return QuestionQuerySet(self.model, using=self._db)
    
    def search(self, query):
        return self.get_queryset().search(query)
    

# user --> many --> questions
class Question(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title




# question --> many --> answers
class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.content[:50]
    

# answers ---> many --> votes
class Vote(models.Model):
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        unique_together = ['answer', 'user'] # no single user should like the same answer for multiple times eg : (A,1) (A,2) Not again (A,2)