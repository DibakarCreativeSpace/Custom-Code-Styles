# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                          ~/.zshrc — Dibakar's Config                         ║
# ║                       macOS · Zsh · Oh My Zsh · Powerlevel10k                ║
# ╚══════════════════════════════════════════════════════════════════════════════╝


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 1. POWERLEVEL10K INSTANT PROMPT (must stay near top)                         │
# └──────────────────────────────────────────────────────────────────────────────┘
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 2. CUSTOM PATH VARIABLES (for reuse below)                                   │
# └──────────────────────────────────────────────────────────────────────────────┘
export DOCS_DIR="$HOME/Documents/Documents - DIBAKAR’s MacBook Pro"
export MONGO_HOME="$DOCS_DIR/Utilities/MongoDB/mongodb-macos-aarch64--8.2.3"
export MONGO_DATA="$DOCS_DIR/Utilities/MongoDB/data/db"


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 3. PATH SETUP (clean & ordered)                                              │
# └──────────────────────────────────────────────────────────────────────────────┘
# Homebrew (highest priority)
PATH="/opt/homebrew/bin:/opt/homebrew/sbin:$PATH"

# MySQL Client
PATH="/opt/homebrew/opt/mysql-client/bin:$PATH"

# Antigravity
PATH="$HOME/.antigravity/antigravity/bin:$PATH"

# MongoDB
PATH="$PATH:$MONGO_HOME/bin"

# Auto-dedupe & export
typeset -U PATH
export PATH


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 4. ENVIRONMENT VARIABLES                                                     │
# └──────────────────────────────────────────────────────────────────────────────┘
# Language & Locale
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# Preferred editor
export EDITOR='nvim'
export VISUAL='nvim'

# MySQL Client compilation flags
export PKG_CONFIG_PATH="/opt/homebrew/opt/mysql-client/lib/pkgconfig"
export LDFLAGS="-L/opt/homebrew/opt/mysql-client/lib"
export CPPFLAGS="-I/opt/homebrew/opt/mysql-client/include"

# Compilation arch
export ARCHFLAGS="-arch $(uname -m)"


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 5. HISTORY SETTINGS (better defaults)                                        │
# └──────────────────────────────────────────────────────────────────────────────┘
HISTFILE=$HOME/.zsh_history
HISTSIZE=50000
SAVEHIST=50000

setopt EXTENDED_HISTORY          # Save timestamps
setopt HIST_EXPIRE_DUPS_FIRST    # Remove duplicates first when trimming
setopt HIST_IGNORE_DUPS          # Don't record an entry that was just recorded
setopt HIST_IGNORE_ALL_DUPS      # Delete old entry if new is duplicate
setopt HIST_IGNORE_SPACE         # Don't record entries starting with space
setopt HIST_FIND_NO_DUPS         # Don't display duplicates when searching
setopt HIST_SAVE_NO_DUPS         # Don't save duplicates
setopt SHARE_HISTORY             # Share history across sessions
setopt INC_APPEND_HISTORY        # Add commands as they are typed


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 6. OH MY ZSH CONFIGURATION                                                   │
# └──────────────────────────────────────────────────────────────────────────────┘
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="powerlevel10k/powerlevel10k"

# Update behavior
zstyle ':omz:update' mode reminder    # Remind to update (instead of auto)
zstyle ':omz:update' frequency 14     # Check every 14 days

# Misc options
DISABLE_LS_COLORS="true"              # We use eza instead
ENABLE_CORRECTION="true"              # Auto-correct typos
COMPLETION_WAITING_DOTS="true"        # Show dots while completing
HIST_STAMPS="dd.mm.yyyy"              # Format for history command

# Plugins (curated list)
plugins=(
  git
  zsh-autosuggestions
  zsh-syntax-highlighting
  web-search
  sudo
  copypath
  copyfile
  copybuffer
  dirhistory
  jsontools
  history
  command-not-found
  colored-man-pages
  extract
  z
  npm
  python
  pip
  brew
  macos
)

source $ZSH/oh-my-zsh.sh

# Powerlevel10k config
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 7. SYSTEM ALIASES & FUNCTIONS                                                │
# └──────────────────────────────────────────────────────────────────────────────┘
alias L="ls -al"
alias ll="ls -l"
alias la="ls -a"
alias c="clear"
alias h="history"
alias p10kconfig="p10k configure"
alias reload="source ~/.zshrc && echo '✅ .zshrc reloaded!'"

