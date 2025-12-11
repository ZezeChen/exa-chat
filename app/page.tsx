"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Spinner,
  Card,
  CardBody,
  Button,
  Avatar,
} from "@heroui/react";
import { Sparkles, AlertCircle, Clock, Search } from "lucide-react";
import { SearchResult as SearchResultType, SearchResponse, AnswerResponse } from "@/lib/types";
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
        body: JSON.stringify({ query: searchQuery, numResults: 10 }),
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

  const handleSubmit = useCallback(() => {
    if (!query.trim()) return;
    if (mode === "search") {
      handleSearch(query);
    } else {
      handleAnswer(query);
    }
  }, [mode, query, handleSearch, handleAnswer]);

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
                icon={<Sparkles className="w-6 h-6" />}
                classNames={{
                  base: "bg-primary/10",
                  icon: "text-primary",
                }}
              />
              <h1 className="text-xl font-medium text-default-700">
                {mode === "search" ? "What would you like to search?" : "What would you like to know?"}
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
                          <Search className="w-4 h-4 shrink-0" />
                        ) : (
                          <Sparkles className="w-4 h-4 shrink-0" />
                        )}
                        <p>{message.query}</p>
                      </CardBody>
                    </Card>
                  </div>
                  
                  {/* Response */}
                  <div className="flex justify-start w-full">
                    {message.isLoading ? (
                      <Card className="w-full">
                        <CardBody className="flex flex-row items-center gap-3 p-4">
                          <Spinner size="sm" color="primary" />
                          <p className="text-default-500">
                            {message.mode === "search" ? "Searching the web..." : "Thinking..."}
                          </p>
                        </CardBody>
                      </Card>
                    ) : message.error ? (
                      <Card className="w-full">
                        <CardBody className="p-4">
                          <div className="flex items-center gap-2 text-danger mb-2">
                            <AlertCircle className="w-4 h-4" />
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
                              } else {
                                handleAnswer(message.query);
                              }
                            }}
                          >
                            Try Again
                          </Button>
                        </CardBody>
                      </Card>
                    ) : message.mode === "search" && message.searchResults ? (
                      // Search results
                      <div className="w-full flex flex-col gap-3">
                        {message.autoprompt && (
                          <div className="flex items-center gap-2 text-small text-default-500">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span>
                              Searched for:{" "}
                              <span className="text-foreground font-medium">
                                {message.autoprompt}
                              </span>
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-small text-default-500">
                          <Clock className="w-4 h-4" />
                          <span>Found {message.searchResults.length} results</span>
                        </div>
                        <div className="flex flex-col gap-3">
                          {message.searchResults.map((result, index) => (
                            <SearchResultCard
                              key={result.id}
                              result={result}
                              index={index}
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
