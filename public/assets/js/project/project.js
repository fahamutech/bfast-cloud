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
            axios.post('/project/all',{
                uid: 'joshua'
            }).then(value=>{
                // console.log(value);
                context.commit('projects', value.data);
            }).catch(reason=>{
                context.commit('projects', []);
                console.log(reason.response); 
            });
        },
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
    created(){
        console.log('new project form created');
    },
    data: {
        createProjectMessage: '',
        createProjectError: false,
        createProjectDone: false,
        createProgressFlag: false,
        project: {
            name: '',
            projectId: '',
            description: ''
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
            if(valid){
                this.createProgressFlag = true;
                createB.classList.add('disabled');
                closeB.classList.add('disabled');
                const project = this.project;
                project.user = {
                    uid: 'joshua'
                };
                axios.post('/project', project).then(value=>{
                    this.project.name ='';
                    this.project.projectId = '';
                    this.project.description = '';
                    this.createProjectDone = true;
                    this.$store.dispatch('projects');
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
        }
    }
});







