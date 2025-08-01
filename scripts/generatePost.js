import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

const {
  GH_TOKEN,
  OPENAI_API_KEY,
  GITHUB_OWNER,
  GITHUB_REPO,
  PROJECT_NAME,
  PROJECT_URL,
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function fetchCommitsSinceLastWeek() {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const sinceIso = since.toISOString();

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits?sha=main&since=${sinceIso}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.map(commit => commit.commit.message);
}

async function generatePost(messages) {
  const prompt = `
Tu es un expert marketing. Voici une liste de commits faits cette semaine sur un projet SaaS appelé "${PROJECT_NAME}". 
Ton objectif est de générer un post LinkedIn engageant, clair, humain, en français, qui met en avant les nouveautés ajoutées.

⚠️ Important : Ne donne pas de détails sur l'implémentation technique. Si un commit concerne uniquement du refactoring, des corrections internes, ou des optimisations techniques, ne l’évoque pas.

Commits :
${messages.map(m => `- ${m}`).join('\n')}

Constraints :
- Le ton doit être motivant, mais pas trop formel.
- Ne parle pas de "commits", mais de "nouvelles fonctionnalités" ou de "mises à jour".
- Termine avec une phrase engageante pour inviter les gens à tester l’outil.
- Ajoute un lien vers le projet dans la phrase engageante. ${PROJECT_URL}
`;

  const response = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-3.5-turbo',
  });

  const post = response.choices[0].message.content;
  const totalTokens = response.usage.total_tokens;

  // Coût estimé pour gpt-3.5-turbo (input + output = $0.002 / 1K tokens)
  const estimatedCost = (totalTokens / 1000) * 0.002;

  return { post, totalTokens, estimatedCost };
}

// --- Étape 3 : Main
(async () => {
  try {
    const commits = await fetchCommitsSinceLastWeek();
    if (commits.length === 0) {
      console.log('⚠️ Aucun nouveau commit cette semaine.');
      return;
    }

    const { post, totalTokens, estimatedCost } = await generatePost(commits);

    console.log('\n📣 Post LinkedIn généré :\n');
    console.log(post);

    console.log('\n📊 Stats :');
    console.log(`- Tokens utilisés : ${totalTokens}`);
    console.log(`- Coût estimé : ~$${estimatedCost.toFixed(4)} USD`);
  } catch (error) {
    console.error('❌ Erreur :', error.message);
  }
})();