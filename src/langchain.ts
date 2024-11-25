import { ChatLlamaCpp } from "@langchain/community/chat_models/llama_cpp";
import { HumanMessage } from "@langchain/core/messages";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const llamaPath = path.join(__dirname, "..", ".models", "llama-2-7b-chat.gguf");
export async function LangChain() {
    try {
        console.log('Initializing model...');
        const model = await ChatLlamaCpp.initialize({ 
            modelPath: llamaPath,
            contextSize: 256,      // Минимальный контекст
            threads: 16,           // Максимум потоков
            batchSize: 4096,       // Максимальный batch
            f16Kv: true,
            useMmap: true,
            useMlock: true,
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            gpuLayers: 0          // Отключаем GPU для ускорения на CPU
        });
        
        async function ask(message) {
            console.time('Sending message...');
            const response = await model.invoke([
              new HumanMessage({ content: message }),
            ]);
            console.timeEnd('Sending message...');
            return response;
        };
        ask.model = model;
        return ask;
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
    console.log('Done!');
}
