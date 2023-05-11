"use client";

import { useState } from "react";
import { GodspeedChunk } from "../../types";

import endent from "endent";
import Image from "next/image";

const codeRegex = /CODE->([\s\S]+?)<-CODE/g;
const linkRegex = /LINK->\s*(.*?)\s*<-LINK/g;
const imageRegex = /IMAGE->\s*!\[(.*?)\]\((.*?)\)\s*<-IMAGE/g;

export default function Home() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [chunks, setChunks] = useState<GodspeedChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string[]>([]);
  const [link, setLink] = useState<string[]>([]);
  const [image, setImage] = useState<{ altText: string; src: string }[]>([]);

  const handleAnswer = async () => {
    setLoading(true);
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

    // console.log(searchResult);

    const prompt = endent`
      use the following passages to answer the query: ${query}

      ${searchResult
        .slice(0, 10)
        .map((chunk) => chunk.content)
        .join("\n\n")}
    `;

    // console.log({ prompt });

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
    let answerVal = "";
    while (!done) {
      const { value, done: _done } = await reader.read();
      done = _done;
      if (value) {
        const chunk = decoder.decode(value);
        // console.log(chunk);
        answerVal += chunk;
        setAnswer((prev) => prev + chunk);
      }
    }

    setLoading(false);

    setTimeout(() => {
      console.log(answerVal);
      let codeMatches = [];
      let linkMatches = [];
      let imageMatches = [];

      let match;

      while ((match = codeRegex.exec(answerVal))) {
        codeMatches.push(match[1].trim());
      }

      while ((match = linkRegex.exec(answerVal))) {
        linkMatches.push(match[1].trim());
      }

      while ((match = imageRegex.exec(answerVal))) {
        const [, altText, src] = match;
        imageMatches.push({ altText: altText.trim(), src: src.trim() });
      }

      console.log("Code matches:", codeMatches);
      console.log("Link matches:", linkMatches);
      console.log("Image matches:", imageMatches);

      setCode(codeMatches);
      setLink(linkMatches);
      setImage(imageMatches);
    }, 1);
  };

  function copyFunction(copyText: string) {
    const textArea = document.createElement("textarea");
    textArea.className = "hidden";
    textArea.textContent = copyText;
    document.body.append(textArea);
    textArea.select();
    document.execCommand("copy");
  }
  return (
    <div className="flex flex-col items-center justify-start h-full p-4 ">
      <div className="text-2xl font-semibold">Godspeed GPT</div>
      <div className="flex items-center space-x-2">
        <input
          className="p-2 mt-4 outline-none w-[360px] border-zinc-500 border-2"
          type="text"
          placeholder="Ask a question"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="p-2 mt-4 text-white bg-green-400 rounded-md"
          onClick={handleAnswer}
        >
          Ask
        </button>
      </div>

      <div className="p-2 mt-4 md:w-[60%] w-[90%] overflow-auto">
        <div>{answer}</div>
        {loading && <div>Loading...</div>}

        {code?.map((code, index) => (
          <pre key={code + index} className="flex flex-col mt-4 bg-zinc-800">
            <div
              className="p-1 text-sm font-thin text-right text-white cursor-pointer bg-zinc-600"
              onClick={(e) => copyFunction(code)}
            >
              Copy
            </div>
            <code className="p-4 text-white">{code}</code>
          </pre>
        ))}
        {link?.map((link, index) => (
          <a key={link + index} href={link}>
            link
          </a>
        ))}

        {/* {image?.map(({ altText, src }, index) => (
          <div key={src + index}>
            <Image alt={altText} src={src} />
          </div>
        ))} */}
      </div>
    </div>
  );
}
