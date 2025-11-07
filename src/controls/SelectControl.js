import { SelectControlBase } from "./base/SelectControlBase.js";

export class SelectControl extends SelectControlBase {
    static template = `<div class="field-select"><label><select title="请选择"><option value="" hidden>请选择</option></select></label></div>`;
    static fragment = null;
    root = null;
    type = 'select';
    name = 'Select';
    element = Object.create(null);
    prompt = Object.create(null);

    constructor(item){
        super();
        if (!SelectControl.fragment){SelectControl.fragment = document.createRange().createContextualFragment(SelectControl.template)}
        if (this.check(item)){this.render(item)}
    }

    // 配置控件
    get value(){return this.element.field.value}
    set value(value) {
        const options = this.element.field.options;
        for (let i = 0;i < options.length;i ++) {
            if (options[i].value === value || options[i].textContent === value) {
                this.element.field.value = options[i].value;
            }
        }
    }

    create(item){
        super.create(SelectControl.fragment.firstElementChild.cloneNode(true), item);
        this.element.field = this.root.querySelector('select');
    }

    bind(){
        const select = this.element.field;
        select.addEventListener('blur',function(){this.classList.add('selected');},{once:true});
        select.onchange = ()=>{this.change()};
        select.onblur = (ev)=>{this.invalid(ev.target)};
        select.oninvalid = (ev)=>{ev.preventDefault();this.invalid(ev.target)};
        return true;
    }

    hook(item){
        if (Object.hasOwn(item, 'options') && Array.isArray(item.options)){
            const options = item.options;
            for (let i = 0;i < options.length;i ++) {
                const option = document.createElement('option');
                if (options[i].value){option.setAttribute('value', options[i].value)};
                if (options[i].title){option.textContent = options[i].title};
                if (item.value){
                    if (options[i].value === item.value || options[i].title === item.value) {
                        option.setAttribute('selected', '')
                    }
                }
                this.element.field.append(option);
            }
        }
        return true;
    }

    change(){
        this.element.field.classList.add('selected');
        super.change();
    }
    invalid(target){
        this.element.field.classList.add('selected');
        this.validity(target)
    }
    reset(){
        this.element.field.classList.remove('selected');
        super.reset();
    }
    focus(){
        super.focus();
        this.element.field.focus();
    }
}
