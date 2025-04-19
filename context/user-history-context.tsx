'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'

// Define types for question history
interface AnswerHistory {
  questionId: string // Format: ${year}-${index}
  year: number
  index: number
  discipline?: string
  selectedAnswer: string
  correctAnswer: string
  isCorrect: boolean
  answeredAt: string
}

interface UserHistoryContextType {
  history: AnswerHistory[]
  loading: boolean
  addToHistory: (answer: Omit<AnswerHistory, 'answeredAt'>) => Promise<void>
  clearHistory: () => Promise<void>
}

const UserHistoryContext = createContext<UserHistoryContextType | undefined>(undefined)

export function UserHistoryProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useKindeBrowserClient()
  const [history, setHistory] = useState<AnswerHistory[]>([])
  const [loading, setLoading] = useState(false)

  // Load history from API when user logs in
  useEffect(() => {
    async function fetchHistory() {
      if (!user || isLoading) return

      setLoading(true)
      try {
        const response = await fetch('/api/history')
        if (!response.ok) throw new Error('Failed to fetch history')

        const data = await response.json()
        setHistory(data.history || [])
      } catch (error) {
        console.error('Error fetching history:', error)
        setHistory([])
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [user, isLoading])

  const addToHistory = async (answer: Omit<AnswerHistory, 'answeredAt'>) => {
    if (!user) return // Only save history for logged-in users

    try {
      const response = await fetch('/api/history/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answer),
      })

      if (!response.ok) throw new Error('Failed to add to history')

      // Refresh history after adding
      const historyResponse = await fetch('/api/history')
      if (!historyResponse.ok) throw new Error('Failed to refresh history')

      const data = await historyResponse.json()
      setHistory(data.history || [])
    } catch (error) {
      console.error('Error adding to history:', error)
    }
  }

  const clearHistory = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/history', {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to clear history')

      setHistory([])
    } catch (error) {
      console.error('Error clearing history:', error)
    }
  }

  return (
    <UserHistoryContext.Provider value={{ history, loading, addToHistory, clearHistory }}>
      {children}
    </UserHistoryContext.Provider>
  )
}

export function useUserHistory() {
  const context = useContext(UserHistoryContext)
  if (context === undefined) {
    throw new Error('useUserHistory must be used within a UserHistoryProvider')
  }
  return context
}
