const {mongoRepSet, config} = require("../test.config");
const {should, expect} = require('chai');
const bfast = require("bfast");

describe('Projects route', function () {
    let adminToken;
    let userToken;
    before(async function () {
        await mongoRepSet().start();
        const adm = await bfast.functions().request('/users/admin')
            .post({
                email: 'a@a.a',
                displayName: 'admin',
                phoneNumber: '0656',
                password: 'admin'
            }, {
                headers: {
                    Authorization: config.masterKey
                }
            });
        adminToken = adm.token;
        const user = await bfast.functions().request('/users')
            .post({
                email: 'b@b.b',
                displayName: 'user',
                phoneNumber: '0656',
                password: 'user'
            });
        userToken = user.token;
    });

    describe('Create', function () {
        it('should create a bfast project', async function () {
            try {
                const p = await bfast.functions().request('/projects/bfast?dry').post({
                        name: 'test',
                        description: 'test project',
                        projectId: 'test',
                        hostDomain: 'fahamutech.com',
                        parse: {
                            appId: 'testapp',
                            masterKey: 'testapp',
                        },
                        members: [
                            {email: 'b@b.b', displayName: 'user'}
                        ]
                    }, {
                        headers: {
                            Authorization: `Bearer ${adminToken}`
                        }
                    }
                );
                should().exist(p);
                should().exist(p.id);
                should().exist(p.type);
                should().exist(p.user);
                expect(p.dry_run).equal(true);
                expect(p.type).equal('bfast');
            } catch (e) {
                console.log(e?.response?.data);
                throw e;
            }
        });
        it('should not create a bfast project which already exist', async function () {
            try {
                const p = await bfast.functions()
                    .request('/projects/bfast?dry')
                    .post({
                        name: 'test',
                        description: 'test project',
                        projectId: 'test',
                        hostDomain: 'fahamutech.com',
                        parse: {
                            appId: 'testapp',
                            masterKey: 'testapp',
                        }
                    }, {
                        headers: {
                            Authorization: `Bearer ${adminToken}`
                        }
                    });
                should().not.exist(p);
            } catch (e) {
                // console.log(e?.response?.data);
                should().exist(e);
                expect(e?.response?.data?.message
                    .startsWith('Project id you suggest is already in use, maybe try this')
                ).equal(true);
            }
        });
        it('should not create a bfast project with invalid data', async function () {
            try {
                const p = await bfast.functions()
                    .request('/projects/bfast?dry')
                    .post({
                        name: 'test',
                        description: 'test project',
                        // projectId: 'test',
                        hostDomain: 'fahamutech.com',
                        parse: {
                            appId: 'testapp',
                            masterKey: 'testapp',
                        }
                    }, {
                        headers: {
                            Authorization: `Bearer ${adminToken}`
                        }
                    });
                should().not.exist(p);
            } catch (e) {
                // console.log(e?.response?.data);
                should().exist(e);
                expect(e?.response?.data?.message).equal('Invalid project data');
            }
        });
    });

    describe('GetProject', function () {
        before(async function () {
            await bfast.functions().request('/projects/bfast?dry').post({
                    name: 'test2',
                    description: 'test2 project',
                    projectId: 'test2',
                    hostDomain: 'fahamutech.com',
                    parse: {
                        appId: 'testapp',
                        masterKey: 'testapp',
                    }
                }, {
                    headers: {
                        Authorization: `Bearer ${adminToken}`
                    }
                }
            );
        });
        it('should get project by id', async function () {
            const p = await bfast.functions().request('/projects/test').get({
                    headers: {
                        Authorization: `Bearer ${adminToken}`
                    }
                }
            );
            should().exist(p);
            should().exist(p.id);
            expect(p.projectId).equal('test');
            expect(p.dry_run).equal(true);
        });
        it('should not return project if not exist', async function () {
            try {
                const p = await bfast.functions().request('/projects/test990i').get({
                        headers: {
                            Authorization: `Bearer ${adminToken}`
                        }
                    }
                );
                should().not.exist(p);
            } catch (e) {
                should().exist(e);
                expect(e?.response?.data).eql({
                    message: 'Fail to get project details'
                });
            }
        });
        it('should not return project for invalid token', async function () {
            try {
                const p = await bfast.functions().request('/projects/test').get({
                        headers: {
                            Authorization: `Bearer abc`
                        }
                    }
                );
                should().not.exist(p);
            } catch (e) {
                should().exist(e);
                expect(e?.response?.data?.message).equal('Fails to verify token');
            }
        });
    });

    describe('GetAll', function () {
        it('should get all projects with admin token', async function () {
            const p = await bfast.functions().request('/projects').get({
                    headers: {
                        Authorization: `Bearer ${adminToken}`
                    }
                }
            );
            should().exist(p);
            expect(p).length(2);
            // console.log(p);
        });
        it('should get all projects with user token', async function () {
            const p = await bfast.functions().request('/projects').get({
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                }
            );
            should().exist(p);
            expect(p).length(1);
            expect(p[0].members[0].email).equal('b@b.b');
            // console.log(p);
        });
        it('should not return projects for invalid token', async function () {
            try {
                const p = await bfast.functions().request('/projects').get({
                        headers: {
                            Authorization: `Bearer abc`
                        }
                    }
                );
                should().not.exist(p);
            } catch (e) {
                should().exist(e);
                expect(e?.response?.data?.message).equal('Fails to verify token');
            }
        });
    });
    describe('Patch', function () {
        it('should update project details', async function () {
            const p = await bfast.functions().request('/projects/test').put(
                {
                    name: 'updated test'
                },
                {
                    headers: {
                        Authorization: `Bearer ${adminToken}`
                    }
                }
            );
            should().exist(p);
            expect(p.message).equal('Project updated');
        });
        // it('should not update for non exist projects', async function () {
        //     try {
        //         const p = await bfast.functions().request('/projects/test9080').put(
        //             {
        //                 name: 'updated test'
        //             },
        //             {
        //                 headers: {
        //                     Authorization: `Bearer ${adminToken}`
        //                 }
        //             }
        //         );
        //         should().not.exist(p);
        //     } catch (e) {
        //         should().exist(e?.response?.data);
        //         expect(e?.response?.data.message).equal('Project not updated');
        //     }
        // });
    });

    describe('addMemberToProject', function () {
        it('should add a member to project if user has enough permission', async function () {
            const p = await bfast.functions().request('/projects/test/members').post(
                {
                    email: 'j@j.j',
                    displayName: 'mshana'
                },
                {
                    headers: {
                        Authorization: `Bearer ${adminToken}`
                    }
                }
            );
            should().exist(p);
            expect(p.members).length(2);
            // console.log(p);
        });
        it('should not add a member to project if email not available', async function () {
            try {
                const p = await bfast.functions().request('/projects/test/members').post(
                    {
                        // email: 'j@j.j',
                        displayName: 'mshana'
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${adminToken}`
                        }
                    }
                );
                should().not.exist(p);
            } catch (e) {
                should().exist(e);
                expect(e?.response?.data).eql({
                    message: 'email is required'
                });
            }
        });
        it('should not add a member to project if displayName not available', async function () {
            try {
                const p = await bfast.functions().request('/projects/test/members').post(
                    {
                        email: 'j@j.j',
                        // displayName: 'mshana'
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${adminToken}`
                        }
                    }
                );
                should().not.exist(p);
            } catch (e) {
                should().exist(e);
                expect(e?.response?.data).eql({
                    message: 'displayName is required'
                });
            }
        });
        it('should not add a member to project if user not available', async function () {
            try {
                const p = await bfast.functions().request('/projects/test/members').post(
                    {
                        // email: 'j@j.j',
                        // displayName: 'mshana'
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${adminToken}`
                        }
                    }
                );
                should().not.exist(p);
            } catch (e) {
                should().exist(e);
                expect(e?.response?.data).eql({
                    message: 'email is required'
                });
            }
        });
    });

    describe('Delete', function () {
        it('should delete a project', async function () {
            const p = await bfast.functions().request('/projects/test').delete({
                    headers: {
                        Authorization: `Bearer ${adminToken}`
                    }
                }
            );
            should().exist(p);
            expect(p.message).equal('Project deleted and removed');
            const all = await bfast.functions().request('/projects').get({
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            });
            should().exist(all);
            expect(all).length(1);
        });
        it('should not delete a non exist project', async function () {
            try {
                const p = await bfast.functions().request('/projects/test90i').delete({
                        headers: {
                            Authorization: `Bearer ${adminToken}`
                        }
                    }
                );
                should().not.exist(p);
            } catch (e) {
                expect(e?.response?.data?.message).equal('Fail to get project details');
            }
        });
    });
})
;
