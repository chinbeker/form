import { InputControlBase } from "./base/InputControlBase.js";

export class TextControl extends InputControlBase {
    static template = `<div class="field-input"><label><input type="text" value="" placeholder="请输入"/></label></div>`;
    static fragment = null;
    root = null;
    type = 'text';
    name = 'Text';
    element = Object.create(null);
    prompt = Object.create(null);

    constructor(item){
        super();
        if (!TextControl.fragment){TextControl.fragment = document.createRange().createContextualFragment(TextControl.template)}
        if (this.check(item)){this.render(item)}
    }

    create(item){
        super.create(TextControl.fragment.firstElementChild.cloneNode(true), item);
        this.element.field = this.root.querySelector('input');
    }
    hook(item){
        // 配置控件
        const input = this.element.field;
        input.setAttribute('type', item.type);
        if (item.value) {input.setAttribute('value', item.value)}
        switch (item.type){
            case 'text' : {input.setAttribute('title','请输入文字');break}
            case 'number' : {input.setAttribute('title','请输入数字');break}
            case 'search' : {input.setAttribute('title','请输入搜索内容');break}
            case 'password' : {input.setAttribute('title','请输入密码');break}
            case 'tel' : {input.setAttribute('title','请输入电话号码');break}
            case 'url' : {input.setAttribute('title','请输入网址');break}
            case 'email' : {input.setAttribute('title','请输入电子邮箱');break}
            case 'date' : {input.setAttribute('title','请选择日期');break}
            case 'month' : {input.setAttribute('title','请选择年月');break}
            case 'time' : {input.setAttribute('title','请选择时间');break}
            case 'datetime' : {input.setAttribute('title','请选择日期和时间');break}
            case 'datetime-local' : {input.setAttribute('title','请选择日期和时间');break}
            case 'color' : {input.setAttribute('title','请点击获取颜色');break}
            case 'range' : {input.setAttribute('title','请拖动获取数值');break}
        };
        return true
    }
}
