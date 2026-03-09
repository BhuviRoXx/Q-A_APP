import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import api from '../utils/api'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

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

  // Modal state
  const [modalVisible, setModalVisible] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useFocusEffect(
    React.useCallback(() => {
      fetchQuestions()
    }, [])
  )

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/questions/')
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

  const handlePostQuestion = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Please enter a title.')
      return
    }
    if (!description.trim()) {
      Alert.alert('Validation', 'Please enter a description.')
      return
    }

    try {
      setSubmitting(true)
      await api.post('/api/questions/', { title: title.trim(), description: description.trim() })
      setTitle('')
      setDescription('')
      setModalVisible(false)
      fetchQuestions()
    } catch (err) {
      console.error(err)
      Alert.alert('Error', 'Failed to post question. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    setTitle('')
    setDescription('')
    setModalVisible(false)
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centered}>
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={questions}
        renderItem={renderQuestion}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Ask Question Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalSheet}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCloseModal}>
                <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Ask a Question</Text>
              <TouchableOpacity
                onPress={handlePostQuestion}
                disabled={submitting}
                style={[styles.postButton, submitting && styles.postButtonDisabled]}
              >
                {submitting
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.postButtonText}>Post</Text>
                }
              </TouchableOpacity>
            </View>

            {/* Inputs */}
            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor="#bbb"
              value={title}
              onChangeText={setTitle}
              maxLength={150}
              returnKeyType="next"
            />
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Describe your question..."
              placeholderTextColor="#bbb"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  )
}

export default home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    letterSpacing: -0.3,
  },
  listContent: {
    padding: 16,
    gap: 10,
    paddingBottom: 100, // space so FAB doesn't overlap last card
  },
  questionCard: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e8e8e8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  stats: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: "#f0f0f0",
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: "#aaa",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 13,
    color: "#777",
    lineHeight: 18,
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    fontSize: 12,
    color: "#111",
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  date: {
    fontSize: 11,
    color: "#bbb",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 15,
    color: "#c62828",
    textAlign: "center",
    fontWeight: "600",
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    letterSpacing: -0.2,
  },
  postButton: {
    backgroundColor: '#111',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111',
    backgroundColor: '#fafafa',
  },
  inputMultiline: {
    minHeight: 120,
    paddingTop: 12,
  },
})