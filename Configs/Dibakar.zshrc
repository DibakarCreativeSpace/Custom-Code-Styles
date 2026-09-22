# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                           ~/.zshrc — Dibakar                                 ║
# ║                Advanced Zsh · Oh My Zsh · Powerlevel10k                      ║
# ╚══════════════════════════════════════════════════════════════════════════════╝


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 1. POWERLEVEL10K INSTANT PROMPT                                              │
# └──────────────────────────────────────────────────────────────────────────────┘
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 2. CORE PATHS / PROJECT ROOTS                                                │
# └──────────────────────────────────────────────────────────────────────────────┘
export DOCS_DIR="$HOME/Documents/Documents - DIBAKAR’s MacBook Pro"
export CODE_ROOT="$DOCS_DIR/Code"
export CODE_BACKUPS_DIR="$CODE_ROOT/Backups"
export CUSTOM_CODE_DIR="$CODE_ROOT/CustomCode"

export MONGO_HOME="$DOCS_DIR/Utilities/MongoDB/mongodb-macos-aarch64--8.3.1"
export MONGO_DATA="$DOCS_DIR/Utilities/MongoDB/data/db"

export VSCODE_WORKBENCH="/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html"
export VSCODE_PRISTINE_BACKUP="$CODE_BACKUPS_DIR/workbench.pristine.html"


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 3. PATH SETUP                                                                │
# └──────────────────────────────────────────────────────────────────────────────┘
typeset -U path PATH

path=(
  /opt/homebrew/bin
  /opt/homebrew/sbin
  "$HOME/.antigravity/antigravity/bin"
  "$MONGO_HOME/bin"
  $path
)

export PATH


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 4. ENVIRONMENT VARIABLES                                                     │
# └──────────────────────────────────────────────────────────────────────────────┘
export LANG="en_US.UTF-8"
export LC_ALL="en_US.UTF-8"

export EDITOR="nvim"
export VISUAL="nvim"

export PKG_CONFIG_PATH="/opt/homebrew/opt/mysql-client/lib/pkgconfig"
export LDFLAGS="-L/opt/homebrew/opt/mysql-client/lib"
export CPPFLAGS="-I/opt/homebrew/opt/mysql-client/include"

export ARCHFLAGS="-arch $(uname -m)"

export PAGER="less"
export LESS="-R"


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 5. HISTORY / SHELL BEHAVIOR                                                  │
# └──────────────────────────────────────────────────────────────────────────────┘
HISTFILE="$HOME/.zsh_history"
HISTSIZE=50000
SAVEHIST=50000

setopt EXTENDED_HISTORY
setopt HIST_EXPIRE_DUPS_FIRST
setopt HIST_IGNORE_DUPS
setopt HIST_IGNORE_ALL_DUPS
setopt HIST_IGNORE_SPACE
setopt HIST_FIND_NO_DUPS
setopt HIST_SAVE_NO_DUPS
setopt SHARE_HISTORY
setopt INC_APPEND_HISTORY
setopt INTERACTIVE_COMMENTS
setopt AUTO_CD
setopt AUTO_PUSHD
setopt PUSHD_IGNORE_DUPS
setopt PUSHD_SILENT
setopt NO_BEEP


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 6. OH MY ZSH                                                                 │
# └──────────────────────────────────────────────────────────────────────────────┘
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="powerlevel10k/powerlevel10k"

zstyle ':omz:update' mode reminder
zstyle ':omz:update' frequency 14

zstyle ':completion:*' menu select
zstyle ':completion:*' matcher-list 'm:{a-zA-Z}={A-Za-z}'

plugins=(
  git
  z
  zsh-autosuggestions
  zsh-syntax-highlighting
  web-search
  sudo
  copypath
  copyfile
  dirhistory
  jsontools
  history
  command-not-found
  colored-man-pages
  extract
  npm
  python
  pip
  brew
  macos
)

source "$ZSH/oh-my-zsh.sh"

[[ -f ~/.p10k.zsh ]] && source ~/.p10k.zsh


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 7. SMALL HELPERS                                                             │
# └──────────────────────────────────────────────────────────────────────────────┘
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

path_prepend() {
  for dir in "$@"; do
    [[ -d "$dir" ]] && path=("$dir" $path)
  done
}

