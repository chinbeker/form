class ControlBase {
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
        if (item.head) {this.element.title.textContent = item.head}
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

class InputControlBase extends ControlBase {
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

class SelectControlBase extends ControlBase {
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

class TextControl extends InputControlBase {
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

class TextareaControl extends InputControlBase {
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

class SelectControl extends SelectControlBase {
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

class RadioControl extends SelectControlBase {
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

class CheckControl extends SelectControlBase {
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

export default class FormControl extends HTMLElement {
    #shadow = null;
    #target = null;
    #root = null;
    #config = Object.create(null);
    #element = Object.create(null);
    #button = Object.create(null);
    #fields = new Map();
    #controls = new Map();

    constructor(){
        super();
        this.#init();
        this.#shadow = this.attachShadow({mode: "closed"});
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(
`:host{
    contain : content;
    font-size: inherit;
    --form-legend-backg-color: rgb(0,108,190);
    --form-item-row-gap: 0.35em;
    --form-item-border-style: none;
    --form-item-focus-bgcolor: rgba(244,245,255,0.90);
    --form-item-invalid-bgcolor: rgb(252,236,236);
    --form-field-title-width: 4em;
    --form-field-title-weight: bold;
    --form-input-width: 100%;
    --form-input-radio-width: 15%;
    --form-input-check-width: 25%;
    --form-input-border-radius: 0.22em;
    --form-input-accent-color: rgb(0,0,255);
    --form-input-focus-color: rgb(110,168,246);
    --form-option-bgcolor: rgb(24,145,242);
    --form-button-width: 100%;
    --form-button-border-radius: 0.2em;
    --form-button-backg-color: rgb(24,145,242);
    --form-button-bgcolor-hover: rgb(0,107,189);
    --form-button-bgcolor-active: rgb(0,92,163);
}
form {background-color: white;}
form, fieldset, legend, label, input, textarea, select, datalist, option, button {box-sizing: border-box}
div, p, span, a, i, img, svg, button {box-sizing: border-box}
.form-group {margin: 0;padding: 0.5em 0;border: none}
.form-group > legend {
    padding-inline: 1em;
    width: 100%;
    font-weight: bold;
    line-height: 2.12em;
    color: white;
    background-color: var(--form-legend-backg-color);
    -ms-user-select: none;
    -webkit-user-select: none;
    user-select: none;
}
.form-group > legend:empty {display: none}
.form-item {padding-block: var(--form-item-row-gap);padding-inline: 1.2em;line-height: 1em}
.form-item:not(:first-of-type) {border-top-width: 1px;border-top-style: var(--form-item-border-style);border-color: rgb(220,220,220)}
.form-group:not(.nowrap) .field-infor {margin-top: 0.25em}
.field-infor > .field-title {position: relative;font-weight: var(--form-field-title-weight)}
.form-group:not(.nomark) .field-infor > .field-title.required::before {
    content: '*';
    position: absolute;
    margin-left: -0.5em;
    vertical-align: top;
    font-weight: normal;
    color: rgb(255,0,0);
}
.field-infor > .field-describe {margin-top: 0.3em;margin-bottom: 0.45em;line-height: 1.2em;font-size: 0.86em;color: rgb(112,112,112)}
.field-infor > .field-describe > i {font-style: normal}
.field-infor > .field-describe > i:empty {display: none}
.form-group.nowrap .form-item-main.top {display: flex}
.form-group.nowrap .form-item-main:not(.top) {display: flex;align-items: center}
.form-group.nowrap .form-item-main.top > .field-infor {padding-top: 0.65em}
.form-group.nowrap .field-infor {flex: none;margin-right: 0.5em;width: var(--form-field-title-width)}
.form-group.nowrap .field-infor > .field-title > span {display: inline-block;width: 100%;text-align: justify;text-align-last: justify}
.form-group.nowrap .field-infor > .field-describe {display: none;word-break: break-all}
.field-input, .input-select {position: relative}
.form-group.nowrap .field-input {flex: auto}
.form-group.nowrap .field-select {flex: auto}
.form-group:not(.nowrap) .field-input {width: var(--form-input-width)}
.form-group:not(.nowrap) .field-select {width: var(--form-input-width)}
input, select {outline: none;font-family: inherit;font-size: inherit;white-space: nowrap;background-color: white}
textarea {outline: none;font-size: inherit;background-color: white}
input::placeholder, textarea::placeholder {color: rgb(150,150,150)}
select, textarea {border-width: 1px;border-style: solid;border-color: rgb(204,204,204)}
.field-input > label {display: block}
.input-radio, .input-checkbox, .input-address {display: flex;flex-wrap: wrap;border-radius: var(--form-input-border-radius)}
.input-radio > label, .input-checkbox > label {
    display: inline-flex;
    padding-block: 0.28em;
    padding-inline-end: 0.6em;
    max-width: 100%;
    flex-grow: 0;
    align-items: center;
    white-space: nowrap;
}
.input-radio {padding-block: 0.45em;padding-inline: 0.44em}
.form-group:not(.nowrap) .input-radio {margin-top: 0.4em}
.input-radio > label {flex-basis: var(--form-input-radio-width)}
.input-checkbox {padding: 0.28em 0.32em;min-height: 2.28em;border: 1px solid rgb(204,204,204);background-color: rgb(255,255,255)}
.input-checkbox > label {flex-basis: var(--form-input-check-width)}
.input-address > label {flex: 1 1 33.33%;white-space: nowrap}
.address-detail {margin-block-start: 0.2em}
.input-select > .input-icon {
    position: absolute;
    width: 100%;
    padding-inline: 0.45em;
    line-height: 1.5em;
    text-align: right;
    font-size: 1.6em;
    color: #464646;
}
.select-option.open {visibility: visible}
.select-option {
    position: absolute;
    width: 100%;
    z-index: 2;
    margin-top: 3px;
    padding: 0.45em 0.35em;
    visibility: hidden;
    font-size: 0.95em;
    border-radius: var(--form-input-border-radius);
    background-color: white;
    box-shadow: 0 1px 6px 1px rgb(212,212,212);
}
.select-option > ol {
    display: flex;
    min-height: 2.68em;
    max-height: 23.6em;
    flex-wrap: wrap;
    gap: 0.2em;
    overflow-y: auto;
    background-color: white;
    scroll-behavior: smooth;
    scroll-snap-type: block;
    overscroll-behavior-y: contain;
}
.select-option > ol > li {
    flex: 1 1 100%;
    padding: 0.7em 0.6em;
    overflow-x: hidden;
    font-size: inherit;
    white-space: nowrap;
    border-radius: var(--form-input-border-radius);
    scroll-snap-align: start;
    user-select: none;
}
.select-option > ol > li:hover {background-color: #F0F1F4}
.select-option > ol > li:active {color: white;background-color: var(--form-option-bgcolor)}
.select-option > ol > li[selected] {color: white;background-color: var(--form-option-bgcolor)}
.input-hidden {position: absolute;bottom: 0;right: 0;width: 100%;z-index: -1}
.field-input input:not([type="radio"]):not([type="checkbox"]):not([type="range"]):not([type="color"]):not([type="image"]) {
    width: 100%;
    padding: 0.6em;
    border-width: 1px;
    border-style: solid;
    border-radius: var(--form-input-border-radius);
}
input[type="text"],input[type="search"], input[type="number"], input[type="password"] {border-color: rgb(204,204,204)}
input[type="tel"], input[type="url"], input[type="email"], input[type="file"] {border-color: rgb(204,204,204)}
input[type^="date"], input[type="month"], input[type="time"] {color: rgb(150,150,150);border-color: rgb(204,204,204)}
.input-radio input[type="radio"] {margin: 0 0.35em 0 0.25em;width: 0.9em;height: 0.9em;accent-color: var(--form-input-accent-color)}
.input-checkbox input[type="checkbox"] {margin: 0 0.3em 0 0.35em;width: 0.85em;height: 0.85em;accent-color: var(--form-input-accent-color)}
.field-input textarea {width: 100%;padding: 0.6em 0.3em 0.6em 0.6em;line-height: 1.2em;border-radius: var(--form-input-border-radius);resize: none}
.field-select select {width: 100%;padding: 0.6em 0.6em 0.6em 0.38em;color: rgb(150,150,150);border-radius: var(--form-input-border-radius)}
.input-address select {width: 100%;padding: 0.6em 0.6em 0.6em 0.38em;color: rgb(150,150,150);border-radius: var(--form-input-border-radius)}
select > option {width: 100%;font-size: 1em;line-height: 1.6em;white-space: nowrap;color: black;background-color: white}
select > option[value=""], option[hidden] {display: none;color: rgb(150,150,150)}
.invalid-msgbox {display: flex}
.form-group:not(.nowrap) .invalid-msgbox {margin-bottom: 0.5em}
.form-group.nowrap .invalid-msgbox::before {content: '';flex: none;margin-right: 0.72em;width: var(--form-field-title-width)}
.form-validate {margin-block-end: 1em;padding-inline: 1.2em}
.danger {flex: auto;margin-top: 0.25em;font-size: 0.88em;line-height: 1.1em;color: red}
.danger:empty {display: none}
.form-button {
    display: flex;
    padding-block: 0.85em;
    padding-inline: 1.2em;
    flex-wrap: wrap;
    align-items: center;
    align-content: center;
    justify-content: space-around;
    border-top-width: 1px;
    border-top-style: solid;
    border-color: rgb(220,220,220);
}
button {
    width: var(--form-input-width);
    appearance: none;
    outline: none;
    font-size: inherit;
    flex: none;
    flex-basis: var(--form-button-width);
    padding-inline: 2em;
    margin-block: 0.35em;
    line-height: 2.12em;
    white-space: nowrap;
    border: none;
    border-radius: var(--form-button-border-radius);
    cursor: pointer;
    -ms-user-select: none;
    -webkit-user-select: none;
    user-select: none;
}
button[type="reset"] {color: initial;background-color: #E5E5E5}
button[type="button"][value="back"] {color: white;background-color: #E7696C}
button[type="submit"] {color: white;background-color: var(--form-button-backg-color)}
@media (hover: hover) and (pointer: fine) {
    button[type="reset"]:hover {background-color: #D5D5D5}
    button[type="submit"]:hover {background-color: var(--form-button-bgcolor-hover)}
    button[type="button"][value="back"]:hover {background-color: #D55255}
}
@media (hover: none) and (pointer: coarse) {
    button[type="reset"]:active {background-color: #BFBFBF}
    button[type="submit"]:active {background-color: var(--form-button-bgcolor-active)}
    button[type="button"][value="back"]:active {background-color: #BE5153}
}
.form-item:focus-within {background-color: var(--form-item-focus-bgcolor)}
.form-item.invalid {background-color: var(--form-item-invalid-bgcolor)}
input:not([readonly]):not([type="radio"]):not([type="checkbox"]):not([type="range"]):not([type="image"]):focus {border-color: var(--form-input-focus-color)}
input[required]:not([type="radio"]):not([type="checkbox"]):not([type="range"]):not([type="image"]):valid {border-color: var(--form-input-focus-color)}
input.first:not([type="radio"]):not([type="checkbox"]):not([type="range"]):not([type="image"]):valid {border-color: var(--form-input-focus-color)}
input[type^="date"]:focus, input[type^="date"][required]:valid, input.first[type^="date"]:valid {color: inherit}
input[type="month"]:focus, input[type="month"][required]:valid, input.first[type="month"]:valid {color: inherit}
input[type="time"]:focus, input[type="time"][required]:valid, input.first[type="time"]:valid {color: inherit}
input.invalid:not([type="radio"]):not([type="checkbox"]):not([type="range"]):not([type="image"]) {color: red;border-color: rgb(255,60,60)}
input.first:not([type="radio"]):not([type="checkbox"]):not([type="range"]):not([type="image"]):invalid {color: red;border-color: rgb(255,60,60)}
textarea:focus, select:focus {border-color: var(--form-input-focus-color)}
textarea.first:valid, textarea[required]:valid {border-color: var(--form-input-focus-color)}
textarea.invalid, textarea.first:invalid {color: red;border-color: rgb(255,60,60)}
select.selected:valid, select[required]:valid {color: inherit;border-color: var(--form-input-focus-color)}
.form-item.invalid .input-address select {border-color: rgb(255,60,60)}
select.invalid, select.selected:invalid {border-color: rgb(255,60,60)}
input[data-type="select"]:focus {border-color: var(--form-input-focus-color)}
input.first[data-type="select"] {border-color: var(--form-input-focus-color)}
input[data-type="select"] {user-select: none;cursor: default}
input[readonly]:not([data-type="select"]) {color: rgb(84,84,84);background-color: rgb(240,240,240);cursor: default}
input[disabled] {color: rgb(84,84,84);background-color: rgb(240,240,240);cursor: default}
select[disabled] {color: rgb(84,84,84);background-color: rgb(240,240,240);cursor: default}
li, li:active {-webkit-tap-highlight-color: transparent}
option, option:active {-webkit-tap-highlight-color: transparent}
button, button:active {-webkit-tap-highlight-color: transparent}
button:focus {outline: none}
[contenteditable]:focus {outline: none}
`);
        this.#shadow.adoptedStyleSheets = [sheet];
        this.#shadow.append(this.#root)
    }

    // 访问器
    get value(){
        const values = Object.create(null);
        for (const [key,field] of this.#fields){
            values[field.name] = field.value;
        }
        return values;
    }
    get valid(){return this.#root.checkValidity()}
    get fields(){return this.#fields}

    // 私有方法
    #reset(){
        for (const [key,field] of this.#fields){field.reset()}
        this.scrollIntoView(true);
    }
    #submit(){
        for (const [key,field] of this.#fields){
            if (!field.valid) {field.focus();return field.valid;}
        }
        return true;
    }
    #bind(){
        this.#root.submit = ()=>{return this.checkValidity()}
        this.#root.onreset = ()=>{this.#reset()}
        this.#button.back.onclick = ()=>{history.back()}
        this.#button.submit.onclick = ()=>{this.#submit()}
    }
    #init(){
        // 初始化配置
        this.#config.id = '';
        this.#config.name = '';
        this.#config.class = '';
        this.#config.action = '';
        this.#config.method = 'get';
        this.#config.target = '_self';
        this.#config.enctype = 'application/x-www-form-urlencoded';
        this.#config.autocomplete = 'off';
        this.#config.nowrap = false;
        this.#config.history = false;
        this.#config.goback = false;
        // 按钮启用
        this.#config.button = Object.create(null);
        this.#config.button.back = false;
        this.#config.button.reset = true;
        this.#config.button.submit = true;


        // 默认控件注册
        const defaultControls = ['text','search','number','password','tel','url','email','date','month','time','datetime','datetime-local'];
        defaultControls.forEach(name => {this.register(name, TextControl)});
        this.register('textarea', TextareaControl);
        this.register('select', SelectControl);
        this.register('radio', RadioControl);
        this.register('checkbox', CheckControl);


        // form 模板创建
        const join = '';
        const node = `<form autocomplete="off"><div class="form-main"></div>${ join
            }<div class="form-validate"><span class="danger"></span></div><div class="form-button"></div></form>`;
        this.#root = document.createRange().createContextualFragment(node).firstElementChild;
        this.#element.main = this.#root.querySelector('.form-main');
        this.#element.danger = this.#root.querySelector('.danger');
        this.#element.button = this.#root.querySelector('.form-button');

        // 表单按钮
        const back = document.createElement('button');
        back.setAttribute('type','button');
        back.setAttribute('value','back');
        back.textContent = '返回';
        this.#button.back = back;

        const reset = document.createElement('button');
        reset.setAttribute('type','reset');
        reset.setAttribute('value','reset');
        reset.textContent = '重置';
        this.#button.reset = reset;

        const submit = document.createElement('button');
        submit.setAttribute('type','submit');
        submit.setAttribute('value','submit');
        submit.textContent = '提交';
        this.#button.submit = submit;

        // 绑定按钮事件
        this.#bind();
    }

    #remove(){
        if (this.#target){
            for (const [key,field] of this.#fields){
                field.unload();
            }
            this.#fields.clear();
            this.#element.main.textContent = '';
            return true;
        }
        return false;
    }

    // 公共方法
    hasControl(name){
        if (name && typeof name === 'string'){
            return this.#controls.has(name);
        }
        return false;
    }
    control(name){
        if (name && typeof name === 'string' && this.#controls.has(name)){
            return this.#controls.get(name);
        } else {
            return null;
        }
    }
    field(name){
        if (name && typeof name === 'string' && this.#fields.has(name)){
            return this.#fields.get(name);
        } else {
            return null;
        }
    }

    checkValidity(){
        const valid = this.#root.checkValidity();
        this.#submit();
        return valid;
    }

    // 组件配置
    config(config){
        if (Object.prototype.toString.call(config) !== '[object Object]'){throw new Error('Form configuration must be of object type')}
        const elemnetOptions = ['id','name','class'];
        const formControlOpitons = ['action','method','autocomplete','enctype','target','charset'];
        const configOptions = elemnetOptions.concat(formControlOpitons);
        for (const key of configOptions){
            if (Object.hasOwn(config, key)){
                if (typeof config[key] !== 'string'){throw new Error(`The "config.${key}" attribute must be of string type.`)}
                if (config[key].trim()){config[key] = config[key].trim();this.#config[key] = config[key];}
            }
        }
        for (const key of elemnetOptions){
            if (Object.hasOwn(config, key) && config[key].length > 0){this.setAttribute(key, config[key]);}
        }

        for (const key of formControlOpitons){
            if (Object.hasOwn(config, key) && config[key].length > 0){this.#root.setAttribute(key, config[key]);}
        }
        const componentOptions = ['nowrap','history'];
        for (const key of componentOptions){
            if (Object.hasOwn(config, key)){
                if (typeof config[key] !== 'boolean'){throw new Error(`The "config.${key}" attribute must be of boolean type.`)}
                if (config[key]){this.#config[key] = true} else {this.#config[key] = false}
            }
        }
        if (Object.hasOwn(config, 'button')){
            if (Object.prototype.toString.call(config.button) !== '[object Object]'){throw new Error('Configuration button attribute requires object type')}
            const buttonOptions = ['reset','back','submit'];
            for (const key of buttonOptions){
                if (Object.hasOwn(config.button, key)){
                    if (typeof config.button[key] !== 'boolean'){throw new Error(`The "config.button.${key}" attribute must be of boolean type.`)}
                    if (config.button[key]){this.#config.button[key] = true} else {this.#config.button[key] = false}
                }
            }
        }
        return this.#config;
    }

    // 控件注册
    register(name, control){
        if (name && typeof name === 'string' && control){
            this.#controls.set(name, control);
        }
    }

    /**
     *
     * @param {Array<object>} source 数据源
     * @param {HTMLElement} target 挂载目标
     * @returns {boolean}
     */
    render(source, target){
        if (FormControl.check(source)){
            this.#remove();
            for (let i = 0;i < source.length;i ++){
                const group = source[i];
                const fieldset = document.createElement('fieldset');
                if (this.#config.nowrap){fieldset.classList.add('nowrap')};
                fieldset.classList.add('form-group');
                const legend = document.createElement('legend');
                if (group.group && typeof group.group === 'string'){legend.textContent = group.group}
                fieldset.append(legend);
                if (group.fields && Array.isArray(group.fields)){
                    const fields = group.fields;
                    for (let j = 0;j < fields.length;j ++){
                        const field = fields[j];
                        if (field.type && this.hasControl(field.type)){
                            const Control = this.control(field.type);
                            const prod = new Control(field);
                            this.#fields.set(prod.name, prod);
                            fieldset.append(prod.root);
                        } else {
                            throw Error(`Control of type "${field.type}" is not registered.`);
                        }
                    }
                }
                this.#element.main.append(fieldset);
            }
            const buttons = ['back','reset','submit'];
            for (const key of buttons){if(this.#config.button[key]){this.#element.button.append(this.#button[key])}}
            const attrs = ['id','name','class'];
            for (const key of attrs){if(this.#config[key]){this.classList.add(this.#config[key])}}
            if (!this.#target){this.#target = target;this.#target.append(this)}
            return true;
        }
        return false;
    }

    toggle(){
        const fieldset = this.#element.main.querySelectorAll('fieldset');
        if (!fieldset.length){return false;}
        if (this.#config.nowrap){
            for (let i = 0;i < fieldset.length;i ++){
                fieldset[i].classList.remove('nowrap');
            }
            this.#config.nowrap = false;
        } else {
            for (let i = 0;i < fieldset.length;i ++){
                fieldset[i].classList.add('nowrap');
            }
            this.#config.nowrap = true;
        }
        return true;
    }

    message(danger){this.#element.danger.textContent = danger;return danger;}
    clear(){if (this.#element.danger.textContent){this.#element.danger.textContent = '';}return '';}
    reset(){this.#root.reset();return true;}
    submit(){this.#root.requestSubmit();return this.#submit();}
    unload(){
        this.#remove();
        this.remove();
        this.#target = null;
        this.#shadow.firstElementChild.remove();
        this.#shadow = null;
        this.#element = null;
        this.#button = null;
        return true;
    }

    /**
     *
     * @param {object} headers
     * @param {Function} callback
     * @returns {Promise<object>}
     */
    async send(headers = {}, callback){
        try {
            if (!this.checkValidity()) {throw new Error('The form did not pass validation');}
            if (!this.#config.action) {throw new Error('Form "action" is required for submit');}
            const method = this.#config.method.toUpperCase();
            try {
                if (method === 'GET') {
                    const url = new URL(this.#config.action, window.location.href);
                    Object.entries(this.value).forEach(([key, val])=> url.searchParams.append(key, val));
                    const request = await fetch(url.toString());
                    if (!request.ok) {throw new Error(`Request failed with status ${request.status}`);}
                    const response = await request.text();
                    if (typeof callback === 'function') {callback(response);}
                    return response;
                } else {
                    const header = Object.create(null);
                    header['Content-Type'] = 'application/json; charset=utf-8';
                    if (typeof headers === 'object' && Object.prototype.toString.call(headers) === '[object Object]') {
                        for (const key of Object.keys(headers)){
                            if (typeof headers[key] === 'string' || typeof headers[key] === 'number'){header[key] = headers[key]}
                        }
                    }
                    const request = await fetch(this.#config.action,
                        {'method': method,'headers': header,'body' : JSON.stringify(this.value)}
                    );
                    if (!request.ok) {throw new Error(`Request failed with status ${request.status}`);}
                    const response = await request.json();
                    if (Object.hasOwn(response, 'message')){this.message(response.message);}
                    if (typeof callback === 'function') {callback(response)}
                    return response;
                }
            } catch (error) {throw error;}
        } catch (error) {throw error;}
    }


    static check(source){
        if (source === undefined || source == null){throw new Error('Required parameter missing')}
        if (Object.prototype.toString.call(source) !== '[object Array]'){throw new Error('Parameter type error')}
        if (source.length == 0){throw new Error('Configuration information cannot be empty')}
        if (source.length > 0){
            for (const item of source){
                if (Object.prototype.toString.call(item) !== '[object Object]'){throw new Error('Grouping configuration requires object type')}
                if (Object.hasOwn(item, 'group') && typeof item.group !== 'string'){throw new Error('The "group" attribute must be of string type.')}
                if (!Object.hasOwn(item, 'fields')) {throw new Error('The "fields" attribute is a required attribute.')}
                if (Object.prototype.toString.call(item.fields) !== '[object Array]'){throw new Error('The "fields" attribute must be of array type')}
            }
        }
        return true;
    }

    disconnectedCallback(){this.unload()}
}

// 组件注册
customElements.define('ele-form', FormControl);
