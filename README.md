# form

#### 介绍
原生开发的轻量级 Web Components 表单组件，使用方便，无依赖、支持验证与主题定制。

#### 软件架构

#### 展示页面
    点击查看：http://beker.picp.vip/demo/form


#### 安装教程

1.  浏览器：

    ```import FormControl from 'http://chinbeker.qicp.vip:5152/js/form.esm.js';```


2.  其他框架：

    ```import FormControl from "http://chinbeker.qicp.vip:5152/js/form.esm.js";```


#### 使用说明

1.  模块导入 FormControl 类,```const form = new FormControl()```, 获取一个实例。
2.  新建配置文件，调用 ```form.config()``` 传入组件的配置信息。
3.  编写表单字段的渲染数据 。(数据驱动页面)
4.  调用实例方法 ```form.render(字段数据，挂载节点)```。


#### 开发说明
1.  详细请看 index.html 或者打开演示页面的网页源代码。
2.  目前仅有 ```[text, textarea, search, number, password, tel, url, email, date, month, time, datetime, datetime-local, select, radio, checkbox]``` 原生实现的表单控件，其他控件后续补齐。

#### 联系我

电子邮箱：chinbeker@foxmai.com
