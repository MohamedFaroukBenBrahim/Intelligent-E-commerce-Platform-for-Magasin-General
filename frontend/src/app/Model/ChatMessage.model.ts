export interface ChatMessage{
    message:string;  
    context: 'jobs' | 'products' | 'general';
    role: 'user' | 'assistant';
}