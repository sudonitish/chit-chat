const url = 'http://localhost:3000';
const socket = io("http://localhost:3000");
let messageToSend = document.getElementById("messageToSend")
let showMessage = document.getElementById("showMessage");
let showChats = document.getElementById('showChats')
let send = document.getElementById("send");
let chatDetails = document.getElementById('chatDetails');
let chatIdForSend = null;
let chatIdForShowMessage = null;
let chatPage = 0;
let messagePageBefore = 0;
let messagePageAfter = 0;
let emailContainer = document.getElementById('email')
let messageSendContainer = document.getElementById('messageSendContainer')
let searchForUser = document.getElementById('searchForUser');
let add = document.getElementById('add');
let createGroup = document.getElementById('createGroup')
let mainContainer = document.getElementById('mainContainer')
let profileImageContainer = document.getElementById('profileImageContainer');
let menuOptions = document.getElementById('menuOptions');
let chatImageOnScreen = document.getElementById('chatImageOnScreen');
let chatNameOnScreen = document.getElementById('chatNameOnScreen')
let showChatsContainer = document.getElementById('showChatsContainer')
let flag = false;
let flagForUpdate = false;
renderChats(chatPage)
socket.on('connect', () => {
})
socket.on('receave message', function (data) {
    let message = document.createElement('label');
    message.innerHTML = data.msg;
    showMessage.appendChild(message);
    let latestMessageOnChat = document.getElementById(data.roomId);
    if (latestMessageOnChat) {
        if (messageToSend.value.trim().length > 10) {
            latestMessageOnChat.children[1].children[1].innerHTML = data.msg.trim().substr(0, 10) + "...";
            
        }
        else {
            latestMessageOnChat.children[1].children[1].innerHTML = data.msg.trim();
        }
        latestMessageOnChat.parentElement.prepend(latestMessageOnChat);
        
        findUnReadMessages(data.roomId)

    }
    else {
        chatPage = 0;
        renderChats(chatPage)
    }
    showMessage.scrollTop = showMessage.scrollHeight;
    if (data.email === emailContainer.innerHTML.trim()) {
        message.className = 'sendedMessage';

    }
    else if (data.roomId === chatIdForSend) {
        message.className = 'receavedMessage';
    }
    else {
        message.remove();
    }
   
});
add.addEventListener('click', addUserToMyChat)
searchForUser.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        addUserToMyChat()
    }
})
send.addEventListener('click', sendMessage)
messageToSend.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        sendMessage()
    }
})
createGroup.addEventListener('click', () => {
    let groupID = null;
    let addGroupDetails = document.createElement('div');
    addGroupDetails.className = "addGroupDetails";

    let closeContainer = document.createElement('div');
    closeContainer.className = 'closeContainer'

    let close = document.createElement('button');
    close.className = 'close'
    close.innerHTML = '<svg width="30" height="30" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>'

    let groupNameContainer = document.createElement('div');
    groupNameContainer.className = 'groupNameContainer';

    let groupName = document.createElement('input');
    groupName.type = 'text';
    groupName.className = 'groupName';
    groupName.placeholder = 'Group Name';

    let createGroupButton = document.createElement('button');
    createGroupButton.className = 'createGroupButton';
    createGroupButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 341.39"><path d="M3.62 302.83c-2 0-3.62-1.62-3.62-3.62 0-1.04.14-2.05.39-3.06 5.8-46 41.82-58.27 67.37-64.9 12.79-3.31 44.6-15.93 31.92-33.3-7.1-9.74-13.53-16.58-19.97-26.87-4.65-6.86-7.1-12.99-7.1-17.89 0-5.23 2.77-11.35 8.32-12.74-.73-10.53-.98-24.38-.48-35.65 1.76-19.35 15.64-33.61 33.57-39.93 7.09-2.7 3.66-13.49 11.5-13.72 18.38-.5 48.51 15.19 60.28 27.92 6.86 7.35 11.26 17.15 12 30.14l-.74 32.46c3.43.98 5.64 3.19 6.62 6.62.98 3.92 0 9.31-3.43 16.91 0 .24-.25.24-.25.49-7.56 12.46-15.44 20.72-24.1 32.26-3.86 5.16-3.11 10.09.1 14.53-4.51 2.63-8.92 5.66-13.15 9.22-16.79 14.09-29.76 35.09-34.32 68.53-.9 3.91-1.25 8.64-.6 12.6H3.62zm415.6-73.61c-.03-3.56-.36-6.1 4.05-6.04l14.28.18c4.61-.03 5.84 1.43 5.79 5.75v19.48h19.36c3.55-.03 6.09-.36 6.03 4.05l-.17 14.29c.02 4.61-1.44 5.83-5.76 5.78h-19.46v19.47c.05 4.32-1.18 5.78-5.79 5.75l-14.28.18c-4.41.06-4.08-2.48-4.05-6.04v-19.36h-19.49c-4.31.05-5.77-1.17-5.75-5.78l-.17-14.29c-.07-4.41 2.48-4.08 6.03-4.05h19.38v-19.37zm12.05-49.31c22.29 0 42.48 9.04 57.08 23.65 14.61 14.61 23.65 34.81 23.65 57.09 0 22.3-9.04 42.48-23.65 57.09-14.6 14.61-34.8 23.65-57.08 23.65-22.3 0-42.48-9.04-57.09-23.65l-.45-.48c-14.35-14.59-23.2-34.59-23.2-56.61 0-22.26 9.04-42.45 23.66-57.06 14.6-14.64 34.79-23.68 57.08-23.68zm45.31 35.42c-11.59-11.59-27.61-18.76-45.31-18.76-17.7 0-33.74 7.17-45.33 18.76-11.6 11.57-18.76 27.6-18.76 45.32 0 17.53 7.01 33.41 18.36 44.94l.41.38c11.59 11.6 27.61 18.77 45.32 18.77 17.69 0 33.72-7.17 45.31-18.77 11.6-11.59 18.77-27.62 18.77-45.32 0-17.69-7.17-33.73-18.77-45.32zm-322.65 87.54c-2.44 0-4.42-1.98-4.42-4.43 0-1.25.17-2.5.48-3.73 7.08-56.13 40.73-68.33 71.87-76.34 14.95-3.84 44.78-18.85 41.16-38.2-7.54-6.99-15.03-16.65-16.33-31.06l-.91.02c-2.09-.03-4.11-.51-6-1.57-4.16-2.37-6.44-6.91-7.54-12.08-2.3-15.79-2.89-23.85 5.53-27.38l.07-.03c-1.04-19.48 2.25-48.14-17.76-54.2 39.5-48.81 85.05-75.37 119.24-31.94 38.1 2 55.09 55.96 31.43 86.17h-1c8.42 3.53 7.15 12.58 5.53 27.38-1.1 5.17-3.38 9.71-7.54 12.08-1.89 1.06-3.91 1.54-6 1.57l-.91-.02c-1.3 14.41-8.81 24.07-16.35 31.06-1.22 6.55 1.37 12.58 5.93 17.87-13.43 17.3-21.41 39.03-21.41 62.61 0 15.05 3.25 29.35 9.09 42.22H153.93z"/></svg>`;


    let titleContainer = document.createElement('div');
    titleContainer.className = 'titleContainer';

    let groupTitle = document.createElement('label');
    groupTitle.className = 'groupTitle';
    groupTitle.innerHTML = 'Group Title';


    let addParticipantsContainer = document.createElement('div');
    addParticipantsContainer.className = 'addParticipantsContainer';

    let addParticipantsText = document.createElement('input');
    addParticipantsText.type = 'text';
    addParticipantsText.className = 'addParticipantsText';
    addParticipantsText.placeholder = 'Add Participants ';

    let addParticipantsButton = document.createElement('button');
    addParticipantsButton.className = 'addParticipantsButton';
    addParticipantsButton.innerHTML = `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 119.15"><defs><style>.cls-1{fill-rule:evenodd;}</style></defs><title>add-user</title><path class="cls-1" d="M100.58,74.55a22.3,22.3,0,1,1-22.31,22.3,22.29,22.29,0,0,1,22.31-22.3ZM36,56.88c-2.09-3.33-6-7.85-6-11.75a6.29,6.29,0,0,1,4.23-5.71c-.2-3.3-.33-6.65-.33-10,0-2,0-3.94.11-5.88a13.63,13.63,0,0,1,.66-3A21,21,0,0,1,44,8.74a27.24,27.24,0,0,1,5.08-2.43C52.28,5.14,50.72.07,54.25,0c8.23-.21,21.76,7,27,12.7a19.22,19.22,0,0,1,5.39,12.85L86.34,40a4.73,4.73,0,0,1,3.46,3c1.13,4.55-3.59,10.21-5.79,13.83-2,3.34-9.76,12.45-9.76,12.53C74,72.42,76,74.5,79.33,76.2A29.63,29.63,0,0,0,74,109.89H0c0-33.68,45.89-26,45.67-40.64,0-.21-8.89-11.1-9.69-12.37Zm60.54,29.4c0-1.19-.11-2,1.37-2l4.8.06c1.55,0,2,.48,1.94,1.93v6.55h6.51c1.19,0,2-.11,2,1.37l-.06,4.8c0,1.55-.48,2-1.93,1.94h-6.55v6.54c0,1.46-.39,2-1.94,1.94l-4.8.06c-1.48,0-1.37-.84-1.37-2V100.9H90c-1.46,0-2-.39-1.94-1.94L88,94.16c0-1.48.83-1.37,2-1.37h6.51V86.28Z"/></svg>`

    let showParticipants = document.createElement('div');
    showParticipants.className = 'showParticipants';

    closeContainer.appendChild(close);
    groupNameContainer.appendChild(groupName);
    groupNameContainer.appendChild(createGroupButton);
    addGroupDetails.appendChild(closeContainer);
    addGroupDetails.appendChild(groupNameContainer);

    titleContainer.appendChild(groupTitle);
    addParticipantsContainer.appendChild(addParticipantsText)
    addParticipantsContainer.appendChild(addParticipantsButton)

    showChatsContainer.appendChild(addGroupDetails);

    close.addEventListener('click', () => {
        addGroupDetails.style.left = '100%';
        addGroupDetails.remove();
    })
    createGroupButton.addEventListener('click', createNewGroupByUser)
    groupName.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            createNewGroupByUser();
        }
    })
    addParticipantsButton.addEventListener('click', addParticipantInGroupByUser)
    addParticipantsText.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            addParticipantInGroupByUser();
        }
    })
    function createNewGroupByUser() {
        fetch(`${url}/api/chat/createGroupChat`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ title: groupName.value })
        })
            .then(response => response.text())
            .then((data) => {
                if (JSON.parse(data).success) {
                    messagePageBefore = 0;
                    messagePageAfter = 0;
                    showChats.innerHTML = ""
                    renderChats(messagePageBefore);
                    groupID = JSON.parse(data).groupID;
                    groupTitle.innerHTML = groupName.value;
                    groupNameContainer.remove();
                    addGroupDetails.appendChild(titleContainer);
                    addGroupDetails.appendChild(addParticipantsContainer);
                    addGroupDetails.appendChild(showParticipants);

                }
            })
    }
    function addParticipantInGroupByUser() {
        fetch(`${url}/api/chat/addParticipantsToGroup`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ groupID, participantEmail: addParticipantsText.value })
        })
            .then(response => response.text())
            .then((data) => {
                if (JSON.parse(data).success) {
                    addParticipantsText.value=""
                    showParticipants.innerHTML = "";
                    JSON.parse(data).participants.forEach(part => {
                        if (part.email !== emailContainer.innerHTML.trim()) {
                            let participant = document.createElement('label')
                            participant.className = 'participant';
                            participant.innerHTML = part.email;
                            showParticipants.appendChild(participant)

                            participant.addEventListener('click', () => {
            
                                fetch(`${url}/api/chat/deleteParticipantFromGroup`, {
                                    method: "POST",
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ chatId: groupID, participantId: part._id })
                                })
                                    .then(response => response.text())
                                    .then(data => {
                                        if (JSON.parse(data).success) {
                                            participant.remove();
                                        }
                                    })
                            })
                        }
                    })

                }
            })
    }
    addGroupDetails.style.left = '0%';
})
showMessage.addEventListener('scroll', (event) => {
    
    if (showMessage.scrollTop < 30) {

        showMessagesBefore(chatIdForShowMessage, ++messagePageBefore)
    }
    else if (showMessage.scrollTop === showMessage.scrollHeight - window.innerHeight + 200) {
        if(messagePageAfter>0)
        showMessagesAfter(chatIdForShowMessage, --messagePageAfter)
    }
})
showChats.addEventListener('scroll', (event) => {
    if (showChats.scrollTop + window.innerHeight === showChats.scrollHeight + 225) {

        renderChats(++chatPage);
    }
})
profileImageContainer.addEventListener('click', () => {
    if (flag) {
        menuOptions.style.height = '0px';
        menuOptions.innerHTML = "";
        flag = false;
    }
    else {
        menuOptions.style.height = '150px';
        menuOptions.innerHTML = ` <a href="/api/user/resetPassword">Reset Password</a>
        <a href="/api/user/logout">Logout</a>`;
        flag = true;
    }

})
chatNameOnScreen.addEventListener('click', () => {
    if (flagForUpdate) {
        flagForUpdate = false;
        document.getElementById('editGroupContainer').remove()
    }
    else {
        findGroupInformation()
        flagForUpdate = true;
    }
});
chatImageOnScreen.addEventListener('click', () => { 
    if (flagForUpdate) {
        flagForUpdate = false;
        document.getElementById('editGroupContainer').remove()
    }
    else {
        findGroupInformation()
        flagForUpdate = true;
    }
});
function createChat(id) {

    fetch(`${url}/api/chat/createChat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
    })
        .then(response => response.text())
        .then((data) => {
            showChats.innerHTML = "";
            chatPage = 0;
            renderChats();
        })
}
function renderChats(chatPage) {
    fetch(`${url}/api/chat/getAllChats?page=${chatPage}`, { method: 'GET' })
        .then(response => response.text())
        .then(data => {
            JSON.parse(data).data.forEach(chat => {

                let chatBox = document.createElement('div');
                chatBox.className = "chatBox"

                let chatPicture = document.createElement('img');
                chatPicture.className = 'chatPicture';

                let chatDescription = document.createElement('div');
                chatDescription.className = "chatDescription"

                let chatName = document.createElement('label');
                chatName.className = "chatName"

                let latestMessage = document.createElement('label');
                latestMessage.className = "latestMessage"
                if (chat.latestMessage) {
                    if (chat.latestMessage.content.length > 10) {
                        latestMessage.innerHTML = chat.latestMessage.content.substr(0, 10) + "...";
                    }
                    else {
                        latestMessage.innerHTML = chat.latestMessage.content;
                    }

                }

                if (chat.isGroupChat) {
                    chatPicture.src = 'group.jpg';
                    chatName.innerHTML = chat.chatName;
                }
                else {
                    chat.participants.forEach(member => {
                        if (member.email !== JSON.parse(data).email) {
                            chatName.innerHTML = member.name;
                            chatPicture.src = member.picture;


                        }
                    })
                }


                let chatCountContainer = document.createElement('div');
                chatCountContainer.className = 'chatCountContainer';

                let chatCount = document.createElement('div');
                chatCount.className = 'chatCount';
                chatCountContainer.appendChild(chatCount);

                chatBox.id = chat._id;

                chatDescription.appendChild(chatName)
                chatDescription.appendChild(latestMessage)

                chatBox.appendChild(chatPicture)
                chatBox.appendChild(chatDescription)
                chatBox.appendChild(chatCountContainer);
                showChats.appendChild(chatBox)
                socket.emit('chatRoom', chat._id)

                findUnReadMessages(chat._id);

                chatBox.addEventListener('click', () => {
                   let messagePage = 0;
                    socket.emit('chatRoom', chatBox.id)
                    chatImageOnScreen.src = chatPicture.src;
                    chatNameOnScreen.innerHTML = chatName.innerHTML;
                    showMessage.innerHTML = "";
                    messageSendContainer.style.display = 'flex';
                    chatDetails.style.display = 'flex';
                    chatIdForShowMessage = chatBox.id
                    let pageValueCalculate = document.getElementById(chatBox.id).children[2].children[0].innerHTML;
                    pageValueCalculate = parseInt(pageValueCalculate);
                    messagePage = Math.floor(pageValueCalculate / 7)
                    messagePageAfter = messagePageBefore = messagePage;
                    showMessagesBefore(chatBox.id, messagePage);
                    if (messagePage > 0) {
                        showMessagesAfter(chatBox.id, --messagePageAfter);
                    }
                    else {
                        showMessagesBefore(chatBox.id, ++messagePageBefore);
                    }
                    readAllMessagesOnClick(chatBox.id)

                })
            });
        })
}
function showMessagesBefore(chatId, messagePageBefore) {
    fetch(`${url}/api/chat/getMessages?chatId=${chatId}&page=${messagePageBefore}`, { method: 'GET' })
        .then(response => response.text())
        .then(data => {

            JSON.parse(data).messages.forEach((messageOnChat => {
                let message = document.createElement('label');
                message.innerHTML = messageOnChat.content;
                if (messageOnChat.sender.email === JSON.parse(data).email) {
                    message.className = "sendedMessage"
                }
                else {
                    message.className = "receavedMessage"
                }
                showMessage.prepend(message)
               
            }))
            if (messagePageBefore <= 1)
            showMessage.scrollTop = showMessage.scrollHeight-window.innerHeight+199;
        })
    chatIdForSend = chatId;
}
function showMessagesAfter(chatId, messagePageAfter) {
    fetch(`${url}/api/chat/getMessages?chatId=${chatId}&page=${messagePageAfter}`, { method: 'GET' })
        .then(response => response.text())
        .then(data => {

            JSON.parse(data).messages.reverse().forEach((messageOnChat => {
                let message = document.createElement('label');
                message.innerHTML = messageOnChat.content;
                if (messageOnChat.sender.email === JSON.parse(data).email) {
                    message.className = "sendedMessage"
                }
                else {
                    message.className = "receavedMessage"
                }
                showMessage.append(message)

                showMessage.scrollTop = showMessage.scrollHeight-window.innerHeight;


            }))
        })
    chatIdForSend = chatId;
}
function sendMessage() {
    fetch(`${url}/api/chat/createMessage`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend.value, chatIdForSend })
    })
        .then(response => response.text())
        .then((data) => {
            if (JSON.parse(data).data !== false) {
                socket.emit('send message', messageToSend.value, chatIdForSend, emailContainer.innerHTML.trim());
                let message = document.createElement('label');
                let latestMessageOnChat = document.getElementById(chatIdForSend);

                if (latestMessageOnChat) {
                    if (messageToSend.value.trim().length > 10) {
                        latestMessageOnChat.children[1].children[1].innerHTML = messageToSend.value.trim().substr(0, 10) + "...";
                    }
                    else {
                        latestMessageOnChat.children[1].children[1].innerHTML = messageToSend.value.trim();
                    }
                    latestMessageOnChat.parentElement.prepend(latestMessageOnChat);
                }
                else {
                    chatPage = 0;
                    renderChats(chatPage)
                }

                message.className = 'sendedMessage';
                message.innerHTML = messageToSend.value.trim();
                showMessage.appendChild(message);
                showMessage.scrollTop = showMessage.scrollHeight;
            }
            messageToSend.value = "";

        })
}
function addUserToMyChat() {
    let searchedUsersContainer = document.createElement('div')
    fetch(`${url}/api/user/serchUser?search=${searchForUser.value}`, {
        method: "GET"
    })
        .then((response) => response.text())
        .then((data) => {
            if (JSON.parse(data).found === false) {
                alert("user Not found")
            }
            else if (JSON.parse(data).found === true) {
                createChat(JSON.parse(data).id)
            }
        })
}
function findGroupInformation() {
    fetch(`${url}/api/chat/checkForAdmin`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: chatIdForShowMessage })
    })
        .then(response => response.text())
        .then((data) => {

            if (JSON.parse(data).isGroupChat) {
                let editGroupContainer = document.createElement('div');
                editGroupContainer.id = 'editGroupContainer';

                let groupNameUpdateInputContainer = document.createElement('div');
                groupNameUpdateInputContainer.className = 'groupNameUpdateInputContainer';

                let groupNameUpdateInput = document.createElement('input');
                groupNameUpdateInput.className = 'groupNameUpdateInput'
                groupNameUpdateInput.type = 'text';
                groupNameUpdateInput.required = 'true';
                groupNameUpdateInput.value = JSON.parse(data).chat[0].chatName;

                groupNameUpdateInputButton = document.createElement('button');
                groupNameUpdateInputButton.className = 'groupNameUpdateInputButton';
                groupNameUpdateInputButton.innerHTML = `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 119.15"><defs><style>.cls-1{fill-rule:evenodd;}</style></defs><title>add-user</title><path class="cls-1" d="M100.58,74.55a22.3,22.3,0,1,1-22.31,22.3,22.29,22.29,0,0,1,22.31-22.3ZM36,56.88c-2.09-3.33-6-7.85-6-11.75a6.29,6.29,0,0,1,4.23-5.71c-.2-3.3-.33-6.65-.33-10,0-2,0-3.94.11-5.88a13.63,13.63,0,0,1,.66-3A21,21,0,0,1,44,8.74a27.24,27.24,0,0,1,5.08-2.43C52.28,5.14,50.72.07,54.25,0c8.23-.21,21.76,7,27,12.7a19.22,19.22,0,0,1,5.39,12.85L86.34,40a4.73,4.73,0,0,1,3.46,3c1.13,4.55-3.59,10.21-5.79,13.83-2,3.34-9.76,12.45-9.76,12.53C74,72.42,76,74.5,79.33,76.2A29.63,29.63,0,0,0,74,109.89H0c0-33.68,45.89-26,45.67-40.64,0-.21-8.89-11.1-9.69-12.37Zm60.54,29.4c0-1.19-.11-2,1.37-2l4.8.06c1.55,0,2,.48,1.94,1.93v6.55h6.51c1.19,0,2-.11,2,1.37l-.06,4.8c0,1.55-.48,2-1.93,1.94h-6.55v6.54c0,1.46-.39,2-1.94,1.94l-4.8.06c-1.48,0-1.37-.84-1.37-2V100.9H90c-1.46,0-2-.39-1.94-1.94L88,94.16c0-1.48.83-1.37,2-1.37h6.51V86.28Z"/></svg>`
            
                let addParticipantInGroupByUserOnUpdate = document.createElement('input');
                addParticipantInGroupByUserOnUpdate.className = 'addParticipantInGroupByUserOnUpdate';
                addParticipantInGroupByUserOnUpdate.type = 'text';
                addParticipantInGroupByUserOnUpdate.placeholder = 'add participants';

                let addParticipantInGroupByUserOnUpdateButton = document.createElement('button');
                addParticipantInGroupByUserOnUpdateButton.className = 'addParticipantInGroupByUserOnUpdateButton';
                addParticipantInGroupByUserOnUpdateButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 341.39"><path d="M3.62 302.83c-2 0-3.62-1.62-3.62-3.62 0-1.04.14-2.05.39-3.06 5.8-46 41.82-58.27 67.37-64.9 12.79-3.31 44.6-15.93 31.92-33.3-7.1-9.74-13.53-16.58-19.97-26.87-4.65-6.86-7.1-12.99-7.1-17.89 0-5.23 2.77-11.35 8.32-12.74-.73-10.53-.98-24.38-.48-35.65 1.76-19.35 15.64-33.61 33.57-39.93 7.09-2.7 3.66-13.49 11.5-13.72 18.38-.5 48.51 15.19 60.28 27.92 6.86 7.35 11.26 17.15 12 30.14l-.74 32.46c3.43.98 5.64 3.19 6.62 6.62.98 3.92 0 9.31-3.43 16.91 0 .24-.25.24-.25.49-7.56 12.46-15.44 20.72-24.1 32.26-3.86 5.16-3.11 10.09.1 14.53-4.51 2.63-8.92 5.66-13.15 9.22-16.79 14.09-29.76 35.09-34.32 68.53-.9 3.91-1.25 8.64-.6 12.6H3.62zm415.6-73.61c-.03-3.56-.36-6.1 4.05-6.04l14.28.18c4.61-.03 5.84 1.43 5.79 5.75v19.48h19.36c3.55-.03 6.09-.36 6.03 4.05l-.17 14.29c.02 4.61-1.44 5.83-5.76 5.78h-19.46v19.47c.05 4.32-1.18 5.78-5.79 5.75l-14.28.18c-4.41.06-4.08-2.48-4.05-6.04v-19.36h-19.49c-4.31.05-5.77-1.17-5.75-5.78l-.17-14.29c-.07-4.41 2.48-4.08 6.03-4.05h19.38v-19.37zm12.05-49.31c22.29 0 42.48 9.04 57.08 23.65 14.61 14.61 23.65 34.81 23.65 57.09 0 22.3-9.04 42.48-23.65 57.09-14.6 14.61-34.8 23.65-57.08 23.65-22.3 0-42.48-9.04-57.09-23.65l-.45-.48c-14.35-14.59-23.2-34.59-23.2-56.61 0-22.26 9.04-42.45 23.66-57.06 14.6-14.64 34.79-23.68 57.08-23.68zm45.31 35.42c-11.59-11.59-27.61-18.76-45.31-18.76-17.7 0-33.74 7.17-45.33 18.76-11.6 11.57-18.76 27.6-18.76 45.32 0 17.53 7.01 33.41 18.36 44.94l.41.38c11.59 11.6 27.61 18.77 45.32 18.77 17.69 0 33.72-7.17 45.31-18.77 11.6-11.59 18.77-27.62 18.77-45.32 0-17.69-7.17-33.73-18.77-45.32zm-322.65 87.54c-2.44 0-4.42-1.98-4.42-4.43 0-1.25.17-2.5.48-3.73 7.08-56.13 40.73-68.33 71.87-76.34 14.95-3.84 44.78-18.85 41.16-38.2-7.54-6.99-15.03-16.65-16.33-31.06l-.91.02c-2.09-.03-4.11-.51-6-1.57-4.16-2.37-6.44-6.91-7.54-12.08-2.3-15.79-2.89-23.85 5.53-27.38l.07-.03c-1.04-19.48 2.25-48.14-17.76-54.2 39.5-48.81 85.05-75.37 119.24-31.94 38.1 2 55.09 55.96 31.43 86.17h-1c8.42 3.53 7.15 12.58 5.53 27.38-1.1 5.17-3.38 9.71-7.54 12.08-1.89 1.06-3.91 1.54-6 1.57l-.91-.02c-1.3 14.41-8.81 24.07-16.35 31.06-1.22 6.55 1.37 12.58 5.93 17.87-13.43 17.3-21.41 39.03-21.41 62.61 0 15.05 3.25 29.35 9.09 42.22H153.93z"/></svg>`;

                addParticipantInGroupByUserOnUpdateContainer = document.createElement('div')
                addParticipantInGroupByUserOnUpdateContainer.className = 'addParticipantInGroupByUserOnUpdateContainer';
                

                let showParticipantsInGroupOnUpdate = document.createElement('div');
                showParticipantsInGroupOnUpdate.className = 'showParticipantsInGroupOnUpdate';
                showParticipantsInGroupOnUpdate.innerHTML = "";
                JSON.parse(data).chat[0].participants.forEach(part => {
                    if (part.email !== emailContainer.innerHTML.trim()) {
                        let participant = document.createElement('label')
                        participant.className = 'participant';
                        participant.innerHTML = part.email;
                        showParticipantsInGroupOnUpdate.appendChild(participant)
                        participant.addEventListener('click', () => {
            
                            fetch(`${url}/api/chat/deleteParticipantFromGroup`, {
                                method: "POST",
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ chatId: chatIdForShowMessage, participantId: part._id })
                            })
                                .then(response => response.text())
                                .then(data => {
                                    if (JSON.parse(data).success) {
                                        participant.remove();
                                    }
                                })
                        })
                    }
                })

                groupNameUpdateInputContainer.appendChild(groupNameUpdateInput);
                groupNameUpdateInputContainer.appendChild(groupNameUpdateInputButton);

                addParticipantInGroupByUserOnUpdateContainer.appendChild(addParticipantInGroupByUserOnUpdate);
                addParticipantInGroupByUserOnUpdateContainer.appendChild(addParticipantInGroupByUserOnUpdateButton);

                editGroupContainer.appendChild(groupNameUpdateInputContainer);
                editGroupContainer.appendChild(addParticipantInGroupByUserOnUpdateContainer);
                editGroupContainer.appendChild(showParticipantsInGroupOnUpdate);
                showMessage.appendChild(editGroupContainer)

                addParticipantInGroupByUserOnUpdateButton.addEventListener('click',addParticipantInGroupByUser)
                addParticipantInGroupByUserOnUpdate.addEventListener('keyup', (event) => {
                    if (event.key === 'Enter') {
                        addParticipantInGroupByUser();
                    }
                })


                groupNameUpdateInputButton.addEventListener('click',changeGroupNameInGroupByUser)
                groupNameUpdateInput.addEventListener('keyup', (event) => {
                    if (event.key === 'Enter') {
                        changeGroupNameInGroupByUser();
                    }
                })

                function addParticipantInGroupByUser() {
                    
                    fetch(`${url}/api/chat/addParticipantsToGroup`, {
                        method: 'POST',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({groupID: chatIdForShowMessage, participantEmail: addParticipantInGroupByUserOnUpdate.value })
                    })
                        .then(response => response.text())
                        .then((data) => {
                            if (JSON.parse(data).success) {
                                editGroupContainer.remove()
                                findGroupInformation();
                            }
                        })
                }
                function changeGroupNameInGroupByUser() {
                    fetch(`${url}/api/chat/chageGroupName`, {
                        method: 'POST',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({groupID: chatIdForShowMessage, groupName: groupNameUpdateInput.value })
                    })
                        .then(response => response.text())
                        .then((data) => {
                            if (JSON.parse(data).success) {
                                document.getElementById(chatIdForShowMessage).children[1].children[0].innerHTML = groupNameUpdateInput.value.trim();
                                document.getElementById('chatNameOnScreen').innerHTML = groupNameUpdateInput.value.trim();
                            }
                        })  
                }
            }
        })
}
function findUnReadMessages(groupId) {

    fetch(`${url}/api/chat/findUnReadMessagesByUserInChat`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: groupId })
    })
        .then(response => response.text())
        .then(data => {
            let messageCount = document.getElementById(groupId).children[2];
            if ((JSON.parse(data).length) === 0 ||groupId===chatIdForShowMessage) {
                messageCount.style.display = 'none';
                readAllMessagesOnClick(groupId)
            }
            else {
                messageCount.style.display = 'flex';
            }
            messageCount.children[0].innerHTML = JSON.parse(data).length;
        })
}
function readAllMessagesOnClick(groupId) {

    fetch(`${url}/api/chat/readMessages`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: groupId })
    })
        .then(response => response.text())
        .then(data => {
            if (JSON.parse(data).success) {
                let messageCount = document.getElementById(groupId).children[2];
                messageCount.style.display = 'none';
                messageCount.children[0].innerHTML = '0';
            }
            
            
        })
}




