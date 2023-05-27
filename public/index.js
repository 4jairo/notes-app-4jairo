//utils

function mainMenuUtils(){
    const mainMenuBtn = mainMenu.querySelectorAll('span')
    for (const btn of mainMenuBtn) {
        btn.addEventListener('click', () => {
            //modal container
            if(btn.id === 'mainMenu-login'){
                loginModal()

            //new Note
            } else if(btn.id === 'mainMenu-notes') {
                
                newNoteContainer.innerHTML = `
                <div class="newNoteContent">
                    <div id="newNoteInputContainer"><input type="text" id="newNoteValue" placeholder="new text"></div>
                    <div><img src="imgs/done.png" class="confirmation"></div>
                    </div>`
                //<div id="uploadImage"><input type="file" placeholder="or upload a image"></div>

                const confirmationBtn = newNoteContainer.querySelector('.confirmation')
                confirmationBtn.addEventListener('click', () => {
                    newNote(newNoteValue.value)
                    newNoteContainer.innerHTML = ''
                })

            //logout
            } else if(btn.id === 'mainMenu-logout'){
                logoutUser()
            }
        })
    }
}

function loginModal(){
    loginModalContainer.style.display = 'flex'
    document.onclick = (e) => {
        if(e.target.id === 'loginModalContainer'){
            loginModalContainer.style.display = 'none'
            document.onclick = null
        }
    }
}

function loginModalUtils(){
    //login Modal Container -> login - create new acc
    const loginSigninBtns = Array.from(loginModalContent.querySelectorAll('h2[data-whatoperation]'))
    for (const btn of loginSigninBtns) {
        btn.addEventListener('click', () => {
            const whatOperation = btn.getAttribute('data-whatoperation')
            const otherOperationElement = loginSigninBtns.find(element => element.getAttribute('data-whatoperation') !== whatOperation)
            btn.style.borderBottom = '1px solid white'
            otherOperationElement.style.borderBottom = '0'
            
            loginModalContent.setAttribute('data-currentoperation', whatOperation)
        })
    }

    //login Modal container -> send form
    loginForm.send.addEventListener('click', () => {
        const name = loginForm.name.value
        const password = loginForm.password.value

        loginModalContent.getAttribute('data-currentoperation') === 'login'
            ? loginUser(name, password)
            : createNewUser(name, password)     
    })
}

function notesContainerUtils(){
    notesContainer.addEventListener('click', (e) => {
        const operation = e.target.getAttribute('data-operation')
        if(!operation) return

        const noteId = e.target.closest('.note').getAttribute('data-id')
        if(operation === 'edit') editNote(noteId)
        if(operation === 'remove') removeNote(noteId)
    })
}

