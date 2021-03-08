import bfastnode from "bfastnode";
import {spawn} from 'node-pty-prebuilt-multiarch';
import moment from "moment";
// import {platform} from 'os';

// const shell = platform() === 'win32' ? 'cmd.exe' : 'bash';
const {bfast} = bfastnode;
const terminals = {};

/**
 *
 * @param shell {string}
 * @param args {Array<string>}
 * @param project {string}
 * @param response {*}
 */
function createTerminal(shell, args, project, response) {
    // console.log(shell);
    terminals[project] = {
        terminal: spawn(shell, args, {
            cols: 1000,
            rows: 700,
            cwd: process.cwd(),
            env: process.env,
            name: project,
        }),
        last: new Date()
    };
    try {
        terminals[project].onData = terminals[project].terminal.onData(data => {
            // response.broadcast(data);
            response.engine.of('/logs').to(project).emit('/logs', data)
            terminals[project].last = new Date();
        });
        terminals[project].onExit = terminals[project].terminal.onExit(_ => {
            terminals[project].onData.dispose();
            terminals[project].onExit.dispose();
            terminals[project].terminal.kill();
            delete terminals[project];
            console.log(_, '**********exit********');
        });
    } catch (e) {
        console.log(e);
        terminals[project] = {};
    }
}

// 2nd draft

export const instanceLogsEvent = bfast.functions().onEvent(
    '/logs',
    (request, response) => {
        if (request.auth && request.auth.projectId && request.auth.type) {
            const projectId = request.auth.projectId;
            const projectType = request.auth.type;
            const project = `${projectId}_${projectType}`.trim();
            const since =
                request.body
                && request.body.time
                && request.body.time
                && request.body.time.toString().replace(new RegExp('[^0-9]', 'ig'), '') !== ''
                    ? request.body.time.toString().replace(new RegExp('[^0-9]', 'ig'), '')
                    : '0';
            const token = request.body && request.body.token ? request.body.token : null;
            response.socket.join(project);
            if (terminals[projectId] && terminals[projectId].terminal && terminals[projectId].terminal._readable === true) {
                terminals[projectId].last = new Date();
            } else {
                createTerminal(`docker`, ['service', 'logs', '-t', '--raw', '-f', '--since', `${since}m`, project], projectId, response);
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
            return {name: x, lastUpdatedMin: past, remove: (past !== null && past !== undefined && past > 3)}
        });
        projects.forEach(el => {
            if (el.remove === true) {
                // console.log(terminals);
                terminals[el.name].terminal.kill();
                // console.log(terminals);
            }
        });
        // console.log(projects);
    }
);
