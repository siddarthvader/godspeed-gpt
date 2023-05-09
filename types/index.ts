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
  current_date: string;
  author: string;
  url: string;
  tokens: number;
  docs: GodspeedDoc[];
  length: number;
};

export type SiteMap = {
  url: string;
};
