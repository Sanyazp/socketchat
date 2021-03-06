var socket = io.connect(); // Соединение с сокетом
var username = ''; // Имя текущего пользователя
var usersArr; // Массив остальных пользователей с их socket ID для отправки личных сообщений
var private = 'All Users'; // Переменная, куда записывается SocketID для отправки личных сообщений
var private2 = 'All Users'; // Переменная с именем, кому отправить сообщение, а так же переключатель чтобы страница знала в каком диалоге сейчас пользователь
socket.on('connect', function() { // Коннект нового юзера
    console.log('connected');
});

socket.on('UsersOnline', function(msg) { // Событие отлавливающее изменение юзеров в чате, и меняющее их на странице
    $("#usersOnline").html(`<img src="../images/online.png" alt="Online">\ \ ${msg.UO}`);
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
        <h4>${data.msg}</h4>
        </div></div>
    </div> `
        document.querySelector(`[data-username="${data.to}"]`).innerHTML += html; // class > data-username
    } else {
        if (!data.private) {
            html = `
            <div class="messageInChat">
                <div class="messageManager">
                <h2>${data.username}</h2>
                <h4>${data.msg}</h4>
                </div>
            </div>
                `
            document.querySelector(`[data-username="All Users"]`).innerHTML += html; // class > data-username
        } else {
            html = `
            <div class="messageInChat">
                <div class="messageManager private">
                <h2>${data.username}</h2>
                <h4>${data.msg}</h4>
                <span>Private Message from ${data.username}</span>
                </div>
            </div>
                `
            document.querySelector(`[data-username="${data.username}"]`).innerHTML += html; // class > data-username
        }

    }
    console.log(data);

}

function usersOnlineColumn(array) {
    var parent = document.getElementById('users');
    parent.innerHTML = `
    <div data-userkey="All Users" style="background: rgba(128, 128, 128, 0.3);">
    <h2 data-userkey="All Users">All Users</h2>
    </div>
    `
    for (var i = 0; i < array.length; i++) {
        if (array[i].username !== username) { // ID > data-username
            parent.innerHTML += `
            <div data-userkey="${array[i].username}">
            <h2 data-userkey="${array[i].username}">${array[i].username}</h2>
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
        new_article.setAttribute('data-username', `${array[i].username}`);
        new_article.style.display = `none`;
        new_article.innerHTML = `<h3>${array[i].username}</h3>`
        parent.insertBefore(new_article, textarea);
    }
}

function usersDialogsUnHider(user) {
    var parent = document.querySelector('.chat');
    for (var i = 0; i < parent.children.length; i++) {
        if (i === parent.children.length - 1) {
            break;
        }
        if (parent.children[i].getAttribute('data-username') == user) { // class > data-username
            parent.children[i].style.display = `block`;
        } else {
            parent.children[i].style.display = `none`;
        }
    }
}

function userSelectDialog(target) {
    var parent = document.getElementById('users');
    for (var i = 0; i < parent.children.length; i++) {
        if (parent.children[i].getAttribute('data-userkey') == target) { // id > data-users
            parent.children[i].style.background = `rgba(128, 128, 128, 0.3)`;
        } else {
            parent.children[i].style.background = `#ffffff`;
        }
    }
}


// MODAL WINDOW //
$('#users').on('click', function(e) {
    usersDialogsUnHider(e.target.getAttribute('data-userkey'));
    userSelectDialog(e.target.getAttribute('data-userkey'));
    if (e.target.getAttribute('data-userkey') == 'All Users') {
        private = 'All Users';
        private2 = 'All Users';
    } else {
        for (var i = 0; i < usersArr.length; i++) {
            if (usersArr[i].username == e.target.getAttribute('data-userkey')) {
                private = usersArr[i].id;
                break;
            }
        }
        private2 = e.target.getAttribute('data-userkey');
    }
    console.log(e.target.getAttribute('data-userkey'));
})
$(document).ready(function() {
    $('#menuResp').on('click', function() {
            if ($('#menuResp').attr('data-clicked') == 'true') {
                $("article#users").css('display', 'block').css('width', "0%");
                $('#menuResp').attr('data-clicked', 'false');
            } else {
                $("article#users").css('display', 'block').css('width', "40%");
                $('#menuResp').attr('data-clicked', 'true');
            }
        }) // Когда загрузится страница появится модальное окно, спрашивающее юзернейм
    $('#overlay').fadeIn(400, // снaчaлa плaвнo пoкaзывaем темную пoдлoжку
        function() { // пoсле выпoлнения предидущей aнимaции
            $('#modal_form')
                .css('display', 'flex') // убирaем у мoдaльнoгo oкнa display: none;
                .animate({ opacity: 1, top: '50%' }, 200); // плaвнo прибaвляем прoзрaчнoсть oднoвременнo сo съезжaнием вниз
        });
    /* Зaкрытие мoдaльнoгo oкнa, тут делaем тo же сaмoе нo в oбрaтнoм пoрядке */

    $('#modal_username_submit, #overlay').click(function() { // лoвим клик пo крестику или пoдлoжке
        if (document.getElementById('modal_username').value !== '' && document.getElementById('modal_username').value.length < 10) { // Проверка, не пустой ли инпут
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