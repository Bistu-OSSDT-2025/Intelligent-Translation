// 主JavaScript文件
// 初始化项目功能

// 加载翻译模块
import { translate } from './translation.js';

// DOM元素缓存
const inputText = document.getElementById('input-text');
const languageSelect = document.getElementById('language-select');
const translateBtn = document.getElementById('translate-btn');
const resultArea = document.getElementById('result');

// 初始化事件监听
function initialize() {
    translateBtn.addEventListener('click', handleTranslate);
}

// 处理翻译功能
function handleTranslate() {
    const text = inputText.value;
    const targetLang = languageSelect.value;
    
    if (!text.trim()) {
        alert('请输入需要翻译的文字');
        return;
    }
    
    translate(text, targetLang)
        .then(result => {
            displayResult(result);
        })
        .catch(error => {
            console.error('翻译失败:', error);
            alert('翻译失败，请稍后再试');
        });
}

// 显示翻译结果
function displayResult(result) {
    resultArea.innerHTML = `
        <h3>翻译结果:</h3>
        <p>${result}</p>
    `;
}

// 启动项目
document.addEventListener('DOMContentLoaded', initialize);
