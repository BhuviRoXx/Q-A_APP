import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import api from '../../utils/api'

interface Answer {
  id: string
  user: string
  username: string
  content: string
  created_at: string
  votes_count: number
}

interface Question {
  id: string
  user: string
  username: string
  title: string
  description: string
  created_at: string
  answers: Answer[]
}

const QuestionDetail = () => {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [answerText, setAnswerText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchQuestion()
  }, [id])

  const fetchQuestion = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/questions/${id}`)
      setQuestion(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load question')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      setError('Answer cannot be empty')
      return
    }

    try {
      setSubmitting(true)
      await api.post(`/api/answers/`, {
        content: answerText,
      })
      setAnswerText('')
      fetchQuestion() // Refresh to show new answer
    } catch (err) {
      setError('Failed to submit answer')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!question) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'Question not found'}</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Question</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Question */}
      <View style={styles.questionSection}>
        <Text style={styles.questionTitle}>{question.title}</Text>
        <Text style={styles.questionDescription}>{question.description}</Text>
        
        <View style={styles.questionMeta}>
          <Text style={styles.userName}>{question.username}</Text>
          <Text style={styles.date}>{new Date(question.created_at).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Answers Count */}
      <View style={styles.answersHeader}>
        <Text style={styles.answersTitle}>{question.answers.length} Answers</Text>
      </View>

      {/* Answers List */}
      {question.answers.map((answer) => (
        <View key={answer.id} style={styles.answerCard}>
          <View style={styles.answerHeader}>
            <Text style={styles.userName}>{answer.username}</Text>
            <Text style={styles.date}>{new Date(answer.created_at).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.answerContent}>{answer.content}</Text>
          <View style={styles.answerFooter}>
            <TouchableOpacity style={styles.voteButton}>
              <Ionicons name="thumbs-up-outline" size={16} color="#007AFF" />
              <Text style={styles.voteCount}>{answer.votes_count}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Answer Input */}
      <View style={styles.answerInputSection}>
        <Text style={styles.answerInputLabel}>Your Answer</Text>
        <TextInput
          style={styles.answerInput}
          placeholder="Write your answer here..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={5}
          value={answerText}
          onChangeText={setAnswerText}
          editable={!submitting}
        />
        <TouchableOpacity 
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmitAnswer}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Submitting...' : 'Submit Answer'}
          </Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </ScrollView>
  )
}

export default QuestionDetail

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  questionSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  questionDescription: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 16,
  },
  questionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
  },
  date: {
    fontSize: 13,
    color: '#999',
  },
  answersHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  answersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  answerCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  answerContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  answerFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voteCount: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  answerInputSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  answerInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 12,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111',
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    padding: 16,
  },
})