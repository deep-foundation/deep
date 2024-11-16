# Deep

```sh
# https://github.com/nvm-sh/nvm
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
nvm i 23; nvm use 23;
```

# test

```sh
npm run build; npm run test;
```

# cli

```sh
npm run build; npm run cli;
> deep.select({ type: deep })
```

# next

```sh
npm run next;
```

[localhost:3000](http://localhost:3000)

# server

```sh
npm run server; npm run start;
```

[localhost:3000](http://localhost:3000)

# electron

```sh
npm run build; npm run client; npm run electron;
```

# ios

```sh
npm run ios;
```

# android

```sh
npm run android;
```

# assets

> ./assets => ./public/... ./ios/... ./android/... ./electron/...

```js
npm run assets;
```

# gh-actions

> Before all docker in system, and prepare gh cli and gh-act extention:

```sh
brew install gh;
gh auth login;
gh extension install https://github.com/nektos/gh-act;
```

```sh
npm run gh-actions
```
