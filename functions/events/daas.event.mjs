import bfast from "bfast";
import {exec} from 'child_process';
import moment from "moment";
// import {platform} from 'os';

// const shell = platform() === 'win32' ? 'cmd.exe' : 'bash';

const terminals = {};

/**
 *
 * @param shell {string}
 * @param args {Array<string>}
 * @param project {string}
 * @param response {*}
 */
function createTerminal(shell, args, project, response) {
    const _exec = exec(shell.concat(' ').concat(args.join(' ')));
    _exec.on('message', message => {
        response.topic(project).announce(message);
    });
    _exec.on("error", err => {
        response.topic(project).announce(err);
    });
    terminals[project] = {
        terminal: {
            kill: function (){
                _exec.kill();
                delete terminals[project];
            }
        },
        last: new Date()
    };
}

// 2nd draft

export const instanceLogsEvent = bfast.functions().onEvent(
    '/logs',
    (request, response) => {
        if (request.auth && request.auth.projectId && request.auth.type) {
            const _projectId = request.auth.projectId;
            const _projectType = request.auth.type;
            const project = `${_projectId}_${_projectType}`.trim();
            const since =
                request.body
                && request.body.time
                && request.body.time
                && request.body.time.toString().replace(new RegExp('[^0-9]', 'ig'), '') !== ''
                    ? request.body.time.toString().replace(new RegExp('[^0-9]', 'ig'), '')
                    : '0';
            const token = request.body && request.body.token ? request.body.token : null;
            response.topic(project).join();
            if (terminals[project] && terminals[project].terminal) {
                terminals[project].last = new Date();
            } else {
                response.topic(project).announce('*** start streaming now ******\r\n');
                createTerminal(`docker`, ['service', 'logs', '-t', '--raw', '-f', '--since', `${since}m`, project], project, response);
            }
        } else {
            response.emit({message: 'please provide projectId and project type in auth and valid token in body'});
        }
    }
);

export const instanceLogsCleaningUpJobs = bfast.functions().onJob(
    {second: '*/30'},
    _ => {
        const projects = Object.keys(terminals).map(x => {
            const past = moment(moment.now()).diff(terminals[x].last, 'minutes');
            return {name: x, lastUpdatedMin: past, remove: (past !== null && past !== undefined && past > 1)}
        });
        projects.forEach(el => {
            if (el.remove === true) {
                terminals[el.name].terminal?.kill();
            }
        });
        // console.log(projects);
    }
);
