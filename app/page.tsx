"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Spinner,
  Card,
  CardBody,
  Button,
  Avatar,
  Skeleton,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { SearchResult as SearchResultType, SearchResponse, AnswerResponse, CodeResponse, CodeMessage } from "@/lib/types";
import { SearchResultCard } from "@/components/SearchResultCard";
import { Header } from "@/components/Header";
import { SearchMode } from "@/components/SearchModeToggle";
import { AnswerCard } from "@/components/AnswerCard";
import { PromptInput } from "@/components/PromptInput";
import { SuggestionCards } from "@/components/SuggestionCards";

interface Message {
  id: string;
  query: string;
  mode: SearchMode;
  searchResults?: SearchResultType[];
  autoprompt?: string;
  answer?: AnswerResponse;
  codeAnswer?: CodeResponse;
  error: string | null;
  isLoading: boolean;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("search");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [messages]);

  const handleModeChange = useCallback((newMode: SearchMode) => {
    setMode(newMode);
  }, []);

  const handleSearch = useCallback(async (searchQuery: string) => {
    const messageId = crypto.randomUUID();
    const newMessage: Message = {
      id: messageId,
      query: searchQuery,
      mode: "search",
      error: null,
      isLoading: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setQuery("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, numResults: 8 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Search failed");
      }

      const data: SearchResponse = await response.json();
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { 
                ...msg, 
                searchResults: data.results, 
                autoprompt: data.autopromptString,
                isLoading: false 
              }
            : msg
        )
      );
    } catch (err) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, error: err instanceof Error ? err.message : "An error occurred", isLoading: false }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAnswer = useCallback(async (answerQuery: string) => {
    const messageId = crypto.randomUUID();
    const newMessage: Message = {
      id: messageId,
      query: answerQuery,
      mode: "answer",
      error: null,
      isLoading: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setQuery("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: answerQuery }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get answer");
      }

      const data: AnswerResponse = await response.json();
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, answer: data, isLoading: false }
            : msg
        )
      );
    } catch (err) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, error: err instanceof Error ? err.message : "An error occurred", isLoading: false }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Use ref to access messages without causing re-renders
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  // Build conversation history for code mode context - use ref to avoid dependency
  const getCodeConversationHistory = useCallback((): CodeMessage[] => {
    return messagesRef.current
      .filter(msg => msg.mode === "code" && !msg.isLoading && !msg.error)
      .flatMap(msg => {
        const result: CodeMessage[] = [{ role: "user", content: msg.query }];
        if (msg.codeAnswer) {
          result.push({ role: "assistant", content: msg.codeAnswer.answer });
        }
        return result;
      });
  }, []);

  const handleCode = useCallback(async (codeQuery: string) => {
    const messageId = crypto.randomUUID();
    const newMessage: Message = {
      id: messageId,
      query: codeQuery,
      mode: "code",
      error: null,
      isLoading: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setQuery("");
    setIsLoading(true);

    try {
      // Get conversation history for context
      const conversationHistory = getCodeConversationHistory();

      const response = await fetch("/api/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: codeQuery,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get code answer");
      }

      const data: CodeResponse = await response.json();
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, codeAnswer: data, isLoading: false }
            : msg
        )
      );
    } catch (err) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, error: err instanceof Error ? err.message : "An error occurred", isLoading: false }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [getCodeConversationHistory]);

  const handleSubmit = useCallback(() => {
    if (!query.trim()) return;
    if (mode === "search") {
      handleSearch(query);
    } else if (mode === "answer") {
      handleAnswer(query);
    } else {
      handleCode(query);
    }
  }, [mode, query, handleSearch, handleAnswer, handleCode]);

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setQuery(suggestion);
  }, []);

  const handleViewSearchResults = useCallback((searchQuery: string) => {
    setMode("search");
    handleSearch(searchQuery);
  }, [handleSearch]);

  const hasMessages = messages.length > 0;

  return (
    <div className="h-dvh flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex flex-col w-full max-w-4xl mx-auto overflow-hidden">
        {!hasMessages ? (
          // Initial state - centered content
          <div className="flex-1 flex flex-col justify-center gap-8 px-4 sm:px-6 py-6">
            <div className="flex w-full flex-col items-center justify-center gap-2">
              <Avatar
                size="lg"
                icon={<Icon icon="solar:stars-bold" className="w-6 h-6" />}
                classNames={{
                  base: "bg-primary/10",
                  icon: "text-primary",
                }}
              />
              <h1 className="text-xl font-medium text-default-700">
                {mode === "search" 
                  ? "What would you like to search?" 
                  : mode === "answer" 
                    ? "What would you like to know?"
                    : "What code question do you have?"}
              </h1>
            </div>
            
            <div className="flex justify-center">
              <SuggestionCards mode={mode} onSelect={handleSuggestionSelect} />
            </div>
          </div>
        ) : (
          // Chat view - messages
          <div 
            ref={contentRef}
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-6"
          >
            <div className="flex flex-col gap-8">
              {messages.map((message) => (
                <div key={message.id} className="flex flex-col gap-4">
                  {/* User query */}
                  <div className="flex justify-end">
                    <Card className="max-w-[85%] bg-primary text-primary-foreground">
                      <CardBody className="p-3 flex flex-row items-center gap-2">
                        {message.mode === "search" ? (
                          <Icon icon="solar:magnifer-linear" className="w-4 h-4 shrink-0" />
                        ) : message.mode === "answer" ? (
                          <Icon icon="solar:stars-bold" className="w-4 h-4 shrink-0" />
                        ) : (
                          <Icon icon="solar:code-bold" className="w-4 h-4 shrink-0" />
                        )}
                        <p>{message.query}</p>
                      </CardBody>
                    </Card>
                  </div>
                  
                  {/* Response */}
                  <div className="flex justify-start w-full">
                    {message.isLoading ? (
                      message.mode === "search" ? (
                        // Search loading - skeleton grid
                        <div className="w-full flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <Spinner size="sm" color="primary" />
                            <span className="text-small text-default-500">Searching the web...</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[...Array(4)].map((_, i) => (
                              <Card key={i} shadow="sm">
                                <CardBody className="p-3 gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <Skeleton className="w-4 h-4 rounded" />
                                    <Skeleton className="w-20 h-3 rounded" />
                                  </div>
                                  <Skeleton className="w-full h-4 rounded" />
                                  <Skeleton className="w-3/4 h-4 rounded" />
                                  <Skeleton className="w-full h-3 rounded" />
                                  <Skeleton className="w-2/3 h-3 rounded" />
                                </CardBody>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ) : message.mode === "code" ? (
                        // Code loading
                        <Card className="w-full">
                          <CardBody className="p-4 gap-3">
                            <div className="flex items-center gap-2">
                              <Spinner size="sm" color="primary" />
                              <span className="text-small text-default-500">Generating code...</span>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Skeleton className="w-full h-4 rounded" />
                              <Skeleton className="w-full h-20 rounded" />
                              <Skeleton className="w-3/4 h-4 rounded" />
                            </div>
                          </CardBody>
                        </Card>
                      ) : (
                        // Answer loading
                        <Card className="w-full">
                          <CardBody className="p-4 gap-3">
                            <div className="flex items-center gap-2">
                              <Spinner size="sm" color="primary" />
                              <span className="text-small text-default-500">Thinking...</span>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Skeleton className="w-full h-4 rounded" />
                              <Skeleton className="w-full h-4 rounded" />
                              <Skeleton className="w-3/4 h-4 rounded" />
                            </div>
                          </CardBody>
                        </Card>
                      )
                    ) : message.error ? (
                      <Card className="w-full">
                        <CardBody className="p-4">
                          <div className="flex items-center gap-2 text-danger mb-2">
                            <Icon icon="solar:danger-circle-linear" className="w-4 h-4" />
                            <span className="font-medium">Error</span>
                          </div>
                          <p className="text-default-500">{message.error}</p>
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            className="mt-3"
                            onPress={() => {
                              if (message.mode === "search") {
                                handleSearch(message.query);
                              } else if (message.mode === "answer") {
                                handleAnswer(message.query);
                              } else {
                                handleCode(message.query);
                              }
                            }}
                          >
                            Try Again
                          </Button>
                        </CardBody>
                      </Card>
                    ) : message.mode === "search" && message.searchResults ? (
                      // Search results - two column grid
                      <div className="w-full flex flex-col gap-3">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {message.autoprompt && (
                              <div className="flex items-center gap-1.5 text-small">
                                <Icon icon="solar:stars-bold" className="w-4 h-4 text-primary" />
                                <span className="text-default-500">Searched:</span>
                                <span className="text-foreground font-medium">
                                  {message.autoprompt}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-tiny text-default-400">
                            {message.searchResults.length} results
                          </span>
                        </div>
                        
                        {/* Results grid - 2 columns with equal height */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-fr">
                          {message.searchResults.map((result, index) => (
                            <SearchResultCard
                              key={result.id}
                              result={result}
                              index={index}
                              query={message.query}
                              isFirst={index === 0}
                            />
                          ))}
                        </div>
                      </div>
                    ) : message.mode === "answer" && message.answer ? (
                      // AI Answer
                      <AnswerCard
                        answer={message.answer.answer}
                        citations={message.answer.citations}
                        onViewSearchResults={() => handleViewSearchResults(message.query)}
                      />
                    ) : message.mode === "code" && message.codeAnswer ? (
                      // Code Answer
                      <AnswerCard
                        answer={message.codeAnswer.answer}
                        citations={message.codeAnswer.citations}
                        onViewSearchResults={() => handleViewSearchResults(message.query)}
                        isCodeMode
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Input area - always at bottom */}
        <div className="bg-background px-4 sm:px-6 py-4">
          <div className="flex flex-col gap-2">
            <PromptInput
              value={query}
              onValueChange={setQuery}
              mode={mode}
              onModeChange={handleModeChange}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
            <p className="text-tiny text-default-400 px-2">
              Powered by Exa AI. Results may vary.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
