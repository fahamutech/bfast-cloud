import bfastnode from "bfastnode";
import {spawn} from 'node-pty-prebuilt-multiarch';
// import {platform} from 'os';

// const shell = platform() === 'win32' ? 'cmd.exe' : 'bash';
const {bfast} = bfastnode;
const terminals = {};

function createTerminal(shell, projectId){
    terminals[projectId] = {
        terminal: spawn(shell, [], {
            cols: 1000,
            rows: 700,
            cwd: '~',
            env: process.env,
            name: projectId,
        }),
        last: new Date()
    };
}

function handleTerminalData(projectId, response) {
    try{
        terminals[projectId].terminal.onData = data => {
            response.broadcast(data);
            terminals[projectId].last = new Date();
        };
        terminals[projectId].terminal.onExit = _ => {
            terminals[projectId].terminal.kill();
            terminals[projectId] = undefined;
        }
    }catch (e){
        terminals[projectId] = {};
    }
}


// initial draft

export const instanceLogsEvent = bfast.functions().onEvent(
    '/logs',
    (request, response) => {
        console.log(request,"********");
        if (request.auth && request.auth.projectId && request.auth.type) {
            const projectId = request.auth.projectId;
            const projectType = request.auth.type;
            if (terminals[projectId] && terminals[projectId].terminal) {
                handleTerminalData(projectId, response);
            } else {
                createTerminal(`docker service logs -f --since 1m ${projectId}_${projectType}`);
                handleTerminalData(projectId, response);
            }
        } else {
            response.broadcast({message: 'please provide projectId and project type'});
        }
    }
);
