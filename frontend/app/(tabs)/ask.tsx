import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import api from '../utils/api'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'

interface Question {
  id: string
  username: string
  title: string
  description: string
  created_at: string
  answers: any[]
}

const Ask = () => {

  const [query, setQuery] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await searchQuestions()
    setRefreshing(false)
  }

  const searchQuestions = async () => {
    if (!query.trim()) return

    try {
      setLoading(true)

      const url = query
      ? `/api/questions/?q=${query}`
      : `/api/questions/`

      const res = await api.get(url)

      const data = Array.isArray(res.data) ? res.data : res.data.results
      setQuestions(data)

      setError(null)
    } catch (err) {
      console.error(err)
      setError("Search failed")
    } finally {
      setLoading(false)
    }
  }

  const renderQuestion = ({ item }: { item: Question }) => (
    <TouchableOpacity
      style={styles.questionCard}
      onPress={() =>
        router.push({
          pathname: "/question/[id]",
          params: { id: item.id }
        })
      }
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text numberOfLines={2} style={styles.description}>
        {item.description}
      </Text>

      <View style={styles.meta}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={28} color="#111" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Search</Text>
              <View style={{ width: 28 }} />
            </View>

      {/* Search Box */}
      <TextInput
        placeholder="Search questions..."
        value={query}
        onChangeText={setQuery}
        style={styles.searchInput}
        onSubmitEditing={searchQuestions}
      />

      {/* Loader */}
      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      {/* Error */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Results */}
      <FlatList
          data={questions}
          renderItem={renderQuestion}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12 }}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />

    </SafeAreaView>
  )
}

export default Ask

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  searchInput: {
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    fontSize: 15,
    color: "#111",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  questionCard: {
    padding: 16,
    marginBottom: 10,
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
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  description: {
    color: "#777",
    fontSize: 13,
    lineHeight: 18,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  username: {
    color: "#111",
    fontSize: 12,
    fontWeight: "700",
  },
  date: {
    color: "#bbb",
    fontSize: 11,
    fontWeight: "500",
  },
  error: {
    color: "#c62828",
    textAlign: "center",
    marginTop: 10,
    fontWeight: "600",
    fontSize: 14,
  },
});