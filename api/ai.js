export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST allowed" });
    }

    const { prompt, mode } = req.body;

        // Standardmodell (Smart) -> Jetzt das extrem schnelle Llama 3.3 70B
    let model = "llama-3.3-70b-versatile";

    if (mode === "fast") {
        // Schnell -> Das kleinere, pfeilschnelle Llama 3.1 8B
        model = "llama-3.1-8b-instant";
    }

    if (mode === "cheap") {
        // Günstig -> Ein kleineres Modell
        model = "llama-3.2-3b-preview";
    
   try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + process.env.GROQ_API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        });

        const data = await response.json();

        // ? API Fehler sauber abfangen
        if (!response.ok) {
            console.error("Groq API Error:", data);
            return res.status(response.status).json({
                error: data.error?.message || "Groq API request failed"
            });
        }

        // ? EXTRA Schutz gegen undefined
        if (!data.choices || !data.choices[0]) {
            console.error("Invalid AI response:", data);
            return res.status(500).json({
                error: "Invalid AI response format"
            });
        }

        return res.status(200).json(data);

    } catch (err) {
        console.error("Server Error:", err);
        return res.status(500).json({
            error: "AI request failed completely"
        });
    }
}
