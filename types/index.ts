import { Document } from "langchain/document";

export enum OpenAIModel {
  DAVINCI_TURBO = "gpt-3.5-turbo",
}

export type GodspeedDoc = {
  title: string;
  url: string;
  date: string;
  content: string;
  tokens: number;
  length: number;
  chunks: GodspeedChunk[];
  metadata?: {};
};

export type GodspeedChunk = {
  doc_title: string;
  doc_url: string;
  doc_date: string;
  content: string;
  content_tokens: number;
  content_length: number;
  embedding: number[];
};

export type GodspeedJSON = {
  title: string;
  url: string;
  content: string;
};

export type SiteMap = {
  url: string;
};

export type Message = {
  type: "apiMessage" | "userMessage";
  message: string;
  isStreaming?: boolean;
  sourceDocs?: Document[];
};
