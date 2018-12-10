;'use strict';

function BlogReady() {

    const d = document;
    const w = window;

    const log = console.log.bind(console);

    let ui = {

        container: null,
        temps: {}
    };

    let cache, page, config, route;

    BindHandlers();

    function Init(state) {

        config = {

            router: 'router.php',
            siteTitle: 'Blog',
            mainPage: '/blog',
            pages: [
                {
                    title: 'Main',
                    path: '/',
                    temp: '/blog',
                    route: '/blog',
                    handler: RenderBlog,
                    data: 'all'
                },
                {
                    title: 'Edit',
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
                    route: null,
                    handler: RenderError,
                    data: null
                }
            ]
        };

        const promises = config.pages.map(item => item.temp);

        cache = {}, page = {};

        ui.container = d.getElementById('blogContent');
        Promise.all(promises.map(url => GetTemp(url))).then(() => Render(state));
    }

    function GetTemp(url) {

        return fetch(`temp${url}.tmp`)
            .then(response => { return response.text().then(text => ui.temps[url] = text) });
    }

    function RenderBlog(json) {
        
        var fragment = document.createElement('DIV');

        JSON.parse(json).forEach(post => {

            var temp = document.createRange().createContextualFragment(ui.temps['/blog']);

            temp.querySelector('H4').innerHTML = post.title;
            temp.querySelector('IMG').src = post.sm_image;
            var span = temp.querySelector('SPAN');
            span.parentNode.insertBefore(document.createTextNode(post.created), span.nextSibling);
            temp.querySelectorAll('P')[1].innerHTML = post.content.substring(0, 500) + '...';
            var links = temp.querySelectorAll('A');
            links[0].href = '/post?' + post.id;
            links[1].href = '/edit?' + post.id;   

            fragment.appendChild(temp);
        });

        ui.container.appendChild(fragment);
    }

    function RenderEdit(json) {

        var fragment = document.createElement('DIV');

        JSON.parse(json).forEach(post => {

            var temp = document.createRange().createContextualFragment(ui.temps['/form']);

            var inputs = temp.querySelectorAll('INPUT');
            inputs[0].value = post.title;
            temp.querySelector('TEXTAREA').innerHTML = post.content;
            temp.querySelector('IMG').src = post.sm_image;

            temp.querySelector('A').addEventListener('click', UpdatePost);
            temp.querySelector('A').href = '/update?' + post.id;

            fragment.appendChild(temp);
        });

        ui.container.appendChild(fragment);
    }

    function UpdatePost(e) {

        e.stopPropagation();
        e.preventDefault();

        log('send data');
    }

    function RenderPost(json) {

        var fragment = document.createElement('DIV');

        JSON.parse(json).forEach(post => {

            var temp = document.createRange().createContextualFragment(ui.temps['/post']);

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

            fragment.appendChild(temp);
        });

        ui.container.appendChild(fragment);
    }

    function RenderError() {

        var fragment = document.createElement('DIV');
        var temp = document.createRange().createContextualFragment(ui.temps['/error']);
        fragment.appendChild(temp);
        ui.container.appendChild(fragment);
    }

    function Render(state) {
        
        if (!state) return;
        
        ClearContent();

        var obj = config.pages.find(o => o.path === location.pathname) || config.pages.find(o => o.path === '/error');

        log(obj);

        // var url = obj.temp;
        // var temp = ui.temps[url] || ui.temps['/error'];
        // ui.container.insertAdjacentHTML('afterbegin', temp);
        // var route = location.pathname === '/' ? config.mainPage : location.pathname;

        var data = 'data=' + (location.search.substr(1) || obj.data);

        $.post({ url: config.router + obj.route, data: data})
            .done(obj.handler);
    }

    function GetState(e) {

        e.stopPropagation();
        e.preventDefault();

        if (e.target.tagName !== 'A') return;

        var state = { page: e.target.getAttribute('href') };
        history.pushState(state, '', state.page);

        Render(state);
    }

    function ClearContent(){
        
        while (ui.container.firstChild) {
            ui.container.removeChild(ui.container.firstChild);
        }
    }

    function BindHandlers() {
        
        w.addEventListener('hashchange', Render);
        w.addEventListener('click', GetState);
        w.addEventListener('load', Init);
        w.addEventListener('popstate', Init);
    }
};

document.addEventListener('DOMContentLoaded', BlogReady);