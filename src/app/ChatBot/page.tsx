"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import Input from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt();

export default function BailReckonerChatBot() {
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const getGroqResponse = async (prompt: string) => {
    const GROQ_API_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
    const GROQ_API_KEY = "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"; // Replace with your Groq API key

    const response = await fetch(GROQ_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-70b-8192", // or llama3-70b-8192
        messages: [
          {
            role: "system",
            content:
              "You are a legal assistant that helps users understand bail laws in India. Answer queries related to the Bail Reckoner.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No response received.";
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = userMessage.trim();
    if (!prompt) return;

    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setUserMessage("");

    try {
      const aiReply = await getGroqResponse(prompt);
      setMessages((prev) => [...prev, { role: "assistant", content: aiReply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Error getting response. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 border rounded-lg shadow-md bg-white">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">
        🧑‍⚖️ AI Advisor For Bail Reckoner 
      </h1>

      <ScrollArea className="h-96 overflow-y-auto px-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`my-2 p-3 rounded-lg text-sm whitespace-pre-wrap text-black ${
              msg.role === "user"
                ? "bg-blue-100 text-right"
                : "bg-gray-100 text-left"
            }`}
            dangerouslySetInnerHTML={{ __html: md.render(msg.content) }}
          />
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>

      <form
        onSubmit={handleSendMessage}
        className="flex items-center mt-4 space-x-2"
      >
        <Input
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Ask something about bail laws..."
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
      </form>
    </div>
  );
}
