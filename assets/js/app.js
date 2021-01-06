const firebaseConfig = {
    apiKey: "AIzaSyBNnvwleeyFislflOkB-6RFNvo7w1FI3ko",
    authDomain: "bfastapp.firebaseapp.com",
    databaseURL: "https://bfastapp.firebaseio.com",
    projectId: "bfastapp",
    storageBucket: "",
    messagingSenderId: "311831913786",
    appId: "1:311831913786:web:6be76738b599546b"
  };
firebase.initializeApp(firebaseConfig);

const appStore = new Vuex.Store({
    state: {
    },
    mutations: {
       
    },
    actions: {
       
    }
});

const appAuth = new Vue({
    el: '#appAuth',
    store: appStore,
    data: {
        loginProgress: false,
        isLogin: false,
        user: {
            username: '',
            password: ''
        }
    },
   created: function(){
        firebase.auth().onAuthStateChanged(user=>{
           if(user){
               this.isLogin = true;
               // console.log(firebase.auth().currentUser);
               // console.log(user);
           }else{
               // console.log(firebase.auth().currentUser);
               this.isLogin = false;
           }
        });
    },
    methods: {
        logout(){
            firebase.auth().signOut();
        },
    },
    computed: {
        getIsLogin(){
            return this.isLogin;
        }
    }
});

const authModal = new Vue({
    el: '#authModal',
    data: {
        isRegister: false,
        isLogin: false,
        authProgress: false,
        loginError: false,
        loginErrorMessage: '',
        user: {
            email: '',
            password: '',
            fullname: '',
            password: '',
            company: ''
        }
    },
    methods: {
        login(){
            // console.log('implement login');
            const form = this.$refs.authForm;
            form.classList.add('was-validated');
            if(form.checkValidity()){
                this.authProgress = true;
                console.log(this.user);
               // firebase.auth().
            }
        },
        register(){
            const form = this.$refs.authForm;
            form.classList.add('was-validated');
            if(form.checkValidity()){
                this.authProgress = true;
                console.log(this.user);
            }
        },
        loginWithEmail(){
            this.authProgress = true;
            this.loginError = false;
            const provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithEmailAndPassword(this.user.email, this.user.password).then((result)=> {
                // ar token = result.credential.accessToken;
                // ar user = result.user;
                // console.log(user);
                this.loginError = false;
                $('#auth').modal('toggle');
            }).catch((error)=> {
                var errorMessage = error.message;
                this.loginError = true;
                this.loginErrorMessage = errorMessage;
                console.log(errorMessage);
            }).finally(_=>{
                this.authProgress = false;
            });
        },
        loginWithGoogle(){
            this.authProgress = true;
            this.loginError = false;
            const provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider).then((result)=> {
                var token = result.credential.accessToken;
                var user = result.user;
                // console.log(user);
                this.loginError = false;
                $('#auth').modal('toggle');
            }).catch((error)=> {
                var errorMessage = error.message;
                this.loginError = true;
                this.loginErrorMessage = errorMessage;
                console.log(errorMessage);
            }).finally(_=>{
                this.authProgress = false;
            });
        },
        reset(){
            console.log('implement reset');
        }
    },
    computed: {
        getIsRegister(){
            return this.isRegister;
        },
        getIsLogin(){
            return this.isLogin;
        },
        getIsAuthProgress(){
            // console.log('authenticate progress changes');
            if(this.authProgress){
                if(this.$refs.loginB)this.$refs.loginB.setAttribute('disabled','disabled');
                if(this.$refs.registerB)this.$refs.registerB.setAttribute('disabled','disabled');
                if(this.$refs.resetB)this.$refs.resetB.setAttribute('disabled','disabled');
                if(this.$refs.loginGB)this.$refs.loginGB.setAttribute('disabled','disabled');
                if(this.$refs.checkB)this.$refs.checkB.setAttribute('disabled', 'disabled');
            }else{
                if(this.$refs.loginB)this.$refs.loginB.removeAttribute('disabled','disabled');
                if(this.$refs.registerB)this.$refs.registerB.removeAttribute('disabled','disabled');
                if(this.$refs.resetB)this.$refs.resetB.removeAttribute('disabled','disabled');
                if(this.$refs.loginGB)this.$refs.loginGB.removeAttribute('disabled','disabled');
                if(this.$refs.checkB)this.$refs.checkB.removeAttribute('disabled', 'disabled');
            }
            return this.authProgress;
        }
    }
});


const project_loader = new Vue({
    el: '#loader',
    data: {
        showLoader: true,
    },
    created(){
        this.showLoader=false;
        // firebase.auth().onAuthStateChanged(user=>{
        //    if(user){
        //        // this.isLogin = true;
        //        // console.log(firebase.auth().currentUser);
        //        // console.log(user);
        //        this.showLoader=false;
        //    }else{
        //        // console.log(firebase.auth().currentUser);
        //        // this.isLogin = false;
        //        this.showLoader=false;
        //        // location.replace('/');
        //    }
        // });
    }
});