path_append() {
  for dir in "$@"; do
    [[ -d "$dir" ]] && path+=("$dir")
  done
  typeset -U path
  export PATH
}

hr() {
  printf '%*s\n' "${COLUMNS:-80}" '' | tr ' ' '─'
}


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 8. ALIASES                                                                   │
# └──────────────────────────────────────────────────────────────────────────────┘
alias c='clear'
alias h='history'
alias reload='source ~/.zshrc && echo "✅ .zshrc reloaded!"'

alias rm='rm -i'
alias cp='cp -i'
alias mv='mv -i'
alias mkdir='mkdir -p'

alias zshconfig='nvim ~/.zshrc'
alias zshvim='nvim ~/.zshrc'
alias zshcode='code ~/.zshrc'

alias code.='code .'
alias coderoot='cd "$CODE_ROOT"'
alias codecustom='cd "$CUSTOM_CODE_DIR"'
alias codebackups='cd "$CODE_BACKUPS_DIR"'

alias docs='cd "$DOCS_DIR"'
alias proj='cd ~/Projects'
alias dl='cd ~/Downloads'
alias dt='cd ~/Desktop'

alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'
alias .....='cd ../../../..'

alias v='nvim'
alias vi='nvim'
alias vim='nvim'

if command_exists eza; then
  alias ls='eza --long --icons=always --group-directories-first'
  alias ll='eza -l --icons=always --group-directories-first'
  alias la='eza -la --icons=always --group-directories-first'
  alias lt='eza --tree --level=2 --icons=always'
  alias lta='eza --tree --level=2 --icons=always -a'
else
  alias ls='ls -G'
  alias ll='ls -l'
  alias la='ls -la'
fi

if command_exists bat; then
  alias cat='bat --style=plain --paging=never'
fi

alias gs='git status'
alias gp='git push'
alias gpl='git pull'
alias gc='git commit -m'
alias ga='git add'
alias gaa='git add .'
alias gco='git checkout'
alias gb='git branch'
alias gl='git log --oneline --graph --decorate --all'

alias python='python3'
alias pip='pip3'
alias venv='python3 -m venv venv'
alias activate='source venv/bin/activate'

alias Dev='npm run dev'
alias Build='npm run build'
alias Start='npm start'
alias ni='npm install'
alias nid='npm install --save-dev'
alias nig='npm install -g'

# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ PROJECT AUTOMATION SHORTCUTS                                                 │
# └──────────────────────────────────────────────────────────────────────────────┘
# These system-wide shortcuts execute `make <target>` in the current directory.
# They are project-agnostic and reusable across repositories and tech stacks.
# A shortcut works when the current project's Makefile defines its target.

# Common project targets.
alias mh='make help'
alias mi='make install'
alias md='make dev'
alias mb='make build'
alias mcheck='make check'
alias mdoctor='make doctor'
alias mhealth='make health'
alias mstatus='make status'
alias mcache='make clean-cache'
alias mc='make clean'

# Test and verification targets.
alias mfeatures='make test-features'
alias mtest-api='make test-api'
# Prefer the complete `test` target; use `test-api` for API/UI Makefiles that
# do not expose a separate full-suite target.
mt() {
  if command make -qp 2>/dev/null | command grep -q '^test:'; then
    command make test "$@"
  else
    command make test-api "$@"
  fi
}

# Full-stack project orchestration targets.
alias msetup='make setup-env'
alias mapi='make api-only'
alias mui='make ui-only'
alias mci='make ci'
alias mstop='make stop'

# Backend/API targets for Django, Python, and other API services.
alias mrunserver='make runserver'
alias mshell='make shell'
alias murls='make urls'
alias mping='make ping'
alias mcompile='make compile'
alias mfreeze='make freeze'
alias moutdated='make outdated'
alias msecurity='make security-check'

# Frontend/UI targets for React, Vite, and other Node-based interfaces.
alias mp='make preview'
alias mopen='make open'
alias mclean-build='make clean-build'
alias mdeps-check='make deps-check'
alias mdeps-update='make deps-update'
alias maudit='make audit'
alias mlint='make lint'
alias mformat='make format'
alias mbundle='make bundle-size'

