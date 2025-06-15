import Fastify from 'fastify'
import { translateStream } from './translation'
import cors from '@fastify/cors'

const fastify = Fastify({
    logger: true
})

fastify.register(cors, {
    origin: true,
    allowedHeaders: ['Content-Type'],
    methods: ['GET', 'POST', 'OPTIONS']
})

fastify.addHook('onSend', (request, reply, payload, done) => {
    reply.header('Access-Control-Allow-Private-Network', 'true');
    done();
});

fastify.get('/', async function handler() {
    return { hello: 'world' }
})

type TranslateBody = {
    translationText: string
}

type Chunk = {
    text: string
    meaning: string
}

type Translation = {
    englishTranslation: string
    chunks: Chunk[]
}

// Stream the translation response with a delay between chunks
fastify.post('/translate', async function handler(request, reply) {
    reply.raw.setHeader('Access-Control-Allow-Origin', '*');
    reply.raw.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    reply.raw.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    reply.raw.setHeader('Access-Control-Allow-Private-Network', 'true');
    reply.raw.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    reply.raw.setHeader('Transfer-Encoding', 'chunked');

    const { translationText } = request.body as { translationText: string };

    for await (const partial of translateStream(translationText)) {
        reply.raw.write(partial);
    }

    reply.raw.end();
});

try {
    fastify.listen({ port: 3000 })
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}