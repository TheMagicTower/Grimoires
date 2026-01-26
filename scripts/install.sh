#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Grimoires Installer for Unix/Linux/macOS
# ============================================================

VERSION="0.3.1"
INSTALL_DIR="${GRIMOIRES_HOME:-$HOME/.grimoires}"
REPO_URL="https://github.com/bluelucifer/Grimoires"
RELEASE_URL="$REPO_URL/releases/latest/download"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_banner() {
    echo -e "${MAGENTA}"
    echo "  ╔═══════════════════════════════════════════╗"
    echo "  ║         🔮 GRIMOIRES INSTALLER 🔮         ║"
    echo "  ║     Multi-AI Agent Orchestration for      ║"
    echo "  ║              Claude Code                  ║"
    echo "  ╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
}

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warning() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }

check_prerequisites() {
    echo -e "${BLUE}Checking prerequisites...${NC}"
    echo ""

    # Node.js 18+
    if ! command -v node &> /dev/null; then
        error "Node.js not found. Please install Node.js 18+"
        echo "  Install from: https://nodejs.org/"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error "Node.js 18+ required (found: $(node -v))"
        exit 1
    fi
    success "Node.js $(node -v)"

    # npm
    if ! command -v npm &> /dev/null; then
        error "npm not found"
        exit 1
    fi
    success "npm $(npm -v)"

    # Claude Code CLI (optional in CI/non-interactive mode)
    if ! command -v claude &> /dev/null; then
        warning "Claude Code CLI not found"
        echo "  Install: npm install -g @anthropic-ai/claude-code"

        # Check if running in CI or non-interactive mode
        if [ -n "$CI" ] || [ -n "$GITHUB_ACTIONS" ] || [ ! -t 0 ]; then
            info "Non-interactive mode: skipping Claude Code installation"
            info "Install manually later: npm install -g @anthropic-ai/claude-code"
        else
            echo ""
            read -p "Install Claude Code now? [Y/n] " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
                npm install -g @anthropic-ai/claude-code
                success "Claude Code CLI installed"
            else
                warning "Claude Code not installed. Install later to use Grimoires."
            fi
        fi
    else
        success "Claude Code CLI"
    fi
}

download_grimoires() {
    echo ""
    echo -e "${BLUE}Downloading Grimoires...${NC}"

    # Remove existing installation
    if [ -d "$INSTALL_DIR" ]; then
        info "Removing existing installation..."
        rm -rf "$INSTALL_DIR"
    fi

    # Create directory
    mkdir -p "$INSTALL_DIR"

    # Try downloading release tarball
    local downloaded=false

    if command -v curl &> /dev/null; then
        info "Attempting to download release package..."
        if curl -fsSL "$RELEASE_URL/grimoires-core.tar.gz" -o "/tmp/grimoires-core.tar.gz" 2>/dev/null; then
            tar -xzf "/tmp/grimoires-core.tar.gz" -C "$INSTALL_DIR"
            rm -f "/tmp/grimoires-core.tar.gz"
            downloaded=true
            success "Downloaded release package"
        else
            info "Release package not available (this is normal for development versions)"
        fi
    elif command -v wget &> /dev/null; then
        info "Attempting to download release package..."
        if wget -qO "/tmp/grimoires-core.tar.gz" "$RELEASE_URL/grimoires-core.tar.gz" 2>/dev/null; then
            tar -xzf "/tmp/grimoires-core.tar.gz" -C "$INSTALL_DIR"
            rm -f "/tmp/grimoires-core.tar.gz"
            downloaded=true
            success "Downloaded release package"
        else
            info "Release package not available (this is normal for development versions)"
        fi
    fi

    # Fallback to git clone
    if [ "$downloaded" = false ]; then
        info "Falling back to git clone from repository..."
        if command -v git &> /dev/null; then
            git clone --depth 1 "$REPO_URL.git" "$INSTALL_DIR/repo" 2>/dev/null || {
                error "Failed to clone repository"
                exit 1
            }
            # Copy core files
            cp -r "$INSTALL_DIR/repo/core" "$INSTALL_DIR/" 2>/dev/null || true
            cp -r "$INSTALL_DIR/repo/templates" "$INSTALL_DIR/" 2>/dev/null || true
            cp -r "$INSTALL_DIR/repo/mcp" "$INSTALL_DIR/" 2>/dev/null || true
            cp -r "$INSTALL_DIR/repo/bin" "$INSTALL_DIR/" 2>/dev/null || true
            cp -r "$INSTALL_DIR/repo/scripts" "$INSTALL_DIR/" 2>/dev/null || true
            # Fallback: copy old structure if new doesn't exist
            if [ ! -d "$INSTALL_DIR/core" ]; then
                mkdir -p "$INSTALL_DIR/core"
                cp -r "$INSTALL_DIR/repo/tower" "$INSTALL_DIR/core/" 2>/dev/null || true
                cp -r "$INSTALL_DIR/repo/familiars" "$INSTALL_DIR/core/" 2>/dev/null || true
                cp -r "$INSTALL_DIR/repo/spells" "$INSTALL_DIR/core/" 2>/dev/null || true
                cp -r "$INSTALL_DIR/repo/runes/rules" "$INSTALL_DIR/core/" 2>/dev/null || true
                cp -r "$INSTALL_DIR/repo/runes/mcp" "$INSTALL_DIR/mcp" 2>/dev/null || true
                cp -r "$INSTALL_DIR/repo/registry/templates" "$INSTALL_DIR/templates" 2>/dev/null || true
            fi
            rm -rf "$INSTALL_DIR/repo"
        else
            error "git is required to install from source"
            exit 1
        fi
    fi

    echo "$VERSION" > "$INSTALL_DIR/version"
    success "Downloaded to $INSTALL_DIR"
}