# Safety nets
alias rm="rm -i"
alias cp="cp -i"
alias mv="mv -i"
alias mkdir="mkdir -p"

# Edit zshrc (hardcoded for reliability)
alias zshconfig="open ~/.zshrc"
alias zshvim="nvim ~/.zshrc"
alias zshcode="code ~/.zshrc"

# Neovim shortcuts
alias v="nvim"
alias vi="nvim"
alias vim="nvim"

# VS Code shortcuts
alias code.="code ."
alias nvimcode="code ~/.config/nvim"

# Edit Neovim config (whole folder)
nvimconfig() {
  cd ~/.config/nvim && nvim .
}

# Quick access to nvim subfolders
alias nvimcore="nvim ~/.config/nvim/lua/dibakar/core/"
alias nvimplugins="nvim ~/.config/nvim/lua/dibakar/plugins/"
alias nvimlock="nvim ~/.config/nvim/lazy-lock.json"


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 8. NAVIGATION ALIASES                                                        │
# └──────────────────────────────────────────────────────────────────────────────┘
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."
alias .....="cd ../../../.."
alias dl="cd ~/Downloads"
alias dt="cd ~/Desktop"
alias docs="cd ~/Documents"


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 9. PYTHON / PIP ALIASES                                                      │
# └──────────────────────────────────────────────────────────────────────────────┘
alias python="python3"
alias pip="pip3"
alias venv="python3 -m venv venv"
alias activate="source venv/bin/activate"


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 10. NODE / NPM ALIASES                                                       │
# └──────────────────────────────────────────────────────────────────────────────┘
alias Dev="npm run dev"
alias Build="npm run build"
alias Start="npm start"
alias ni="npm install"
alias nid="npm install --save-dev"
alias nig="npm install -g"


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 11. MONGODB ALIASES                                                          │
# └──────────────────────────────────────────────────────────────────────────────┘
alias MongoStart="cd \"$MONGO_HOME/bin\" && ./mongod --dbpath \"$MONGO_DATA\""
alias MongoStop="pkill mongod"
alias MongoStatus="pgrep -fl mongod"


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 12. GIT ALIASES (extras beyond oh-my-zsh git plugin)                         │
# └──────────────────────────────────────────────────────────────────────────────┘
alias gs="git status"
alias gp="git push"
alias gpl="git pull"
alias gc="git commit -m"
alias ga="git add"
alias gaa="git add ."
alias gco="git checkout"
alias gb="git branch"
alias gl="git log --oneline --graph --decorate --all"


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 13. MODERN CLI REPLACEMENTS                                                  │
# └──────────────────────────────────────────────────────────────────────────────┘
# eza (modern ls)
alias ls="eza --long --color=always --icons=always"
alias lt="eza --tree --level=2 --icons=always"
alias lta="eza --tree --level=2 --icons=always -a"


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 14. CUSTOM FUNCTIONS                                                         │
# └──────────────────────────────────────────────────────────────────────────────┘
# help — Show all custom commands & shortcuts
help() {
  echo -e "\n\033[1;36m🚀 Dibakar's Custom Commands\033[0m"
  echo -e "\033[1;90m═══════════════════════════════════════════════\033[0m"

  echo -e "\n\033[1;33m📦 Project Runners:\033[0m"
  echo -e "  \033[1;32mRun\033[0m              → Interactive server selector"
  echo -e "  \033[1;32mRun 1\033[0m            → Django (manage.py runserver)"
  echo -e "  \033[1;32mRun 2\033[0m            → npm run dev"
  echo -e "  \033[1;32mDev / Build / Start\033[0m → npm scripts"

  echo -e "\n\033[1;33m📁 File Operations:\033[0m"
  echo -e "  \033[1;32mmkcd <dir>\033[0m       → Create + enter folder"
  echo -e "  \033[1;32mbackup <file>\033[0m    → Timestamped backup"
  echo -e "  \033[1;32mextract <archive>\033[0m → Extract any archive"
  echo -e "  \033[1;32mcopy <file>\033[0m      → Copy file content to clipboard"
  echo -e "  \033[1;32mpaste-to <file>\033[0m  → Paste clipboard to file"

  echo -e "\n\033[1;33m🌐 Network:\033[0m"
  echo -e "  \033[1;32mmyip\033[0m             → Public + local IP"
  echo -e "  \033[1;32mweather [city]\033[0m   → Weather forecast"
  echo -e "  \033[1;32mport <num>\033[0m       → Find process on port"
  echo -e "  \033[1;32mkillport <num>\033[0m   → Kill process on port"

  echo -e "\n\033[1;33m🌿 Git Shortcuts:\033[0m"
  echo -e "  \033[1;32mgs\033[0m               → git status"
  echo -e "  \033[1;32mga / gaa\033[0m         → git add / git add ."
  echo -e "  \033[1;32mgc \"msg\"\033[0m         → git commit -m \"msg\""
  echo -e "  \033[1;32mgp / gpl\033[0m         → git push / git pull"
  echo -e "  \033[1;32mgco / gb\033[0m         → git checkout / git branch"
  echo -e "  \033[1;32mgl\033[0m               → Pretty git log graph"

  echo -e "\n\033[1;33m🐍 Python / Pip:\033[0m"
  echo -e "  \033[1;32mpython / pip\033[0m     → python3 / pip3"
  echo -e "  \033[1;32mvenv\033[0m             → Create virtual environment"
  echo -e "  \033[1;32mactivate\033[0m         → Activate venv"

  echo -e "\n\033[1;33m📦 Node / NPM:\033[0m"
  echo -e "  \033[1;32mni / nid / nig\033[0m   → npm install / --save-dev / -g"

  echo -e "\n\033[1;33m🍃 MongoDB:\033[0m"
  echo -e "  \033[1;32mMongoStart\033[0m       → Start MongoDB daemon"
  echo -e "  \033[1;32mMongoStop\033[0m        → Stop MongoDB"
  echo -e "  \033[1;32mMongoStatus\033[0m      → Check MongoDB status"

  echo -e "\n\033[1;33m⚙️  Config Editing:\033[0m"
  echo -e "  \033[1;32mzshconfig\033[0m        → Open zshrc in default app"
  echo -e "  \033[1;32mzshvim\033[0m           → Edit zshrc in Neovim"
  echo -e "  \033[1;32mzshcode\033[0m          → Edit zshrc in VS Code"
  echo -e "  \033[1;32mnvimconfig\033[0m       → Edit Neovim config in nvim"
  echo -e "  \033[1;32mnvimcode\033[0m         → Edit Neovim config in VS Code"
  echo -e "  \033[1;32mnvimcore\033[0m         → Edit nvim core folder"
  echo -e "  \033[1;32mnvimplugins\033[0m      → Edit nvim plugins folder"
  echo -e "  \033[1;32mnvimlock\033[0m         → Edit lazy-lock.json"
  echo -e "  \033[1;32mp10kconfig\033[0m       → Configure prompt"
  echo -e "  \033[1;32mreload\033[0m           → Reload zshrc"

  echo -e "\n\033[1;33m🧭 Navigation:\033[0m"
  echo -e "  \033[1;32m.. / ... / ....\033[0m  → Go up 1/2/3 levels"
  echo -e "  \033[1;32mdl / dt / docs\033[0m   → Downloads / Desktop / Documents"
  echo -e "  \033[1;32mcd <partial>\033[0m     → Smart jump (zoxide)"

  echo -e "\n\033[1;33m🎨 Modern CLI (eza):\033[0m"
  echo -e "  \033[1;32mls / ll / la\033[0m     → Beautiful listings"
  echo -e "  \033[1;32mL\033[0m                → Detailed list (ls -al)"
  echo -e "  \033[1;32mlt / lta\033[0m         → Tree view (with hidden)"

  echo -e "\n\033[1;33m🎯 Other:\033[0m"
  echo -e "  \033[1;32mf\033[0m                → Auto-correct previous command"
  echo -e "  \033[1;32mc / h\033[0m            → clear / history"
  echo -e "  \033[1;32mv / vi / vim\033[0m     → Open Neovim"
  echo -e "  \033[1;32mcode.\033[0m            → Open current dir in VS Code"

  echo -e "\n\033[1;90m═══════════════════════════════════════════════\033[0m"
  echo -e "\033[1;90m💡 Type 'cheat' for category-specific cheat sheets\033[0m"
  echo -e "\033[1;90m💡 Type 'alias' to see ALL aliases (including OMZ plugins)\033[0m\n"
}

