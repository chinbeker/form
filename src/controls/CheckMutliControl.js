import { SelectControlBase } from "./base/SelectControlBase.js";

export class CheckMultiControl extends SelectControlBase {
    static template = `<div class="field-input"><div class="input-checkbox" title="可多选"></div></div>`;
    static fragment = null;
    root = null;
    type = 'radio';
    name = 'Radio';
    element = Object.create(null);
    prompt = Object.create(null);
    constructor(item){
        super();
        if (!CheckMultiControl.fragment){CheckMultiControl.fragment = document.createRange().createContextualFragment(CheckMultiControl.template)}
        if (this.check(item)){this.render(item)}
    }
    get value(){
        const children = this.element.field.children;
        for (let i = 0;i < children.length;i ++){
            const radio = children[i].firstElementChild.firstElementChild;
            if (radio.checked){return radio.getAttribute('value')}
        }
    }
    set value(value){
        const children = this.element.field.children;
        for (let i = 0;i < children.length;i ++){
            const radio = children[i].firstElementChild.firstElementChild;
            if (radio.hasAttribute('value') && radio.getAttribute('value') === value){radio.checked=true;return true;}
        }
        return false;
    }

    create(item){
        super.create(RadioControl.fragment.firstElementChild.cloneNode(true), item);
        this.element.options = this.root.querySelector('.input-radio');
        this.element.field = [];
    }
    bind(){

    }
    hook(item){
        // 配置控件
        console.log(this.element);
        const radio = this.element.options;

        if (item.fields && Array.isArray(item.fields)){
            const fields = item.fields;

            for (let i = 0;i < fields.length;i ++) {
                const label = document.createElement('label');
                const input = document.createElement('input');
                input.setAttribute('type', 'checkbox');
                input.setAttribute('value', '1');
                if (fields[i].name){input.setAttribute('name', fields[i].name)}
                if (i == 0 && item.required) {input.setAttribute('required', '')}
                const span = document.createElement('span');
                if (fields[i].title){span.textContent = fields[i].title}
                if (item.value){
                    if (Array.isArray(item.value)){
                        for (let j=0;j<item.value.length;j++){
                            if (fields[i].name === item.value[j] || fields[i].title === item.value[j]) {
                                input.setAttribute('checked', '')
                            }
                        }
                    } else {
                        if (fields[i].name === item.value || fields[i].title === item.value) {
                            input.setAttribute('checked', '')
                        }
                    }
                }
                label.append(input);
                label.append(span);
                this.#element.options.append(label);
            }
        }
        return true;
    }
}
