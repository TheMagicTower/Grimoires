#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Sprint Plugin Setup Script
# Installs Sprint Orchestration as a Claude Code plugin for /sprint:* commands
# ============================================================

GRIMOIRES_HOME="${GRIMOIRES_HOME:-$HOME/.grimoires}"
CLAUDE_PLUGINS_DIR="$HOME/.claude/plugins"
PLUGIN_NAME="sprint"
PLUGIN_DIR="$CLAUDE_PLUGINS_DIR/$PLUGIN_NAME"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_DIR="$REPO_ROOT/plugin-sprint"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warning() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }

print_banner() {
    echo -e "${CYAN}"
    echo "  ╔═══════════════════════════════════════════╗"
    echo "  ║      🏃 SPRINT PLUGIN SETUP 🏃            ║"
    echo "  ╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_source() {
    if [ ! -d "$SOURCE_DIR" ]; then
        error "Sprint plugin source not found at $SOURCE_DIR"
        error "Make sure you're running from the Grimoires repository"
        exit 1
    fi
    success "Sprint plugin source found"
}

setup_plugin_dir() {
    mkdir -p "$CLAUDE_PLUGINS_DIR"

    # Remove existing plugin if present
    if [ -d "$PLUGIN_DIR" ]; then
        rm -rf "$PLUGIN_DIR"
        info "Removed existing sprint plugin"
    fi

    success "Plugin directory ready: $PLUGIN_DIR"
}

install_plugin() {
    echo ""
    info "Installing Sprint plugin..."

    # Copy entire plugin-sprint directory contents to plugin dir
    cp -r "$SOURCE_DIR" "$PLUGIN_DIR"

    success "Plugin installed!"
}

uninstall_plugin() {
    echo ""
    info "Removing Sprint plugin..."

    if [ -d "$PLUGIN_DIR" ]; then
        rm -rf "$PLUGIN_DIR"
        success "Removed plugin: $PLUGIN_DIR"
    else
        info "Plugin not found"
    fi

    # Also remove old standalone skills if present
    local old_skills_dir="$HOME/.claude/skills"
    for skill in sprint-init sprint-plan sprint-cycle sprint-review sprint-all; do
        if [ -d "$old_skills_dir/$skill" ]; then
            rm -rf "$old_skills_dir/$skill"
            info "Removed old skill: $skill"
        fi
    done

    echo ""
    success "Sprint plugin uninstalled"
}

print_success() {
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Sprint Plugin Setup Complete!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${CYAN}Available commands in Claude Code:${NC}"
    echo "    /sprint:init      - Generate sprint.config.yaml"
    echo "    /sprint:plan      - Create sprint plan"
    echo "    /sprint:cycle     - Execute single sprint"
    echo "    /sprint:review    - Batch PR review"
    echo "    /sprint:all       - Execute all sprints"
    echo ""
    echo -e "  ${CYAN}Plugin location:${NC}"
    echo "    $PLUGIN_DIR"
    echo ""
}

list_skills() {
    echo ""
    info "Installed Sprint skills:"
    echo ""

    if [ -d "$PLUGIN_DIR/skills" ]; then
        for dir in "$PLUGIN_DIR/skills"/*; do
            if [ -d "$dir" ]; then
                local name=$(basename "$dir")
                echo "  - /sprint:$name"
            fi
        done
    else
        warning "Sprint plugin not installed"
        echo "  Run: ./setup-sprint.sh install"
    fi
    echo ""
}

show_help() {
    cat << EOF
Sprint Plugin Setup Script

Usage:
    setup-sprint.sh [command]

Commands:
    install     Install Sprint as Claude Code plugin (default)
    uninstall   Remove Sprint plugin
    list        List installed skills
    help        Show this help

Examples:
    ./setup-sprint.sh              # Install plugin
    ./setup-sprint.sh install      # Install plugin
    ./setup-sprint.sh uninstall    # Remove plugin
    ./setup-sprint.sh list         # List skills

EOF
}

# Parse arguments
COMMAND="${1:-install}"

# Main
main() {
    print_banner

    case "$COMMAND" in
        install)
            check_source
            setup_plugin_dir
            install_plugin
            print_success
            ;;
        uninstall)
            uninstall_plugin
            ;;
        list)
            list_skills
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            error "Unknown command: $COMMAND"
            show_help
            exit 1
            ;;
    esac
}

main