setup_path() {
    echo ""
    echo -e "${BLUE}Setting up PATH...${NC}"

    BIN_DIR="$INSTALL_DIR/bin"
    mkdir -p "$BIN_DIR"

    # Create CLI wrapper
    cat > "$BIN_DIR/grimoires" << 'WRAPPER'
#!/usr/bin/env bash
# Grimoires CLI wrapper

GRIMOIRES_HOME="${GRIMOIRES_HOME:-$HOME/.grimoires}"

show_help() {
    cat << EOF
Grimoires - Multi-AI Agent Orchestration for Claude Code

Usage:
    grimoires [command]

Commands:
    version     Show installed version
    update      Update to latest version
    uninstall   Remove Grimoires from system
    doctor      Check installation health
    hooks       Setup/manage Claude Code hooks
    skills      Setup/manage Claude Code skills (/cast:* commands)
    env         Check/manage environment variables
    help        Show this help message

Project Commands (run in project directory):
    init        Initialize Grimoires for current project

Note: Most Grimoires commands are used within Claude Code:
    /cast:summon    - Initialize project
    /cast:dev       - Start development workflow
    /cast:review    - Code review
    /cast:analyze   - Code analysis
    /cast:design    - Design workflow
    /cast:fix       - Fix errors
    /cast:parallel  - Parallel execution

For more information: https://github.com/bluelucifer/Grimoires
EOF
}

case "${1:-help}" in
    version|-v|--version)
        if [ -f "$GRIMOIRES_HOME/version" ]; then
            echo "Grimoires v$(cat "$GRIMOIRES_HOME/version")"
        else
            echo "Grimoires (version unknown)"
        fi
        ;;
    update)
        echo "Updating Grimoires..."
        curl -fsSL https://raw.githubusercontent.com/bluelucifer/Grimoires/main/scripts/install.sh | bash
        ;;
    uninstall)
        echo "Running uninstaller..."
        if [ -f "$GRIMOIRES_HOME/scripts/uninstall.sh" ]; then
            bash "$GRIMOIRES_HOME/scripts/uninstall.sh"
        else
            curl -fsSL https://raw.githubusercontent.com/bluelucifer/Grimoires/main/scripts/uninstall.sh | bash
        fi
        ;;
    doctor)
        echo "Checking Grimoires installation..."
        echo ""

        # Check installation directory
        if [ -d "$GRIMOIRES_HOME" ]; then
            echo "✓ Installation directory: $GRIMOIRES_HOME"
        else
            echo "✗ Installation directory not found"
            exit 1
        fi

        # Check version file
        if [ -f "$GRIMOIRES_HOME/version" ]; then
            echo "✓ Version: $(cat "$GRIMOIRES_HOME/version")"
        else
            echo "⚠ Version file not found"
        fi

        # Check core directories
        for dir in core templates mcp; do
            if [ -d "$GRIMOIRES_HOME/$dir" ]; then
                echo "✓ $dir/ exists"
            else
                echo "⚠ $dir/ not found"
            fi
        done

        # Check Claude Code
        if command -v claude &> /dev/null; then
            echo "✓ Claude Code CLI available"
        else
            echo "⚠ Claude Code CLI not found"
        fi

        # Check hooks CLI
        if [ -f "$GRIMOIRES_HOME/bin/grimoires-hooks" ]; then
            echo "✓ Hooks CLI available"
        else
            echo "⚠ Hooks CLI not found"
        fi

        # Check Claude hooks integration
        if [ -f "$HOME/.claude/hooks.json" ]; then
            echo "✓ Claude hooks configured"
        else
            echo "⚠ Claude hooks not configured (run: grimoires hooks setup)"
        fi

        # Check Claude skills
        if [ -d "$HOME/.claude/skills/cast-summon" ]; then
            skill_count=$(ls -d "$HOME/.claude/skills/cast-"* 2>/dev/null | wc -l)
            echo "✓ Claude skills configured ($skill_count spells)"
        else
            echo "⚠ Claude skills not configured (run: grimoires skills setup)"
        fi

        # Check MCP configuration files
        echo ""
        echo "MCP Configuration:"
        if [ -d "$GRIMOIRES_HOME/mcp" ]; then
            mcp_count=$(ls "$GRIMOIRES_HOME/mcp/"*.json 2>/dev/null | wc -l)
            echo "✓ MCP configs available ($mcp_count files)"
        else
            echo "⚠ MCP configs not found"
        fi

        # Check Familiar CLIs (optional)
        echo ""
        echo "Familiars (optional):"
        if command -v codex &> /dev/null; then
            echo "✓ Codex CLI installed"
        else
            echo "- Codex not installed (npm i -g @openai/codex)"
        fi

        if command -v gemini &> /dev/null; then
            echo "✓ Gemini CLI installed"
        else
            echo "- Gemini not installed (npm i -g @google/gemini-cli)"
        fi

        echo ""
        echo "Note: Familiars are optional. Claude handles all tasks by default."
        echo "      CLI tools use your existing subscriptions (no API keys needed)."

        echo ""
        echo "Installation health check complete."
        ;;
    init)
        echo "To initialize Grimoires in a project, use Claude Code:"
        echo "  1. Open Claude Code in your project directory"
        echo "  2. Run: /cast:summon"
        ;;
    hooks)
        shift 2>/dev/null || true
        case "${1:-}" in
            setup|install)
                if [ -f "$GRIMOIRES_HOME/scripts/setup-hooks.sh" ]; then
                    bash "$GRIMOIRES_HOME/scripts/setup-hooks.sh" install "${@:2}"
                else
                    echo "Hooks setup script not found. Please update Grimoires."
                fi
                ;;
            uninstall|remove)
                if [ -f "$GRIMOIRES_HOME/scripts/setup-hooks.sh" ]; then
                    bash "$GRIMOIRES_HOME/scripts/setup-hooks.sh" uninstall
                else
                    rm -f "$HOME/.claude/hooks.json"
                    echo "Hooks removed."
                fi
                ;;
            verify|check)
                if [ -f "$GRIMOIRES_HOME/scripts/setup-hooks.sh" ]; then
                    bash "$GRIMOIRES_HOME/scripts/setup-hooks.sh" verify
                fi
                ;;
            *)
                echo "Grimoires Hooks Management"
                echo ""
                echo "Usage: grimoires hooks <command>"
                echo ""
                echo "Commands:"
                echo "  setup     Install hooks integration with Claude Code"
                echo "  uninstall Remove hooks integration"
                echo "  verify    Verify hooks setup"
                echo ""
                echo "Examples:"
                echo "  grimoires hooks setup"
                echo "  grimoires hooks setup --simple"
                echo "  grimoires hooks uninstall"
                ;;
        esac
        ;;
    skills)
        shift 2>/dev/null || true
        case "${1:-}" in
            setup|install)
                if [ -f "$GRIMOIRES_HOME/scripts/setup-skills.sh" ]; then
                    bash "$GRIMOIRES_HOME/scripts/setup-skills.sh" install
                else
                    echo "Skills setup script not found. Please update Grimoires."
                fi
                ;;
            uninstall|remove)
                if [ -f "$GRIMOIRES_HOME/scripts/setup-skills.sh" ]; then
                    bash "$GRIMOIRES_HOME/scripts/setup-skills.sh" uninstall
                else
                    echo "Skills setup script not found."
                fi
                ;;
            list)
                if [ -f "$GRIMOIRES_HOME/scripts/setup-skills.sh" ]; then
                    bash "$GRIMOIRES_HOME/scripts/setup-skills.sh" list
                else
                    echo "No skills found."
                fi
                ;;
            *)
                echo "Grimoires Skills Management"
                echo ""
                echo "Usage: grimoires skills <command>"
                echo ""
                echo "Commands:"
                echo "  setup     Install /cast:* spells as Claude Code skills"
                echo "  uninstall Remove Grimoires skills"
                echo "  list      List installed skills"
                echo ""
                echo "Examples:"
                echo "  grimoires skills setup"
                echo "  grimoires skills list"
                echo "  grimoires skills uninstall"
                ;;
        esac
        ;;
    env)
        shift 2>/dev/null || true
        case "${1:-}" in
            check|validate)
                if [ -f "$GRIMOIRES_HOME/core/utils/env-validator.js" ]; then
                    node "$GRIMOIRES_HOME/core/utils/env-validator.js" "${@:2}"
                else
                    echo "Environment validator not found. Please update Grimoires."
                fi
                ;;
            list)
                if [ -f "$GRIMOIRES_HOME/core/utils/env-validator.js" ]; then
                    node "$GRIMOIRES_HOME/core/utils/env-validator.js" --group full --strict
                else
                    echo "Environment validator not found."
                fi
                ;;
            *)
                echo "Grimoires Environment Management"
                echo ""
                echo "Usage: grimoires env <command>"
                echo ""
                echo "Commands:"
                echo "  check     Validate environment variables"
                echo "  list      List all environment variables and their status"
                echo ""
                echo "Options for 'check':"
                echo "  --group <name>   Variable group (minimal, basic, full)"
                echo "  --strict         Include optional variables"
                echo "  --json           Output as JSON"
                echo ""
                echo "Examples:"
                echo "  grimoires env check"
                echo "  grimoires env check --group full --strict"
                echo "  grimoires env list"
                ;;
        esac
        ;;
    help|-h|--help|*)
        show_help
        ;;
