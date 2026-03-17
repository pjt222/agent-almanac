---
name: setup-wsl-dev-environment
description: >
  Windows上でWSL2開発環境をセットアップする。シェル設定、必須ツール、
  Git、SSHキー、Node.js、Python、クロスプラットフォームのパス管理を
  含む。新しいWindowsマシンを開発用に設定する場合、初めてWSL2を設定する
  場合、既存のWSLインストールに開発ツールを追加する場合、またはWSLと
  Windowsツールを組み合わせたクロスプラットフォームワークフローを設定
  する場合に使用する。
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: wsl, windows, linux, development, setup
---

# WSL開発環境のセットアップ

クロスプラットフォーム作業のための完全なWSL2開発環境を設定する。

## 使用タイミング

- 新しいWindowsマシンを開発用にセットアップする場合
- 初めてWSL2を設定する場合
- 既存のWSLインストールに開発ツールを追加する場合
- クロスプラットフォームワークフロー（WSL + Windowsツール）をセットアップする場合

## 入力

- **必須**: WSL2をサポートするWindows 10/11
- **任意**: 使用するLinuxディストリビューション（デフォルト: Ubuntu）
- **任意**: セットアップする言語（Node.js、Python、R）
- **任意**: 追加ツール（Docker、tmux、fzf）

## 手順

### ステップ1: WSL2のインストール

PowerShell（管理者として実行）で次のコマンドを実行する:

```powershell
wsl --install
wsl --set-default-version 2
```

プロンプトが表示されたら再起動する。デフォルトでUbuntuがインストールされる。

**期待結果：** 再起動後、`wsl --list --verbose` でディストリビューションがWSLバージョン2で動作していることが確認できる。`wsl` コマンドでLinuxシェルが開く。

**失敗時：** WSL2のインストールが失敗した場合、`optionalfeatures.exe` から「仮想マシンプラットフォーム」と「Windows Subsystem for Linux」のWindows機能を手動で有効にする。古いWindows 10ビルドでは、Microsoftからのカーネル更新が必要な場合がある。

### ステップ2: WSLリソース制限の設定

WindowsホームディレクトリにHTTPSで `~/.wslconfig` を作成する:

```ini
[wsl2]
memory=8GB
processors=4
localhostForwarding=true
```

**期待結果：** `.wslconfig` ファイルがWindowsユーザーのホームディレクトリ（例: `C:\Users\Name\.wslconfig`）に存在する。`wsl --shutdown` を実行してWSLを再起動すると、リソース制限が適用される。

**失敗時：** 設定が反映されない場合、ファイルが正しい場所（WSLホームではなくWindowsホーム）にあることを確認する。変更を反映させるには `wsl --shutdown` を実行してWSLを再起動する。

### ステップ3: 必須ツールの更新とインストール

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y \
  build-essential \
  curl \
  wget \
  git \
  git-lfs \
  vim \
  htop \
  tree \
  jq \
  ripgrep \
  fd-find \
  unzip \
  zip
```

便利なエイリアスを作成する:

```bash
echo 'alias fd="fdfind"' >> ~/.bashrc
```

**期待結果：** すべてのパッケージがエラーなくインストールされる。`git --version`、`jq --version`、`rg --version`、`tree` などのコマンドが正常に実行できる。

**失敗時：** `apt install` が失敗した場合、まず `sudo apt update` でパッケージリストを更新する。パッケージが見つからない場合、Ubuntuのバージョンがそのパッケージをサポートしているか確認するか、代替ソース（snap、cargo、または手動ダウンロード）からインストールする。

### ステップ4: Gitの設定

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global core.autocrlf input
git config --global color.ui auto
git config --global core.editor vim
```

**期待結果：** `git config --list` で正しいユーザー名、メールアドレス、デフォルトブランチ（`main`）、autocrlf（`input`）、エディタ設定が表示される。

**失敗時：** 設定が適用されない場合、`--global`（現在のリポジトリのみに適用される `--local` ではなく）を使用していることを確認する。`~/.gitconfig` に期待どおりのエントリが含まれているか確認する。

### ステップ5: SSHキーのセットアップ

```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
# GitHubに追加: Settings > SSH and GPG keys
```

テスト: `ssh -T git@github.com`

**期待結果：** `ssh -T git@github.com` が「Hi username! You've successfully authenticated.」を返す。SSHキーペアが `~/.ssh/id_ed25519` と `~/.ssh/id_ed25519.pub` に存在する。

**失敗時：** 認証が失敗した場合、公開キーがGitHubに追加されているか確認する（Settings > SSH and GPG keys）。`ssh-add -l` で `ssh-agent` が実行中でキーがロードされているか確認する。エージェントが実行されていない場合、`eval "$(ssh-agent -s)"` を `~/.bashrc` に追加する。

### ステップ6: Node.jsのインストール（nvmを使用）

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

**期待結果：** `node --version` と `npm --version` が現在のLTSバージョンを返す。`nvm ls` でインストールされたバージョンがデフォルトとして表示される。

**失敗時：** インストール後に `nvm` が見つからない場合、`~/.bashrc` をsourceするか、新しいターミナルを開く。インストールスクリプトが失敗した場合、スクリプトの内容を確認してから手動でダウンロードして実行する。

