const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.static('.'));

const RAPIDAPI_KEY = 'SEU_RAPIDAPI_KEY_AQUI'; // Substitua pela sua chave da RapidAPI
const RAPIDAPI_HOST = 'tiktok-scraper7.p.rapidapi.com';

app.get('/stats/:userInput', async (req, res) => {
    const userInput = req.params.userInput.trim();
    console.log(`\n--- 🚀 Processando busca para: ${userInput} ---`);

    try {
        // 1. Primeiro, vamos descobrir o ID real e o Username correto
        // Usamos o endpoint /user/info mas passando o username como parâmetro
        const isNumeric = /^\d+$/.test(userInput);
        
        const userSearchConfig = {
            method: 'GET',
            url: `https://${RAPIDAPI_HOST}/user/info`,
            params: isNumeric ? { user_id: userInput } : { unique_id: userInput },
            headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': RAPIDAPI_HOST }
        };

        const infoRes = await axios.request(userSearchConfig);
        const userData = infoRes.data.data;

        if (!userData) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        const realUserId = userData.user?.id || userData.id;
        const username = userData.user?.uniqueId || userData.uniqueId;

        console.log(`🔍 ID localizado: ${realUserId} para o perfil: ${username}`);

        // 2. Agora que temos o ID real (numérico), buscamos os posts
        const postsRes = await axios.get(`https://${RAPIDAPI_HOST}/user/posts`, {
            params: { user_id: realUserId, count: '30', cursor: '0' },
            headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': RAPIDAPI_HOST }
        });

        const videos = postsRes.data.data?.videos || postsRes.data.aweme_list || [];
        
        let totalViews = 0;
        videos.forEach(v => {
            totalViews += (v.play_count || v.statistics?.play_count || 0);
        });

        console.log(`✅ Sucesso! Total de Views: ${totalViews}`);

        res.json({ 
            id: realUserId, 
            username: username, 
            totalViews: totalViews,
            nickname: userData.user?.nickname || ""
        });

    } catch (error) {
        console.error("❌ Erro no processamento:", error.message);
        res.status(500).json({ error: "Erro ao consultar dados. Verifique se o username/ID está correto." });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 SERVIDOR ONLINE: http://localhost:${PORT}`);
});