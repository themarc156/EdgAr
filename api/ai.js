const G_KEY = process.env.GROQ_API_KEY;

module.exports = async (req, res) => {
    console.log("API aufgerufen, Methode:", req.method);

    // 1. CORS-Header setzen, damit der Browser die Antwort akzeptiert
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // 2. Den OPTIONS-Preflight (Bild 5 aus deinen Logs) direkt durchwinken
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. Erst danach blockieren wir alle echten Anfragen, die kein POST sind
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST allowed" });
    }

    // 4. Body manuell parsen (Lösung für das Vercel-Problem)
    let body = req.body;
    if (typeof body === "string") {
        try {
            body = JSON.parse(body);
        } catch (e) {
            return res.status(400).json({ error: "Ungültiges JSON im Body" });
        }
    }
    
    const { prompt, mode } = body || {};

    if (!G_KEY) {
        console.error("KRITISCH: Kein API-Key in Vercel hinterlegt!");
        return res.status(500).json({ error: "API-Key fehlt in Vercel!" });
    }

    // Aktuelle Groq-Modelle
    let model = "llama-3.3-70b-versatile";
    if (mode === "fast") model = "llama-3.1-8b-instant";
    if (mode === "cheap") model = "llama-3.2-3b-preview";

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + G_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Groq hat Fehler gemeldet:", data);
            return res.status(response.status).json({
                error: data.error?.message || "Fehler bei Groq"
            });
        }

        return res.status(200).json(data);

    } catch (err) {
        console.error("Fehler beim Fetch:", err.message);
        return res.status(500).json({ error: "Server-Crash: " + err.message });
    }
};
