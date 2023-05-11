"use client";

import { useState } from "react";
import { GodspeedChunk } from "../../types";

import endent from "endent";

export default function Home() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [chunks, setChunks] = useState<GodspeedChunk[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAnswer = async () => {
    setAnswer("");
    const searchResponse = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!searchResponse.ok) {
      return;
    }
    const searchResult: GodspeedChunk[] = await searchResponse.json();
    setChunks(searchResult);

    console.log(searchResult);

    const prompt = endent`
      use the following passages to answer the query: ${query}

      ${searchResult
        .slice(0, 10)
        .map((chunk) => chunk.content)
        .join("\n\n")}
    `;

    console.log({ prompt });

    const answerResponse = await fetch("/api/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!answerResponse.ok) {
      return;
    }

    const data = await answerResponse.body;

    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: _done } = await reader.read();
      done = _done;
      if (value) {
        const chunk = decoder.decode(value);
        setAnswer((prev) => prev + chunk);
      }
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-2xl font-semibold">Godspeed GPT</div>
      <input
        className="p-2 mt-4 outline-none w-[360px] border-zinc-500 border-2"
        type="text"
        placeholder="Ask a question"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        className="p-2 mt-4 text-white rounded-md bg-zinc-500"
        onClick={handleAnswer}
      >
        Submit
      </button>
      <div className="p-2 mt-4 md:w-[60%] w-[90%]">
        <code>{answer}</code>
      </div>
    </div>
  );
}
