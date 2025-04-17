"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

// Define types for question history
interface AnswerHistory {
  questionId: string;  // Format: ${year}-${index}
  year: number;
  index: number;
  discipline?: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  answeredAt: string;
}

interface UserHistoryContextType {
  history: AnswerHistory[];
  addToHistory: (answer: Omit<AnswerHistory, "answeredAt">) => void;
  clearHistory: () => void;
}

const UserHistoryContext = createContext<UserHistoryContextType | undefined>(undefined);

export function UserHistoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useKindeBrowserClient();
  const [history, setHistory] = useState<AnswerHistory[]>([]);

  // Load history from localStorage when component mounts and when user changes
  useEffect(() => {
    if (user) {
      const userId = user.id || user.email;
      const storedHistory = localStorage.getItem(`userAnswerHistory-${userId}`);
      if (storedHistory) {
        try {
          setHistory(JSON.parse(storedHistory));
        } catch (e) {
          console.error("Failed to parse stored history:", e);
          setHistory([]);
        }
      }
    } else {
      // Clear history when user logs out
      setHistory([]);
    }
  }, [user]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (user && history.length > 0) {
      const userId = user.id || user.email;
      localStorage.setItem(`userAnswerHistory-${userId}`, JSON.stringify(history));
    }
  }, [history, user]);

  const addToHistory = (answer: Omit<AnswerHistory, "answeredAt">) => {
    if (!user) return; // Only save history for logged-in users

    setHistory(prev => {
      // Check if this question has been answered before
      const existingIndex = prev.findIndex(item => item.questionId === answer.questionId);
      const newAnswer = {
        ...answer,
        answeredAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        // Replace the existing answer
        const updated = [...prev];
        updated[existingIndex] = newAnswer;
        return updated;
      } else {
        // Add new answer
        return [...prev, newAnswer];
      }
    });
  };

  const clearHistory = () => {
    if (!user) return;

    setHistory([]);
    const userId = user.id || user.email;
    localStorage.removeItem(`userAnswerHistory-${userId}`);
  };

  return (
    <UserHistoryContext.Provider value={{ history, addToHistory, clearHistory }}>
      {children}
    </UserHistoryContext.Provider>
  );
}

export function useUserHistory() {
  const context = useContext(UserHistoryContext);
  if (context === undefined) {
    throw new Error("useUserHistory must be used within a UserHistoryProvider");
  }
  return context;
} 