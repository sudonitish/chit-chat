const url = '';
const socket = io("https://chit-chat-k8xb.onrender.com");
let messageToSend = document.getElementById("messageToSend")
let showMessage = document.getElementById("showMessage");
let showChats = document.getElementById('showChats')
let send = document.getElementById("send");
let chatDetails = document.getElementById('chatDetails');
let emailContainer = document.getElementById('email')
let messageSendContainer = document.getElementById('messageSendContainer')
let userInput = document.getElementById('userInput');
let searchForUser = document.getElementById('searchForUser');
let add = document.getElementById('add');
let createGroup = document.getElementById('createGroup')
let mainContainer = document.getElementById('mainContainer')
let profilePicture = document.getElementById('profilePicture');
let menuOptions = document.getElementById('menuOptions');
let chatImageOnScreen = document.getElementById('chatImageOnScreen');
let chatNameOnScreen = document.getElementById('chatNameOnScreen');
let showChatsContainer = document.getElementById('showChatsContainer');
let chatContainer = document.getElementById('chatContainer');
let editGroupOuterContainer = document.getElementById('editGroupOuterContainer');
let exports = document.getElementById('export');
let backButton = document.getElementById('backButton');
let addGroupDetails = document.getElementById('addGroupDetails');
let menuButton = document.getElementById('menu-icon');
let profilePictureToEditUpload=document.getElementById('profilePictureToEditUpload');
let chatIdForSend = null;
let chatIdForShowMessage = null;
let chatPage = 0;
let messagePageBefore = 0;
let messagePageAfter = 0;
let flag = false;
let flagForUpdate = false;
let isPersonalChat = false;
renderChats(chatPage)
socket.on('connect', () => { })
socket.on('receave message', function (data) {

    let messageContainer = document.createElement('div')
    let senderEmail = document.createElement('label')
    senderEmail.className = 'senderEmail';
    let message = document.createElement('label');
    message.className = "innerMessage"
    messageContainer.appendChild(senderEmail)
    messageContainer.appendChild(message)
    message.innerText = data.msg;
    showMessage.appendChild(messageContainer);
    let latestMessageOnChat = document.getElementById(data.roomId);
    if (latestMessageOnChat) {
        latestMessageOnChat.children[1].children[1].innerText = data.msg.trim();
        latestMessageOnChat.parentElement.prepend(latestMessageOnChat);
        findUnReadMessages(data.roomId)
    }
    else {
        chatPage = 0;
        renderChats(chatPage)
    }
    showMessage.scrollTop = showMessage.scrollHeight;
    if (data.email === emailContainer.innerText.trim()) {
        if (!isPersonalChat)
            senderEmail.innerText = '~Me';
        messageContainer.className = 'sendedMessage';

    }
    else
        if (data.roomId === chatIdForSend) {
            if (!isPersonalChat)
                senderEmail.innerText = "~" + data.email;
            messageContainer.className = 'receavedMessage';
        }
        else {
            messageContainer.remove();
        }

});
//----------------------------------------------------------------
//----------------------------------------------------------------
//event listeners
//----------------------------------------------------------------
//----------------------------------------------------------------
add.addEventListener('click', addUserToMyChat)
send.addEventListener('click', sendMessage)
searchForUser.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        addUserToMyChat()
    }
})
messageToSend.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        sendMessage()
    }
})
createGroup.addEventListener('click', () => {
    addGroupDetails.classList.remove('d-none');
    userInput.classList.add('d-none');
    showChats.classList.add('d-none');
    if (!isMobileDevice() && !chatContainer.classList.contains('d-none')) {
        chatContainer.classList.add('d-none');
    }
    let groupID = null;
    let groupEditActive = true;
    let close = document.getElementById('close');
    let groupNameContainer= document.getElementById('groupNameContainer');
    let groupName = document.getElementById('groupName');
    let createGroupButton = document.getElementById('createGroupButton');
    let groupTitle = document.getElementById('groupTitle');
    let addParticipantsContainer = document.getElementById('addParticipantsContainer');
    let addParticipantsText = document.getElementById('addParticipantsText');
    let addParticipantsButton = document.getElementById('addParticipantsButton');
    let showParticipants = document.getElementById('showParticipants');

    close.addEventListener('click', () => {
        userInput.classList.remove('d-none');
        addGroupDetails.classList.add('d-none');
        showChats.classList.remove('d-none');
        addParticipantsContainer.classList.add('d-none');
        groupNameContainer.classList.remove('d-none');
        groupName.value = '';
        groupTitle.innerText = '';
        addParticipantsText.value = '';
        showParticipants.innerHTML='';
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
        if (groupEditActive) {
            fetch(`${url}/api/chat/createGroupChat`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ title: groupName.value })
            })
            .then(response => response.text())
            .then((data) => {
                  if (JSON.parse(data).success) {
                      groupEditActive=false;
                      messagePageBefore = 0;
                      messagePageAfter = 0;
                      showChats.innerHTML = ""
                      renderChats(messagePageBefore);
                      groupID = JSON.parse(data).groupID;
                      groupTitle.innerText = groupName.value;
                      groupNameContainer.classList.add('d-none');
                      addParticipantsContainer.classList.remove('d-none');
                  }
            })
        }
    }
    function addParticipantInGroupByUser() {
        if (groupID) {
            fetch(`${url}/api/chat/addParticipantsToGroup`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ groupID, participantEmail: addParticipantsText.value })
            })
                .then(response => response.text())
                .then((data) => {
                    if (JSON.parse(data).success) {
                        addParticipantsText.value = ""
                        showParticipants.innerHTML = "";
                        JSON.parse(data).participants.forEach(part => {
                            if (part.email !== emailContainer.innerText.trim()) {
                                let participant = document.createElement('label')
                                participant.className = 'participant';
                                participant.innerText = part.email;
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
    }
})
showMessage.addEventListener('scroll', (event) => {
    if (showMessage.scrollTop <30) {
        showMessagesBefore(chatIdForShowMessage, ++messagePageBefore)
    }
    else if (showMessage.scrollTop > showMessage.scrollHeight - window.innerHeight + 160) {
        if (messagePageAfter > 0)
            showMessagesAfter(chatIdForShowMessage, --messagePageAfter)
    }
})
showChats.addEventListener('scroll', (event) => {
    if (showChats.scrollTop + window.innerHeight === showChats.scrollHeight + 160) {
        renderChats(++chatPage);
    }
})
profilePictureToEditUpload.addEventListener('change', (event) => {
    handleImageUpload(event, profilePictureToEditUpload)
})
chatNameOnScreen.addEventListener('click', handleEditProfileClick);
chatImageOnScreen.addEventListener('click', handleEditProfileClick);
backButton.addEventListener('click', () => {
    showChatsContainer.classList.remove('d-none');
    document.getElementById(chatIdForShowMessage).classList.remove('active');
    exports.classList.add('d-none');
    chatIdForShowMessage=null;
})
exports.addEventListener('click', () => {
    window.open(`${url}/api/chat/exportChat?chatId=${chatIdForShowMessage}&startDate=${0}&endDate=${0}&chatName=${chatNameOnScreen.innerText}&chatImage=${chatImageOnScreen.src}`, '_blank');
})
menuButton.addEventListener('click', ()=>{
    setTimeout(() =>{
        menuOptions.children[0].classList.toggle('d-none');
    },50)
    setTimeout(() =>{
        menuOptions.children[1].classList.toggle('d-none');
    },52)
    setTimeout(() =>{
        menuOptions.children[2].classList.toggle('d-none');
    },54)
    menuButton.classList.toggle('menuOpen');
    menuButton.parentElement.classList.toggle('bg-changeforMenu');
    menuButton.parentElement.parentElement.classList.toggle('abs-right');
})
//----------------------------------------------------------------
//----------------------------------------------------------------
//functions
//----------------------------------------------------------------
//----------------------------------------------------------------
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
            renderChats(chatPage);
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
                    latestMessage.innerText = chat.latestMessage.content;
                }

                if (chat.isGroupChat) {
                    chatPicture.src = 'group.png';
                    chatName.innerText = chat.chatName;
                    chatBox.setAttribute('data-is-group', 'true');
                }
                else {
                    chatBox.setAttribute('data-is-group', 'false');
                    chat.participants.forEach(member => {
                        if (member.email !== JSON.parse(data).email) {
                            chatName.innerText = member.name;
                            chatPicture.src = member.picture;
                        }
                    })
                }


                let chatCountContainer = document.createElement('div');
                chatCountContainer.className = 'chatCountContainer';

                let chatCount = document.createElement('div');
                chatCount.className = 'chatCount';
                chatCountContainer.appendChild(chatCount);

                if (chat._id)
                    chatBox.id = chat._id;
                else
                    chatBox.id = chat.id;

                chatDescription.appendChild(chatName)
                chatDescription.appendChild(latestMessage)

                chatBox.appendChild(chatPicture)
                chatBox.appendChild(chatDescription)
                chatBox.appendChild(chatCountContainer);
                showChats.appendChild(chatBox)

                socket.emit('chatRoom', chatBox.id)
                if (chat._id) {
                    findUnReadMessages(chat._id);

                }
                else {
                    findUnReadMessages(chat.id);

                }

                chatBox.addEventListener('click', () => {
                    let messagePage = 0;
                    if (isMobileDevice()) {
                        showChatsContainer.classList.add('d-none');
                        backButton.classList.remove('d-none');
                    }
                    hideGroupEdit();

                    socket.emit('chatRoom', chatBox.id)
                    chatImageOnScreen.src = chatPicture.src;
                    chatNameOnScreen.innerText = chatName.innerText;
                    showMessage.innerHTML = "";
                    chatDetails.setAttribute('data-is-group', chatBox.getAttribute('data-is-group'));
                    isPersonalChat = (chatBox.getAttribute('data-is-group') === 'false');
                    if (chatIdForShowMessage) {
                        document.getElementById(chatIdForShowMessage).classList.remove('active');
                    }
                    chatIdForShowMessage = chatBox.id;
                    document.getElementById(chatIdForShowMessage).classList.add('active');
                    chatContainer.classList.remove('d-none');
                    let pageValueCalculate = document.getElementById(chatBox.id).children[2].children[0].innerText;
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
                let messageContainer = document.createElement('div')
                let senderEmail = document.createElement('label')
                senderEmail.className = 'senderEmail';
                let message = document.createElement('label');
                message.className = "innerMessage"
                message.innerText = messageOnChat.content;
                messageContainer.appendChild(senderEmail)
                messageContainer.appendChild(message)
                if (messageOnChat.sender.email === JSON.parse(data).email) {
                    if (!isPersonalChat)
                        senderEmail.innerText = '~Me';
                    messageContainer.className = "sendedMessage"
                }
                else {
                    if (!isPersonalChat)
                        senderEmail.innerText = "~" + messageOnChat.sender.email;
                    messageContainer.className = "receavedMessage"
                }
                showMessage.prepend(messageContainer)

            }))
            if (messagePageBefore <= 1)
                showMessage.scrollTop = showMessage.scrollHeight - window.innerHeight + 199;
        })
    chatIdForSend = chatId;
}
function showMessagesAfter(chatId, messagePageAfter) {
    fetch(`${url}/api/chat/getMessages?chatId=${chatId}&page=${messagePageAfter}`, { method: 'GET' })
        .then(response => response.text())
        .then(data => {

            JSON.parse(data).messages.reverse().forEach((messageOnChat => {

                let messageContainer = document.createElement('div')
                let senderEmail = document.createElement('label')
                senderEmail.className = 'senderEmail';
                let message = document.createElement('label');
                message.className = "innerMessage"
                message.innerText = messageOnChat.content;
                messageContainer.appendChild(senderEmail)
                messageContainer.appendChild(message)
                if (messageOnChat.sender.email === JSON.parse(data).email) {
                    if (!isPersonalChat)
                        senderEmail.innerText = '~Me';
                    messageContainer.className = "sendedMessage"
                }
                else {
                    if (!isPersonalChat)
                        senderEmail.innerText = "~" + messageOnChat.sender.email;
                    messageContainer.className = "receavedMessage"
                }
                showMessage.append(messageContainer)

                showMessage.scrollTop = showMessage.scrollHeight - window.innerHeight;


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
                socket.emit('send message', messageToSend.value, chatIdForSend, emailContainer.innerText.trim());
                let latestMessageOnChat = document.getElementById(chatIdForSend);
                let messageContainer = document.createElement('div')
                let senderEmail = document.createElement('label')
                senderEmail.className = 'senderEmail';
                let message = document.createElement('label');
                message.className = "innerMessage"
                messageContainer.appendChild(senderEmail)
                messageContainer.appendChild(message)

                if (latestMessageOnChat) {
                    latestMessageOnChat.children[1].children[1].innerText = messageToSend.value.trim();
                    latestMessageOnChat.parentElement.prepend(latestMessageOnChat);
                }
                else {
                    chatPage = 0;
                    renderChats(chatPage)
                }
                if (!isPersonalChat)
                    senderEmail.innerText = '~Me'
                messageContainer.className = 'sendedMessage';
                message.innerText = messageToSend.value.trim();
                showMessage.appendChild(messageContainer);
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
async function findGroupInformation() {
    await fetch(`${url}/api/chat/checkForAdmin`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: chatIdForShowMessage })
    })
        .then(response => response.text())
        .then((data) => {
            if (JSON.parse(data).isGroupChat) {
                flagForUpdate = true;
                let editGroupContainer = document.createElement('div');
                editGroupContainer.id = 'editGroupContainer';
                editGroupContainer.className = 'editGroupContainer';

                let groupNameUpdateInputContainer = document.createElement('div');
                groupNameUpdateInputContainer.className = 'groupNameUpdateInputContainer';

                let groupNameUpdateInput = document.createElement('input');
                groupNameUpdateInput.className = 'groupNameUpdateInput'
                groupNameUpdateInput.type = 'text';
                groupNameUpdateInput.required = 'true';
                groupNameUpdateInput.placeholder = 'Rename Group';
                groupNameUpdateInput.value = JSON.parse(data).chat[0].chatName;

                groupNameUpdateInputButton = document.createElement('button');
                groupNameUpdateInputButton.className = 'groupNameUpdateInputButton';
                groupNameUpdateInputButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 341.38"><path d="M3.62 302.83c-2 0-3.62-1.63-3.62-3.62 0-1.04.14-2.05.39-3.06 5.8-46 41.83-58.27 67.38-64.9 12.78-3.32 44.59-15.94 31.92-33.3-7.1-9.74-13.55-16.58-19.98-26.87-4.65-6.86-7.1-12.99-7.1-17.89 0-5.23 2.77-11.35 8.33-12.74-.73-10.53-.98-24.38-.49-35.65 1.77-19.35 15.64-33.61 33.57-39.93 7.1-2.7 3.67-13.49 11.5-13.72 18.38-.5 48.51 15.19 60.28 27.92 6.85 7.35 11.26 17.15 12 30.14l-.74 32.46c3.43.98 5.64 3.19 6.62 6.62.98 3.92 0 9.31-3.43 16.91 0 .24-.25.24-.25.48-7.56 12.47-15.44 20.73-24.1 32.27-3.86 5.16-3.1 10.09.1 14.53-4.51 2.63-8.91 5.66-13.15 9.22-16.88 14.17-29.89 35.31-34.39 69.06l-.51 2.98c-.25 1.93-.38 3.51-.38 4.7 0 1.49.12 2.96.36 4.39H3.62zm423.85-12.89-30.17 8.03 4.34-32.36 25.83 24.33zm-19.18-31.68 29.86-33.99a2.72 2.72 0 0 1 1.98-.95c.48 0 .96.09 1.37.31l22.98 20.9c.46.41.73 1.03.74 1.65.01.69-.27 1.37-.81 1.85l-30.39 34.57-25.76-24.34h.03zm22.97-78.35c22.26 0 42.46 9.05 57.07 23.67 14.63 14.59 23.67 34.78 23.67 57.07s-9.04 42.48-23.65 57.09l-.48.45c-14.58 14.34-34.57 23.19-56.61 23.19-22.29 0-42.48-9.04-57.08-23.64l-.45-.49c-14.35-14.58-23.21-34.58-23.21-56.6 0-22.27 9.05-42.45 23.65-57.05 14.61-14.65 34.81-23.69 57.09-23.69zm45.32 35.4c-11.57-11.58-27.59-18.75-45.32-18.75-17.69 0-33.73 7.18-45.32 18.77-11.59 11.57-18.77 27.61-18.77 45.32 0 17.53 7.01 33.4 18.37 44.94l.4.38c11.6 11.59 27.62 18.76 45.32 18.76 17.52 0 33.39-7.01 44.95-18.36l.38-.4c11.59-11.59 18.76-27.62 18.76-45.32 0-17.69-7.18-33.73-18.77-45.34zm-322.65 87.55c-2.44 0-4.42-1.97-4.42-4.42 0-1.25.18-2.5.48-3.73 7.08-56.13 40.73-68.33 71.87-76.34 14.96-3.84 44.77-18.85 41.16-38.2-7.54-6.99-15.02-16.65-16.34-31.06l-.9.02c-2.09-.03-4.12-.51-5.99-1.58-4.17-2.36-6.44-6.9-7.54-12.07-2.32-15.79-2.9-23.86 5.52-27.38l.07-.03c-1.04-19.48 2.25-48.14-17.76-54.2 39.5-48.81 85.04-75.37 119.24-31.94 38.09 2 55.09 55.96 31.43 86.17h-1c8.42 3.52 7.15 12.58 5.53 27.38-1.1 5.17-3.38 9.71-7.55 12.07-1.87 1.07-3.9 1.55-5.99 1.58l-.91-.02c-1.3 14.41-8.81 24.07-16.35 31.06-1.22 6.55 1.38 12.58 5.93 17.87-13.42 17.3-21.42 39.03-21.42 62.61 0 15.05 3.26 29.35 9.11 42.21H153.93z"/></svg>`

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
                    if (part.email !== emailContainer.innerText.trim()) {
                        let participant = document.createElement('label')
                        participant.className = 'participant';
                        participant.innerText = part.email;
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
                editGroupOuterContainer.appendChild(editGroupContainer)

                addParticipantInGroupByUserOnUpdateButton.addEventListener('click', addParticipantInGroupByUser)
                addParticipantInGroupByUserOnUpdate.addEventListener('keyup', (event) => {
                    if (event.key === 'Enter') {
                        addParticipantInGroupByUser();
                    }
                })


                groupNameUpdateInputButton.addEventListener('click', changeGroupNameInGroupByUser)
                groupNameUpdateInput.addEventListener('keyup', (event) => {
                    if (event.key === 'Enter') {
                        changeGroupNameInGroupByUser();
                    }
                })

                function addParticipantInGroupByUser() {

                    fetch(`${url}/api/chat/addParticipantsToGroup`, {
                        method: 'POST',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({ groupID: chatIdForShowMessage, participantEmail: addParticipantInGroupByUserOnUpdate.value })
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
                        body: JSON.stringify({ groupID: chatIdForShowMessage, groupName: groupNameUpdateInput.value })
                    })
                        .then(response => response.text())
                        .then((data) => {
                            if (JSON.parse(data).success) {
                                document.getElementById(chatIdForShowMessage).children[1].children[0].innerText = groupNameUpdateInput.value.trim();
                                document.getElementById('chatNameOnScreen').innerText = groupNameUpdateInput.value.trim();
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
            if ((JSON.parse(data).length) === 0 || groupId === chatIdForShowMessage) {
                messageCount.style.display = 'none';
                readAllMessagesOnClick(groupId)
            }
            else {
                messageCount.style.display = 'flex';
            }
            messageCount.children[0].innerText = JSON.parse(data).length;
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
                messageCount.children[0].innerText = '0';
            }
        })
}
function handleImageUpload(event, profilePictureToEdit) {
    const files = event.target.files;
    const formData = new FormData();

    formData.append('displayPicture', files[0])

    fetch(`${url}/api/user/changeProfile`, {
        method: "POST",
        body: formData
    })
        .then(response => response.text())
        .then(data => {
            if (JSON.parse(data).status === 'ok') {
                profilePicture.src = JSON.parse(data).picture;
                profilePictureToEdit.src = JSON.parse(data).picture;
            }
        })
}
function hideGroupEdit() {
    let editGroupContainer = document.getElementById('editGroupContainer');
    if (editGroupContainer) {
        editGroupContainer.remove();
    }
    flagForUpdate = false;
    editGroupOuterContainer.classList.remove('h100');
    editGroupOuterContainer.classList.add('d-none');
    chatDetails.classList.remove('bottom-radius');
    showMessage.classList.remove('d-none');
    messageSendContainer.classList.remove('d-none');
}
function showGroupEdit() {
    showMessage.classList.add('d-none');
    messageSendContainer.classList.add('d-none');
    editGroupOuterContainer.classList.remove('d-none');
    editGroupOuterContainer.classList.add('h100');
    chatDetails.classList.add('bottom-radius');
    flagForUpdate = true;
}
async function handleEditProfileClick() {
    if (flagForUpdate) {
        hideGroupEdit();
    }
    else {
        await findGroupInformation();
        if (flagForUpdate) {
            showGroupEdit();
        }
    }
}
function isMobileDevice() {
    const mobileWidthThreshold = 990; // Adjust this value as needed
    return window.innerWidth < mobileWidthThreshold;
}




