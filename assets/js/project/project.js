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

const pStore = new Vuex.Store({
    state: {
        projects: [],
    },
    mutations: {
        projects(state, data){
            state.projects = data;
        }
    },
    actions: {
        projects(context){
            firebase.auth().onAuthStateChanged(user=>{
               if(user){
                    axios.post('/project/all',{
                        uid: user.uid,
                    }).then(value=>{
                        // console.log(value);
                        context.commit('projects', value.data);
                    }).catch(reason=>{
                        context.commit('projects', []);
                        console.log(reason.response); 
                    });
               }else{
                   context.commit('projects', []);
               }
            });
        },
    }
});

const authBar = new Vue({
    el: '#authBar',
    data: {
        
    },
    methods: {
      logout(){
          // location.replace('/');
          console.log(firebase.auth().currentUser);
          if(firebase.auth().currentUser){
              firebase.auth().signOut();
              location.replace('/');
          }
      }  
    }
});

const project = new Vue({
    el: '#projects',
    store: pStore,
    data: {
        
    },
    created: function(){
        this.$store.dispatch('projects');
    },
    methods: {

    },
    computed: {
        projects: function(){
            // console.log(this.$store.state.projects);
            return this.$store.state.projects;
        },
        showProjcts: function(){
            
        }
    }
});

const project_new = new Vue({
    el: '#createProject',
    store: pStore,
    data: {
        createProjectMessage: '',
        createProjectError: false,
        createProjectDone: false,
        createProgressFlag: false,
        project: {
            name: '',
            projectId: '',
            description: '',
            isParse: true,
            parse: {
                appId: null,
                masterKey: null
            }
        }
    },
    methods: {
        createProject: function(){
            this.createProjectDone = false;
            this.createProjectError = false;
            const form = this.$refs.createProjectForm;
            const createB = this.$refs.createButton;
            const closeB = this.$refs.closeButton;
            const valid = form.checkValidity();
            form.classList.add('was-validated');
            console.log(this.project);
            if(valid && firebase.auth().currentUser){
                this.createProgressFlag = true;
                createB.classList.add('disabled');
                closeB.classList.add('disabled');
                const project = this.project;
                project.user = firebase.auth().currentUser;
                axios.post('/project', project).then(value=>{
                    this.project.name ='';
                    this.project.projectId = '';
                    this.project.description = '';
                    this.project.isParse = true;
                    this.project.parse.appId = null;
                    this.project.parse.masterKey = null;
                    this.createProjectDone = false;
                    form.classList.remove('was-validated');
                    this.$store.dispatch('projects');
                    $('#newProject').modal('toggle');
                }).catch(error=>{
                    this.createProjectError = true;
                    this.createProjectMessage = error.response.data.message;
                    // console.log(error.response);
                }).finally(_=>{
                    createB.classList.remove('disabled');
                    closeB.classList.remove('disabled');
                    this.createProgressFlag = false;
                });
            }
        },
    },
    computed: {
        showProgress: function(){
            return this.createProgressFlag;
        },
        isParse: function(){
            return this.project.isParse
        }
    }
});

const project_loader = new Vue({
    el: '#loader',
    data: {
        showLoader: true,
    },
    created(){
        // console.log(console.log(firebase.auth().currentUser));
        firebase.auth().onAuthStateChanged(user=>{
           if(user){
               this.showLoader=false;
           }else{
               this.showLoader=false;
               location.replace('/');
           }
        });
    }
});

