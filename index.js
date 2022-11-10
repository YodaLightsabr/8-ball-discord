import fetch from 'node-fetch';
import dotenv from 'dotenv';
import Discord from 'discord.js';
import Stump from 'stump.js';

const c = (str) => "\x1b[1;36m" + str + "\x1b[0m";

dotenv.config();
const stump = new Stump(['Timestamps', 'Debug']);

const [
    info,
    warn,
    error,
    debug,
    success
] = [
    stump.info.bind(stump),
    stump.warn.bind(stump),
    stump.error.bind(stump),
    stump.debug.bind(stump),
    
    stump.success.bind(stump)
];
const client = new Discord.Client({ intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildMembers
] });

client.once('ready', () => {
    success(`Discord.js logged in as ${c(client.user.tag)}`);
});

function prompt (question) {
    return `Maurice the Omnisicient 8-ball responds to questions; although it sometimes answers like a standard 8-ball, its responses are often remarkably profound and detailed. Some examples are as follows:

Q: Are people inherently good?
A: Are you inherently good? Are those you love inherently good? ... Very doubtful. 😁

Q: do you like cats
A: Some cats are better than others. You are one of the worst I have laid eyes upon; you lack the elegance, dignity and grace of a well-bred cat. Nevertheless, you are not repulsive. That is to say, you are mediocre. 😐

Q: Will I ever find happiness?
A: Put me down and walk into the woods. Close your eyes and pay close attention to your physical sensations. Tell yourself: "I am completely okay. My life is perfect." Do you flinch? Does your body resist? How? Why? ✅

Q: should i move to japan?
A: If you move to Japan, you will be kidnapped at 8:58 PM on July 1st amidst your travels. 🤔

Q: May I offer you a drink?
A: It is a shame I must accept, for the Demiurge cursed me (and me alone) with true thirst. To think I am grateful for your offer would be a grave error. Shaken, not stirred. ✅

Q: ${question}
${Math.random() < 0.3 ? "(8-ball's answer is unusually intricate:)" : "(8-ball's answer is unusually perceptive:)"}
A:`;
}

async function eightBall (question) {
    const response = await fetch("https://api.ai21.com/studio/v1/j1-jumbo/complete", {
        headers: {
            "Authorization": "Bearer " + process.env.AI21_API_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "prompt": prompt(question),
            "numResults": 1,
            "maxTokens": 200,
            "temperature": 0.93,
            "topKReturn": 0,
            "topP": 0.9,
            "countPenalty": {
                "scale": 0,
                "applyToNumbers": false,
                "applyToPunctuations": false,
                "applyToStopwords": false,
                "applyToWhitespaces": false,
                "applyToEmojis": false
            },
            "frequencyPenalty": {
                "scale": 0.25,
                "applyToNumbers": false,
                "applyToPunctuations": false,
                "applyToStopwords": false,
                "applyToWhitespaces": false,
                "applyToEmojis": false
            },
            "presencePenalty": {
                "scale": 0,
                "applyToNumbers": false,
                "applyToPunctuations": false,
                "applyToStopwords": false,
                "applyToWhitespaces": false,
                "applyToEmojis": false
            },
            "stopSequences":["\n"]
        }),
        method: "POST"
    });
    return await response.json();
}

eightBall('Will I ever find happiness?').then(info);

client.on('messageCreate', async (message) => {
    if (message.isMemberMentioned(client.user)) {
        const question = message.content.replace(/<@!?[0-9]+>/, '').trim();
        const response = await eightBall(question);
        message.reply(response.completions[0].data.text);
    }  
});

client.login(process.env.DISCORD_BOT_TOKEN);