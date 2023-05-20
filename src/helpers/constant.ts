
export type Pages = "chat" | "generate";
export type Routes='/'|'/generate'

export const PageList:Record<Pages,Routes>={
    'chat':'/',
    'generate':'/generate'
}