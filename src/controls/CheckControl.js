import { SelectControlBase } from "./base/SelectControlBase.js";

export class CheckControl extends SelectControlBase {
    static template = `<div class="field-input"><div class="input-checkbox" title="可多选"></div><label class="input-hidden">${ ''
            }<input type="text" data-type="check" value="" autocomplete="off" placeholder="请输入"></label></div>`;
    static fragment = null;
    root = null;
    type = 'checkbox';
    name = 'Checkbox';
    element = Object.create(null);
    prompt = Object.create(null);

    constructor(item){
        super();
        if (!CheckControl.fragment){
            CheckControl.fragment = document.createRange().createContextualFragment(CheckControl.template)
        }
        if (this.check(item)){this.render(item)}
    }

    get value(){
        const arr = [];
        for (const option of this.element.options){if (option.checked){arr.push(option.value)}}
        return arr;
    }
    set value(value){
        for (const option of this.element.options){
            if (option.hasAttribute('value') && option.getAttribute('value') === value){
                option.checked = true;return true;
            }
        }
        return false;
    }

    create(item){
        super.create(CheckControl.fragment.firstElementChild.cloneNode(true), item);
        this.element.option = this.root.querySelector('.input-checkbox');
        this.element.field = this.root.querySelector('input');
        this.element.options = [];
    }

    bind(){
        const input = this.element.field;
        input.oninput = ()=>{this.change()};
        input.oninvalid = (ev)=>{ev.preventDefault();this.invalid(ev.target)};
        const options = this.element.options;
        for (const checkbox of options){
            checkbox.onchange = ()=>{this.change();this.checked()};
            checkbox.onblur = ()=>{this.blur()}
        }
        return true;
    }

    hook(item){
        this.root.querySelector('.form-item-main').classList.add('top');
        if (item.options && Array.isArray(item.options)){
            const options = item.options;
            for (let i = 0;i < options.length;i ++) {
                const label = document.createElement('label');
                const input = document.createElement('input');
                input.setAttribute('type', 'checkbox');
                if (item.name){input.setAttribute('data-name',item.name)};
                const span = document.createElement('span');
                if (options[i].value){input.setAttribute('value', options[i].value)}
                if (options[i].title){
                    span.textContent = options[i].title;
                } else if (options[i].value) {
                    span.textContent = options[i].value;
                }
                if (item.value){
                    if (Array.isArray(item.value)){
                        for (let j=0;j<item.value.length;j++){
                            if (options[i].value === item.value[j] || options[i].title === item.value[j]) {
                                input.setAttribute('checked', '')
                            }
                        }
                    } else {
                        if (options[i].value === item.value || options[i].title === item.value) {
                            input.setAttribute('checked', '')
                        }
                    }
                }
                label.append(input);
                label.append(span);
                this.element.options.push(input);
                this.element.option.append(label);
            }
        }
        return true;
    }

    checked(){
        const value = this.value;
        this.element.field.value =  value.toString();
    }

    blur(){this.validity(this.element.field)}

    invalid(target){
        this.element.field.classList.add('first');
        this.validity(target)
    }
}
