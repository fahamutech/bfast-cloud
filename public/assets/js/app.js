const appStore = new Vuex.Store({
    state: {
    },
    mutations: {
       
    },
    actions: {
       
    }
});

const isLogin = false;

const appAuth = new Vue({
    el: '#appAuth',
    store: appStore,
    data: {
        loginProgress: false,
        isLogin: isLogin,
        user: {
            username: '',
            password: ''
        }
    },
    created: function(){
       
    },
    methods: {
        login(){
            console.log('implement login');
        },
        register(){
            console.log('implement register');
        },
        logout(){
            console.log('implement logout');
        },
        
    },
    computed: {
        getIsLogin(){
            return this.isLogin;
        }
    }
});







