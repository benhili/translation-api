import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import 'dotenv/config';
import jsonAutocomplete from "json-autocomplete";

const client = new OpenAI();

const TranslationSchema = z.object({
    englishTranslation: z.string(),
    chunks: z.array(z.object({
        text: z.string().max(100),
        meaning: z.string().max(500),
        // reading: z.string().max(100),
    })),
});

const systemInstruction = `
You are an assistant to language learners, helping them understand Japanese sentences by breaking them down into chunks and explaining each chunk in English.

Break down the supplied sentence into meaningful, contiguous chunks.

Each chunk should be SMALL, meaningful groupings of words or characters.

For grammar and particles, provide a brief explanation of their function in the sentence do not use a generic definition.

DO NOT OUTPUT readings, brackets, or romaji/pinyin/furigana/pronunciations of any kind.

Ignore full stops eg never make a chunk like this: {text: "。"meaning: "End of the first sentence."}

'Meaning' MUST be markedly different from 'chunk' text (reworded, definition, synonyms, etc.).

EXAMPLE:
input: "イスラエルがイランを攻撃しました"
output: {
    englishTranslation: "Israel attacked Iran.",
    chunks: [
        {text: "イスラエル", meaning: "Israel", reading: "いすらえる"},
        {text: "が", meaning: "Indicates that 'イスラエル' is the one performing the action.", reading: null},
        {text: "攻撃", meaning: "attack", reading: "こうげき"},
        {text: "イラン", meaning: "Iran", reading: "いらん"},
        {text: "を", meaning: "Indicates that 'イラン' is the target of the action.", reading: null},
        {text: "しました", meaning: "Did (past tense of する - suru, "to do") This is the conjugated verb that makes "攻撃" into an action that was performed. "攻撃しました" collectively means "attacked.", reading: "しました"}
    ]
}

input: "イランのメディアは、首都テヘランで女性や子どもが、亡くなったりけがをしたりしたと言いました"
output: {
    englishTranslation: Iran's media said that women and children died or were injured in the capital city, Tehran.
    chunks: [
        {text: "イランのメディア", meaning: "Iran's media の is a possessive particle, indicating that the media belongs to Iran."},
        {text: "は", meaning: "Topic marker, indicates that 'イランのメディア' is the topic of the sentence."},
        {text: "首都", meaning: "capital city"},
        {text: "テヘラン", meaning: "Tehran"},
        {text: "で", meaning: "Particle indicating テヘラン as the place of action."},
        {text: "女性や子ども", meaning: "women and children や is a particle used to indicate a non-exhaustive list, similar to 'and' in English."},
        {text: "が", meaning: "Subject marker, indicates that '女性や子ども' are the ones performing the action or being described."},
        {text: "亡くなったり", meaning: "died, passed away (past tense of 亡くなる) たり is a particle used to indicate a non-exhaustive list of actions, similar to 'or' in English."},
        {text: "けがをしたり", meaning: "injured (past tense of けがをする) たり shows this is listed along with なくなったり"},
        {text: "言いました", meaning: "said (past tense of 言う)"}
    ]
`;

export async function* translateStream(inputText: string) {
    const stream = client.responses.stream({
        model: "gpt-4o-mini",
        input: [
            { role: "system", content: systemInstruction },
            { role: "user", content: inputText }
        ],
        text: {
            format: zodTextFormat(TranslationSchema, "event"),
        },
    });

    for await (const event of stream) {
        if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
            yield event.delta;
        }
    }
}
