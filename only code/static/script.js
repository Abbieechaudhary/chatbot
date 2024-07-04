function initializeChat() {
    const greeting = "Hey, how can I assist you?";
    appendMessage('chatbot-message', greeting);
}

function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim() === '') return;
    
    appendMessage('user-message', userInput);
    showLoadingIndicator();

    // Simulate delay
    setTimeout(() => {
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_input: userInput })
        })
        .then(response => response.json())
        .then(data => {
            const chatbotResponse = data.chatbot_response;
            hideLoadingIndicator();
            appendMessage('chatbot-message', chatbotResponse);
            
            if (data.chatbot_response.includes("Would you like to provide one?")) {
                handleNoAnswer(userInput);
            } else if (data.suggested_question) {
                handleSuggestion(data.suggested_question, userInput);
            }
        })
        .catch(error => console.error('Error:', error));
    }, 2000); // Delay for 2 seconds

    document.getElementById('user-input').value = '';
}

function showLoadingIndicator() {
    const chatHistory = document.getElementById('chat-history');
    const loadingElement = document.createElement('div');
    loadingElement.className = 'chatbot-message loading';
    loadingElement.id = 'loading-indicator';
    loadingElement.innerHTML = '<span></span><span></span><span></span>';
    chatHistory.appendChild(loadingElement);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function hideLoadingIndicator() {
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement) {
        loadingElement.remove();
    }
}


function appendMessage(className, message) {
    const chatHistory = document.getElementById('chat-history');
    const messageElement = document.createElement('div');
    messageElement.className = `message-wrapper ${className}`;
    const messageText = document.createElement('div');
    messageText.className = className;
    messageText.textContent = message;
    messageElement.appendChild(messageText);
    chatHistory.appendChild(messageElement);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function handleNoAnswer(originalInput) {
    const userAnswer = prompt(`Sorry, I don't have an answer for that. Would you like to provide one? If yes, type your answer; otherwise, click cancel.`);
    if (userAnswer !== null && userAnswer.trim() !== '') {
        fetch('/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_input: originalInput, user_answer: userAnswer })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert("Thank you! The new question and answer have been saved.");
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

function handleSuggestion(suggestedQuestion, originalInput) {
    const userConfirmation = confirm(`Did you mean: '${suggestedQuestion}'?`);
    if (userConfirmation) {
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_input: suggestedQuestion })
        })
        .then(response => response.json())
        .then(data => {
            const chatbotResponse = data.chatbot_response;
            appendMessage('chatbot-message', chatbotResponse);
        })
        .catch(error => console.error('Error:', error));
    } else {
        const userAnswer = prompt(`Please provide the answer for the question '${originalInput}':`);
        if (userAnswer !== null && userAnswer.trim() !== '') {
            fetch('/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_input: originalInput, user_answer: userAnswer })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    alert("Thank you! The new question and answer have been saved.");
                }
            })
            .catch(error => console.error('Error:', error));
        }
    }
}

window.onload = initializeChat;
