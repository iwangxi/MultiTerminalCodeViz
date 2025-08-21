import { useState, useEffect } from 'react';
import type { CustomTerminalContent, TerminalLine } from '../data/terminalOutputs';

const STORAGE_KEY = 'customTerminalContents';

/**
 * Hook for managing custom terminal content
 * Provides CRUD operations with localStorage persistence
 */
export function useCustomTerminalContent() {
  const [customContents, setCustomContents] = useState<CustomTerminalContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load custom contents from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const contents = parsed.map((content: any) => ({
          ...content,
          createdAt: new Date(content.createdAt)
        }));
        setCustomContents(contents);
      }
    } catch (error) {
      console.error('Failed to load custom terminal contents:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever contents change
  const saveToStorage = (contents: CustomTerminalContent[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contents));
    } catch (error) {
      console.error('Failed to save custom terminal contents:', error);
    }
  };

  // Create a new custom content
  const createCustomContent = (name: string, lines: TerminalLine[]): CustomTerminalContent => {
    const newContent: CustomTerminalContent = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      lines,
      createdAt: new Date()
    };

    const updatedContents = [...customContents, newContent];
    setCustomContents(updatedContents);
    saveToStorage(updatedContents);
    
    return newContent;
  };

  // Update existing custom content
  const updateCustomContent = (id: string, updates: Partial<Omit<CustomTerminalContent, 'id' | 'createdAt'>>) => {
    const updatedContents = customContents.map(content =>
      content.id === id ? { ...content, ...updates } : content
    );
    setCustomContents(updatedContents);
    saveToStorage(updatedContents);
  };

  // Delete custom content
  const deleteCustomContent = (id: string) => {
    const updatedContents = customContents.filter(content => content.id !== id);
    setCustomContents(updatedContents);
    saveToStorage(updatedContents);
  };

  // Get custom content by ID
  const getCustomContent = (id: string): CustomTerminalContent | undefined => {
    return customContents.find(content => content.id === id);
  };

  // Get all custom content names for selection
  const getCustomContentOptions = () => {
    return customContents.map(content => ({
      id: content.id,
      name: content.name,
      linesCount: content.lines.length,
      createdAt: content.createdAt
    }));
  };

  // Create default custom content if none exists
  const createDefaultContent = () => {
    if (customContents.length === 0) {
      const defaultLines: TerminalLine[] = [
        { text: "user@localhost:~$ ", color: "command", delay: 0 },
        { text: "echo 'Welcome to my custom terminal!'", color: "primary", delay: 100 },
        { text: "Welcome to my custom terminal!", color: "success", delay: 200 },
        { text: "user@localhost:~$ ", color: "command", delay: 300 },
        { text: "ls -la", color: "primary", delay: 100 },
        { text: "total 8", color: "muted", delay: 200 },
        { text: "drwxr-xr-x  3 user user 4096 Jan 15 10:30 .", color: "info", delay: 100 },
        { text: "drwxr-xr-x  5 user user 4096 Jan 15 10:25 ..", color: "info", delay: 100 },
        { text: "-rw-r--r--  1 user user  220 Jan 15 10:30 .bashrc", color: "primary", delay: 100 },
        { text: "-rw-r--r--  1 user user  807 Jan 15 10:30 .profile", color: "primary", delay: 100 },
        { text: "user@localhost:~$ ", color: "command", delay: 300 }
      ];
      
      return createCustomContent("Default Custom Terminal", defaultLines);
    }
    return customContents[0];
  };

  return {
    customContents,
    isLoading,
    createCustomContent,
    updateCustomContent,
    deleteCustomContent,
    getCustomContent,
    getCustomContentOptions,
    createDefaultContent
  };
}
