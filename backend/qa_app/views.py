from rest_framework import viewsets, permissions
from .models import Question
from .serializers import QuestionSerializer

class QuestionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Questions
    Supports: list, retrieve, create, update, delete
    Includes search and nested answers
    """
    serializer_class = QuestionSerializer
    # permission_classes = [permissions.IsAuthenticated]  # Only logged-in users can access

    def get_queryset(self):
        """
        Returns filtered queryset based on search query (q)
        """
        qs = Question.objects.all()  # start with all questions
        q = self.request.GET.get('q')  # get search term from query params
        if q:
            qs = Question.objects.search(q)  # use custom manager's search method
        return qs.order_by('-created_at')  # latest questions first