alias MongoStart='cd "$MONGO_HOME/bin" && ./mongod --dbpath "$MONGO_DATA"'
alias MongoStop='pkill mongod'
alias MongoStatus='pgrep -fl mongod'

alias code-safe='code_safe'
alias code-save-pristine='code_save_pristine'
alias code-status='code_status'


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 9. FILE / UTIL FUNCTIONS                                                     │
# └──────────────────────────────────────────────────────────────────────────────┘
mkcd() {
  mkdir -p "$1" && cd "$1"
}

backup() {
  if [[ -z "$1" || ! -e "$1" ]]; then
    echo "Usage: backup <file-or-folder>"
    return 1
  fi

  local ts
  ts="$(date +%Y%m%d-%H%M%S)"
  local dest="${1}.bak.${ts}"

  command cp -R "$1" "$dest" && echo "✅ Backup created: $dest"
}

copy() {
  if [[ -f "$1" ]]; then
    pbcopy < "$1"
    echo "✅ Copied content of '$1' to clipboard"
  else
    echo "❌ File not found: $1"
    return 1
  fi
}

paste-to() {
  if [[ -z "$1" ]]; then
    echo "Usage: paste-to <file>"
    return 1
  fi
  pbpaste > "$1"
  echo "✅ Pasted clipboard to '$1'"
}

myip() {
  echo "🌐 Public IP: $(curl -s ifconfig.me)"
  echo "🏠 Local IP:  $(ipconfig getifaddr en0 2>/dev/null || echo 'N/A')"
}

weather() {
  local city="${1:-}"
  curl -s "wttr.in/${city}?format=3"
}

port() {
  if [[ -z "$1" ]]; then
    echo "Usage: port <number>"
    return 1
  fi
  lsof -i :"$1"
}

killport() {
  if [[ -z "$1" ]]; then
    echo "Usage: killport <number>"
    return 1
  fi
  lsof -ti :"$1" | xargs kill -9 && echo "✅ Killed process on port $1"
}

serve() {
  local p="${1:-8000}"
  python3 -m http.server "$p"
}

up() {
  local n="${1:-1}"
  local dir=""
  for ((i=0; i<n; i++)); do
    dir="../${dir}"
  done
  cd "$dir"
}

psgrep() {
  if [[ -z "$1" ]]; then
    echo "Usage: psgrep <pattern>"
    return 1
  fi
  ps aux | grep -i "$1" | grep -v grep
}


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 10. VS CODE SAFE MODE / BACKUP TOOLING                                       │
# └──────────────────────────────────────────────────────────────────────────────┘
code_save_pristine() {
  command mkdir -p "$CODE_BACKUPS_DIR" || return 1

  if [[ ! -f "$VSCODE_WORKBENCH" ]]; then
    echo "❌ workbench.html not found:"
    echo "   $VSCODE_WORKBENCH"
    return 1
  fi

  if grep -q "VSCODE-CUSTOM-CSS" "$VSCODE_WORKBENCH" 2>/dev/null; then
    echo "⚠️  workbench.html is patched right now."
    echo "   Restore a clean version first, then run code-save-pristine."
    return 1
  fi

  if [[ -f "$VSCODE_PRISTINE_BACKUP" ]]; then
    command mv "$VSCODE_PRISTINE_BACKUP" \
      "$CODE_BACKUPS_DIR/workbench.pristine.$(date +%Y%m%d-%H%M%S).html"
  fi

  command cp "$VSCODE_WORKBENCH" "$VSCODE_PRISTINE_BACKUP" || return 1
  echo "💾 Saved pristine backup to:"
  echo "   $VSCODE_PRISTINE_BACKUP"
}

code_status() {
  if grep -q "VSCODE-CUSTOM-CSS" "$VSCODE_WORKBENCH" 2>/dev/null; then
    echo "🎨 Status: PATCHED"
  else
    echo "🧼 Status: CLEAN"
  fi
}