esac
WRAPPER
    chmod +x "$BIN_DIR/grimoires"

    # Detect shell and rc file
    SHELL_RC=""
    SHELL_NAME=""

    if [ -n "${ZSH_VERSION:-}" ] || [ -f "$HOME/.zshrc" ]; then
        SHELL_RC="$HOME/.zshrc"
        SHELL_NAME="zsh"
    elif [ -n "${BASH_VERSION:-}" ] || [ -f "$HOME/.bashrc" ]; then
        SHELL_RC="$HOME/.bashrc"
        SHELL_NAME="bash"
    elif [ -f "$HOME/.profile" ]; then
        SHELL_RC="$HOME/.profile"
        SHELL_NAME="sh"
    fi

    if [ -n "$SHELL_RC" ]; then
        # Check if already configured
        if ! grep -q "GRIMOIRES_HOME" "$SHELL_RC" 2>/dev/null; then
            echo "" >> "$SHELL_RC"
            echo "# Grimoires - Multi-AI Agent Orchestration" >> "$SHELL_RC"
            echo "export GRIMOIRES_HOME=\"$INSTALL_DIR\"" >> "$SHELL_RC"
            echo 'export PATH="$GRIMOIRES_HOME/bin:$PATH"' >> "$SHELL_RC"
            success "Added to $SHELL_RC"
        else
            info "PATH already configured in $SHELL_RC"
        fi
    else
        warning "Could not detect shell configuration file"
        echo "  Please add these lines to your shell config:"
        echo "    export GRIMOIRES_HOME=\"$INSTALL_DIR\""
        echo '    export PATH="$GRIMOIRES_HOME/bin:$PATH"'
    fi

    # Also add to .profile for login shells
    if [ -f "$HOME/.profile" ] && [ "$SHELL_RC" != "$HOME/.profile" ]; then
        if ! grep -q "GRIMOIRES_HOME" "$HOME/.profile" 2>/dev/null; then
            echo "" >> "$HOME/.profile"
            echo "# Grimoires" >> "$HOME/.profile"
            echo "export GRIMOIRES_HOME=\"$INSTALL_DIR\"" >> "$HOME/.profile"
            echo 'export PATH="$GRIMOIRES_HOME/bin:$PATH"' >> "$HOME/.profile"
        fi
    fi
}

