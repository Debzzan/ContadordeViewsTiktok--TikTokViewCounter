const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.static('.'));

const RAPIDAPI_KEY = '663d8ebafbmsh925528f38329688p114cc1jsnc3830cf791b7';
const RAPIDAPI_HOST = 'tiktok-scraper7.p.rapidapi.com';

app.get('/stats/:userId', async (req, res) => {
    const userId = req.params.userId.trim();
    console.log(`\n--- 🚀 Consultando ID: ${userId} ---`);

    try {
        const response = await axios.get(`https://${RAPIDAPI_HOST}/user/posts`, {
            params: { user_id: userId, count: '30', cursor: '0' },
            headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': RAPIDAPI_HOST }
        });

        const videos = response.data.data?.videos || response.data.aweme_list || [];
        if (videos.length === 0) return res.status(404).json({ error: "Sem vídeos." });

        let totalViews = 0;
        videos.forEach(v => {
            totalViews += (v.play_count || v.statistics?.play_count || 0);
        });

        console.log(`✅ Sucesso! Soma: ${totalViews}`);
        res.json({ id: userId, totalViews: totalViews });

    } catch (error) {
        console.error("❌ Erro na requisição:", error.message);
        res.status(500).json({ error: "Erro na API" });
    }
});

// --- NOVO BLOCO DE INICIALIZAÇÃO COM DEBUG ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 SERVIDOR ATIVO EM: http://localhost:${PORT}`);
    console.log(`🟢 Pressione Control + C para desligar.`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ ERRO: A porta ${PORT} já está sendo usada!`);
        console.error(`💡 SOLUÇÃO: Mude a linha 'const PORT = 3000' para 3001 ou 4000.`);
    } else {
        console.error(`\n❌ ERRO AO INICIAR:`, err);
    }
});