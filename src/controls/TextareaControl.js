import { InputControlBase } from "./base/InputControlBase.js";

export class TextareaControl extends InputControlBase {
    static template = `<div class="field-input"><label><textarea rows="8" placeholder="请输入" title="请输入文字内容"></textarea></label></div>`;
    static fragment = null;
    root = null;
    type = 'textarea';
    name = 'Textarea';
    element = Object.create(null);
    prompt = Object.create(null);
    constructor(item){
        super();
        if (!TextareaControl.fragment){TextareaControl.fragment = document.createRange().createContextualFragment(TextareaControl.template)}
        if (this.check(item)){this.render(item)}
    }
    create(item){
        super.create(TextareaControl.fragment.firstElementChild.cloneNode(true), item);
        this.element.field = this.root.querySelector('textarea');
    }
    hook(item){
        // 配置控件
        const textarea = this.element.field;
        if (item.value) {textarea.textContent = item.value}
        if (item.title){textarea.setAttribute('title',item.title)}
        return true
    }
}