create_global_config() {
    echo ""
    echo -e "${BLUE}Creating global configuration...${NC}"

    if [ ! -f "$INSTALL_DIR/config.yaml" ]; then
        cat > "$INSTALL_DIR/config.yaml" << 'CONFIG'
# Grimoires Global Configuration
# https://github.com/bluelucifer/Grimoires

version: "0.3.1"

# API Keys (set via environment variables or here)
# Note: Environment variables take precedence
api_keys:
  openai: ${OPENAI_API_KEY}
  google: ${GOOGLE_API_KEY}
  figma: ${FIGMA_ACCESS_TOKEN}

# Default settings for new projects
defaults:
  # Preset selection: auto | minimal | frontend | backend | fullstack
  preset: auto

  # Automatically run /cast:summon when /cast:* is called without grimoire.yaml
  auto_init: true

  # Maximum parallel Familiar executions
  parallel_limit: 4

  # Default familiars to enable
  familiars:
    - codex
    - gemini
    - reviewer

# Cost management settings
cost:
  # Enable cost tracking
  enabled: false

  # Daily budget in USD
  daily_budget: 10.00

  # Show cost alerts
  alerts: true

  # Model routing for cost optimization
  routing:
    simple_tasks: haiku
    standard_tasks: sonnet
    complex_tasks: opus

# Update settings
updates:
  # Check for updates on grimoires commands
  auto_check: true

  # Update channel: stable | beta
  channel: stable

# Telemetry (anonymous usage statistics)
telemetry:
  enabled: false
CONFIG
        success "Configuration created at $INSTALL_DIR/config.yaml"
    else
        info "Configuration already exists"
    fi
}

