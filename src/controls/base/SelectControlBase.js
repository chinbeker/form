import { ControlBase } from "./ControlBase.js";

export class SelectControlBase extends ControlBase {
    constructor(){
        super();
    }
    // 访问器

    // 实例方法
    init(item){
        this.prompt.required = '此项为必选项';
        super.init(item);
    }

    build(item){
        const select = this.element.field;
        if (item.name) {select.setAttribute('name', item.name)}
        if (item.required) {select.setAttribute('required', '')}
        if (item.disabled) {select.setAttribute('disabled', '')}
    }

    bind(){
        const select = this.element.field;
        select.onchange = ()=>{this.change()};
        select.onblur = (ev)=>{this.blur(ev.target)};
        select.oninvalid = (ev)=>{ev.preventDefault();this.invalid(ev.target)};
        return true;
    }

    validity(target){
        const validity = target.validity;
        if (validity.valid){
            this.root.classList.remove('invalid');
            this.clear();
        } else {
            this.root.classList.add('invalid');
            if (validity.valueMissing) {
                this.message(this.prompt.required);
            } else if (validity.patternMismatch) {
                this.message(this.prompt.pattern);
            } else {
                this.message(target.validationMessage);
            }
        }
    }

    check(item){
        if (super.check(item)){
            if (Object.hasOwn(item, 'options')) {
                if (Object.prototype.toString.call(item.options) !== '[object Array]'){throw new Error('The "options" attribute must be of array type.')}
                const options = item.options;
                for (const option of options){
                    if (!Object.hasOwn(option, 'value')){throw new Error('The "options.value" attribute is a required attribute.')}
                    if (typeof option.value !== 'string' && typeof option.value !== 'number'){
                        throw new Error('The "options.value" attribute must be of string or numeric type.');
                    }
                    if (typeof option.value === 'string' && !Boolean(option.value)) {throw new Error('The "options.value" attribute is a required attribute.')}
                    if (Object.hasOwn(option, 'title') && typeof option.title !== 'string'){throw new Error('The "options.title" attribute must be of string type.')}
                    if (!Object.hasOwn(option, 'title')){option.title = option.value}
                }
            }
            return true;
        }
        return false;
    }
}
