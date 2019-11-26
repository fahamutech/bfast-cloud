# bfast-ee

BFast::Cloud enterprises edition

## Get Started
Install docker and nodejs from 10.x or 12.x. Clone project then execute `npm install` inside project folder.

### Run local
* without docker run `npm run dev` 

* Using docker in swarm mode run `~$ bash ./deploy.sh` for linux based OS `PS C:/>./deploy.bat` in window OS

## Project Structure
```shell script
.
|__design/
|__specs/
|__src/
|____adapter/
|____compose/
|____controller/
|____factory/
|____model/
|____public/
|____routes
|____app.ts
|____index.ts
|__ssl/
|__.dockerignore
|__.gitignore
|__.npmrc
|__CHANGELOG.md
|__deploy.bat
|__deploy.sh
|__docker-compose.yml
|__Dockerfile
|__gulpfile.js
|__package.json
|__tsconfig.json
|__README.md
```
Source code found in `src/` folder and test code found in `specs/` folder.



