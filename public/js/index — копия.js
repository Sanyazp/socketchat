var socket = io.connect(); // Соединение с сокетом
var username = ''; // Имя текущего пользователя
var usersArr; // Массив остальных пользователей с их socket ID для отправки личных сообщений
var private = 'All Users'; // Переменная, куда записывается SocketID для отправки личных сообщений
var private2 = ''; // Переменная с именем, кому отправить сообщение, а так же переключатель чтобы страница знала в каком диалоге сейчас пользователь
socket.on('connect', function() { // Коннект нового юзера
    console.log('connected');
});

socket.on('UsersOnline', function(msg) { // Событие отлавливающее изменение юзеров в чате, и меняющее их на странице
    $("#usersOnline").html(`Users Online : ${msg.UO}`);
    usersArr = msg.array;
    usersOnlineColumn(usersArr);
    usersDialogsHider(usersArr);
});
socket.on('message', function(data) {
    console.log(data);
    addMessageOnPage(data);
});

$("#textarea").on('keypress', function(e) {
    if (e.keyCode == 13) {
        if (this.value != "") {
            socket.emit('message', {
                msg: this.value,
                private
            });
            console.log(this.value);
            addMessageOnPage({
                msg: this.value,
                to: private2
            }, 'me');
            this.value = ``;
        }
    }
})


function addMessageOnPage(data, who) {
    var html = '';
    if (who == 'me') {
        html = `            <div class="messageInChat">
        <div class="messageClient">            <h2>${username}</h2>
        ${data.msg}
        </div></div>
    </div> `
        document.querySelector(`.${data.to}`).innerHTML += html; // class > data-username
    } else {
        if (!data.private) {
            html = `
            <div class="messageInChat">
                <div class="messageManager">
                <h2>${data.username}</h2>
                ${data.msg}
                </div>
            </div>
                `
            document.querySelector(`.All_Users`).innerHTML += html; // class > data-username
        } else {
            html = `
            <div class="messageInChat">
                <div class="messageManager private">
                <h2>${data.username}</h2>
                ${data.msg}
                <span>Private Message from ${data.username}</span>
                </div>
            </div>
                `
            document.querySelector(`.${data.username}`).innerHTML += html; // class > data-username
        }

    }
    console.log(data);

}

function usersOnlineColumn(array) {
    var parent = document.getElementById('users');
    parent.innerHTML = `
    <div id="All_Users">
    <h2 data-username="All Users">All Users</h2>
    </div>
    `
    for (var i = 0; i < array.length; i++) {
        if (array[i].username !== username) { // ID > data-username
            parent.innerHTML += `
            <div id="${array[i].username}">
            <h2>${array[i].username}</h2>
            </div>
            `
        } else {
            continue;
        }
    }
}

function usersDialogsHider(array) {
    var parent = document.querySelector('.chat');
    for (var y = 0; y < parent.children.length; y++) {
        if (y === 0) continue;
        if (y === parent.children.length - 1) break;
        parent.children[y].remove();
    }
    var textarea = document.getElementById('textarea');
    for (var i = 0; i < array.length; i++) {
        if (array[i].username == username) continue;
        var new_article = document.createElement('article');
        new_article.id = 'messages';
        new_article.classList.add(`${array[i].username}`);
        new_article.style.display = `none`;
        parent.insertBefore(new_article, textarea);
    }
}

function usersDialogsUnHider(user) {
    var parent = document.querySelector('.chat');
    for (var i = 0; i < parent.children.length; i++) {
        if (i === parent.children.length - 1) {
            break;
        }
        if (parent.children[i].classList.contains(user)) { // class > data-username
            parent.children[i].style.display = `block`;
        } else {
            parent.children[i].style.display = `none`;
        }
    }
}

function userSelectDialog(target) {
    var parent = document.getElementById('users');
    for (var i = 0; i < parent.children.length; i++) {
        if (parent.children[i].id === target) { // id > data-users
            parent.children[i].style.background = `rgba(128, 128, 128, 0.3)`;
        } else {
            parent.children[i].style.background = `#ffffff`;
        }
    }
}


// MODAL WINDOW //
$('#users').on('click', function(e) {
    usersDialogsUnHider(e.target.id);
    userSelectDialog(e.target.id);
    if (e.target.id == 'All_Users') {
        private = 'All Users';
        private2 = 'All_Users';
    } else {
        for (var i = 0; i < usersArr.length; i++) {
            if (usersArr[i].username == e.target.id) {
                private = usersArr[i].id;
                break;
            }
        }
        private2 = e.target.id;
    }
    console.log(e.target.id);
})
$(document).ready(function() { // Когда загрузится страница появится модальное окно, спрашивающее юзернейм
    $('#overlay').fadeIn(400, // снaчaлa плaвнo пoкaзывaем темную пoдлoжку
        function() { // пoсле выпoлнения предидущей aнимaции
            $('#modal_form')
                .css('display', 'flex') // убирaем у мoдaльнoгo oкнa display: none;
                .animate({ opacity: 1, top: '50%' }, 200); // плaвнo прибaвляем прoзрaчнoсть oднoвременнo сo съезжaнием вниз
        });
    /* Зaкрытие мoдaльнoгo oкнa, тут делaем тo же сaмoе нo в oбрaтнoм пoрядке */

    $('#modal_username_submit, #overlay').click(function() { // лoвим клик пo крестику или пoдлoжке
        if (document.getElementById('modal_username').value !== '') { // Проверка, не пустой ли инпут
            username = document.getElementById('modal_username').value;
            socket.emit('username', username); // посылаем юзернейм на сервер
            console.log(username);; // Если не ввёл логин то не закрываем модальное окно
            $('#modal_form')
                .animate({ opacity: 0, top: '45%' }, 200, // плaвнo меняем прoзрaчнoсть нa 0 и oднoвременнo двигaем oкнo вверх
                    function() { // пoсле aнимaции
                        $(this).css('display', 'none'); // делaем ему display: none;
                        $('#overlay').fadeOut(400); // скрывaем пoдлoжку
                    }
                );
        } else {
            $('#modal_form input').css('border', '1px solid red');
        }
    });
});

//