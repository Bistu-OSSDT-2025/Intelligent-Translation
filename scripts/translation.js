const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const generateSign = (text, targetLang, sourceLang) => {
    const salt = Date.now();
    const signStr = process.env.BAIDU_APP_ID + text + salt + process.env.BAIDU_APP_SECRET;
    return crypto.createHash('md5').update(signStr).digest('hex');
};



const handleTranslation = async () => {
    const inputText = document.getElementById('input-text').value;
    const sourceLang = document.getElementById('source-lang').value;
    const targetLang = document.getElementById('target-lang').value;

    if (!inputText.trim()) {
        alert('请输入需要翻译的内容');
        return;
    }

    try {
        document.getElementById('translate-btn').disabled = true;
        document.getElementById('translate-btn').value = '翻译中...';
        document.getElementById('output-text').value = '翻译中...';

        const response = await fetch('/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: inputText,
                sourceLang: sourceLang,
                targetLang: targetLang
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.success) {
            document.getElementById('output-text').value = data.data;
        } else {
            alert('Translation failed: ' + data.error);
            document.getElementById('output-text').value = '';
        }
    } catch (error) {
        console.error('Translation error:', error);
        alert('Translation failed. Please try again.');
        document.getElementById('output-text').value = '';
    } finally {
        document.getElementById('translate-btn').disabled = false;
        document.getElementById('translate-btn').value = '翻译';
    }
};

document.getElementById('translate-btn').addEventListener('click', handleTranslation);

const translate = async (text, targetLang, sourceLang = 'auto') => {
    const salt = Date.now();
    const sign = generateSign(text, targetLang, sourceLang);
    
    try {
        const response = await axios.post(
            'https://fanyi-api.baidu.com/api/trans/vip/translate',
            `q=${encodeURIComponent(text)}&from=${sourceLang}&to=${targetLang}&appid=${process.env.BAIDU_APP_ID}&salt=${salt}&sign=${sign}`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                }
            }
        );

        if (response.data.error_code) {
            throw new Error(`Translation error: ${response.data.error_msg}`);
        }

        return response.data.trans_result[0].dst;
    } catch (error) {
        console.error('Translation failed:', error.message);
        throw error;
    }
};

const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
    });
});

// API endpoint for translation
app.post('/translate', async (req, res) => {
    try {
        const { text, targetLang, sourceLang = 'auto' } = req.body;
        
        if (!text || !targetLang) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required parameters: text and targetLang' 
            });
        }

        const translatedText = await translate(text, targetLang, sourceLang);
        res.json({ success: true, data: translatedText });
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