copy_scripts() {
    echo ""
    echo -e "${BLUE}Copying utility scripts...${NC}"

    mkdir -p "$INSTALL_DIR/scripts"

    # Copy uninstall script for offline access
    cat > "$INSTALL_DIR/scripts/uninstall.sh" << 'UNINSTALL'
#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="${GRIMOIRES_HOME:-$HOME/.grimoires}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}"
echo "  ╔═══════════════════════════════════════════╗"
echo "  ║       🗑️  GRIMOIRES UNINSTALLER 🗑️        ║"
echo "  ╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Confirm
read -p "Remove Grimoires from $INSTALL_DIR? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

# Remove installation directory
if [ -d "$INSTALL_DIR" ]; then
    rm -rf "$INSTALL_DIR"
    echo -e "${GREEN}✓ Removed $INSTALL_DIR${NC}"
else
    echo -e "${YELLOW}⚠ Directory not found: $INSTALL_DIR${NC}"
fi

# Clean shell rc files
for rc in "$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.profile"; do
    if [ -f "$rc" ]; then
        # Create backup
        cp "$rc" "${rc}.grimoires.bak"
        # Remove Grimoires lines
        grep -v "GRIMOIRES_HOME" "$rc" | grep -v "# Grimoires" > "${rc}.tmp" || true
        mv "${rc}.tmp" "$rc"
        rm -f "${rc}.grimoires.bak"
    fi
done
echo -e "${GREEN}✓ Cleaned shell configuration${NC}"

# Ask about project files
echo ""
read -p "Remove project-local .grimoires/ directories? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Searching for project directories..."
    find "$HOME" -maxdepth 5 -type d -name ".grimoires" 2>/dev/null | while read dir; do
        rm -rf "$dir"
        echo -e "  ${GREEN}✓ Removed $dir${NC}"
    done
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✨ Grimoires uninstalled successfully ✨${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo "Note: Project grimoire.yaml files were preserved."
echo "      Delete them manually if no longer needed."
UNINSTALL
    chmod +x "$INSTALL_DIR/scripts/uninstall.sh"

    success "Utility scripts installed"
}

print_success() {
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✨ Grimoires installed successfully! ✨${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${CYAN}Installation:${NC}"
    echo "    Location: $INSTALL_DIR"
    echo "    Version:  $VERSION"
    echo ""
    echo -e "  ${CYAN}Quick Start:${NC}"
    echo "    1. Restart your terminal (or run: source ~/.zshrc)"
    echo "    2. Navigate to your project directory"
    echo "    3. Run any /cast: command in Claude Code"
    echo ""
    echo -e "  ${CYAN}Commands in Claude Code:${NC}"
    echo "    /cast-summon    - Initialize Grimoires for project"
    echo "    /cast-dev       - Start development workflow"
    echo "    /cast-review    - Code review"
    echo "    /cast-analyze   - Code analysis"
    echo "    /cast-design    - Design workflow"
    echo "    /cast-tdd       - TDD workflow"
    echo ""
    echo -e "  ${CYAN}CLI Commands:${NC}"
    echo "    grimoires version   - Show version"
    echo "    grimoires doctor    - Check installation"
    echo "    grimoires update    - Update Grimoires"
    echo "    grimoires uninstall - Remove Grimoires"
    echo ""
    echo -e "  ${CYAN}Documentation:${NC}"
    echo "    https://github.com/bluelucifer/Grimoires"
    echo ""
}

setup_hooks() {
    echo ""
    echo -e "${BLUE}Setting up Claude Code hooks...${NC}"

    # Skip only in CI environments, but auto-install in non-interactive user installs
    if [ -n "${CI:-}" ] || [ -n "${GITHUB_ACTIONS:-}" ]; then
        info "CI mode: skipping hooks setup"
        return
    fi

    if [ -f "$INSTALL_DIR/scripts/setup-hooks.sh" ]; then
        # In non-interactive mode (curl | bash), auto-install
        if [ ! -t 0 ]; then
            info "Auto-installing hooks..."
            bash "$INSTALL_DIR/scripts/setup-hooks.sh" install
        else
            read -p "Setup Claude Code hooks integration? [Y/n] " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
                bash "$INSTALL_DIR/scripts/setup-hooks.sh" install
            else
                info "Skipped hooks setup. Run later: grimoires hooks setup"
            fi
        fi
    else
        warning "Hooks setup script not found"
    fi
}

setup_skills() {
    echo ""
    echo -e "${BLUE}Setting up Claude Code skills...${NC}"

    # Skip only in CI environments, but auto-install in non-interactive user installs
    if [ -n "${CI:-}" ] || [ -n "${GITHUB_ACTIONS:-}" ]; then
        info "CI mode: skipping skills setup"
        return
    fi

    if [ -f "$INSTALL_DIR/scripts/setup-skills.sh" ]; then
        # In non-interactive mode (curl | bash), auto-install
        if [ ! -t 0 ]; then
            info "Auto-installing skills..."
            bash "$INSTALL_DIR/scripts/setup-skills.sh" install
        else
            read -p "Install /cast-* commands as Claude Code skills? [Y/n] " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
                bash "$INSTALL_DIR/scripts/setup-skills.sh" install
            else
                info "Skipped skills setup. Run later: grimoires skills setup"
            fi
        fi
    else
        warning "Skills setup script not found"
    fi
}

# Main
main() {
    print_banner
    check_prerequisites
    download_grimoires
    setup_path
    create_global_config
    copy_scripts
    setup_hooks
    setup_skills
    print_success
}

main "$@"
