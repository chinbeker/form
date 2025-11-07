import { ControlBase } from "./ControlBase.js";

export class InputControlBase extends ControlBase {
    constructor(){
        super()
    }
    // 访问器
    get value(){return this.element.field.value}
    set value(value) {this.element.field.value = value;return value}

    get readonly() {return this.element.field.hasAttribute('readonly')}
    set readonly(value){
        if (value){
            this.element.field.setAttribute('readonly','');
            return true;
        } else {
            this.element.field.removeAttribute('readonly');
            return false;
        }
    }

    // 实例方法
    init(item){
        this.prompt.required = '此项为必填项';
        super.init(item);
    }

    build(item){
        const input = this.element.field;
        if (item.name) {input.setAttribute('name', item.name)}
        if (item.required) {
            input.setAttribute('required', '');
            input.setAttribute('minlength', '1')
        }
        if (item.readonly) {input.setAttribute('readonly', '')}
        if (item.disabled) {input.setAttribute('disabled', '')}
        if (item.props){
            const props = item.props;
            for (let key of Object.keys(props)){
                input.setAttribute(key, props[key])
            }
        }
    }

    bind(){
        const input = this.element.field;
        input.addEventListener('blur', function(){this.classList.add('first')},{once:true});
        input.onchange = ()=>{this.change()};
        input.oninput = ()=>{this.change()};
        input.onblur = ()=>{this.validity()};
        input.oninvalid = (ev)=>{ev.preventDefault();this.invalid()};
        return true;
    }

    validity(){
        const input = this.element.field;
        const validity = input.validity;
        if (validity.valid){
            this.root.classList.remove('invalid');
            this.clear();
        } else {
            this.root.classList.add('invalid');
            if (validity.valueMissing) {
                this.message(this.prompt.required);
            } else if (validity.patternMismatch) {
                this.message(this.prompt.pattern);
            } else if (validity.typeMismatch) {
                this.message("\u683c\u5f0f\u9519\u8bef");
            } else if (validity.rangeOverflow) {
                const step = parseFloat(input.step) || 1;
                const min = parseFloat(input.min) || 0;
                const dou = (parseFloat(input.max)-min)/step;
                const int = Math.floor(dou);
                if ((dou-int) < 1) {
                    this.message(`\u503c\u5fc5\u987b\u5c0f\u4e8e\u6216\u7b49\u4e8e${step*int+min}`);
                } else {
                    this.message(`\u503c\u5fc5\u987b\u5c0f\u4e8e\u6216\u7b49\u4e8e${input.max}`);
                }
            } else if (validity.rangeUnderflow) {
                this.message(`\u503c\u5fc5\u987b\u5927\u4e8e\u6216\u7b49\u4e8e${input.min}`);
            } else if (validity.stepMismatch) {
                const step = parseFloat(input.step) || 1;
                if (step == 1) {
                    this.message('\u5fc5\u987b\u8f93\u5165\u6574\u6570');
                } else {
                    const min = parseFloat(input.min) || 0;
                    const dou = (parseFloat(input.value) - min) / step;
                    const int = Math.floor(dou);
                    if ((dou-int) < 1){
                        this.message(`\u503c\u65e0\u6548\uff0c\u4e0b\u4e00\u4e2a\u6b63\u786e\u503c\u4e3a${step*(int+1)+min}`);
                    }
                }
            } else if (validity.badInput) {
                this.message("\u8f93\u5165\u9519\u8bef");
            } else if (validity.tooLong) {
                this.message(this.prompt.maxlength || `\u6700\u591a\u8f93\u5165${input.getAttribute('maxlength')}\u4e2a\u5b57\u7b26`);
            } else if (validity.tooShort) {
                this.message(this.prompt.minlength || `\u81f3\u5c11\u8f93\u5165${input.getAttribute('minlength')}\u4e2a\u5b57\u7b26`);
            } else {
                this.message(input.validationMessage);
            }
        }
    };

    change(){
        this.element.field.classList.add('first');
        super.change();
    }
    invalid(){
        this.element.field.classList.add('first');
        this.validity()
    }
    reset(){
        this.element.field.classList.remove('first');
        super.reset();
    }

    focus(){
        super.focus();
        this.element.field.focus();
    }

    check(item){
        if (super.check(item)){
            if (Object.hasOwn(item, 'props')) {
                if (Object.prototype.toString.call(item.props) !== '[object Object]'){throw new Error('The "props" attribute must be of object type.')}
                const props = item.props;
                const number = ['min','max','minlength','maxlength','step','rows','cols'];
                for (const key of Object.keys(props)){
                    if (number.includes(key)){
                        if (typeof props[key] !== 'number'){
                            throw new Error(`The "props.${key}" attribute must be of number type.`)
                        }
                    } else if (typeof props[key] !== 'string'){
                        throw new Error(`The "props.${key}" attribute must be of string type.`);
                    }
                }
            }
            return true;
        }
        return false;
    }
}
