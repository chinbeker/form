import { SelectControlBase } from "./base/SelectControlBase.js";

export class RadioControl extends SelectControlBase {
    static template = `<div class="field-input"><div class="input-radio"></div></div>`;
    static fragment = null;
    root = null;
    type = 'radio';
    name = 'Radio';
    element = Object.create(null);
    prompt = Object.create(null);

    constructor(item){
        super();
        if (!RadioControl.fragment){RadioControl.fragment = document.createRange().createContextualFragment(RadioControl.template)}
        if (this.check(item)){this.render(item)}
    }

    get valid(){
        if (this.element.field.length > 0){return this.element.field[0].validity.valid}
        return true;
    }
    get value(){
        for (const radio of this.element.field){
            if (radio.checked){return radio.getAttribute('value')}
        }
        return '';
    }
    set value(value){
        for (const radio of this.element.field){
            if (radio.hasAttribute('value') && radio.getAttribute('value') === value){
                radio.checked = true;return true;
            }
        }
        return false;
    }

    create(item){
        super.create(RadioControl.fragment.firstElementChild.cloneNode(true), item);
        this.element.option = this.root.querySelector('.input-radio');
        this.element.options = [];
        this.element.field = [];
    }

    build(){return true;}

    bind(){
        for (const radio of this.element.field){
            radio.addEventListener('blur',function(){this.classList.add('first');},{once:true});
            radio.onchange = ()=>{this.change()};
            radio.oninvalid = (ev)=>{ev.preventDefault();this.validity(ev.target);};
        }
    }
    hook(item){
        if (item.options && Array.isArray(item.options)){
            const options = item.options;
            for (let i = 0;i < options.length;i ++) {
                const label = document.createElement('label');
                const input = document.createElement('input');
                input.setAttribute('type', 'radio');
                if (item.required) {input.setAttribute('required', '')}
                if (item.name) {input.setAttribute('name', item.name)}
                if (options[i].value){input.setAttribute('value', options[i].value)};
                const span = document.createElement('span');
                if (options[i].title){span.textContent = options[i].title};
                if (item.value){
                    if (options[i].value === item.value || options[i].title === item.value) {
                        input.setAttribute('checked', '')
                    }
                }
                label.append(input);
                label.append(span);
                this.element.options.push(input);
                this.element.option.append(label);
                this.element.field.push(input);
            }
        }
        return true;
    }

    focus(){
        if (this.element.field.length > 0){this.element.field[0].focus()}
    }
}
