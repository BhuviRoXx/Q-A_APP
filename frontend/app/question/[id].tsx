import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import api from '../utils/api'

interface Answer {
  id: number
  user: string
  username: string
  content: string
  created_at: string
  votes_count: number
}

interface Question {
  id: number
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
      await api.post(`/api/answers/`, { question: id, content: answerText })
      setAnswerText('')
      fetchQuestion()
    } catch (err) {
      setError('Failed to submit answer')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleVoteSubmit = async (answerId: number) => {
    try {
      await api.post(`/api/answers/${answerId}/vote/`)
      fetchQuestion()
    } catch (err) {
      setError('Failed to vote')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#111" />
      </View>
    )
  }

  if (!question) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Question not found'}</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Question</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Question Block */}
      <View style={styles.questionSection}>
        <Text style={styles.questionTitle}>{question.title}</Text>
        <Text style={styles.questionDescription}>{question.description}</Text>
        <View style={styles.metaRow}>
          <View style={styles.authorChip}>
            <Text style={styles.authorChipText}>{question.username}</Text>
          </View>
          <Text style={styles.date}>{new Date(question.created_at).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Answers Header */}
      <View style={styles.answersHeader}>
        <Text style={styles.answersCount}>{question.answers.length}</Text>
        <Text style={styles.answersLabel}>{question.answers.length === 1 ? 'Answer' : 'Answers'}</Text>
      </View>

      {/* Answers List */}
      <View style={styles.answersList}>
        {question.answers.map((answer, index) => (
          <View key={answer.id} style={styles.answerCard}>
            {/* Left accent line */}
            <View style={styles.accentLine} />

            <View style={styles.answerBody}>
              <View style={styles.answerHeader}>
                <Text style={styles.answerUsername}>{answer.username}</Text>
                <Text style={styles.date}>{new Date(answer.created_at).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.answerContent}>{answer.content}</Text>
              <TouchableOpacity style={styles.voteButton} onPress={() => handleVoteSubmit(answer.id)}>
                <Ionicons name="thumbs-up" size={14} color="#111" />
                <Text style={styles.voteCount}>{answer.votes_count}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Answer Input */}
      <View style={styles.answerInputSection}>
        <Text style={styles.answerInputLabel}>YOUR ANSWER</Text>
        <TextInput
          style={styles.answerInput}
          placeholder="Write your answer here..."
          placeholderTextColor="#bbb"
          multiline
          numberOfLines={5}
          value={answerText}
          onChangeText={setAnswerText}
          editable={!submitting}
          textAlignVertical="top"
        />
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxText}>{error}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmitAnswer}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.submitButtonText}>Submit Answer</Text>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default QuestionDetail

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    backgroundColor: '#fff',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    letterSpacing: -0.3,
  },
  questionSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.6,
    marginBottom: 12,
    lineHeight: 28,
  },
  questionDescription: {
    fontSize: 15,
    color: '#444',
    lineHeight: 23,
    marginBottom: 18,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorChip: {
    backgroundColor: '#111',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  authorChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  date: {
    fontSize: 12,
    color: '#bbb',
    fontWeight: '500',
  },
  answersHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  answersCount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -1,
  },
  answersLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#888',
    letterSpacing: -0.2,
  },
  answersList: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 8,
  },
  answerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  accentLine: {
    width: 3,
    backgroundColor: '#111',
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  answerBody: {
    flex: 1,
    padding: 14,
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  answerUsername: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
  },
  answerContent: {
    fontSize: 14,
    color: '#444',
    lineHeight: 21,
    marginBottom: 12,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  voteCount: {
    fontSize: 13,
    color: '#111',
    fontWeight: '700',
  },
  answerInputSection: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 32,
  },
  answerInputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#aaa',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  answerInput: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111',
    minHeight: 110,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  errorBox: {
    backgroundColor: '#fee',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorBoxText: {
    color: '#c62828',
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#111',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    fontWeight: '600',
  },
})