export class ControlBase {
    static template = `<div class="form-item"><div class="form-item-main"><div class="field-infor">${''
            }<div class="field-title"><span></span></div><div class="field-describe"><i></i></div></div>${''
            }</div><div class="invalid-msgbox"><span class="danger"></span></div></div>`;
    static fragment = null;
    constructor(){
        if (!ControlBase.fragment){
            ControlBase.fragment = document.createRange().createContextualFragment(ControlBase.template);
        }
    }

    // 访问器
    get title() {return this.element.title.textContent}
    set title(value) {this.element.title.textContent = value;return value}

    get describe() {return this.element.describe.textContent}
    set describe(value) {this.element.describe.textContent = value;return value}

    get danger() {return this.element.danger.textContent}
    set danger(value) {this.element.danger.textContent = value;return value}

    get valid() {return this.element.field.validity.valid}

    get value() {throw new Error('"value" must be implemented by subclass')}
    set value(value) {throw new Error('"value" must be implemented by subclass')}

    get required() {return this.element.field.hasAttribute('required')}
    set required(value){
        if (value){
            this.element.field.setAttribute('required','');
            this.element.head.classList.add('required');
            return true;
        } else {
            this.element.field.removeAttribute('required');
            this.element.head.classList.remove('required');
            return false;
        }
    }
    get disabled(){return this.element.field.hasAttribute('disabled');}
    set disabled(value){
        if (value){
            this.element.field.setAttribute('disabled','');return true;
        } else {
            this.element.field.removeAttribute('disabled');return false;
        }
    }

    // 接口
    init(item){
        this.prompt.pattern = '输入不正确';
        this.element.head = null;
        this.element.title = null;
        this.element.field = null;
        this.element.danger = null;
        this.element.describe = null
        if (Object.hasOwn(item, 'message')){
            const message = item.message;
            for (const key of Object.keys(message)){
                this.prompt[key] = message[key]
            }
        }
    }
    event(){throw new Error('"event" method must be implemented by subclass')};
    build(){throw new Error('"build" method must be implemented by subclass')}
    bind(){throw new Error('"bind" method must be implemented by subclass')}
    create(temp, item){
        this.type = item.type;
        this.name = item.name;
        const root = ControlBase.fragment.firstElementChild.cloneNode(true);
        const main = root.querySelector('.form-item-main');
        main.append(temp);
        this.element.head = root.querySelector('.field-title');
        this.element.title = this.element.head.firstElementChild;
        this.element.describe = root.querySelector('i');
        this.element.danger =  root.querySelector('.danger');
        if (item.label) {this.element.title.textContent = item.label}
        if (item.required) {this.element.head.classList.add('required')}
        if (item.describe) {this.element.describe.textContent = item.describe}
        this.root = root;
    }
    render(item){this.init(item);this.create(item);this.build(item);this.hook(item);this.bind()}
    clear(){if (this.element.danger.textContent){this.element.danger.textContent = '';}}
    change(){this.root.classList.remove('invalid');this.clear()}
    invalid(){throw new Error('"invalid" method must be implemented by subclass')}
    validity(){throw new Error('"validity" method must be implemented by subclass')}
    message(danger){this.element.danger.textContent = danger}
    reset(){this.root.classList.remove('invalid');this.clear()}
    focus(){this.root.scrollIntoView({behavior: 'smooth',block: 'start'})}
    unload(){
        for (const key of Object.keys(this.element)){
            this.element[key].remove();
            this.element[key] = null;
        }
        this.root.remove();
        this.element = null;
        this.messge = null;
        this.root = null
    }

    check(item){
        if (item === undefined || item == null){throw new Error('Required parameter missing')}
        if (Object.prototype.toString.call(item) !== '[object Object]'){throw new Error('Parameter type error')}
        const requiredOptions = ['type','name'];
        const booleanOptions = ['required','readonly','disabled'];
        const stringOptions = ['head','describe'];
        for (const key of requiredOptions){
            if (!Object.hasOwn(item, key)) {throw new Error(`The "${key}" attribute is a required attribute.`)}
            if (typeof item[key] !== 'string'){throw new Error(`The "${key}" attribute must be of string type.`)}
            item[key] = item[key].trim();
            if (item[key].length === 0) {throw new Error(`The "${key}" attribute is a required attribute.`)}
        }
        for (const key of booleanOptions){
            if (Object.hasOwn(item, key) && typeof item[key] !== 'boolean') {throw new Error(`The "${key}" attribute must be of boolean type.`)}
        }
        for (const key of stringOptions){
            if (Object.hasOwn(item, key) && typeof item[key] !== 'string') {throw new Error(`The "${key}" attribute must be of string type.`)}
        }
        if (Object.hasOwn(item, 'message')){
            if (Object.prototype.toString.call(item.message) !== '[object Object]'){
                throw new Error('The "message" attribute must be of object type.')
            }
            for (const key of Object.keys(item.message)){
                if (typeof item.message[key] !== 'string'){throw new Error(`The "message.${key}" attribute must be of string type.`)}
            }
        }
        return true;
    }
}
