"use client";

import { useEffect, useRef, useState } from "react";
import { GodspeedChunk } from "../../types";
import { Message } from "postcss";

const BASE_URL = "https://docs.godspeed.systems/sitemap.xml";

const codeRegex = /```([\s\S]+?)```/g;
const linkRegex = /LINK->\s*(.*?)\s*<-LINK/g;
const imageRegex = /IMAGE->\s*!\[(.*?)\]\((.*?)\)\s*<-IMAGE/g;

export default function Home() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [chunks, setChunks] = useState<GodspeedChunk[]>([]);
  const [loading, setLoading] = useState(false);
  // const [code, setCode] = useState<string[]>([]);
  // const [link, setLink] = useState<string[]>([]);
  // const [image, setImage] = useState<{ altText: string; src: string }[]>([]);

  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message: "Hi, what would you like to learn about godspeed",
        type: "apiMessage",
      },
    ],
    history: [],
  });

  const { messages, history, pendingSourceDocs } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");

  function copyFunction(copyText: string) {
    console.log("called...");

    navigator.clipboard.writeText(copyText).then(
      function () {
        console.log("Async: Copying to clipboard was successful!");
      },
      function (err) {
        console.error("Async: Could not copy text: ", err);
      }
    );
  }

  const handleAnswer = async () => {
    setBusy(true);
    setLoading(true);
    setAnswer("");

    const question = query.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: "userMessage",
          message: question,
        },
      ],
    }));

    // setLoading(true);
    // setQuery("");

    try {
      const response = await fetch("/api/langchain-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query.trim(),
          history,
        }),
      });
      const data = await response.json();
      console.log("data", data);

      if (data.error) {
        setError(data.error);
      } else {
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: "apiMessage",
              message: data.text,
              sourceDocs: data.metadata,
            },
          ],
          history: [...state.history, [question, data.text]],
        }));
      }
      console.log("messageState", messageState);

      setLoading(false);

      //scroll to bottom
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    } catch (error) {
      setLoading(false);
      setError("An error occurred while fetching the data. Please try again.");
      console.log("error", error);
    }

    // setCode([]);
    // setLink([]);
    // setImage([]);
    // const searchResponse = await fetch("/api/langchain-chat", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ query }),
    // });

    // if (!searchResponse.ok) {
    //   return;
    // }

    // setAnswer(await searchResponse.json());
    // const searchResult: GodspeedChunk[] = await searchResponse.json();
    // setChunks(searchResult);

    // const prompt = endent`
    //   use the following passages and your own knowledge to answer the query: ${query}

    //   ${searchResult
    //     .slice(0, 10)
    //     .map((chunk) => chunk.content)
    //     .join("\n\n")}
    // `;

    // const answerResponse = await fetch("/api/answer", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ prompt }),
    // });

    // if (!answerResponse.ok) {
    //   return;
    // }

    // const data = await answerResponse.body;

    setLoading(false);
    setBusy(false);

    // if (!data) {
    //   return;
    // }

    // const reader = data.getReader();
    // const decoder = new TextDecoder();
    // let done = false;
    // let answerVal = "";
    // while (!done) {
    //   const { value, done: _done } = await reader.read();
    //   done = _done;
    //   if (value) {
    //     const chunk = decoder.decode(value);
    //     // console.log(chunk);

    //     if (chunk === "CODE") {
    //       console.log("code begins...");
    //     }
    //     answerVal += chunk;
    //     setAnswer((prev) => prev + chunk);
    //   }
    // }

    // setTimeout(() => {
    //   // console.log(answerVal);
    //   let codeMatches = [];
    //   let linkMatches = [];
    //   let imageMatches = [];

    //   let match;

    //   while ((match = codeRegex.exec(answerVal))) {
    //     codeMatches.push(match[1].trim());
    //     // setAnswer((prev) => prev.replace(match[0].trim() as string, ""));
    //     answerVal = answerVal.replace(
    //       match[0],
    //       generateCodeBlock(match[1].trim())
    //     );
    //   }

    //   while ((match = linkRegex.exec(answerVal))) {
    //     linkMatches.push(match[1].trim());
    //     answerVal = answerVal.replace(match[0], "");
    //   }

    //   while ((match = imageRegex.exec(answerVal))) {
    //     const [, altText, src] = match;
    //     imageMatches.push({ altText: altText.trim(), src: src.trim() });
    //     answerVal = answerVal.replace(match[0], "");
    //   }

    // console.log("Code matches:", codeMatches);
    // console.log("Link matches:", linkMatches);
    // console.log("Image matches:", imageMatches);

    // setCode(codeMatches);
    // setLink(linkMatches);
    // setImage(imageMatches);

    // console.log({ answerVal });
    // setAnswer(answerVal);
    //   setBusy(false);
    // }, 1);
  };

  function getAnswer() {
    return {
      __html: answer,
    };
  }

  function generateCodeBlock(content: string) {
    return `<pre class="flex flex-col mt-4 font-mono leading-none bg-zinc-800">
        <div 
          class="copy-code p-2 text-sm font-thin text-right text-white cursor-pointer bg-zinc-600"
        >Code</div>
        <code class="w-full p-4 overflow-scroll text-white flex-1 leading-2">${content}</code>
      </pre>`;
  }

  useEffect(() => {
    const copyEle = document.getElementsByClassName("copy-code");

    if (copyEle) {
      // copyEle.map((ele) => {

      for (let i = 0; i < copyEle.length; i++) {
        const ele = copyEle[i];
        ele.addEventListener("click", () => {
          const code = ele.nextElementSibling?.textContent;
          if (code) {
            copyFunction(code);
          }
        });
      }
    }

    return () => {
      // cleanup remove event listeners
    };
  }, [busy]);

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
          className="p-2 mt-4 text-white bg-red-400 rounded-md disabled:bg-slate-300"
          onClick={handleAnswer}
          disabled={busy}
        >
          Ask
        </button>
      </div>
      <div>
        {messages.map((message, index) => (
          <div key={index} className="mt-4 text-xl font-semibold">
            {message.message}
          </div>
        ))}
        {pendingSourceDocs?.map((doc, index) => (
          <div key={index} className="mt-4 text-xl font-semibold">
            {doc.title}
          </div>
        ))}
      </div>
      {error && (
        <div className="p-4 border border-red-400 rounded-md">
          <p className="text-red-500">{error}</p>
        </div>
      )}
      {/* <div className="flex flex-row items-start w-[90%] center space-x-4">
        <div className="p-2 mt-4  w-[80%] overflow-auto">
          <pre
            className="font-mono whitespace-break-spaces"
            dangerouslySetInnerHTML={getAnswer()}
          ></pre>
          {loading && <div>Loading...</div>}

          {link.length ? (
            <div className="mt-4 text-xl font-semibold underline">
              Related Links
            </div>
          ) : (
            ""
          )}
          {link?.map((link, index) => (
            <a
              key={link + index}
              href={BASE_URL + link}
              className="flex p-2 text-blue-500 underline"
            >
              {link}
            </a>
          ))}
          {image?.map(({ altText, src }, index) => (
          <div key={src + index}>
            <Image alt={altText} src={src} />
          </div>
        ))}
        </div>
        {chunks.length ? (
          <div className="  w-[20%]">
            <div className="text-xl font-semibold underline">
              Related Documentation
            </div>
            <div className="overflow-auto">
              {chunks.slice(0, 10).map((chunk) => (
                <div key={chunk.doc_url} className="mt-4">
                  <a
                    href={chunk.doc_url}
                    target="_blank"
                    className="text-sm text-blue-500 underline"
                  >
                    {chunk.doc_title}
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : (
          ""
        )}
      </div> */}
    </div>
  );
}
