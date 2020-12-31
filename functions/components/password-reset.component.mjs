export const passwordRestComponent = function (){
    return `
        <!DOCTYPE html>
        <html>
        
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
            <title>BFast::Cloud - Reset Password</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/css/bootstrap.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/css/ionicons.min.css">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto">
            <!--    <link rel="stylesheet" href="assets/css/styles.min.css">-->
            <style>
                .login-clean {
                    background: #f1f7fc;
                    padding: 80px 0
                }
        
                .login-clean form {
                    max-width: 320px;
                    width: 90%;
                    margin: 0 auto;
                    background-color: #fff;
                    padding: 40px;
                    border-radius: 4px;
                    color: #505e6c;
                    box-shadow: 1px 1px 5px rgba(0, 0, 0, .1)
                }
        
                .login-clean .illustration {
                    text-align: center;
                    padding: 0 0 20px;
                    font-size: 100px;
                    color: #f4476b
                }
        
                .login-clean form .form-control {
                    background: #f7f9fc;
                    border: none;
                    border-bottom: 1px solid #dfe7f1;
                    border-radius: 0;
                    box-shadow: none;
                    outline: 0;
                    color: inherit;
                    text-indent: 8px;
                    height: 42px
                }
        
                .login-clean form .btn-primary {
                    background: #f4476b;
                    border: none;
                    border-radius: 4px;
                    padding: 11px;
                    box-shadow: none;
                    margin-top: 26px;
                    text-shadow: none;
                    outline: 0 !important
                }
        
                .login-clean form .btn-primary:active, .login-clean form .btn-primary:hover {
                    background: #eb3b60
                }
        
                .login-clean form .btn-primary:active {
                    transform: translateY(1px)
                }
        
                .login-clean form .forgot {
                    display: block;
                    text-align: center;
                    font-size: 12px;
                    color: #6f7a85;
                    opacity: .9;
                    text-decoration: none
                }
        
                .login-clean form .forgot:active, .login-clean form .forgot:hover {
                    opacity: 1;
                    text-decoration: none
                }
            </style>
        </head>
        
        <body style="display: flex;flex-direction: column;min-height: 100vh;">
        <nav class="navbar navbar-light navbar-expand-md shadow" style="flex-grow: 0;">
            <div class="container">
                <a class="navbar-brand" href="#"
                   style="font-family: Roboto, sans-serif;font-weight: bold;color: rgb(17,90,158);">
                    BFAST::CLOUD
                </a>
                <button class="navbar-toggler" data-toggle="collapse">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="navbar-toggler-icon"></span>
                </button>
            </div>
        </nav>
        <!-- Start: Login Form Clean -->
        <div id="loginApp" class="login-clean" style="background-color: rgb(5,89,159);flex-grow: 1;">
            <form>
                <h2 class="sr-only">Reset Form</h2>
                <small class="form-text text-muted" style="font-family: Roboto, sans-serif;font-weight: normal;">
                    Reset your password
                </small>
                <div class="illustration">
                    <i class="icon ion-ios-refresh-empty" style="color: rgb(26,91,157);"></i>
                </div>
                <div class="form-group">
                    <input class="form-control"
                           type="password"
                           v-model="password"
                           placeholder="Password"
                           required="" minlength="6">
                </div>
                <div class="form-group">
                    <input class="form-control"
                           type="password"
                           v-model="cpassword"
                           placeholder="Repeat Password"
                           required="" minlength="6">
                </div>
                <div class="form-group">
                    <button v-if="!loginProgress" @click="login($event)" class="btn btn-primary btn-block" type="submit"
                            style="background-color: rgb(17,90,158);">
                        RESET
                    </button>
                    <div id="spinnerId" style="display: none" v-if="loginProgress"
                         class="d-flex justify-content-center align-item-center spinner-border" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
            </form>
        </div>
        <!-- End: Login Form Clean -->
        <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/vue"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/js/bootstrap.bundle.min.js"></script>
        <script>
            const loginApp = new Vue({
                el: '#loginApp',
                data: {
                    cpassword: '',
                    password: '',
                    token: '',
                    loginProgress: false,
                },
                created: function () {
                    document.getElementById('spinnerId').removeAttribute('style');
                    //  console.log('login app started');
                    let href = location.href;
                    const url = new URL(href);
                    this.token = url.searchParams.get('token');
                },
                methods: {
                    login($event) {
                        $event.preventDefault();
                        const valid = (this.password && this.password !== '' && this.cpassword && this.cpassword !== '');
                        if (!valid) {
                            alert('Please fill password and repeat password field');
                            return;
                        }
                        if (this.password !== this.cpassword) {
                            alert('Password not match, try again');
                            return;
                        }
                        this.loginProgress = true;
                        axios.post('/users/password/reset', {
                            code: this.token,
                            password: this.password
                        }, {
                            headers: {
                                'content-type': 'application/json'
                            }
                        }).then(value => {
                            console.log(value.data);
                            document.body.innerHTML = \`
                            <div class="container">
                                <h4>Password reset successful, you can continue with login process.</h4>
                            </div>
                            \`;
                            this.loginProgress = false;
                        }).catch(reason => {
                            console.log(reason.data);
                            this.loginProgress = false;
                            alert('Unexpected error happens');
                        });
                    }
                }
        
            });
        </script>
        </body>
        
        </html>
    `
}
