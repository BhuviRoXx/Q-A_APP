from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Question, Answer, Vote
from .serializers import QuestionSerializer, AnswerSerializer, UserRegistrationSerializer, UserLoginSerializer, UserSerializer
from rest_framework.decorators import action


@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """
    User registration endpoint
    POST: Create new user account
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        return Response({
            'user': UserSerializer(user).data,
            "message": "Account created successfully"
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def signin(request):
    """
    User login endpoint
    POST: Authenticate user and return tokens
    """
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        try:
            user_obj = User.objects.get(email=email)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None
        
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class QuestionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Questions
    Supports: list, retrieve, create, update, delete
    Includes search and nested answers
    """
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Returns filtered queryset based on search query (q)
        """
        qs = Question.objects.all()  # start with all questions
        q = self.request.GET.get('q')  # get search term from query params
        if q:
            qs = Question.objects.search(q)  # use custom manager's search method
        return qs.order_by('-created_at')  # latest questions first
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise PermissionDenied("You can only delete your own questions")
        instance.delete()


class AnswerViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Answer
    """
    serializer_class = AnswerSerializer
    queryset = Answer.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    
    @action(detail=True, methods=['POST'])
    def vote(self, request, pk=None):
        answer = self.get_object()
        user = request.user

        # Check if user already voted
        vote, created = Vote.objects.get_or_create(answer=answer, user=user)
        if not created:
            return Response({'status': 'already voted'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'status': 'voted', 'votes_count': answer.votes.count()}, status=status.HTTP_200_OK)