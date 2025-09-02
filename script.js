document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CONFIGURATION AND ELEMENT SELECTION ---
    const apiUrl = 'https://emo-chatbot.aixbrain.de/chat/';

    let apiKey = null;
    const apiOverlay = document.getElementById('api-overlay');
    const apiKeyInput = document.getElementById('api-key-input');

    apiKey = localStorage.getItem("apiKey");
    
    if (apiKey) {
        apiKeyInput.value = apiKey;
        apiOverlay.classList.add('hidden');
    }

    

    // Page/View Elements
    const pages = document.querySelectorAll('.page');
    const startPage = document.getElementById('start-page');
    const chatContainer = document.getElementById('chat-container');
    
    // Modals & Overlays
    const tncModal = document.getElementById('tnc-modal');
    const errorOverlay = document.getElementById('error-overlay');
    const websitePopup = document.getElementById('website-popup');
    const websiteIframe = document.getElementById('website-iframe');
    const websiteUrlSpan = document.getElementById('website-url');

    // Buttons & Inputs
    const langFlags = document.querySelectorAll('.lang-flag');
    const agreeButton = document.getElementById('agree-button');
    const exitButton = document.getElementById('exit-button');
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    const closeWebsiteButton = document.getElementById('close-website-button');
    
    const chatWindow = document.getElementById('chat-window');

    
    const apiSubmitButton = document.getElementById('api-submit-button');





    // --- 2. STATE MANAGEMENT ---
    const translations = {
        en: {
            welcome: "Willkommen!",
            select_language: "Please select your language:",
            agree_header: "Hi, I’m EMIL, the AI-based EMO chatbot, and I look forward to chatting with you.",
            agree: "All set? Then let's go!",
            agree_content: `
                <p>Before we begin, here are a few important things to note:</p>
                <ul>
                    <li>I am still a prototype, which means I’m just here for demonstration, and my answers <strong>may not be accurate</strong>.</li>
                    <li>Please <strong>do not</strong> enter any <strong>personal</strong> information such as your name, email address, etc.</li>
                    <li>Please <strong>do not</strong> enter <strong>confidential</strong> or <strong>sensitive</strong> information (e.g., prices). </li>
                    <li>The chat history will be <strong>logged</strong> for later evaluation.</li>
                    <li>Please <strong>terminate</strong> your chat session when you’re done.</li>
                    <li>If you have questions, ask the <strong>booth staff</strong>.</li>
                </ul>
                `,
            welcome_message: "Hello, I'm EMIL, how can I help you?",
            exit: "Exit and Delete",
            send: "Send",
            placeholder: "Type your message...",
            error_header: "Sorry, the service is currently not working properly.",
            error_content: "Please contact a stand supervisor.",
            // ...add all other UI strings here...
        },
        de: {
            welcome: "Willkommen!",
            select_language: "Bitte wählen Sie Ihre Sprache:",
            agree_header: "Hallo, ich bin EMIL, der KI-basierte EMO Chatbot, und freue mich darauf, mit Dir zu chatten.",
            agree: "Alles klar? Dann los geht's!",
            agree_content: `
                <p>Bevor es losgeht, hier noch ein paar wichtige Punkte:</p>
                <ul>
                    <li>Ich bin noch ein Prototyp, das heißt ich diene ausschließlich zu Demonstrationszwecken und meine Antworten sind <strong>ohne Gewähr</strong>.</li>
                    <li>Bitte gib <strong>keine personenbezogenen Daten</strong> (z.B. Namen, E-Mail) ein.</li>
                    <li>Bitte gib <strong>keine vertraulichen</strong> oder <strong>wettbewerbssensitiven</strong> Informationen (z.B. Preisinformationen) ein.</li>
                    <li>Der Chatverlauf wird <strong>protokolliert</strong>, um später ausgewertet zu werden.</li>
                    <li>Bitte <strong>beende</strong> Deine Chat-Session sobald Du fertig bist.</li>
                    <li>Wenn du Fragen hast, wende Dich an das <strong>Standpersonal</strong>.</li>
                </ul>
                `,
            welcome_message: "Hallo, ich bin EMIL. Wie kann ich Ihnen helfen?",
            exit: "Beenden und Löschen",
            send: "Senden",
            placeholder: "Geben Sie Ihre Nachricht ein...",
            error_header: "Entschuldigung, der Dienst funktioniert derzeit nicht richtig.",
            error_content: "Bitte wenden Sie sich an einen Standbetreuer.",
            // ...add all other UI strings here...
        }
    };

    let userLanguage = 'en';

    function updateUIText() {
        document.querySelector('h1').textContent = translations[userLanguage].welcome;
        document.querySelector('#start-page p').textContent = translations[userLanguage].select_language;
        document.getElementById('agree-header').textContent = translations[userLanguage].agree_header;
        document.getElementById('agree-button').textContent = translations[userLanguage].agree;
        document.getElementById('agree-content').innerHTML = translations[userLanguage].agree_content;
        document.getElementById('exit-button').textContent = translations[userLanguage].exit;
        document.getElementById('send-button').textContent = translations[userLanguage].send;
        document.getElementById('message-input').placeholder = translations[userLanguage].placeholder;
        document.querySelector('#error-overlay .modal-content h2').textContent = translations[userLanguage].error_header;
        document.querySelector('#error-overlay .modal-content p').textContent = translations[userLanguage].error_content;
    }


    let messageHistory = [];
    let mascotAnimationInterval = null;

    // --- 3. UI FLOW & NAVIGATION ---

    // autoscroll down
    window.visualViewport.addEventListener('resize', () => {
        window.scrollTo(0, document.body.scrollHeight);
    });

    
    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.toggle('active', page.id === pageId);
            page.classList.toggle('hidden', page.id !== pageId);
        });
    }

    langFlags.forEach(flag => {
        flag.addEventListener('click', () => {
            userLanguage = flag.dataset.lang;
            tncModal.classList.remove('hidden');
            updateUIText();
        });
    });

    agreeButton.addEventListener('click', () => {
        tncModal.classList.add('hidden');
        showPage('chat-container');
        displayInitialWelcome(); // Show the mascot inside the chat window
        messageInput.focus();
    });

    apiSubmitButton.addEventListener('click', () => {
        apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            alert("Please enter a valid API key before continuing.");
            return;
        }
        localStorage.setItem("apiKey", apiKey);
        apiOverlay.classList.add('hidden');
    });

    exitButton.addEventListener('click', () => {
        if (userLanguage == 'de') {
            text = "Sind Sie sicher, dass Sie die Unterhaltung beenden und den Verlauf löschen möchten?"
        }
        if (userLanguage == 'en') {
            text = "Are you sure you want to exit and delete the conversation history?"
        }
        if (confirm(text)) {
            messageHistory = [];
            chatWindow.innerHTML = '';
            showPage('start-page');
        }
    });
    
    closeWebsiteButton.addEventListener('click', () => {
        websiteIframe.src = 'about:blank'; // Stop content from loading/playing
        websitePopup.classList.add('hidden');
    });

    // --- 4. CHAT FUNCTIONALITY ---
    sendButton.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !sendButton.disabled) {
            handleSendMessage();
        }
    });

    function displayInitialWelcome() {
        chatWindow.innerHTML = `
            <div class="initial-welcome">
                <img src="assets/EMO-AI-Hub_Maskottchen_Emil_Warten.svg" alt="Mascot Sitting">
                <h2>${translations[userLanguage].welcome_message}</h2>
            </div>
        `;
    }

    async function handleSendMessage() {
        // Clear initial welcome message on first interaction
        const initialWelcome = chatWindow.querySelector('.initial-welcome');
        if (initialWelcome) {
            initialWelcome.remove();
        }

        const prompt = messageInput.value.trim();
        if (!prompt) return;

        displayMessage('user', prompt);
        messageHistory.push({ role: 'user', content: prompt, timestamp: new Date().toISOString() });
        
        messageInput.value = '';
        messageInput.disabled = true;
        sendButton.disabled = true;

        const { messageElement, avatarElement } = displayMessage('model', '');
        
        startMascotAnimation(avatarElement);

        try {
            await callChatApi(prompt, messageElement, avatarElement);
        } catch (error) {
            console.error('A critical error occurred:', error);
            stopMascotAnimation(avatarElement, 'idea');
            showErrorPage();
        } finally {
            messageInput.disabled = false;
            sendButton.disabled = false;
            messageInput.focus();
        }
    }

    // --- 5. API COMMUNICATION ---
    async function callChatApi(prompt, messageElement, avatarElement) {
        // ... (This function remains unchanged from the previous version)
        const requestBody = { user_info: { id: "user123", language_tag: userLanguage }, chat_request: { prompt: prompt, messages: messageHistory } };
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey }, body: JSON.stringify(requestBody) });
        if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); 
            for (const line of lines) {
                if (line.trim() === '') continue;
                try {
                    const chunk = JSON.parse(line);
                    processStreamChunk(chunk, messageElement, avatarElement);
                } catch (error) { console.error('Failed to parse JSON chunk:', line, error); }
            }
        }
    }
    
    // Add a buffer property to the messageElement for streaming
    function processStreamChunk(chunk, messageElement, avatarElement) {
        switch (chunk.type) {
            case 'delta':
                // Buffer raw markdown
                if (!messageElement._markdownBuffer) messageElement._markdownBuffer = '';
                messageElement._markdownBuffer += chunk.content;
                // Render the full buffer as HTML
                messageElement.innerHTML = marked.parse(messageElement._markdownBuffer);
                chatWindow.scrollTop = chatWindow.scrollHeight;
                break;
            case 'final':
                stopMascotAnimation(avatarElement, 'idea');
                // Use the full buffer for final rendering
                let markdown = messageElement._markdownBuffer || '';
                // Optionally handle links here if needed
                const finalContent = parseAndHandleLink(markdown);
                messageElement.innerHTML = marked.parse(finalContent.html);
                messageHistory.push({ role: 'model', content: chunk.content, timestamp: chunk.timestamp });
                if (finalContent.link) {
                    showWebsiteInPopup(finalContent.link);
                }
                // Clean up buffer
                delete messageElement._markdownBuffer;
                break;
            case 'error':
                stopMascotAnimation(avatarElement, 'idea');
                messageElement.textContent = `Error: ${chunk.content}`;
                messageElement.style.color = 'red';
                break;
        }
    }
    
    // --- 6. DYNAMIC FEATURES ---
    function startMascotAnimation(avatarElement) {
        let toggle = true;
        avatarElement.src = 'assets/EMO-AI-Hub_Maskottchen_Emil_Denken.svg';
        function animate() {
            toggle = !toggle;
            avatarElement.src = toggle ? 'assets/EMO-AI-Hub_Maskottchen_Emil_Denken.svg' : 'assets/EMO-AI-Hub_Maskottchen_Emil_Suche.svg';
            const nextDelay = Math.floor(Math.random() * (4000 - 1000 + 1)) + 1000;
            mascotAnimationInterval = setTimeout(animate, nextDelay);
        }
        animate();
    }
    function stopMascotAnimation(avatarElement) { /* Unchanged */ clearInterval(mascotAnimationInterval); mascotAnimationInterval = null; avatarElement.src = `assets/EMO-AI-Hub_Maskottchen_Emil_Idee.svg`; }
    function showErrorPage() { errorOverlay.classList.remove('hidden'); }

    // Link Parsing and Iframe Popup
    function parseAndHandleLink(text) {
        const regex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/;
        const match = text.match(regex);
        if (match) {
            const linkText = match[1];
            const url = match[2];
            // // Replace markdown link with a simple, non-clickable text or a subtle indicator
            // const html = text.replace(regex, `${linkText} (link opened in popup)`);
            const html = text;
            return { html, link: url };
            return { html, link: url };
        }
        return { html: text, link: null };
    }

    function showWebsiteInPopup(url) {
        // websiteUrlSpan.textContent = url;
        // websiteIframe.src = url;
        websiteUrlSpan.textContent = "https://de.wikipedia.org/wiki/Tiger";
        websiteIframe.src = "https://de.wikipedia.org/wiki/Tiger";
        
        websitePopup.classList.remove('hidden');
    }

    // --- 7. UTILITY FUNCTION: DISPLAY MESSAGE IN UI ---
    function displayMessage(role, content) { /* Unchanged */ const wrapper = document.createElement('div'); wrapper.classList.add('message-wrapper', `${role}-message-wrapper`); const messageElement = document.createElement('div'); messageElement.classList.add('message', `${role}-message`); messageElement.innerHTML = content; let avatarElement = null; if (role === 'model') { const avatar = document.createElement('img'); avatar.classList.add('avatar'); avatar.src = 'assets/mascot_still.png'; avatarElement = avatar; wrapper.appendChild(avatar); wrapper.appendChild(messageElement); } else { wrapper.appendChild(messageElement); } chatWindow.appendChild(wrapper); chatWindow.scrollTop = chatWindow.scrollHeight; return { messageElement, avatarElement }; }

    // --- INITIALIZATION ---
    showPage('start-page');

});