code_safe() {
  command mkdir -p "$CODE_BACKUPS_DIR" || return 1

  if [[ ! -f "$VSCODE_PRISTINE_BACKUP" ]]; then
    echo "❌ Missing pristine backup:"
    echo "   $VSCODE_PRISTINE_BACKUP"
    echo "   Run: code-save-pristine"
    return 1
  fi

  # Quit VS Code first
  osascript -e 'tell application "Visual Studio Code" to quit' >/dev/null 2>&1 || true
  sleep 2
  killall "Code" "Code Helper" "Electron" 2>/dev/null || true
  sleep 1

  local session_backup="$CODE_BACKUPS_DIR/workbench.session.$(date +%Y%m%d-%H%M%S).html"

  command cp "$VSCODE_WORKBENCH" "$session_backup" || return 1
  command cp "$VSCODE_PRISTINE_BACKUP" "$VSCODE_WORKBENCH" || {
    command cp "$session_backup" "$VSCODE_WORKBENCH"
    return 1
  }

  echo "🛡️  Launching VS Code in safe mode..."
  open -W -a "Visual Studio Code"

  command cp "$session_backup" "$VSCODE_WORKBENCH" || echo "⚠️  Restore failed; manual restore may be needed."
  command rm -f "$session_backup"
  echo "✅ Restored your working workbench.html"
}


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 11. RUN SELECTOR                                                             │
# └──────────────────────────────────────────────────────────────────────────────┘
unalias Run 2>/dev/null
Run() {
  local choice=$1

  if [[ -z "$choice" ]]; then
    echo -e "\n\033[1;36m📦 Select the command to run:\033[0m"
    echo -e "  \033[1;33m1)\033[0m 🐍 python3 manage.py runserver"
    echo -e "  \033[1;33m2)\033[0m 📗 npm run dev"
    echo
    read "choice?Enter choice [1 or 2]: "
  fi

  case "$choice" in
    1)
      if [[ ! -f "manage.py" ]]; then
        echo -e "\n\033[1;31m✖ No 'manage.py' found in $(pwd)\033[0m"
        return 1
      fi
      echo -e "\n\033[1;32m▶ Running Django server...\033[0m\n"
      python3 manage.py runserver &
      local DJANGO_PID=$!
      trap "kill $DJANGO_PID 2>/dev/null" EXIT
      sleep 3
      open http://localhost:8000 2>/dev/null || true
      wait $DJANGO_PID
      ;;
    2)
      if [[ ! -f "package.json" ]]; then
        echo -e "\n\033[1;31m✖ No 'package.json' found in $(pwd)\033[0m"
        return 1
      fi
      echo -e "\n\033[1;32m▶ Running npm dev server...\033[0m\n"
      npm run dev -- --open
      ;;
    *)
      echo -e "\n\033[1;31m✖ Invalid choice. Please enter 1 or 2.\033[0m"
      return 1
      ;;
  esac
}


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 12. BIG HELP MENUS                                                           │
# └──────────────────────────────────────────────────────────────────────────────┘
help() {
  cat <<'EOF'

🚀 Dibakar's Custom Commands

════════════════════════════════════════════════════════════════════

Core
  c / h / reload           clear / history / reload zshrc
  v / vi / vim             open nvim
  zshconfig / zshvim       edit ~/.zshrc
  code.                    open current directory in VS Code

Navigation
  .. / ... / ....          up 1 / 2 / 3 folders
  dl / dt / docs           Downloads / Desktop / Documents
  coderoot                 jump to Code folder
  codecustom               jump to CustomCode folder
  codebackups              jump to Backups folder
  proj                     jump to ~/Projects

Files
  mkcd <dir>               create + enter folder
  backup <file>            timestamp backup
  copy <file>              copy file content to clipboard
  paste-to <file>          paste clipboard into file
  serve [port]             start python http server
  up [n]                   go up n folders

VS Code Safe Mode
  code-status              show if workbench is patched
  code-save-pristine       save a clean backup of workbench.html
  code-safe                launch VS Code safely and restore after quit

Git
  gs / gp / gpl            status / push / pull
  ga / gaa                 add / add .
  gc <msg>                 commit -m
  gco / gb                 checkout / branch
  gl                       pretty git log

Python / Node
  python / pip             python3 / pip3
  venv                     create venv
  activate                 source venv/bin/activate
  Dev / Build / Start      npm run dev / build / start
  ni / nid / nig           npm install / devDependency / global

Project Automation Shortcuts
  mh / mi / md / mc        help / install / dev / clean
  mb / mt / mcheck         build / test / project checks
  mapi / mui               API-only / UI-only
  mci / mdoctor            CI / environment doctor
  mstatus / mstop          service status / stop servers
  cheat make               show the complete shortcut list

MongoDB
  MongoStart               start mongod
  MongoStop                stop mongod
  MongoStatus              show mongod process

System
  myip                     public + local IP
  weather [city]           quick weather
  port <num>               inspect port
  killport <num>           kill port process
  psgrep <text>            search processes

Tips
  help                     this menu
  cheat [category]         category cheat sheets
  alias                    list all aliases

EOF
}

