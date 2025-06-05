const { Translate } = require('@google-cloud/translate').v2;

// Initialize Google Translate client
const translate = new Translate();

/**
 * Translates text to the target language using Google Translate API
 * @param {string} text - The text to translate
 * @param {string} targetLang - The target language code (e.g., 'es', 'fr')
 * @returns {Promise<string>} - The translated text
 */
async function translateText(text, targetLang) {
    const [translation] = await translate.translate(text, targetLang);
    return translation;
}

// Express handler
exports.translateHandler = async (req, res) => {
    try {
        const { text, targetLang } = req.body;
        if (!text || !targetLang) {
            return res.status(400).json({ error: 'text and targetLang are required' });
        }

        if (!/^[a-z]{2}$/.test(targetLang)) {
            return res.status(400).json({ error: 'Invalid targetLang format' });
        }

        const translated = await translateText(text, targetLang);
        res.json({ translated });
    } catch (err) {
        const isDev = process.env.NODE_ENV !== 'production';
        res.status(500).json({ error: isDev ? err.message : 'Translation failed' });
    }
};
