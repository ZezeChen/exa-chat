"use client";

import { useState, useCallback } from "react";
import {
  Input,
  Button,
  Chip,
  Spinner,
  Card,
  CardBody,
  Divider,
} from "@heroui/react";
import { Search, Sparkles, AlertCircle, Clock } from "lucide-react";
import { SearchResult as SearchResultType, SearchResponse, AnswerResponse } from "@/lib/types";
import { SearchResultCard } from "@/components/SearchResultCard";
import { Header } from "@/components/Header";
import { EmptyState } from "@/components/EmptyState";
import { SearchModeToggle, SearchMode } from "@/components/SearchModeToggle";
import { AnswerCard } from "@/components/AnswerCard";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [autoprompt, setAutoprompt] = useState<string | null>(null);
  
  // Answer mode state
  const [mode, setMode] = useState<SearchMode>("search");
  const [answerData, setAnswerData] = useState<AnswerResponse | null>(null);

  const handleSearch = useCallback(async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setAnswerData(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, numResults: 10 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Search failed");
      }

      const data: SearchResponse = await response.json();
      setResults(data.results);
      setAutoprompt(data.autopromptString || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handleAnswer = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setResults([]);
    setAutoprompt(null);

    try {
      const response = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get answer");
      }

      const data: AnswerResponse = await response.json();
      setAnswerData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setAnswerData(null);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (mode === "search") {
        handleSearch();
      } else {
        handleAnswer();
      }
    }
  };

  const handleViewSearchResults = useCallback(() => {
    setMode("search");
    handleSearch(query);
  }, [query, handleSearch]);

  const searchSuggestions = [
    "Latest AI news",
    "React best practices",
    "Climate change solutions",
  ];

  const answerSuggestions = [
    "What is machine learning?",
    "How does React work?",
    "Why is the sky blue?",
  ];

  const suggestions = mode === "search" ? searchSuggestions : answerSuggestions;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {!hasSearched ? (
          <div className="flex flex-col items-center justify-center min-h-[65vh] gap-8">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-2xl bg-primary/10">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-center">
                <span className="text-primary">Exa</span>{" "}
                <span className="text-foreground">Search</span>
              </h1>
              <p className="text-default-500 text-base sm:text-lg text-center max-w-md">
                AI-powered search engine that finds exactly what you need
              </p>
            </div>

            <Card className="w-full max-w-2xl" shadow="lg">
              <CardBody className="p-5 sm:p-6 gap-4">
                <div className="flex justify-center">
                  <SearchModeToggle mode={mode} onModeChange={setMode} />
                </div>
                <div className="flex flex-row gap-3 items-center">
                  <Input
                    value={query}
                    onValueChange={setQuery}
                    onKeyDown={handleKeyDown}
                    placeholder={mode === "search" ? "Search anything..." : "Ask a question..."}
                    radius="lg"
                    size="lg"
                    isClearable
                    onClear={() => setQuery("")}
                    startContent={
                      <Search className="w-5 h-5 text-default-400 shrink-0" />
                    }
                  />
                  <Button
                    color="primary"
                    size="lg"
                    radius="lg"
                    className="font-semibold px-8 h-12 shrink-0"
                    onPress={() => mode === "search" ? handleSearch() : handleAnswer()}
                    isLoading={isLoading}
                  >
                    {mode === "search" ? "Search" : "Ask"}
                  </Button>
                </div>

                <Divider />

                <div className="flex flex-wrap gap-2 justify-center items-center">
                  <span className="text-small text-default-400">Try:</span>
                  {suggestions.map((suggestion) => (
                    <Chip
                      key={suggestion}
                      variant="flat"
                      color="default"
                      className="cursor-pointer"
                      onClick={() => setQuery(suggestion)}
                    >
                      {suggestion}
                    </Chip>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <Card shadow="md">
              <CardBody className="p-4 gap-3">
                <div className="flex justify-center">
                  <SearchModeToggle mode={mode} onModeChange={setMode} />
                </div>
                <div className="flex flex-row gap-3 items-center">
                  <Input
                    value={query}
                    onValueChange={setQuery}
                    onKeyDown={handleKeyDown}
                    placeholder={mode === "search" ? "Search anything..." : "Ask a question..."}
                    radius="lg"
                    size="md"
                    isClearable
                    onClear={() => setQuery("")}
                    classNames={{
                      base: "flex-1",
                    }}
                    startContent={
                      <Search className="w-4 h-4 text-default-400 shrink-0" />
                    }
                  />
                  <Button
                    color="primary"
                    size="lg"
                    radius="lg"
                    className="font-semibold px-6 h-10 shrink-0"
                    onPress={() => mode === "search" ? handleSearch() : handleAnswer()}
                    isLoading={isLoading}
                  >
                    {mode === "search" ? "Search" : "Ask"}
                  </Button>
                </div>
              </CardBody>
            </Card>

            {autoprompt && (
              <div className="flex items-center gap-2 text-small text-default-500 px-1">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>
                  Searched for:{" "}
                  <span className="text-foreground font-medium">
                    {autoprompt}
                  </span>
                </span>
              </div>
            )}

            {isLoading ? (
              <Card>
                <CardBody className="flex flex-col items-center justify-center py-20 gap-4">
                  <Spinner size="lg" color="primary" />
                  <p className="text-default-500">
                    {mode === "search" ? "Searching the web..." : "Getting answer..."}
                  </p>
                </CardBody>
              </Card>
            ) : error ? (
              <Card>
                <CardBody className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="p-4 rounded-full bg-danger/10">
                    <AlertCircle className="w-8 h-8 text-danger" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-danger mb-2">
                      {mode === "search" ? "Search Error" : "Answer Error"}
                    </h3>
                    <p className="text-default-500 mb-4">{error}</p>
                    <div className="flex gap-3 justify-center flex-wrap">
                      <Button
                        color="primary"
                        variant="flat"
                        onPress={() => mode === "search" ? handleSearch() : handleAnswer()}
                      >
                        Try Again
                      </Button>
                      {mode === "answer" && (
                        <Button
                          color="default"
                          variant="flat"
                          startContent={<Search className="w-4 h-4" />}
                          onPress={handleViewSearchResults}
                        >
                          View Search Results
                        </Button>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ) : mode === "answer" && answerData ? (
              answerData.answer && answerData.answer.trim() ? (
                <AnswerCard
                  answer={answerData.answer}
                  citations={answerData.citations}
                  onViewSearchResults={handleViewSearchResults}
                />
              ) : (
                <Card>
                  <CardBody className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="p-4 rounded-full bg-warning/10">
                      <Sparkles className="w-8 h-8 text-warning" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        No Answer Available
                      </h3>
                      <p className="text-default-500 mb-4">
                        Unable to generate an answer for this question. Try rephrasing or ask a different question.
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button
                          color="primary"
                          variant="flat"
                          onPress={handleAnswer}
                        >
                          Try Again
                        </Button>
                        <Button
                          color="default"
                          variant="flat"
                          startContent={<Search className="w-4 h-4" />}
                          onPress={handleViewSearchResults}
                        >
                          View Search Results
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )
            ) : mode === "search" && results.length === 0 ? (
              <EmptyState query={query} />
            ) : mode === "search" && results.length > 0 ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-small text-default-500 px-1">
                  <Clock className="w-4 h-4" />
                  <span>Found {results.length} results</span>
                </div>

                <div className="flex flex-col gap-3">
                  {results.map((result, index) => (
                    <SearchResultCard
                      key={result.id}
                      result={result}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
