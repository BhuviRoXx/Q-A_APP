from rest_framework import serializers
from .models import Question, Answer, Vote
from django.contrib.auth.models import User

from django.db import models
# User Serializers for Authentication
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


# Answer serializer
class AnswerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    votes_count = serializers.IntegerField(source='votes.count', read_only=True)  # dynamic count

    class Meta:
        model = Answer
        fields = ['id', 'user', 'username', 'question', 'content', 'created_at', 'votes_count']
        read_only_fields = ['id', 'created_at', 'username', 'user', 'votes_count']

# Question serializer with nested answers
class QuestionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    answers = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ['id', 'user', 'username', 'title', 'description', 'created_at', 'answers']
        read_only_fields = ['id', 'created_at', 'username']

    def get_answers(self, obj):
        # obj is the Question instance
        return AnswerSerializer(
            obj.answers.annotate(votes_count=models.Count('votes')).order_by('-votes_count'),
            many=True,
            context=self.context
        ).data