### ステップ7: Pythonのインストール（pyenvを使用）

```bash
# ビルド依存関係のインストール
sudo apt install -y make libssl-dev zlib1g-dev libbz2-dev \
  libreadline-dev libsqlite3-dev libncursesw5-dev xz-utils \
  tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev

curl https://pyenv.run | bash

# ~/.bashrcに追加
echo 'export PATH="$HOME/.pyenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
source ~/.bashrc

pyenv install 3.12
pyenv global 3.12
```

**期待結果：** `python --version` がPython 3.12.xを返す。`pyenv versions` でインストールされたバージョンがグローバルとして設定されている。

**失敗時：** `pyenv install` がビルドエラーで失敗した場合、`apt install` コマンドのすべてのビルド依存関係がインストールされているか確認する。不足しているライブラリ（特に `libssl-dev` や `zlib1g-dev`）がPythonのビルド失敗の最も一般的な原因である。

### ステップ8: シェルの設定

`~/.bashrc` に以下を追加する:

```bash
# 履歴
export HISTSIZE=10000
export HISTFILESIZE=20000
export HISTCONTROL=ignoredups:erasedups
shopt -s histappend

# ナビゲーションエイリアス
alias ll='ls -alF'
alias la='ls -A'
alias ..='cd ..'
alias ...='cd ../..'

# 開発パス
export DEV_HOME="/mnt/d/dev/p"
alias dev='cd $DEV_HOME'

# 関数
mkcd() { mkdir -p "$1" && cd "$1"; }

# PATH追加
export PATH="$HOME/bin:$HOME/.local/bin:$PATH"
```

**期待結果：** `source ~/.bashrc` を実行後、すべてのエイリアス（`ll`、`la`、`..`、`dev`）が動作し、`mkcd` 関数がディレクトリを作成して移動し、`$DEV_HOME` が開発ディレクトリを指す。

**失敗時：** エイリアスが利用できない場合、追記が `~/.bashrc`（`~/.bash_profile` や `~/.profile` ではなく）に追加されているか確認する。新しいターミナルを開かずにリロードするには `source ~/.bashrc` を実行する。

### ステップ9: Claude Code CLIのセットアップ

```bash
# インストール後、Claude CLIをPATHに追加
echo 'export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# 確認
which claude
```

**期待結果：** `which claude` がClaude Code CLIバイナリのパス（例: `~/.claude/local/node_modules/.bin/claude`）を返す。`claude --version` でインストールされたバージョンが表示される。

**失敗時：** `claude` が見つからない場合、PATH exportが `~/.bashrc` に追加されてsourceされているか確認する。Claude Codeが `~/.claude/local/` に実際にインストールされているか確認する。インストールされていない場合は、先にClaude Codeのインストール手順に従う。

### ステップ10: クロスプラットフォームパスの参照

| Windows | WSL |
|---------|-----|
| `C:\Users\Name` | `/mnt/c/Users/Name` |
| `D:\dev\projects` | `/mnt/d/dev/projects` |
| `%APPDATA%` | `/mnt/c/Users/Name/AppData/Roaming` |

WSLからWindowsエクスプローラーを開く: `explorer.exe .`

**期待結果：** パス変換テーブルが理解され、テスト済みである。WSLからWindowsパスへのアクセスが機能し（例: `ls /mnt/c/Users/`）、`explorer.exe .` で現在のWSLディレクトリのWindowsエクスプローラーが開く。

**失敗時：** `/mnt/c/` にアクセスできない場合、WSLのオートマウントが設定されているか確認する。`/etc/wsl.conf` の `[automount]` 設定を確認する。マウントポイントが古い場合は `wsl --shutdown` を実行して再起動する。

## バリデーション

- [ ] WSL2が正しいディストリビューションで動作している
- [ ] Gitが正しいアイデンティティで設定されている
- [ ] SSHキーがGitHubに追加され、接続が確認済みである
- [ ] Node.jsがインストールされて動作している
- [ ] Pythonがインストールされて動作している
- [ ] シェルのエイリアスと関数が動作する
- [ ] Claude Code CLIにアクセスできる

## よくある落とし穴

- **`/mnt/` での遅いファイルアクセス**: パフォーマンス向上のために、頻繁にアクセスするプロジェクトはWSLファイルシステム（`~/`）に保存する。Windowsツールと共有するプロジェクトには `/mnt/` を使用する。
- **改行コード**: `core.autocrlf=input` によりCRLFの問題を防ぐ。エディタをLF改行を使用するように設定する。
- **パーミッションの問題**: `/mnt/` 上のファイルは不正なパーミッションが表示される場合がある。`/etc/wsl.conf` に以下を追加する: `[automount]\noptions = "metadata,umask=22,fmask=11"`
- **Windows Defender**: パフォーマンス向上のためにWSLディレクトリをリアルタイムスキャンから除外する。

## 関連スキル

- `configure-git-repository` - 詳細なGitリポジトリのセットアップ
- `configure-mcp-server` - MCPセットアップにはWSL環境が必要
- `write-claude-md` - プロジェクト向けAIアシスタントの設定
