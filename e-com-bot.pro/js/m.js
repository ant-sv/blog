;'use strict';

function BlogReady() {

    const d = document;
    const w = window;
    const log = console.log.bind(console);
    let config;

    let ui = { container: null, temps: {} };
    
    BindHandlers();

    function Init(state) {

        config = {

            router: 'router.php',
            siteTitle: 'Blog',
            mainPage: '/blog',
            pages: [
                {
                    title: 'Main page',
                    path: '/',
                    temp: '/blog',
                    route: '/blog',
                    handler: RenderBlog,
                    data: 'all'
                },
                {
                    title: 'Edit post',
                    path: '/edit',
                    temp: '/form',
                    route: '/edit',
                    handler: RenderEdit,
                    data: 'new'
                },
                {
                    title: 'Post',
                    path: '/post',
                    temp: '/post',
                    route: '/post',
                    handler: RenderPost,
                    data: 'last'
                },
                {
                    title: 'Error',
                    path: '/error',
                    temp: '/error',
                    route: '/error',
                    handler: RenderError,
                    data: 'Page not found'
                }
            ]
        };

        const promises = config.pages.map(item => item.temp);
        ui.container = d.getElementById('blogContent');
        Promise.all(promises.map(url => GetTemp(url))).then(() => Render(state));

        // log(ui.temps);
    }

    function GetTemp(url) {

        return fetch(`/temp${url}.tmp`)
            .then(response => { return response.text().then(text => ui.temps[url] = text) });
    }

    function RenderBlog(json) {
        
        JSON.parse(json).forEach(post => {

            var temp = d.createRange().createContextualFragment(ui.temps['/blog']);

            d.title = config.pages.find(o => o.path === '/').title;

            temp.querySelector('H4').innerHTML = post.title;
            temp.querySelector('IMG').src = post.sm_image;
            var span = temp.querySelector('SPAN');
            span.parentNode.insertBefore(document.createTextNode(post.created), span.nextSibling);
            temp.querySelectorAll('P')[1].innerHTML = post.content.substring(0, 500) + '...';
            temp.querySelector('A').href = '/post?' + post.id;

            ui.container.appendChild(temp);
        });
    }

    function RenderEdit(json) {

        JSON.parse(json).forEach(post => {

            var temp = d.createRange().createContextualFragment(ui.temps['/form']);

            temp.querySelector('INPUT').value = post.title;
            temp.querySelector('TEXTAREA').innerHTML = post.content;
            temp.querySelector('IMG').src = post.sm_image;

            temp.querySelector('A').addEventListener('click', UpdatePost);
            // temp.querySelector('A').href = '/update?' + post.id;
            temp.querySelector('FORM').id = post.id;

            ui.container.appendChild(temp);
        });
    }

    function UpdatePost(e) {

        if (e.target.tagName !== 'A') return;

        e.stopPropagation();
        e.preventDefault();

        var formData = new FormData();

        formData.append('title',   ui.container.querySelectorAll('INPUT')[0].value);
        formData.append('content', ui.container.querySelector   ('TEXTAREA').value);
        formData.append('id',      ui.container.querySelector   ('FORM').id);
        formData.append('title',   ui.container.querySelectorAll('INPUT')[0].value);
        formData.append('image',   ui.container.querySelector   ('#file').files[0]);

        $.post({
            url: config.router + '/update',
            data: formData,
            processData: false,
            contentType: false,
        }).then(data => log(data));
    }

    function RenderPost(json) {

        JSON.parse(json).forEach(post => {

            var temp = d.createRange().createContextualFragment(ui.temps['/post']);

            var headers = temp.querySelectorAll('H2');
            headers[0].innerHTML = post.title;
            headers[1].innerHTML = post.title;
            temp.querySelector('IMG').src = post.image;
            var span = temp.querySelector('SPAN');
            span.parentNode.insertBefore(document.createTextNode(post.created), span.nextSibling);
            temp.querySelectorAll('P')[0].innerHTML = post.content;
            var links = temp.querySelectorAll('A');
            links[0].href = '/del?' + post.id;
            links[1].href = '/edit?' + post.id;

            ui.container.appendChild(temp);
        });
    }

    function RenderError(data) {

        d.title = `${config.pages.find(o => o.path === '/error').title} - ${data}`;

        var temp = d.createRange().createContextualFragment(ui.temps['/error']);
        temp.querySelector('DIV').innerHTML = data;

        // log(location.pathname);

        ui.container.appendChild(temp);
    }

    function Render(state) {
        
        if (!state) return;
        
        ClearContent();
        var obj = config.pages.find(o => o.path === location.pathname) || config.pages.find(o => o.path === '/error');

        // log(obj);

        // var url = obj.temp;
        // var temp = ui.temps[url] || ui.temps['/error'];
        // ui.container.insertAdjacentHTML('afterbegin', temp);
        // var route = location.pathname === '/' ? config.mainPage : location.pathname;

        var data = 'data=' + (location.search.substr(1) || obj.data);

        obj.path === '/error' ?
            obj.handler(obj.data) :
            $.post({ url: config.router + obj.route, data: data}).done(obj.handler);
    }

    function GetState(e) {

        if (e.target.tagName !== 'A') return;

        e.stopPropagation();
        e.preventDefault();

        var state = { page: e.target.getAttribute('href') };
        history.pushState(state, '', state.page);

        Render(state);
    }

    function ClearContent(){
        
        while (ui.container.firstChild)
            ui.container.removeChild(ui.container.firstChild);
    }

    function BindHandlers() {
        
        w.addEventListener('hashchange', Render);
        w.addEventListener('click', GetState);
        w.addEventListener('load', Init);
        w.addEventListener('popstate', Init);
    }
};

document.addEventListener('DOMContentLoaded', BlogReady);