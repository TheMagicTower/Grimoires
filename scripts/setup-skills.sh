#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Grimoires Plugin Setup Script
# Installs Grimoires as a Claude Code plugin for /cast:* commands
# ============================================================

GRIMOIRES_HOME="${GRIMOIRES_HOME:-$HOME/.grimoires}"
CLAUDE_PLUGINS_DIR="$HOME/.claude/plugins"
PLUGIN_NAME="cast"
PLUGIN_DIR="$CLAUDE_PLUGINS_DIR/$PLUGIN_NAME"

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
    echo "  ║       🔮 GRIMOIRES PLUGIN SETUP 🔮        ║"
    echo "  ╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_grimoires() {
    if [ ! -d "$GRIMOIRES_HOME" ]; then
        error "Grimoires not installed at $GRIMOIRES_HOME"
        exit 1
    fi
    success "Grimoires installation found"
}

setup_plugin_dir() {
    mkdir -p "$CLAUDE_PLUGINS_DIR"

    # Remove existing plugin if present
    if [ -d "$PLUGIN_DIR" ]; then
        rm -rf "$PLUGIN_DIR"
    fi

    mkdir -p "$PLUGIN_DIR/.claude-plugin"
    mkdir -p "$PLUGIN_DIR/skills"
    success "Plugin directory ready: $PLUGIN_DIR"
}

# Create plugin manifest
create_plugin_manifest() {
    cat > "$PLUGIN_DIR/.claude-plugin/plugin.json" << 'EOF'
{
  "name": "cast",
  "description": "Grimoires - Multi-AI Agent Orchestration spells for Claude Code",
  "version": "0.3.5",
  "author": {
    "name": "TheMagicTower",
    "url": "https://github.com/TheMagicTower/Grimoires"
  },
  "repository": "https://github.com/TheMagicTower/Grimoires",
  "license": "MIT"
}
EOF
    success "Created plugin manifest"
}

# Create a skill from a spell
create_skill() {
    local spell_name="$1"
    local skill_name="${spell_name#cast-}"  # Remove "cast-" prefix
    local skill_dir="$PLUGIN_DIR/skills/$skill_name"
    local spell_file="$GRIMOIRES_HOME/core/spells/$spell_name.md"

    if [ ! -f "$spell_file" ]; then
        warning "Spell not found: $spell_file"
        return
    fi

    mkdir -p "$skill_dir"

    # Generate SKILL.md with frontmatter
    cat > "$skill_dir/SKILL.md" << EOF
---
name: $skill_name
description: $(get_spell_description "$spell_name")
disable-model-invocation: true
---

EOF

    # Append the original spell content (skip first line if it's a header)
    tail -n +2 "$spell_file" >> "$skill_dir/SKILL.md"

    success "Created skill: /cast:$skill_name"
}

# Get spell description based on name
get_spell_description() {
    local name="$1"
    case "$name" in
        "cast-summon")
            echo "Initialize Grimoires for a project"
            ;;
        "cast-dev")
            echo "Start development workflow with AI agents"
            ;;
        "cast-review")
            echo "Code review with design principles validation"
            ;;
        "cast-analyze")
            echo "Deep code analysis with Gemini (security/performance)"
            ;;
        "cast-design")
            echo "UI/UX design workflow with Stitch"
            ;;
        "cast-fix")
            echo "Fix errors using FixHive knowledge base"
            ;;
        "cast-parallel")
            echo "Execute tasks in parallel"
            ;;
        "cast-tdd")
            echo "TDD workflow (RED-GREEN-REFACTOR)"
            ;;
        "cast-test-coverage")
            echo "Analyze and improve test coverage"
            ;;
        "cast-e2e")
            echo "E2E testing workflow"
            ;;
        "cast-plan")
            echo "Plan implementation with Sequential Thinking"
            ;;
        "cast-refactor")
            echo "Safe refactoring workflow"
            ;;
        "cast-checkpoint")
            echo "Save/restore work checkpoint"
            ;;
        *)
            echo "Grimoires workflow spell"
            ;;
    esac
}

install_plugin() {
    echo ""
    info "Installing Grimoires plugin..."

    create_plugin_manifest

    local spells=(
        "cast-summon"
        "cast-dev"
        "cast-review"
        "cast-analyze"
        "cast-design"
        "cast-fix"
        "cast-parallel"
        "cast-tdd"
        "cast-test-coverage"
        "cast-e2e"
        "cast-plan"
        "cast-refactor"
        "cast-checkpoint"
    )

    for spell in "${spells[@]}"; do
        create_skill "$spell"
    done

    echo ""
    success "Plugin installed!"
}

uninstall_plugin() {
    echo ""
    info "Removing Grimoires plugin..."

    if [ -d "$PLUGIN_DIR" ]; then
        rm -rf "$PLUGIN_DIR"
        success "Removed plugin: $PLUGIN_DIR"
    else
        info "Plugin not found"
    fi

    # Also remove old standalone skills if present
    local old_skills_dir="$HOME/.claude/skills"
    for skill in cast-summon cast-dev cast-review cast-analyze cast-design cast-fix cast-parallel cast-tdd cast-test-coverage cast-e2e cast-plan cast-refactor cast-checkpoint; do
        if [ -d "$old_skills_dir/$skill" ]; then
            rm -rf "$old_skills_dir/$skill"
            info "Removed old skill: $skill"
        fi
    done

    echo ""
    success "Plugin uninstalled"
}

print_success() {
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✨ Grimoires Plugin Setup Complete! ✨${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${CYAN}Available commands in Claude Code:${NC}"
    echo "    /cast:summon      - Initialize project"
    echo "    /cast:dev         - Development workflow"
    echo "    /cast:review      - Code review"
    echo "    /cast:analyze     - Code analysis"
    echo "    /cast:design      - UI/UX design"
    echo "    /cast:fix         - Fix errors"
    echo "    /cast:tdd         - TDD workflow"
    echo "    /cast:plan        - Planning"
    echo ""
    echo -e "  ${CYAN}Plugin location:${NC}"
    echo "    $PLUGIN_DIR"
    echo ""
}

show_help() {
    cat << EOF
Grimoires Plugin Setup Script

Usage:
    setup-skills.sh [command]

Commands:
    install     Install Grimoires as Claude Code plugin (default)
    uninstall   Remove Grimoires plugin
    list        List installed skills
    help        Show this help

Examples:
    ./setup-skills.sh              # Install plugin
    ./setup-skills.sh install      # Install plugin
    ./setup-skills.sh uninstall    # Remove plugin
    ./setup-skills.sh list         # List skills

EOF
}

list_skills() {
    echo ""
    info "Installed Grimoires skills:"
    echo ""

    if [ -d "$PLUGIN_DIR/skills" ]; then
        for dir in "$PLUGIN_DIR/skills"/*; do
            if [ -d "$dir" ]; then
                local name=$(basename "$dir")
                echo "  - /cast:$name"
            fi
        done
    else
        warning "Grimoires plugin not installed"
        echo "  Run: grimoires skills setup"
    fi
    echo ""
}

# Parse arguments
COMMAND="${1:-install}"

# Main
main() {
    print_banner

    case "$COMMAND" in
        install)
            check_grimoires
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
