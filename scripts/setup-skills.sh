#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Grimoires Skills Setup Script
# Registers Grimoires spells as Claude Code skills
# ============================================================

GRIMOIRES_HOME="${GRIMOIRES_HOME:-$HOME/.grimoires}"
CLAUDE_SKILLS_DIR="$HOME/.claude/skills"

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
    echo "  ║       🔮 GRIMOIRES SKILLS SETUP 🔮        ║"
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

setup_skills_dir() {
    mkdir -p "$CLAUDE_SKILLS_DIR"
    success "Skills directory ready: $CLAUDE_SKILLS_DIR"
}

# Create a skill from a spell
create_skill() {
    local spell_name="$1"
    local skill_dir="$CLAUDE_SKILLS_DIR/$spell_name"
    local spell_file="$GRIMOIRES_HOME/core/spells/$spell_name.md"

    if [ ! -f "$spell_file" ]; then
        warning "Spell not found: $spell_file"
        return
    fi

    mkdir -p "$skill_dir"

    # Generate SKILL.md with frontmatter
    cat > "$skill_dir/SKILL.md" << EOF
---
name: $spell_name
description: Grimoires spell - $(get_spell_description "$spell_name")
disable-model-invocation: true
---

EOF

    # Append the original spell content (skip first line if it's a header)
    tail -n +2 "$spell_file" >> "$skill_dir/SKILL.md"

    success "Created skill: $spell_name"
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

install_skills() {
    echo ""
    info "Installing Grimoires skills..."

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
    success "All skills installed!"
}

uninstall_skills() {
    echo ""
    info "Removing Grimoires skills..."

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
        if [ -d "$CLAUDE_SKILLS_DIR/$spell" ]; then
            rm -rf "$CLAUDE_SKILLS_DIR/$spell"
            success "Removed: $spell"
        fi
    done

    echo ""
    success "Skills uninstalled"
}

print_success() {
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✨ Grimoires Skills Setup Complete! ✨${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${CYAN}Available commands in Claude Code:${NC}"
    echo "    /cast-summon      - Initialize project"
    echo "    /cast-dev         - Development workflow"
    echo "    /cast-review      - Code review"
    echo "    /cast-analyze     - Code analysis"
    echo "    /cast-design      - UI/UX design"
    echo "    /cast-fix         - Fix errors"
    echo "    /cast-tdd         - TDD workflow"
    echo "    /cast-plan        - Planning"
    echo ""
    echo -e "  ${CYAN}Skills location:${NC}"
    echo "    $CLAUDE_SKILLS_DIR"
    echo ""
}

show_help() {
    cat << EOF
Grimoires Skills Setup Script

Usage:
    setup-skills.sh [command]

Commands:
    install     Install Grimoires spells as Claude Code skills (default)
    uninstall   Remove Grimoires skills
    list        List installed skills
    help        Show this help

Examples:
    ./setup-skills.sh              # Install skills
    ./setup-skills.sh install      # Install skills
    ./setup-skills.sh uninstall    # Remove skills
    ./setup-skills.sh list         # List skills

EOF
}

list_skills() {
    echo ""
    info "Installed Grimoires skills:"
    echo ""

    local found=false
    for dir in "$CLAUDE_SKILLS_DIR"/cast-*; do
        if [ -d "$dir" ]; then
            local name=$(basename "$dir")
            echo "  - /$name"
            found=true
        fi
    done

    if [ "$found" = false ]; then
        warning "No Grimoires skills installed"
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
            setup_skills_dir
            install_skills
            print_success
            ;;
        uninstall)
            uninstall_skills
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
