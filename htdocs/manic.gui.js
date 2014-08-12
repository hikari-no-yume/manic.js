window.manic.GUI = (function (manic) {
    'use strict';
    
    var chatOpen = false, chatlog = null, chatbox = null;
    
    function init(sendMessage) {
        chatlog = document.createElement('div');
        chatlog.id = 'chatlog';
        document.body.appendChild(chatlog);
        
        chatbox = document.createElement('input');
        chatbox.type = 'text';
        chatbox.id = 'chatbox';
        chatbox.className = 'hidden text-f';
        document.body.appendChild(chatbox);
        
        window.onkeypress = function (e) {
            if ((e.charCode || e.keyCode) === 't'.charCodeAt(0)) {
                chatbox.className = 'text-f';
                chatOpen = true;
                chatbox.focus();
            }
        };
        chatbox.onkeydown = function (e) {
            // Return key
            if (e.which === 13) {
                sendMessage(chatbox.value);
                chatbox.value = '';
                chatbox.blur();
                chatbox.className = 'hidden text-f';
                chatOpen = false;
            }
        };
    }
    
    function formatText(target, text) {
        // & is the colour escape character
        var pieces = text.split('&');
        for (var i = 0; i < pieces.length; i++) {
            if (pieces[i].length === 0) {
                continue;
            }
            
            var element = document.createElement('span');
            // If there was a &
            if (i > 0) {
                element.className = 'text-' + pieces[i][0];
                // Strip &
                pieces[i] = pieces[i].substr(1);
            } else {
                element.className = 'text-f';
            }
            
            element.textContent = pieces[i];
            target.appendChild(element);
        }
    }
    
    function chatMessageReceived(text) {
        var message = document.createElement('div');
        formatText(message, text);
        chatlog.appendChild(message);
        chatlog.scrollTop = chatlog.scrollHeight;
    }
    
    return {
        init: init,
        formatText: formatText,
        chatMessageReceived: chatMessageReceived
    };
}(window.manic));