# cheat — Smart cheat sheet for common workflows
# Usage: cheat | cheat git | cheat npm | cheat brew etc.
cheat() {
  case "$1" in
    git)
      echo -e "\n\033[1;33m🌿 Git Workflow Cheat Sheet\033[0m"
      echo -e "\033[1;90m─────────────────────────────────────────\033[0m"
      echo -e "\033[1;36m  Your Custom:\033[0m"
      echo -e "    \033[1;32mgs\033[0m              → git status"
      echo -e "    \033[1;32mga <file>\033[0m       → git add"
      echo -e "    \033[1;32mgaa\033[0m             → git add ."
      echo -e "    \033[1;32mgc \"msg\"\033[0m        → git commit -m"
      echo -e "    \033[1;32mgp / gpl\033[0m        → git push / pull"
      echo -e "    \033[1;32mgco <branch>\033[0m    → git checkout"
      echo -e "    \033[1;32mgb\033[0m              → git branch"
      echo -e "    \033[1;32mgl\033[0m              → Pretty log graph"
      echo -e "\n\033[1;36m  From OMZ Git Plugin:\033[0m"
      echo -e "    \033[1;32mg\033[0m               → git"
      echo -e "    \033[1;32mgst / gss\033[0m       → git status / short"
      echo -e "    \033[1;32mgcb <name>\033[0m      → git checkout -b"
      echo -e "    \033[1;32mgcm / gcd\033[0m       → checkout main / develop"
      echo -e "    \033[1;32mgsta / gstp\033[0m     → stash push / pop"
      echo -e "    \033[1;32mgstl\033[0m            → stash list"
      echo -e "    \033[1;32mgd / gds\033[0m        → diff / diff staged"
      echo -e "    \033[1;32mgrh / grhh\033[0m      → reset / reset --hard"
      echo -e "    \033[1;32mgrb / grbi\033[0m      → rebase / interactive"
      echo -e "    \033[1;32mgcp\033[0m             → cherry-pick"
      echo -e "    \033[1;32mgf / gfa\033[0m        → fetch / fetch all"
      echo -e "    \033[1;32mgrt\033[0m             → cd to git root"
      echo -e "    \033[1;32mgwip / gunwip\033[0m   → quick WIP commit / undo"
      ;;

    npm|node)
      echo -e "\n\033[1;33m📦 NPM Workflow Cheat Sheet\033[0m"
      echo -e "\033[1;90m─────────────────────────────────────────\033[0m"
      echo -e "\033[1;36m  Your Custom:\033[0m"
      echo -e "    \033[1;32mDev / Build / Start\033[0m → run scripts"
      echo -e "    \033[1;32mni\033[0m              → npm install"
      echo -e "    \033[1;32mnid\033[0m             → npm install --save-dev"
      echo -e "    \033[1;32mnig\033[0m             → npm install -g"
      echo -e "\n\033[1;36m  From OMZ NPM Plugin:\033[0m"
      echo -e "    \033[1;32mnpmI\033[0m            → npm init"
      echo -e "    \033[1;32mnpmS <pkg>\033[0m      → npm i -S (save)"
      echo -e "    \033[1;32mnpmD <pkg>\033[0m      → npm i -D (dev)"
      echo -e "    \033[1;32mnpmg <pkg>\033[0m      → npm i -g (global)"
      echo -e "    \033[1;32mnpmL / npmL0\033[0m    → list / depth 0"
      echo -e "    \033[1;32mnpmO\033[0m            → outdated"
      echo -e "    \033[1;32mnpmU\033[0m            → update"
      echo -e "    \033[1;32mnpmt\033[0m            → npm test"
      echo -e "    \033[1;32mnpmrd / npmrb\033[0m   → run dev / run build"
      echo -e "    \033[1;32mnpmst\033[0m           → npm start"
      echo -e "    \033[1;32mnpmi <pkg>\033[0m      → npm info"
      ;;

    brew)
      echo -e "\n\033[1;33m🍺 Homebrew Cheat Sheet\033[0m"
      echo -e "\033[1;90m─────────────────────────────────────────\033[0m"
      echo -e "\033[1;36m  Install / Remove:\033[0m"
      echo -e "    \033[1;32mbi <pkg>\033[0m        → brew install"
      echo -e "    \033[1;32mbcin <app>\033[0m      → brew install --cask"
      echo -e "    \033[1;32mbr <pkg>\033[0m        → brew reinstall"
      echo -e "    \033[1;32mbuz <pkg>\033[0m       → brew uninstall --zap"
      echo -e "\n\033[1;36m  Update / Upgrade:\033[0m"
      echo -e "    \033[1;32mbu\033[0m              → brew update"
      echo -e "    \033[1;32mbup\033[0m             → brew upgrade"
      echo -e "    \033[1;32mbubu\033[0m            → update + outdated + upgrade"
      echo -e "    \033[1;32mbcup\033[0m            → upgrade casks"
      echo -e "\n\033[1;36m  Search / Info:\033[0m"
      echo -e "    \033[1;32mbs <name>\033[0m       → brew search"
      echo -e "    \033[1;32mbl / bcl\033[0m        → list / list casks"
      echo -e "    \033[1;32mbo / bco\033[0m        → outdated / outdated casks"
      echo -e "    \033[1;32mbdr\033[0m             → brew doctor"
      echo -e "    \033[1;32mbcn\033[0m             → brew cleanup"
      echo -e "\n\033[1;36m  Services:\033[0m"
      echo -e "    \033[1;32mbsl\033[0m             → list services"
      echo -e "    \033[1;32mbson <svc>\033[0m      → start service"
      echo -e "    \033[1;32mbsoff <svc>\033[0m     → stop service"
      ;;

    pip|python)
      echo -e "\n\033[1;33m🐍 Python / Pip Cheat Sheet\033[0m"
      echo -e "\033[1;90m─────────────────────────────────────────\033[0m"
      echo -e "\033[1;36m  Your Custom:\033[0m"
      echo -e "    \033[1;32mpython / pip\033[0m    → python3 / pip3"
      echo -e "    \033[1;32mvenv\033[0m            → Create venv"
      echo -e "    \033[1;32mactivate\033[0m        → Activate venv"
      echo -e "\n\033[1;36m  From OMZ Pip Plugin:\033[0m"
      echo -e "    \033[1;32mpipi <pkg>\033[0m      → pip install"
      echo -e "    \033[1;32mpipu <pkg>\033[0m      → pip install --upgrade"
      echo -e "    \033[1;32mpipun <pkg>\033[0m     → pip uninstall"
      echo -e "    \033[1;32mpipir\033[0m           → pip install -r requirements.txt"
      echo -e "    \033[1;32mpiplo\033[0m           → list outdated"
      echo -e "    \033[1;32mpipreq\033[0m          → freeze > requirements.txt"
      echo -e "    \033[1;32mpipgi <pkg>\033[0m     → check if installed"
      echo -e "\n\033[1;36m  From OMZ Python Plugin:\033[0m"
      echo -e "    \033[1;32mpy\033[0m              → python3"
      echo -e "    \033[1;32mpyserver [port]\033[0m → quick HTTP server"
      echo -e "    \033[1;32mpyfind\033[0m          → find all .py files"
      echo -e "    \033[1;32mpygrep <text>\033[0m   → grep in .py files"
      ;;

    nvim|vim)
      echo -e "\n\033[1;33m📝 Neovim Shortcuts Cheat Sheet\033[0m"
      echo -e "\033[1;90m─────────────────────────────────────────\033[0m"
      echo -e "\033[1;36m  Open Neovim:\033[0m"
      echo -e "    \033[1;32mv / vi / vim\033[0m    → Open nvim"
      echo -e "    \033[1;32mnvim <file>\033[0m     → Open specific file"
      echo -e "\n\033[1;36m  Edit Configs:\033[0m"
      echo -e "    \033[1;32mzshvim\033[0m          → Edit zshrc"
      echo -e "    \033[1;32mnvimconfig\033[0m      → Open whole nvim folder"
      echo -e "    \033[1;32mnvimcore\033[0m        → Open core/ folder"
      echo -e "    \033[1;32mnvimplugins\033[0m     → Open plugins/ folder"
      echo -e "    \033[1;32mnvimlock\033[0m        → Edit lazy-lock.json"
      echo -e "\n\033[1;36m  In VS Code:\033[0m"
      echo -e "    \033[1;32mzshcode\033[0m         → Edit zshrc in VS Code"
      echo -e "    \033[1;32mnvimcode\033[0m        → Edit nvim config in VS Code"
      echo -e "    \033[1;32mcode.\033[0m           → Open current dir in VS Code"
      ;;

    file)
      echo -e "\n\033[1;33m📁 File Operations Cheat Sheet\033[0m"
      echo -e "\033[1;90m─────────────────────────────────────────\033[0m"
      echo -e "\033[1;36m  Custom Functions:\033[0m"
      echo -e "    \033[1;32mmkcd <dir>\033[0m      → mkdir + cd"
      echo -e "    \033[1;32mbackup <file>\033[0m   → Timestamped backup"
      echo -e "    \033[1;32mcopy <file>\033[0m     → File → clipboard"
      echo -e "    \033[1;32mpaste-to <file>\033[0m → Clipboard → file"
      echo -e "\n\033[1;36m  Listing (eza):\033[0m"
      echo -e "    \033[1;32mls / ll / la / L\033[0m → Various list views"
      echo -e "    \033[1;32mlt / lta\033[0m        → Tree view (with hidden)"
      echo -e "\n\033[1;36m  From OMZ Plugins:\033[0m"
      echo -e "    \033[1;32mextract <arc>\033[0m   → Extract any archive (or x)"
      echo -e "    \033[1;32mcopypath\033[0m        → Copy current path"
      echo -e "    \033[1;32mcopyfile <f>\033[0m    → Copy file content"
      echo -e "    \033[1;32mCtrl+O\033[0m          → Copy current command line"
      ;;

    net|network)
      echo -e "\n\033[1;33m🌐 Network Cheat Sheet\033[0m"
      echo -e "\033[1;90m─────────────────────────────────────────\033[0m"
      echo -e "  \033[1;32mmyip\033[0m            → Public + local IP"
      echo -e "  \033[1;32mweather [city]\033[0m  → Weather forecast"
      echo -e "  \033[1;32mport <num>\033[0m      → Find process on port"
      echo -e "  \033[1;32mkillport <num>\033[0m  → Kill process on port"
      ;;

    mongo|mongodb)
      echo -e "\n\033[1;33m🍃 MongoDB Cheat Sheet\033[0m"
      echo -e "\033[1;90m─────────────────────────────────────────\033[0m"
      echo -e "  \033[1;32mMongoStart\033[0m      → Start MongoDB daemon"
      echo -e "  \033[1;32mMongoStop\033[0m       → Stop MongoDB"
      echo -e "  \033[1;32mMongoStatus\033[0m     → Check MongoDB status"
      echo -e "\n  \033[1;90mPath: \$MONGO_HOME\033[0m"
      echo -e "  \033[1;90mData: \$MONGO_DATA\033[0m"
      ;;

    mac|macos)
      echo -e "\n\033[1;33m🍎 macOS Cheat Sheet (OMZ macos plugin)\033[0m"
      echo -e "\033[1;90m─────────────────────────────────────────\033[0m"
      echo -e "\033[1;36m  Finder:\033[0m"
      echo -e "  \033[1;32mshowfiles\033[0m       → Show hidden files in Finder"
      echo -e "  \033[1;32mhidefiles\033[0m       → Hide hidden files in Finder"
      echo -e "  \033[1;32mofd\033[0m             → Open current dir in Finder"
      echo -e "  \033[1;32mpfd\033[0m             → Print Finder's current dir"
      echo -e "  \033[1;32mcdf\033[0m             → cd to Finder's current dir"
      echo -e "\n\033[1;36m  Other:\033[0m"
      echo -e "  \033[1;32mquick-look <f>\033[0m  → QuickLook preview"
      echo -e "  \033[1;32mmusic\033[0m           → Control Music app"
      echo -e "  \033[1;32mtab\033[0m             → New iTerm tab in same dir"
      ;;

    web|search)
      echo -e "\n\033[1;33m🔍 Web Search Cheat Sheet (OMZ web-search)\033[0m"
      echo -e "\033[1;90m─────────────────────────────────────────\033[0m"
      echo -e "  \033[1;32mgoogle <query>\033[0m       → Google search"
      echo -e "  \033[1;32myoutube <query>\033[0m      → YouTube search"
      echo -e "  \033[1;32mddg <query>\033[0m          → DuckDuckGo"
      echo -e "  \033[1;32mgithub <query>\033[0m       → GitHub search"
      echo -e "  \033[1;32mstackoverflow <q>\033[0m    → Stack Overflow"
      echo -e "  \033[1;32mreddit <query>\033[0m       → Reddit search"
      echo -e "  \033[1;32mscholar <query>\033[0m      → Google Scholar"
      echo -e "  \033[1;32mwiki <query>\033[0m         → Wikipedia"
      echo -e "  \033[1;32mchatgpt <query>\033[0m      → ChatGPT"
      echo -e "  \033[1;32mclaudeai <query>\033[0m     → Claude AI"
      echo -e "  \033[1;32mgrok <query>\033[0m         → Grok"
      ;;

    nav|cd)
      echo -e "\n\033[1;33m🧭 Navigation Cheat Sheet\033[0m"
      echo -e "\033[1;90m─────────────────────────────────────────\033[0m"
      echo -e "\033[1;36m  Custom:\033[0m"
      echo -e "  \033[1;32m.. / ... / ....\033[0m → Up 1/2/3 levels"
      echo -e "  \033[1;32m..... / ......\033[0m → Up 4/5 levels"
      echo -e "  \033[1;32mdl / dt / docs\033[0m → Downloads / Desktop / Documents"
      echo -e "\n\033[1;36m  Smart (zoxide):\033[0m"
      echo -e "  \033[1;32mcd <partial>\033[0m   → Smart fuzzy jump"
      echo -e "  \033[1;32mcd -\033[0m           → Previous directory"
      echo -e "  \033[1;32mzoxide query -l\033[0m → Show tracked dirs"
      echo -e "\n\033[1;36m  History (OMZ):\033[0m"
      echo -e "  \033[1;32m1 / 2 / 3 ...\033[0m  → cd to history index"
      echo -e "  \033[1;32mAlt+←/→\033[0m       → Directory history"
      ;;

    zsh|shell)
      echo -e "\n\033[1;33m⚡ Zsh Power Tips\033[0m"
      echo -e "\033[1;90m─────────────────────────────────────────\033[0m"
      echo -e "\033[1;36m  History:\033[0m"
      echo -e "  \033[1;32mh / hl / hs\033[0m    → history / less / grep"
      echo -e "  \033[1;32mhsi <text>\033[0m     → history grep (case-insensitive)"
      echo -e "  \033[1;32mCtrl+R\033[0m         → Reverse search history"
      echo -e "\n\033[1;36m  Auto-correct:\033[0m"
      echo -e "  \033[1;32mf\033[0m              → Fix last command (pay-respects)"
      echo -e "\n\033[1;36m  Sudo:\033[0m"
      echo -e "  \033[1;32mESC ESC\033[0m        → Prepend sudo to last command"
      echo -e "  \033[1;32m_ <cmd>\033[0m        → sudo <cmd>"
      echo -e "\n\033[1;36m  Reload / Edit:\033[0m"
      echo -e "  \033[1;32mreload\033[0m         → Source zshrc"
      echo -e "  \033[1;32mzshvim\033[0m         → Edit in nvim"
      echo -e "  \033[1;32mp10kconfig\033[0m     → Reconfigure prompt"
      ;;

    *)
      echo -e "\n\033[1;36m📚 Available Cheat Sheets\033[0m"
      echo -e "\033[1;90m═══════════════════════════════════════════════\033[0m"
      echo -e "  \033[1;32mcheat git\033[0m       → Git workflow (custom + OMZ)"
      echo -e "  \033[1;32mcheat npm\033[0m       → NPM / Node workflow"
      echo -e "  \033[1;32mcheat brew\033[0m      → Homebrew shortcuts"
      echo -e "  \033[1;32mcheat pip\033[0m       → Python / Pip"
      echo -e "  \033[1;32mcheat nvim\033[0m      → Neovim shortcuts"
      echo -e "  \033[1;32mcheat file\033[0m      → File operations"
      echo -e "  \033[1;32mcheat net\033[0m       → Network commands"
      echo -e "  \033[1;32mcheat mongo\033[0m     → MongoDB"
      echo -e "  \033[1;32mcheat mac\033[0m       → macOS-specific"
      echo -e "  \033[1;32mcheat web\033[0m       → Web search shortcuts"
      echo -e "  \033[1;32mcheat nav\033[0m       → Navigation tricks"
      echo -e "  \033[1;32mcheat zsh\033[0m       → Zsh power tips"
      echo -e "\033[1;90m═══════════════════════════════════════════════\033[0m"
      echo -e "\033[1;90m💡 Or type 'help' for full custom commands menu\033[0m"
      ;;
  esac
  echo ""
}

