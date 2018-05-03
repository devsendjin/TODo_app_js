'use strict';

function TodoItem(text) {
    var _text = text;
    this.done = false;
    this.removed = false;
    this.showText = _text;
}