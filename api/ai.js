

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
