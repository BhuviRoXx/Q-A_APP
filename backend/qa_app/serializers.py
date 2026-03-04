from rest_framework import serializers
from .models import Question,Answer,Vote

from rest_framework import serializers
from .models import Question, Answer
from django.contrib.auth.models import User

# Answer serializer
class AnswerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Answer
        fields = ['id', 'user', 'username', 'content', 'created_at']
        read_only_fields = ['id', 'created_at', 'username']

# Question serializer with nested answers
class QuestionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)  # nested answers

    class Meta:
        model = Question
        fields = ['id', 'user', 'username', 'title', 'description', 'created_at', 'answers']
        read_only_fields = ['id', 'created_at', 'username']