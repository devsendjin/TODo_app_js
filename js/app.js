'use strict';

var todos = [];

if (localStorage.getItem('items') && localStorage.getItem('items') !== null) {
    todos = JSON.parse(localStorage.getItem('items'));
    showList('all');
}

var init = $('#websocket').click(function () {
    testWebSocket();
});

var wsUrl = "ws://echo.websocket.org/";
var websocket;

function testWebSocket() {
    websocket = new WebSocket(wsUrl);
    websocket.onopen = function (evt) {
        onOpen(evt)
    };
    // websocket.onclose = function (evt) {
    //     onClose(evt)
    // };
    websocket.onmessage = function (evt) {
        onMessage(evt)
    };
    websocket.onerror = function (evt) {
        onError(evt)
    };
}

function onOpen() {
    // writeToScreen("CONNECTED");
    doSend(JSON.stringify(todos));
}
// function onClose() {
//     writeToScreen("DISCONNECTED");
// }

function onMessage(evt) {
    writeToScreen('RESPONSE: ' + evt.data);
    // websocket.close();
}

function onError(evt) {
    writeToScreen('ERROR: ' + evt.data);
}

function doSend(message) {
    writeToScreen("SENT: " + message);
    websocket.send(message);
}

function writeToScreen(message) {
    console.log(message);
}

window.addEventListener("load", init, false);

$(document).ready(function () {

    $('#sendBtn').click(function () {
        $.ajax({
            type: "POST",
            url: "https://httpbin.org/post",
            data: JSON.stringify(todos)
        }).done(function (res) {
            console.log(res);
        }).fail(function (msg) {
            console.log(msg);
        })
    });

    $('#addBtn').click(function () {
        var text = $('textarea').val();
        var error = $('#form p');
        if (!text) {
            if (error) {
                error.remove();
            }
            $('.requests').prepend('<p>Заполните текстовое поле!');
            return;
        } else {
            error.remove();
        }
        var item = new TodoItem(text);
        todos.push(item);
        showList('all');
    });

    function clickHandlers() {
        var list = $('#list');
        list.on('click', '.list-note #done', function (event) {
            var index = $(event.target).parent().data('index');
            $(event.target).html('');
            $(event.target).parent().children('#remove').remove();
            $(event.target).parent().addClass('done-bg').fadeOut(1000);
            todos[index].done = true;
        });

        list.on('click', '.list-note #remove', function (event) {
            var index = $(event.target).parent().data('index');
            if (todos[index].removed || todos[index.done]) {
                return;
            }
            $(event.target).parent().children('#done').html('');
            $(event.target).html('Removed').parent().addClass('removed-bg').fadeOut(1000);
            todos[index].removed = true;
        });

        $('#done-filter').click(function () {
            if (sheckForEmpty('done', "There are no DONE items")) {
                $('.list-note').hide();
                return;
            }
            showList('done');
        });

        $('#todos-filter').click(function () {
            showList('todo');
        });
        $('#all-filter').click(function () {
            showList('all');
        });

        $('#trash-filter').click(function () {
            if (sheckForEmpty('removed', "There are no REMOVED items")) {
                $('.list-note').hide();
                return;
                showList('removed');
            }
            showList('removed');
        });
    }

    function sheckForEmpty(prop, msg) {
        var counter = 0;
        todos.forEach(function (item) {
            if (item[prop]) {
                counter++;
            }
        });
        if (!counter) {
            if ($(".error-msg")) {
                $(".error-msg").html('');
            }
            $('#list').append("<span class='error-msg'>" + msg + "</span>");
            return 1;
        }
    }

    clickHandlers();
});

function showList(filter) {
    var str = '';
    for (var i = 0; i < todos.length; i++) {
        if (filter === "all") {
            if (!todos[i].done && !todos[i].removed) {
                str += "<div class='list-note' data-index='" + i + "'>" + todos[i].showText + "<span id='remove'>Remove</span><span class='done' id='done'>Done</span></div>"
            } else if (todos[i].done) {
                str += "<div class='list-note done-bg' data-index='" + i + "'>" + todos[i].showText + "</div>"
            } else if (todos[i].removed) {
                str += "<div class='list-note removed-bg' data-index='" + i + "'>" + todos[i].showText + "<span id='remove'>Removed</span></div>"
            }
        } else if (filter === "todo") {
            if (!todos[i].done && !todos[i].removed) {
                str += "<div class='list-note' data-index='" + i + "'>" + todos[i].showText + "<span id='remove'>Remove</span><span class='done' id='done'>Done</span></div>"
            }
        } else if (filter === 'done') {
            if (todos[i].done) {
                str += "<div class='list-note done-bg' data-index='" + i + "'>" + todos[i].showText + "</div>";
            }
        } else if (filter === 'removed') {
            if (todos[i].removed) {
                str += "<div class='list-note removed-bg' data-index='" + i + "'>" + todos[i].showText + "<span id='remove'>Removed</span></div>";
            }
        } else if (todos[i].done || todos[i].removed) {
            return;
        } else {
            str += "<div class='list-note' data-index='" + i + "'>" + todos[i].showText + "<span id='remove'>Remove</span><span class='done' id='done'>Done</span></div>"
        }
    }

    $('#list').html(str);
    localStorage.setItem('items', JSON.stringify(todos));
}
