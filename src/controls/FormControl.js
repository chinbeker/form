import { TextControl } from "./TextControl.js";
import { TextareaControl } from "./TextareaControl.js";
import { SelectControl } from "./SelectControl.js";
import { RadioControl } from "./RadioControl.js";
import { CheckControl } from "./CheckControl.js";

import { CSSLoader } from "../utils/cssloader.js";

const style = await CSSLoader('/src/styles/form.css');

export class FormControl extends HTMLElement {
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
        sheet.replaceSync(style);
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