cheat() {
  case "$1" in
    git)
      cat <<'EOF'

🌿 Git Cheat Sheet

Custom:
  gs        git status
  ga        git add
  gaa       git add .
  gc "msg"  git commit -m "msg"
  gp        git push
  gpl       git pull
  gco       git checkout
  gb        git branch
  gl        pretty log graph

EOF
      ;;
    code|vscode)
      cat <<'EOF'

🎨 VS Code Cheat Sheet

code.              open current directory
code-status        patched / clean check
code-save-pristine save clean workbench backup
code-safe          safe launch and auto-restore

EOF
      ;;
    npm|node)
      cat <<'EOF'

📦 Node / NPM Cheat Sheet

Dev     npm run dev
Build   npm run build
Start   npm start
ni      npm install
nid     npm install --save-dev
nig     npm install -g

EOF
      ;;
    make|project|projects)
      cat <<'EOF'

🧰 Project Automation Shortcuts

Common:
  mi          make install
  md          make dev
  mh          make help
  msetup      make setup-env
  mapi        make api-only
  mui         make ui-only
  mb          make build
  mcheck      make check
  mt          make test (or test-api when `test` is unavailable)
  mfeatures   make test-features
  mtest-api   make test-api
  mci         make ci
  mdoctor     make doctor
  mhealth     make health
  mstatus     make status
  mcache      make clean-cache
  mc          make clean
  mstop       make stop

Backend/API:
  mrunserver / mshell / murls / mping / mcompile
  mfreeze / moutdated / msecurity

Frontend/UI:
  mp / mopen / mclean-build / mdeps-check / mdeps-update
  maudit / mlint / mformat / mbundle

Run these inside a project directory containing the relevant Makefile.

EOF
      ;;
    python|pip)
      cat <<'EOF'

🐍 Python / Pip Cheat Sheet

python   python3
pip      pip3
venv     python3 -m venv venv
activate source venv/bin/activate

EOF
      ;;
    mongo|mongodb)
      cat <<EOF

🍃 MongoDB Cheat Sheet

MongoStart   start mongod
MongoStop    stop mongod
MongoStatus  inspect mongod

Home: $MONGO_HOME
Data: $MONGO_DATA

EOF
      ;;
    nav|cd)
      cat <<'EOF'

🧭 Navigation Cheat Sheet

.. / ... / ....   up 1 / 2 / 3
dl / dt / docs    Downloads / Desktop / Documents
coderoot          Code folder
codecustom        CustomCode folder
codebackups       Backups folder

EOF
      ;;
    shell|zsh)
      cat <<'EOF'

⚡ Zsh Cheat Sheet

reload      source ~/.zshrc
zshconfig   edit ~/.zshrc
help        main command menu
cheat       category menu

EOF
      ;;
    *)
      cat <<'EOF'

📚 Cheat Categories

  cheat git
  cheat code
  cheat npm
  cheat make
  cheat python
  cheat mongo
  cheat nav
  cheat shell

EOF
      ;;
  esac
}


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 13. TOOL INTEGRATIONS                                                        │
# └──────────────────────────────────────────────────────────────────────────────┘
if command_exists zoxide; then
  eval "$(zoxide init --cmd cd zsh)"
fi

if command_exists pay-respects; then
  eval "$(pay-respects zsh)"
fi


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 14. NICE WELCOME                                                             │
# └──────────────────────────────────────────────────────────────────────────────┘
echo -e "\n\033[1;36m👋 Welcome back, Dibakar!\033[0m"
echo -e "\033[1;90m   $(date '+%A, %d %B %Y · %I:%M %p')\033[0m"
echo -e "\033[1;90m   Type 'help' for commands, 'cheat' for categories, 'code-safe' for VS Code safe mode\033[0m\n"


# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                              END OF ~/.zshrc                                 ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