//notes
function editNote(noteId){
    const noteElement = notesContainer.querySelector(`[data-id="${noteId}"]`)
    const noteContentContainer = noteElement.querySelector('.note-content')
    const noteContentElement = noteElement.querySelector('.note-content h3')
    const noteContentValue = noteElement.querySelector('.note-content h3').innerHTML
    
    noteContentElement.remove()
    noteContentContainer.innerHTML += `
    <div>
        <input type="text" value="${noteContentValue}">
    </div>
    <div>
        <img src="imgs/done.png" class="confirmation">
    </div>`

    const confirmBtn = noteContentContainer.querySelector(`.confirmation`)
    confirmBtn.addEventListener('click', () => {
        const token = localStorage.getItem('token')
        const newNoteValue = {
            content: noteContentContainer.querySelector(`input`).value
        }
        dbRequest(`${mainUrl}/notes/${noteId}`, 'PATCH', newNoteValue, token)
        .then(response => {
            if(response.error) console.log(response.error)
            else {
                //new note value
                noteContentContainer.innerHTML = `<h3>${response.content}</h3>`

                //new note time
                const noteTimeContainer = noteElement.querySelector('.note-time')

                const date = new Date(response.date)
                const dateString = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`
                const hour = `${date.getHours()}:${date.getMinutes()}`

                noteTimeContainer.innerHTML = `<p>${dateString}</p><p>&mdash;</p><p>${hour}</p>`
            }
        })
    })
}

function removeNote(noteId){
    const token = localStorage.getItem('token')
    if(!token) {
        console.log('not logged in')
        return
    }

    dbRequest(`${mainUrl}/notes/${noteId}`, 'DELETE', {}, token).then(() => {
        const removedNoteElement = notesContainer.querySelector(`[data-id="${noteId}"]`)
        removedNoteElement.remove()
    })
}

function newNote(content){
    const token = localStorage.getItem('token')
    if(!token) {
        console.log('any user rn')
        return
    }
    dbRequest(`${mainUrl}/notes`, 'POST', {content}, token).then(note => {     
        const {id, date, content} = note
        notesContainer.insertAdjacentHTML('afterbegin', noteContent(id, date, content))
    })
}

function showNote(notes){
    let HTMLContent = ''
    for (const note of notes) {
        const {id, date, content} = note
        HTMLContent += noteContent(id, date, content)
    }
    notesContainer.innerHTML = HTMLContent
}

function noteContent(noteId, noteDate, noteContent){
    const date = new Date(noteDate)
    const dateString = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`
    const hour = `${date.getHours()}:${date.getMinutes()}`
    
    return `
    <div class="note" data-id="${noteId}">
        <div>
            <div class="note-content">
                <h3>${noteContent}</h3>
            </div>
            <div class="note-time">
                <p>${dateString}</p>
                <p>&mdash;</p>
                <p>${hour}</p>
            </div>
        </div>
        <div class="note-edit">
            <div><img data-operation="edit" src="imgs/edit.png"></div>
            <div><img data-operation="remove" src="imgs/remove.png"></div>
        </div>
    </div>`
}

//users

function loginUser(name, password){
    dbRequest(`${mainUrl}/login`, 'POST', {name, password}).then(response => {
        if(response.error) {
            loginModalError.style.display = 'flex'
            loginModalErrorMessage.innerHTML = response.error

        } else {
            loginModalError.style.display = 'none'

            closeModalAndSetUser(response.token, name)
            showNote(response.notes)
        }
    })
}

function createNewUser(name, password){
    dbRequest(`${mainUrl}/signin`, 'POST', {name, password}).then(response => {
        if(response.error) {
            loginModalError.style.display = 'flex'
            loginModalErrorMessage.innerHTML = response.error
        } else {
            loginModalError.style.display = 'none'
            closeModalAndSetUser(response.token, name)
        }
    })
}

function closeModalAndSetUser(token, userName){
    //close modal
    document.onclick = null
    loginModalContainer.style.display = 'none'
    loginForm.name.value = ''
    loginForm.password.value = ''

    //mainMenu
    const loginBtn = mainMenu.querySelector('#mainMenu-login')
    loginBtn.innerHTML = `${userName} - log out`
    loginBtn.id = 'mainMenu-logout'
    
    //set user
    localStorage.setItem('token', token)
}

function getLoggedUser(){
    const token = localStorage.getItem('token')
    if(!token) return

    dbRequest(`${mainUrl}/login`, 'POST', {}, token).then(response => {
        //token expired
        if(response.error){
            //clear localstorage token
            localStorage.removeItem('token')
            
            //error message
            loginModalError.style.display = 'flex'
            loginModalErrorMessage.innerHTML = 'session expired, please login again'
            loginModal()

        //good token
        } else {
            const {token: resToken, name, notes} = response
            closeModalAndSetUser(resToken, name)
            showNote(notes)
        }
    })
}

function logoutUser(){
    //removing from localstorage
    localStorage.removeItem('token')

    //removing notes
    notesContainer.innerHTML = ''

    //main menu option
    const loginBtn = mainMenu.querySelector('#mainMenu-logout')
    loginBtn.innerHTML = 'Login - New Account'
    loginBtn.id = 'mainMenu-login'
}

//window && dbrequest

const mainUrl = 'http://localhost:3000'

async function dbRequest(url, method, body, token){
    const headers = {
        'Accept': 'aplication.json',
        'Content-Type': 'application/json',
    }
    if(token) headers['Authorization'] = `Bearer ${token}`

    try{
        const response = await fetch(url, {
            headers,
            method,
            body: JSON.stringify(body)
        })
        return response.json()
    } catch (err) {
        console.error(err)
    }  
}

window.addEventListener('load', () => {
    mainMenuUtils()
    loginModalUtils()
    notesContainerUtils()
    getLoggedUser()
})