# Run — Interactive server selector
# Usage: Run | Run 1 (Django) | Run 2 (npm dev)
unalias Run 2>/dev/null
Run() {
  local choice=$1

  if [ -z "$choice" ]; then
    echo -e "\n\033[1;36m📦 Select the command to run:\033[0m"
    echo -e "  \033[1;33m1)\033[0m 🐍 python3 manage.py runserver"
    echo -e "  \033[1;33m2)\033[0m 📗 npm run dev"
    echo ""
    read "choice?Enter choice [1 or 2]: "
  fi

  case $choice in
    1)
      if [ ! -f "manage.py" ]; then
        echo -e "\n\033[1;31m✖ No 'manage.py' found in $(pwd)\033[0m"
        echo -e "\033[1;33m  Are you in a Django project folder?\033[0m\n"
        return 1
      fi
      echo -e "\n\033[1;32m▶ Running Django server...\033[0m\n"
      python3 manage.py runserver
      ;;
    2)
      if [ ! -f "package.json" ]; then
        echo -e "\n\033[1;31m✖ No 'package.json' found in $(pwd)\033[0m"
        echo -e "\033[1;33m  Are you in a Node.js project folder?\033[0m\n"
        return 1
      fi
      echo -e "\n\033[1;32m▶ Running npm dev server...\033[0m\n"
      npm run dev
      ;;
    *)
      echo -e "\n\033[1;31m✖ Invalid choice. Please enter 1 or 2.\033[0m"
      ;;
  esac
}

