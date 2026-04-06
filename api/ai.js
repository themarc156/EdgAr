export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST allowed" });
    }

    const { prompt } = req.body;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + process.env.GROQ_API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                let model = "llama3-70b-8192";

if (req.body.mode === "fast") {
    model = "mixtral-8x7b-32768";
}

if (req.body.mode === "cheap") {
    model = "llama3-8b-8192";
}
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        });

        const data = await response.json();

        return res.status(200).json(data);

    } catch (err) {
        return res.status(500).json({ error: "AI request failed" });
    }
}
