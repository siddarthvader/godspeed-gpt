"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { Message } from "../../types";

const codeRegex = /```([\s\S]+?)```/g;
export default function Home() {
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(false);

  const [messageState, setMessageState] = useState<{
    messages: Message[];
    history: [string, string][];
  }>({
    messages: [
      {
        message: "Hi, what would you like to learn about godspeed",
        type: "apiMessage",
      },
    ],
    history: [],
  });

  const { messages, history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");

  function copyFunction(copyText: string) {
    // console.log("called...");

    navigator.clipboard.writeText(copyText).then(
      function () {
        console.log("Async: Copying to clipboard was successful!");
      },
      function (err) {
        console.error("Async: Could not copy text: ", err);
      }
    );
  }

  const handleEnter = (e: any) => {
    if (e.key === "Enter" && query) {
      handleAnswer(e);
    } else if (e.key == "Enter") {
      e.preventDefault();
    }
  };

  const handleAnswer = async () => {
    setBusy(true);
    setLoading(true);
    setQuery("");
    setError("");

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
      // console.log("data", data);
      setLoading(false);

      if (data.error) {
        setError(data.error);
      } else {
        console.log("messageState", messageState);

        let match;
        let codeMatches = [];
        let answerVal = data.text;
        while ((match = codeRegex.exec(data.text))) {
          codeMatches.push(match[1].trim());
          answerVal = answerVal.replace(
            match[0],
            generateCodeBlock(match[1].trim())
          );
        }
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: "apiMessage",
              message: answerVal,
              sourceDocs: data.sourceDocuments,
            },
          ],
          history: [...state.history, [question, data.text]],
        }));
      }

      //scroll to bottom
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    } catch (error) {
      setLoading(false);
      setError("An error occurred while fetching the data. Please try again.");
      console.log("error", error);
    }

    setBusy(false);
    setLoading(false);
  };

  function getAnswer(message: string) {
    return {
      __html: message,
    };
  }

  function generateCodeBlock(content: string) {
    return `<pre class="flex flex-col mt-4 font-sans text-sm leading-none bg-zinc-800">
        <div 
          class="copy-code p-2 text-sm font-semibold text-right text-white cursor-pointer bg-zinc-600"
        >Copy</div>
        <code class="w-full p-4 overflow-scroll text-white flex-1 leading-2 font-mono">${content}</code>
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

  useEffect(() => {
    textAreaRef.current?.focus();
    messageListRef?.current?.scrollTo(0, messageListRef.current.scrollHeight);
  }, [loading, query]);

  return (
    <div className="flex flex-col items-center justify-start h-full p-4 ">
      <div className="text-2xl font-semibold">Godspeed GPT</div>
      <hr className="w-full h-0.5 my-4 border-t-0 opacity-100 bg-red-400" />

      <div className="flex-1 w-[80%] h-full overflow-auto" ref={messageListRef}>
        {messages?.map((message, index) => (
          <div key={"message_container_" + index}>
            <div
              key={"message_" + index}
              className="flex flex-col p-2 my-2 text-sm"
            >
              <div className="flex items-center">
                {message.type === "apiMessage" ? (
                  <Image
                    src="/bot-image.png"
                    alt="AI"
                    width={24}
                    height={24}
                    priority
                  />
                ) : (
                  <Image
                    key={"usermessage_" + index}
                    src="/usericon.png"
                    alt="AI"
                    width={24}
                    height={24}
                    priority
                  />
                )}
                <pre
                  key={"pre_" + index}
                  className={
                    "ml-2 font-sans text-sm whitespace-break-spaces " +
                    (message.type !== "apiMessage"
                      ? "text-black"
                      : "text-zinc-700")
                  }
                  dangerouslySetInnerHTML={getAnswer(message.message)}
                ></pre>
              </div>

              <div className="flex flex-col">
                <div className="mt-4 font-semibold text-red-600 ml-[20px] underline">
                  {message?.sourceDocs ? " Verified Sources" : ""}
                </div>
                <div className="flex space-x-2">
                  {message?.sourceDocs?.slice(0, 4).map((doc, dindex) => (
                    <a
                      target="_blank"
                      key={"sourcedacs_" + dindex}
                      className="ml-2 text-zinc-600 hover:text-red-600 hover:underline no-underline max-w-[200px] border-[1px] underline-no border-transparent hover:border-red-600 p-2 overflow-hidden truncate rounded-xl shadow-sm"
                      href={doc.metadata.source}
                    >
                      {dindex + 1}. {doc.metadata.source}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <hr
              key={"divider_" + index}
              className="w-full h-[0.25px] my-1 border-t-0 opacity-100 bg-red-300"
            />
          </div>
        ))}
      </div>
      <div className="flex items-center space-x-2 w-[80%]">
        <input
          ref={textAreaRef}
          className="p-2 mt-4 outline-none w-[90%] focus:border-red-500 border-2 border-zinc-300"
          type="text"
          placeholder="Ask a question about Godspeed"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleEnter}
        />
        {loading ? (
          <button
            disabled
            type="button"
            className="inline-flex items-center p-2 mt-4 text-sm font-medium text-red-500 bg-white border border-gray-200 rounded-lg"
          >
            <svg
              aria-hidden="true"
              role="status"
              className="inline w-4 h-4 mr-3 text-red-200 animate-spin"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="#1C64F2"
              />
            </svg>
            Loading...
          </button>
        ) : (
          <button
            className="p-2 mt-4 text-white bg-red-400 rounded-md disabled:bg-slate-300"
            onClick={handleAnswer}
            disabled={busy}
          >
            Ask
          </button>
        )}
      </div>
      {error && (
        <div className="p-4 border border-red-400 rounded-md">
          <p className="text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
}
