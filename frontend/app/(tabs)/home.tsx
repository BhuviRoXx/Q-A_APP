import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import api from '../utils/api'
import { router } from 'expo-router'

interface Question {
  id: string
  user: string
  username: string
  title: string
  description: string
  created_at: string
  answers: Array<{
    id: string
    user: string
    username: string
    content: string
    created_at: string
    votes_count: number
  }>
}

const home = () => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useFocusEffect(
    React.useCallback(() => {
      fetchQuestions()
    }, [])
  )

const fetchQuestions = async () => {
  try {
    setLoading(true)
    const response = await api.get('/api/questions')
    // Check if response.data is an array or an object with results
    const questionsData = Array.isArray(response.data) ? response.data : response.data.results
    setQuestions(questionsData)
    setError(null)
  } catch (err) {
    setError('Failed to load questions')
    console.error(err)
  } finally {
    setLoading(false)
  }
}

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  const renderQuestion = ({ item }: { item: Question }) => (
    <TouchableOpacity 
      style={styles.questionCard}
      onPress={() => router.push({ pathname: '/question/[id]', params: { id: item.id } })}
    >
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{item.answers.length}</Text>
          <Text style={styles.statLabel}>answers</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.username}</Text>
          <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={questions}
        renderItem={renderQuestion}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  )
}

export default home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 12,
  },
  questionCard: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  stats: {
    justifyContent: 'center',
    marginRight: 16,
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    marginVertical: 4,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
})