# copy file content to clipboard
copy() {
  if [ -f "$1" ]; then
    cat "$1" | pbcopy
    echo "✅ Copied content of '$1' to clipboard"
  else
    echo "❌ File not found: $1"
  fi
}

# paste clipboard to a file
paste-to() {
  pbpaste > "$1"
  echo "✅ Pasted clipboard to '$1'"
}

# mkcd — Create a directory and cd into it
mkcd() {
  mkdir -p "$1" && cd "$1"
}

# backup — Quickly backup a file with a timestamp
backup() {
  cp "$1" "$1.bak.$(date +%Y%m%d-%H%M%S)"
  echo "✅ Backup created: $1.bak.$(date +%Y%m%d-%H%M%S)"
}

# myip — Show your public IP address
myip() {
  echo "🌐 Public IP: $(curl -s ifconfig.me)"
  echo "🏠 Local IP:  $(ipconfig getifaddr en0 2>/dev/null || echo 'N/A')"
}

# weather — Get the weather for your location
weather() {
  local city="${1:-}"
  curl -s "wttr.in/$city?format=3"
}

# port — Find process using a specific port
port() {
  lsof -i :"$1"
}

# killport — Kill process running on a specific port
killport() {
  lsof -ti :"$1" | xargs kill -9 && echo "✅ Killed process on port $1"
}


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 15. TOOL INTEGRATIONS                                                        │
# └──────────────────────────────────────────────────────────────────────────────┘

# Zoxide — Smarter cd (only load if installed)
if command -v zoxide &>/dev/null; then
  eval "$(zoxide init --cmd cd zsh)"
fi

# Pay-Respects — Modern command corrector (Rust-based, replaces theFuck)
if command -v pay-respects &>/dev/null; then
  eval "$(pay-respects zsh)"
fi


# ┌──────────────────────────────────────────────────────────────────────────────┐
# │ 16. WELCOME MESSAGE                                                          │
# └──────────────────────────────────────────────────────────────────────────────┘
echo -e "\n\033[1;36m👋 Welcome back, Dibakar!\033[0m"
echo -e "\033[1;90m   $(date '+%A, %d %B %Y · %I:%M %p')\033[0m"
echo -e "\033[1;90m   Type 'help' for custom commands\033[0m\n"


# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                              END OF ~/.zshrc                                 ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
